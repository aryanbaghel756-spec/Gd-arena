import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.models import TranscriptTurn
from backend.report_generator import validate_and_sanitize_quotes
from backend.database import get_or_create_student, update_student_progress

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
        "language": "en",
        "student_id": "test_student_1"
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
    create_res = client.post("/api/rooms", json={
        "topic": "Will AI Create More Jobs Than It Destroys?",
        "panel_size": 3,
        "language": "en"
    })
    room_id = create_res.json()["room_id"]

    turn1_res = client.post(f"/api/rooms/{room_id}/next", json={})
    assert turn1_res.status_code == 200
    t1 = turn1_res.json()
    assert t1["turn"]["role"] == "moderator"
    assert t1["phase"] == "opening"
    assert t1["next_actor"] == "student"

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

    turn3_res = client.post(f"/api/rooms/{room_id}/next", json={})
    assert turn3_res.status_code == 200
    t3 = turn3_res.json()
    assert t3["next_actor"] in ["ai", "student"]

def test_interruption_handling():
    create_res = client.post("/api/rooms", json={
        "topic": "Remote Work vs Office",
        "panel_size": 3,
        "language": "en"
    })
    room_id = create_res.json()["room_id"]

    t1 = client.post(f"/api/rooms/{room_id}/next", json={}).json()
    interrupted_id = t1["turn"]["id"]

    student_payload = {
        "student_text": "Pardon me, but let me quickly jump in on this point.",
        "interrupted_turn_id": interrupted_id
    }
    res = client.post(f"/api/rooms/{room_id}/next", json=student_payload)
    assert res.status_code == 200

    room_state = client.get(f"/api/rooms/{room_id}").json()
    transcript = room_state["transcript"]
    assert any(t["id"] == interrupted_id and t["interrupted"] is True for t in transcript)

def test_end_report_and_metrics():
    create_res = client.post("/api/rooms", json={
        "topic": "Social Media Regulation",
        "panel_size": 4,
        "language": "en",
        "student_id": "test_student_2"
    })
    room_id = create_res.json()["room_id"]

    client.post(f"/api/rooms/{room_id}/next", json={})
    client.post(f"/api/rooms/{room_id}/next", json={
        "student_text": "We need balanced algorithmic accountability without excessive government censorship."
    })

    end_res = client.post(f"/api/rooms/{room_id}/end", json={})
    assert end_res.status_code == 200
    report = end_res.json()
    assert report["room_id"] == room_id
    assert "metrics" in report
    assert "word_counts" in report["metrics"]
    assert "speaking_share_pct" in report["metrics"]
    assert "criteria_scores" in report
    assert len(report["criteria_scores"]) == 6

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
    for crit in validated:
        assert crit.quote.turn_id in ["turn_1", "turn_2"]
        if crit.quote.turn_id == "turn_2":
            assert crit.quote.text == "I believe we should invest in vocational education."

def test_standard_error_envelope():
    res404 = client.get("/api/rooms/non_existent_room_999")
    assert res404.status_code == 404
    data404 = res404.json()
    assert "error" in data404
    assert data404["error"]["code"] == "ROOM_NOT_FOUND"

    res422 = client.post("/api/rooms", json={"topic": "Test", "panel_size": 10})
    assert res422.status_code == 422
    data422 = res422.json()
    assert "error" in data422
    assert data422["error"]["code"] == "VALIDATION_ERROR"

def test_verified_facts_endpoint():
    create_res = client.post("/api/rooms", json={
        "topic": "Will AI Create More Jobs Than It Destroys?",
        "panel_size": 3,
        "language": "en"
    })
    room_id = create_res.json()["room_id"]
    facts_res = client.get(f"/api/rooms/{room_id}/facts")
    assert facts_res.status_code == 200
    facts = facts_res.json()
    assert "verified_data_points" in facts
    assert len(facts["verified_data_points"]) >= 2
    assert any("World Economic Forum" in dp["evidence"] or "Historical" in dp["claim"] for dp in facts["verified_data_points"])
    assert "common_myths_debunked" in facts

def test_student_satisfaction_and_memory():
    # 1. Check profile initial state
    profile_res = client.get("/api/students/student_persistent_test/profile")
    assert profile_res.status_code == 200
    prof = profile_res.json()
    assert prof["student_id"] == "student_persistent_test"
    assert "known_concepts" in prof
    assert "roadmap" in prof
    assert len(prof["roadmap"]) >= 2

    # 2. Create room with this student
    create_res = client.post("/api/rooms", json={
        "topic": "Will AI Create More Jobs Than It Destroys?",
        "panel_size": 3,
        "language": "en",
        "student_id": "student_persistent_test"
    })
    room_id = create_res.json()["room_id"]

    # Turn 1: Opening turn
    client.post(f"/api/rooms/{room_id}/next", json={})

    # Turn 2: Student states that they understood and are satisfied
    client.post(f"/api/rooms/{room_id}/next", json={
        "student_text": "I see, that makes sense. That answers my question about net job creation."
    })

    # Explicit satisfaction call
    sat_res = client.post(f"/api/rooms/{room_id}/satisfaction", json={
        "is_satisfied": True,
        "notes": "Verified WEF statistics resolved my skepticism"
    })
    assert sat_res.status_code == 200
    assert sat_res.json()["is_satisfied"] is True

    # 3. Check updated profile has retained the knowledge
    updated_prof = client.get("/api/students/student_persistent_test/profile").json()
    assert any("Grasped core trade-offs" in c for c in updated_prof["known_concepts"])

