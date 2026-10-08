"""
GD Arena - SQLite Persistent Database Engine
Stores student profiles, known concepts, personalized learning roadmaps,
discussion rooms, and query satisfaction records.
"""
import os
import json
import sqlite3
import time
from typing import Dict, List, Any, Optional

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "gd_arena.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Students table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        student_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        known_concepts TEXT NOT NULL,
        weak_areas TEXT NOT NULL,
        resolved_queries TEXT NOT NULL,
        pending_queries TEXT NOT NULL,
        roadmap TEXT NOT NULL,
        total_sessions INTEGER DEFAULT 0,
        average_score REAL DEFAULT 0.0,
        created_at_ms INTEGER NOT NULL,
        updated_at_ms INTEGER NOT NULL
    )
    """)

    # Discussion Rooms table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rooms (
        room_id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        panel_size INTEGER NOT NULL,
        language TEXT NOT NULL,
        phase TEXT NOT NULL,
        is_satisfied INTEGER DEFAULT 0,
        satisfaction_notes TEXT DEFAULT '',
        created_at_ms INTEGER NOT NULL,
        ended_at_ms INTEGER DEFAULT NULL
    )
    """)

    # Turns table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS turns (
        id TEXT NOT NULL,
        room_id TEXT NOT NULL,
        speaker_id TEXT NOT NULL,
        speaker_name TEXT NOT NULL,
        role TEXT NOT NULL,
        is_ai INTEGER NOT NULL,
        text TEXT NOT NULL,
        t_ms INTEGER NOT NULL,
        interrupted INTEGER DEFAULT 0,
        PRIMARY KEY (room_id, id)
    )
    """)

    # Reports table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        room_id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        overall_score INTEGER NOT NULL,
        summary TEXT NOT NULL,
        metrics_json TEXT NOT NULL,
        criteria_scores_json TEXT NOT NULL,
        created_at_ms INTEGER NOT NULL
    )
    """)

    conn.commit()
    conn.close()

# Auto-initialize database on import
init_db()


# --- Student Profile Operations ---

def get_or_create_student(student_id: str = "student_default", name: str = "Student Discussant") -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE student_id = ?", (student_id,))
    row = cursor.fetchone()

    now_ms = int(time.time() * 1000)

    if not row:
        default_known = [
            "Basic Group Discussion structure and decorum",
            "Opening statement articulation"
        ]
        default_weak = [
            "Backing arguments with empirical statistics",
            "Neutralizing aggressive debaters with poise"
        ]
        default_roadmap = [
            {"milestone": 1, "goal": "Master Fact-Grounded Counter-Arguments", "status": "in_progress", "recommended_topic": "ai-jobs"},
            {"milestone": 2, "goal": "Lead Multi-Stakeholder Consensus Synthesis", "status": "pending", "recommended_topic": "remote-work"},
            {"milestone": 3, "goal": "Navigate High-Pressure Policy Interventions", "status": "pending", "recommended_topic": "social-media-regulation"}
        ]
        cursor.execute("""
        INSERT INTO students (
            student_id, name, known_concepts, weak_areas, resolved_queries, pending_queries, roadmap,
            total_sessions, average_score, created_at_ms, updated_at_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            student_id,
            name,
            json.dumps(default_known),
            json.dumps(default_weak),
            json.dumps([]),
            json.dumps([]),
            json.dumps(default_roadmap),
            0,
            0.0,
            now_ms,
            now_ms
        ))
        conn.commit()
        cursor.execute("SELECT * FROM students WHERE student_id = ?", (student_id,))
        row = cursor.fetchone()

    conn.close()
    return {
        "student_id": row["student_id"],
        "name": row["name"],
        "known_concepts": json.loads(row["known_concepts"]),
        "weak_areas": json.loads(row["weak_areas"]),
        "resolved_queries": json.loads(row["resolved_queries"]),
        "pending_queries": json.loads(row["pending_queries"]),
        "roadmap": json.loads(row["roadmap"]),
        "total_sessions": row["total_sessions"],
        "average_score": row["average_score"],
        "created_at_ms": row["created_at_ms"],
        "updated_at_ms": row["updated_at_ms"]
    }


def update_student_progress(
    student_id: str,
    new_known_concepts: List[str] = None,
    new_weak_areas: List[str] = None,
    new_resolved_queries: List[str] = None,
    new_pending_queries: List[str] = None,
    session_score: Optional[int] = None
) -> Dict[str, Any]:
    student = get_or_create_student(student_id)
    known = set(student["known_concepts"])
    if new_known_concepts:
        known.update(new_known_concepts)

    weak = set(student["weak_areas"])
    if new_weak_areas:
        weak.update(new_weak_areas)
    # Remove newly mastered concepts from weak areas
    weak = weak - known

    resolved = set(student["resolved_queries"])
    if new_resolved_queries:
        resolved.update(new_resolved_queries)

    pending = set(student["pending_queries"])
    if new_pending_queries:
        pending.update(new_pending_queries)
    pending = pending - resolved

    total_sessions = student["total_sessions"]
    avg_score = student["average_score"]

    if session_score is not None:
        total_sessions += 1
        avg_score = round(((avg_score * (total_sessions - 1)) + session_score) / total_sessions, 1)

    # Dynamic roadmap updates based on mastery
    roadmap = student["roadmap"]
    if len(known) >= 4 and len(roadmap) > 0 and roadmap[0]["status"] == "in_progress":
        roadmap[0]["status"] = "completed"
        if len(roadmap) > 1:
            roadmap[1]["status"] = "in_progress"

    now_ms = int(time.time() * 1000)

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE students SET
        known_concepts = ?,
        weak_areas = ?,
        resolved_queries = ?,
        pending_queries = ?,
        roadmap = ?,
        total_sessions = ?,
        average_score = ?,
        updated_at_ms = ?
    WHERE student_id = ?
    """, (
        json.dumps(list(known)),
        json.dumps(list(weak)),
        json.dumps(list(resolved)),
        json.dumps(list(pending)),
        json.dumps(roadmap),
        total_sessions,
        avg_score,
        now_ms,
        student_id
    ))
    conn.commit()
    conn.close()

    return get_or_create_student(student_id)
