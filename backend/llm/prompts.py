import json
from typing import List, Dict, Any, Optional

def build_turn_prompt(
    topic: str,
    recent_turns: List[Dict[str, Any]],
    available_personas: List[Dict[str, Any]],
    phase: str,
    verified_facts: Optional[Dict[str, Any]] = None,
    student_profile: Optional[Dict[str, Any]] = None
) -> str:
    personas_desc = "\n".join([
        f"- ID: '{p['id']}', Name: '{p['name']}', Persona: {p['persona']}, Style: {p.get('system_prompt', '')}"
        for p in available_personas
    ])

    transcript_text = "\n".join([
        f"[{t['speaker_name']} ({t['speaker_id']})]: {t['text']}"
        for t in recent_turns[-6:]
    ])

    facts_section = ""
    if verified_facts:
        points = "\n".join([
            f"* {dp['claim']}: {dp['evidence']} (Source: {dp['source']})"
            for dp in verified_facts.get("verified_data_points", [])
        ])
        myths = "\n".join([
            f"* Myth: {m['myth']} -> Reality: {m['reality']}"
            for m in verified_facts.get("common_myths_debunked", [])
        ])
        facts_section = f"""
VERIFIED REAL-WORLD EVIDENCE & EMPIRICAL BENCHMARKS (NO MYTHS OR FAKE DATA):
{points}

COMMON MYTHS TO AVOID:
{myths}
"""

    student_memory_section = ""
    if student_profile:
        known = ", ".join(student_profile.get("known_concepts", [])[:4])
        pending = ", ".join(student_profile.get("pending_queries", [])[:2])
        student_memory_section = f"""
STUDENT'S ACCUMULATED KNOWLEDGE & CURRENT QUERIES:
- Concepts Student Already Understands: {known if known else "Foundational understanding"}
- Unresolved Questions Student Is Probing: {pending if pending else "Actively exploring topic trade-offs"}
* Instruction: Build upon what the student already knows. Provide concrete, well-grounded answers to satisfy their pending questions.
"""

    prompt = f"""You are coordinating an authentic, high-caliber Group Discussion (GD).
Topic: "{topic}"
Current Phase: {phase}

Available AI Participants:
{personas_desc}
{facts_section}
{student_memory_section}

Recent Discussion Context (Last ~6 turns):
{transcript_text if transcript_text else "(No utterances yet)"}

Core Requirements:
1. Select exactly ONE participant from the available list who should logically speak next.
2. Ground the response in real-world logic, verifiable principles, or the empirical evidence provided. Absolutely NO fake facts or fabricated statistics.
3. If the student recently posed a question or objection, address it directly with concrete reasoning until their doubt is clarified.
4. Keep the utterance concise, spoken-style (1 to 3 punchy sentences), staying strictly in persona character.
5. Output MUST be strictly valid JSON without formatting or markdown code blocks:
{{"speaker": "participant_id", "text": "spoken response here"}}
"""
    return prompt.strip()


def build_report_prompt(
    topic: str,
    transcript: List[Dict[str, Any]],
    student_profile: Optional[Dict[str, Any]] = None
) -> str:
    formatted_transcript = "\n".join([
        f"Turn ID: {t['id']} | Speaker: {t['speaker_name']} ({t['role']}): {t['text']}"
        for t in transcript
    ])

    prompt = f"""You are an expert Group Discussion (GD) assessor evaluating the student's real performance.
Discussion Topic: "{topic}"

Complete Transcript:
{formatted_transcript}

Evaluate the student on these 6 criteria:
1. Starting the discussion (initiative, framing)
2. Idea quality (relevance, depth, reasoning, grounding in facts)
3. Building on others (active engagement with peers' points)
4. Listening (respecting flow, avoiding monopolization)
5. Handling interruptions (poise, constructive responses)
6. Ending strongly (synthesis, resolution)

For each criterion provide:
- "score": Integer from 1 to 5.
- "feedback": 1-2 constructive, actionable sentences.
- "quote": {{"turn_id": "exact_turn_id", "text": "exact quote string from student in transcript"}}.
Also provide:
- "overall_score": Integer 0 to 100.
- "summary": 2-3 sentences overview of the student's performance, noting real strengths and learning roadmap recommendations.

IMPORTANT: The "quote" MUST be taken word-for-word from an actual turn in the transcript.

Output MUST be strictly valid JSON without markdown code blocks:
{{
  "overall_score": 75,
  "summary": "...",
  "criteria_scores": [
    {{
      "criterion": "Starting the discussion",
      "score": 4,
      "feedback": "...",
      "quote": {{"turn_id": "turn_2", "text": "..."}}
    }},
    ...
  ]
}}
"""
    return prompt.strip()