def test_gd_formats_and_custom_topics():
    # Case based format
    case_res = client.post("/api/rooms", json={
        "topic": "NovaTech Crisis - Layoffs vs Salary Cuts",
        "panel_size": 3,
        "format": "case_based",
        "patience_sec": 7
    })
    assert case_res.status_code == 201
    case_data = case_res.json()
    assert case_data["format"] == "case_based"
    assert case_data["patience_sec"] == 7

    room_id = case_data["room_id"]
    t1 = client.post(f"/api/rooms/{room_id}/next", json={}).json()
    assert "Case-Study" in t1["turn"]["text"]

    # Custom topic grounding
    facts_res = client.get(f"/api/rooms/{room_id}/facts")
    assert facts_res.status_code == 200
    facts = facts_res.json()
    assert "core_domains" in facts
    assert len(facts["core_domains"]) >= 2

def test_hinglish_mode():
    res = client.post("/api/rooms", json={
        "topic": "Will AI Create More Jobs Than It Destroys?",
        "panel_size": 3,
        "language": "hinglish"
    })
    room_id = res.json()["room_id"]
    t1 = client.post(f"/api/rooms/{room_id}/next", json={}).json()
    # Moderator speaks in natural Hindi/Hinglish
    assert any(w in t1["turn"]["text"].lower() for w in ["karega", "aaj", "hum", "chaliye", "discuss"])

def test_what_you_could_have_said_in_report():
    res = client.post("/api/rooms", json={
        "topic": "Will AI Create More Jobs Than It Destroys?",
        "panel_size": 3
    })
    room_id = res.json()["room_id"]
    client.post(f"/api/rooms/{room_id}/next", json={})
    client.post(f"/api/rooms/{room_id}/next", json={"student_text": "I think tech creates jobs."})
    client.post(f"/api/rooms/{room_id}/next", json={})
    
    report_res = client.post(f"/api/rooms/{room_id}/end", json={})
    assert report_res.status_code == 200
    report = report_res.json()
    assert "what_you_could_have_said" in report
    assert len(report["what_you_could_have_said"]) >= 1
    item = report["what_you_could_have_said"][0]
    assert "suggested_response" in item
    assert "missed_angle" in item

def test_create_custom_topic_endpoint():
    res = client.post("/api/topics/custom", json={
        "title": "75% Mandatory Attendance: Enhances Discipline or Restricts Learning?",
        "category": "Education Policy",
        "difficulty": "Medium"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "75% Mandatory Attendance: Enhances Discipline or Restricts Learning?"
    assert data["format"] == "custom"
    assert "core_domains" in data
    assert any("Pedagogical" in d for d in data["core_domains"])
    assert len(data["verified_data_points"]) >= 2

    # Check that creating room with this custom topic works
    room_res = client.post("/api/rooms", json={
        "topic": data["title"],
        "panel_size": 3,
        "format": "standard"
    })
    assert room_res.status_code == 201
    room_id = room_res.json()["room_id"]
    t1 = client.post(f"/api/rooms/{room_id}/next", json={}).json()
    assert t1["turn"] is not None

def test_join_room_multi_seat_support():
    create_res = client.post("/api/rooms", json={
        "topic": "Will AI Create More Jobs Than It Destroys?",
        "panel_size": 4,
        "language": "en"
    })
    room_id = create_res.json()["room_id"]

    # Friend joins room
    join_res = client.post(f"/api/rooms/{room_id}/join", json={
        "student_id": "friend_rahul_99",
        "student_name": "Rahul"
    })
    assert join_res.status_code == 200
    join_data = join_res.json()
    assert join_data["total_human_count"] == 2
    assert "Rahul joined room successfully" in join_data["message"]

    # Verify GetRoom returns multiple human participants
    room_info = client.get(f"/api/rooms/{room_id}").json()
    assert len(room_info["human_participants"]) == 2
    assert any(h["name"] == "Rahul" for h in room_info["human_participants"])

    # Advance opening turn from Moderator
    client.post(f"/api/rooms/{room_id}/next", json={})

    # Advance turn from Rahul
    client.post(f"/api/rooms/{room_id}/next", json={
        "student_id": "friend_rahul_99",
        "student_name": "Rahul",
        "student_text": "I agree with Aarav on technical training."
    })
    
    # Check that transcript registered Rahul
    room_updated = client.get(f"/api/rooms/{room_id}").json()
    assert any(turn["speaker_name"] == "Rahul" for turn in room_updated["transcript"])

