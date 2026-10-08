"""
GD Arena - Student Satisfaction and Query Resolution Engine
Monitors whether student queries have received satisfactory, evidence-backed answers,
prevents premature room termination until the student is satisfied,
and persists student learnings and roadmap progression.
"""
import re
from typing import Dict, List, Any, Tuple
from .database import update_student_progress, get_or_create_student
from .facts_db import get_facts_for_topic

SATISFACTION_KEYWORDS = [
    "makes sense", "understood", "got it", "i see", "satisfied", "clear now",
    "good point", "agree with that data", "cleared my doubt", "that answers my question",
    "convinced", "well explained",
    # Hinglish natural phrases
    "samajh gaya", "samajh gayi", "samajh aa gaya", "clear hai", "doubt clear",
    "theek hai bhai", "ab clear hai", "sahi bola", "agree karta hu", "point sahi hai",
    "shukriya", "thank you", "ab samajh aaya", "bilkul sahi"
]

PROBING_KEYWORDS = [
    "why", "how", "what about", "not convinced", "still doubtful", "proof",
    "evidence", "but what if", "disagree", "unrealistic", "clarify", "doesn't answer",
    # Hinglish probing phrases
    "kaise", "kyu", "kyun", "par kyu", "aisa kyu", "doubt hai", "samajh nhi aaya",
    "samajh nahi aaya", "bhai kaise", "proof kya hai", "yakin nhi ho raha",
    "batao na", "clear nahi hua", "ek doubt hai", "sawal hai"
]

def analyze_student_intent(student_text: str) -> Dict[str, Any]:
    text_lower = student_text.lower()
    is_question = "?" in student_text or any(w in text_lower for w in ["how", "why", "what", "where", "who", "when"])
    
    satisfied_signals = [k for k in SATISFACTION_KEYWORDS if k in text_lower]
    probing_signals = [k for k in PROBING_KEYWORDS if k in text_lower]

    return {
        "is_question": is_question,
        "is_satisfied_signal": len(satisfied_signals) > 0,
        "is_probing_signal": len(probing_signals) > 0,
        "query_text": student_text if is_question else None
    }

def process_student_utterance_and_learnings(
    student_id: str,
    topic: str,
    student_text: str
) -> Dict[str, Any]:
    """
    Extracts new concepts demonstrated by student or active queries to resolve.
    Updates the student's persistent knowledge profile in SQLite.
    """
    intent = analyze_student_intent(student_text)
    facts = get_facts_for_topic(topic)

    new_known: List[str] = []
    new_resolved: List[str] = []
    new_pending: List[str] = []

    # Check if student referenced key facts or demonstrated concept mastery
    for dp in facts.get("verified_data_points", []):
        claim_words = [w.lower() for w in dp["claim"].split() if len(w) > 3]
        if any(w in student_text.lower() for w in claim_words):
            new_known.append(f"{topic}: {dp['claim']}")

    if intent["is_satisfied_signal"]:
        # If student signals satisfaction, mark previous pending queries as resolved
        student = get_or_create_student(student_id)
        if student["pending_queries"]:
            new_resolved.extend(student["pending_queries"])
        new_known.append(f"Grasped core trade-offs of {topic}")
    elif intent["is_question"]:
        new_pending.append(student_text[:120])

    updated_profile = update_student_progress(
        student_id=student_id,
        new_known_concepts=new_known if new_known else None,
        new_resolved_queries=new_resolved if new_resolved else None,
        new_pending_queries=new_pending if new_pending else None
    )

    return {
        "intent": intent,
        "updated_profile": updated_profile
    }
