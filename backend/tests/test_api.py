import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.models import TranscriptTurn
from backend.report_generator import validate_and_sanitize_quotes

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "mock_mode" in data
    assert "active_providers" in data

def test_topics():
    res = client.get("/api/topics")
    assert res.status_code == 200
    data = res.json()
    assert "topics" in data
    assert len(data["topics"]) >= 3
    assert data["topics"][0]["id"] == "ai-jobs"

def test_create_and_get_room():
    payload = {
        "topic": "Will AI Create More Jobs Than It Destroys?",
        "panel_size": 4,
        "language": "en"
    }
    create_res = client.post("/api/rooms", json=payload)
    assert create_res.status_code == 201
    room_data = create_res.json()
    assert "room_id" in room_data
    assert room_data["duration_sec"] == 300
    assert room_data["moderator"]["is_ai"] is True
    assert len(room_data["participants"]) == 4
    for p in room_data["participants"]:
        assert p["is_ai"] is True
        assert "gender_hint" in p["voice"]

    room_id = room_data["room_id"]
    get_res = client.get(f"/api/rooms/{room_id}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["room_id"] == room_id
    assert fetched["phase"] == "opening"
    assert isinstance(fetched["transcript"], list)

def test_turn_loop_and_moderator_opening():
    # Create room
    create_res = client.post("/api/rooms", json={
        "topic": "Will AI Create More Jobs Than It Destroys?",
        "panel_size": 3,
        "language": "en"
    })
    room_id = create_res.json()["room_id"]

    # Turn 1: UI calls next with no student text to get opening
    turn1_res = client.post(f"/api/rooms/{room_id}/next", json={})
    assert turn1_res.status_code == 200
    t1 = turn1_res.json()
    assert t1["turn"]["role"] == "moderator"
    assert t1["phase"] == "opening"
    assert t1["next_actor"] == "student"

    # Turn 2: Student speaks
    student_payload = {
        "student_text": "I believe AI will create more jobs by sparking entirely new industries.",
        "student_started_ms": 1728374000000,
        "student_ended_ms": 1728374010000
    }
    turn2_res = client.post(f"/api/rooms/{room_id}/next", json=student_payload)
    assert turn2_res.status_code == 200
    t2 = turn2_res.json()
    assert t2["turn"]["role"] == "participant"
    assert t2["turn"]["speaker_id"] in ["aarav", "meera", "kabir"]
    assert t2["phase"] == "discussion"

    # Turn 3: AI played, UI calls next with no student text (cross-talk)
    turn3_res = client.post(f"/api/rooms/{room_id}/next", json={})
    assert turn3_res.status_code == 200
    t3 = turn3_res.json()
    # Either another AI turn or floor back to student
    assert t3["next_actor"] in ["ai", "student"]

def test_interruption_handling():
    create_res = client.post("/api/rooms", json={
        "topic": "Remote Work vs Office",
        "panel_size": 3,
        "language": "en"
    })
    room_id = create_res.json()["room_id"]

    # Opening turn
    t1 = client.post(f"/api/rooms/{room_id}/next", json={}).json()
    interrupted_id = t1["turn"]["id"]

    # Student interrupts turn_1
    student_payload = {
        "student_text": "Pardon me, but let me quickly jump in on this point.",
        "interrupted_turn_id": interrupted_id
    }
    res = client.post(f"/api/rooms/{room_id}/next", json=student_payload)
    assert res.status_code == 200

    # Verify room transcript reflects interruption
    room_state = client.get(f"/api/rooms/{room_id}").json()
    transcript = room_state["transcript"]
    assert any(t["id"] == interrupted_id and t["interrupted"] is True for t in transcript)

def test_end_report_and_metrics():
    create_res = client.post("/api/rooms", json={
        "topic": "Social Media Regulation",
        "panel_size": 4,
        "language": "en"
    })
    room_id = create_res.json()["room_id"]

    # Opening
    client.post(f"/api/rooms/{room_id}/next", json={})

    # Student speaks
    client.post(f"/api/rooms/{room_id}/next", json={
        "student_text": "We need balanced algorithmic accountability without excessive government censorship."
    })

    # End discussion
    end_res = client.post(f"/api/rooms/{room_id}/end", json={})
    assert end_res.status_code == 200
    report = end_res.json()
    assert report["room_id"] == room_id
    assert "metrics" in report
    assert "word_counts" in report["metrics"]
    assert "speaking_share_pct" in report["metrics"]
    assert "criteria_scores" in report
    assert len(report["criteria_scores"]) == 6

    # Verify every quote exists in the transcript
    transcript_res = client.get(f"/api/rooms/{room_id}").json()["transcript"]
    transcript_ids = {t["id"] for t in transcript_res}
    for item in report["criteria_scores"]:
        quote = item["quote"]
        assert quote["turn_id"] in transcript_ids

def test_quote_sanitizer_drops_hallucinations():
    fake_transcript = [
        TranscriptTurn(
            id="turn_1",
            speaker_id="moderator",
            speaker_name="Dr. Verma",
            role="moderator",
            is_ai=True,
            text="Welcome to the discussion.",
            t_ms=1000,
            interrupted=False
        ),
        TranscriptTurn(
            id="turn_2",
            speaker_id="student",
            speaker_name="You",
            role="student",
            is_ai=False,
            text="I believe we should invest in vocational education.",
            t_ms=2000,
            interrupted=False
        )
    ]

    # Deliberate hallucinated quotes that do NOT exist in the transcript
    hallucinated_raw = [
        {
            "criterion": "Starting the discussion",
            "score": 5,
            "feedback": "Great opening",
            "quote": {"turn_id": "turn_999", "text": "I never said this phrase anywhere!"}
        },
        {
            "criterion": "Idea quality",
            "score": 4,
            "feedback": "Good points",
            "quote": {"turn_id": "turn_1", "text": "Completely fake non-matching text"}
        }
    ]

    validated = validate_and_sanitize_quotes(hallucinated_raw, fake_transcript)
    assert len(validated) == 6
    
    # Must be replaced with real turn_2 student quote
    for crit in validated:
        assert crit.quote.turn_id in ["turn_1", "turn_2"]
        if crit.quote.turn_id == "turn_2":
            assert crit.quote.text == "I believe we should invest in vocational education."

def test_standard_error_envelope():
    # 404 Room not found
    res404 = client.get("/api/rooms/non_existent_room_999")
    assert res404.status_code == 404
    data404 = res404.json()
    assert "error" in data404
    assert data404["error"]["code"] == "ROOM_NOT_FOUND"

    # 422 Invalid panel size
    res422 = client.post("/api/rooms", json={"topic": "Test", "panel_size": 10})
    assert res422.status_code == 422
    data422 = res422.json()
    assert "error" in data422
    assert data422["error"]["code"] == "VALIDATION_ERROR"
