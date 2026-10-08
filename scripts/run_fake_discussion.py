#!/usr/bin/env python3
"""
GD Arena - Fake Discussion Simulation Script
Demonstrates end-to-end Group Discussion flow against MOCK_MODE backend.
"""
import sys
import os
import time

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app

def print_separator(title=""):
    print("\n" + "=" * 60)
    if title:
        print(f"  {title}")
        print("=" * 60)

def main():
    client = TestClient(app)

    print_separator("GD ARENA - AUTOMATED DISCUSSION SIMULATION")
    
    # 1. Health check
    print("[1] Checking Backend Health...")
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    health = health_res.json()
    print(f"    Status: {health['status']} | Mock Mode: {health['mock_mode']} | Provider: {health['provider']}")

    # 2. Get topics
    print("\n[2] Fetching Topics...")
    topics_res = client.get("/api/topics")
    assert topics_res.status_code == 200
    topics = topics_res.json()["topics"]
    selected_topic = topics[0]
    print(f"    Selected Topic: '{selected_topic['title']}' ({selected_topic['category']})")

    # 3. Create room
    print("\n[3] Creating GD Room (Panel Size: 4)...")
    room_payload = {
        "topic": selected_topic["title"],
        "panel_size": 4,
        "language": "en"
    }
    create_res = client.post("/api/rooms", json=room_payload)
    assert create_res.status_code == 201
    room = create_res.json()
    room_id = room["room_id"]
    print(f"    Room Created: ID={room_id}")
    print(f"    Moderator: {room['moderator']['name']} (is_ai={room['moderator']['is_ai']})")
    print(f"    Participants: {', '.join([p['name'] + ' (' + p['id'] + ')' for p in room['participants']])}")

    # 4. Turn 1 - Opening from Moderator
    print("\n[4] Session Begins (Calling /next with no text)...")
    turn1 = client.post(f"/api/rooms/{room_id}/next", json={}).json()
    t1 = turn1["turn"]
    print(f"    [{t1['speaker_name']} ({t1['role']})]: \"{t1['text']}\"")
    print(f"    Next Actor: {turn1['next_actor']} | Phase: {turn1['phase']}")

    # 5. Turn 2 - Student speaks
    print("\n[5] Student Initiates Discussion...")
    student_text_1 = "I believe AI will create more high-value jobs by eliminating mundane repetitive tasks, just as past industrial transformations did."
    print(f"    [Student (You)]: \"{student_text_1}\"")
    turn2 = client.post(f"/api/rooms/{room_id}/next", json={"student_text": student_text_1}).json()
    t2 = turn2["turn"]
    print(f"    [{t2['speaker_name']} ({t2['role']})]: \"{t2['text']}\"")
    print(f"    Next Actor: {turn2['next_actor']} (AI-to-AI dialogue triggered)")

    # 6. Turn 3 - AI to AI dialogue
    print("\n[6] AI Follow-up (Cross-talk without student text)...")
    turn3 = client.post(f"/api/rooms/{room_id}/next", json={}).json()
    t3 = turn3["turn"]
    print(f"    [{t3['speaker_name']} ({t3['role']})]: \"{t3['text']}\"")
    print(f"    Next Actor: {turn3['next_actor']}")

    # 7. Turn 4 - Student Interruption
    print(f"\n[7] Student Interrupts Turn {t3['id']}...")
    student_text_2 = "Wait, let me interject. While productivity rises, the transitional friction for displaced workers cannot be ignored."
    print(f"    [Student (You) - INTERRUPTING {t3['id']}]: \"{student_text_2}\"")
    turn4 = client.post(f"/api/rooms/{room_id}/next", json={
        "student_text": student_text_2,
        "interrupted_turn_id": t3["id"]
    }).json()
    t4 = turn4["turn"]
    print(f"    [{t4['speaker_name']} ({t4['role']})]: \"{t4['text']}\"")

    # 8. Concluding the session and fetching report
    print("\n[8] Ending Session & Generating GD Performance Report...")
    report_res = client.post(f"/api/rooms/{room_id}/end", json={})
    assert report_res.status_code == 200
    report = report_res.json()

    print_separator("GD PERFORMANCE REPORT SUMMARY")
    print(f"Room ID:         {report['room_id']}")
    print(f"Topic:           {report['topic']}")
    print(f"Overall Score:   {report['overall_score']}/100")
    print(f"Total Turns:     {report['total_turns']}")
    print(f"Summary:         {report['summary']}")
    
    print("\n--- Speaking Share & Metrics ---")
    metrics = report["metrics"]
    for spk, pct in metrics["speaking_share_pct"].items():
        wc = metrics["word_counts"].get(spk, 0)
        print(f"  - {spk:12}: {pct:5.1f}% ({wc} words)")
    print(f"  Student Interruptions Logged: {metrics['student_interruptions_count']}")

    print("\n--- Evaluated Competencies (Strictly Verified Quotes) ---")
    for item in report["criteria_scores"]:
        print(f"\n* {item['criterion']} [{item['score']}/5]")
        print(f"  Feedback: {item['feedback']}")
        print(f"  Verified Quote ({item['quote']['turn_id']}): \"{item['quote']['text']}\"")

    print_separator("SIMULATION COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
