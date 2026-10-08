import json
from typing import List, Dict, Any

def build_turn_prompt(
    topic: str,
    recent_turns: List[Dict[str, Any]],
    available_personas: List[Dict[str, Any]],
    phase: str
) -> str:
    personas_desc = "\n".join([
        f"- ID: '{p['id']}', Name: '{p['name']}', Persona: {p['persona']}, Style: {p.get('system_prompt', '')}"
        for p in available_personas
    ])

    transcript_text = "\n".join([
        f"[{t['speaker_name']} ({t['speaker_id']})]: {t['text']}"
        for t in recent_turns[-6:]
    ])

    prompt = f"""You are coordinating an interactive group discussion.
Topic: "{topic}"
Current Phase: {phase}

Available AI Participants:
{personas_desc}

Recent Discussion Context (Last ~6 turns):
{transcript_text if transcript_text else "(No utterances yet)"}

Instructions:
1. Select exactly ONE participant from the available list who should logically speak next.
2. The speaker can respond to ANY previous point (student or another AI participant).
3. Generate 1 to 3 concise, natural, spoken sentences staying strictly in character.
4. Output MUST be strictly valid JSON without formatting or markdown code blocks:
{{"speaker": "participant_id", "text": "spoken response here"}}
"""
    return prompt.strip()


def build_report_prompt(topic: str, transcript: List[Dict[str, Any]]) -> str:
    formatted_transcript = "\n".join([
        f"Turn ID: {t['id']} | Speaker: {t['speaker_name']} ({t['role']}): {t['text']}"
        for t in transcript
    ])

    prompt = f"""You are an expert Group Discussion (GD) assessor evaluating the student's performance.
Discussion Topic: "{topic}"

Complete Transcript:
{formatted_transcript}

Evaluate the student on these 6 criteria:
1. Starting the discussion (initiative, framing)
2. Idea quality (relevance, depth, reasoning)
3. Building on others (active engagement with peers' points)
4. Listening (respecting flow, avoiding monopolization)
5. Handling interruptions (poise, constructive responses)
6. Ending strongly (synthesis, conclusion)

For each criterion provide:
- "score": Integer from 1 to 5.
- "feedback": 1-2 constructive sentences.
- "quote": {{"turn_id": "exact_turn_id", "text": "exact quote string from student in transcript"}}.
Also provide:
- "overall_score": Integer 0 to 100.
- "summary": 2-3 sentences overview of the student's performance.

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
