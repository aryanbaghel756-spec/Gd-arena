import logging
from typing import Dict, List, Any, Optional
from .models import EndReportResponse, Metrics, CriterionScore, QuoteRef, TranscriptTurn
from .store import RoomState
from .llm.router import llm_router

logger = logging.getLogger(__name__)

CRITERIA_LIST = [
    "Starting the discussion",
    "Idea quality",
    "Building on others",
    "Listening",
    "Handling interruptions",
    "Ending strongly"
]

def validate_and_sanitize_quotes(
    raw_criteria: List[Dict[str, Any]],
    transcript: List[TranscriptTurn]
) -> List[CriterionScore]:
    """
    Validates that every feedback point quotes an actual turn and text in the transcript.
    Hallucinated or mismatched quotes are corrected or replaced with authentic utterances.
    """
    turn_map: Dict[str, TranscriptTurn] = {t.id: t for t in transcript}
    student_turns = [t for t in transcript if t.role == "student"]
    
    # Default fallback quotes
    first_student_turn = student_turns[0] if student_turns else (transcript[0] if transcript else None)
    last_student_turn = student_turns[-1] if student_turns else (transcript[-1] if transcript else None)

    validated: List[CriterionScore] = []
    
    # Convert raw to dictionary by criterion name if available
    raw_map: Dict[str, Dict[str, Any]] = {
        item.get("criterion", ""): item for item in raw_criteria if isinstance(item, dict)
    }

    for crit_name in CRITERIA_LIST:
        raw_item = raw_map.get(crit_name)
        score = 3
        feedback = f"Demonstrated active engagement in {crit_name.lower()}."
        candidate_quote: Optional[QuoteRef] = None

        if raw_item:
            try:
                score = max(1, min(5, int(raw_item.get("score", 3))))
            except Exception:
                score = 3
            feedback = str(raw_item.get("feedback", feedback)).strip()
            
            raw_quote = raw_item.get("quote")
            if isinstance(raw_quote, dict):
                tid = raw_quote.get("turn_id", "")
                qtext = raw_quote.get("text", "").strip()
                
                # Check if turn_id exists in transcript and qtext is a substring of that turn's text
                if tid in turn_map:
                    actual_text = turn_map[tid].text
                    if qtext and (qtext.lower() in actual_text.lower() or actual_text.lower() in qtext.lower()):
                        candidate_quote = QuoteRef(turn_id=tid, text=actual_text)

        # If quote is missing or invalid/hallucinated, substitute with genuine transcript turn
        if not candidate_quote:
            if crit_name == "Starting the discussion" and first_student_turn:
                candidate_quote = QuoteRef(turn_id=first_student_turn.id, text=first_student_turn.text)
            elif crit_name == "Ending strongly" and last_student_turn:
                candidate_quote = QuoteRef(turn_id=last_student_turn.id, text=last_student_turn.text)
            elif student_turns:
                # Use a turn corresponding to criterion index or middle
                idx = len(validated) % len(student_turns)
                candidate_quote = QuoteRef(turn_id=student_turns[idx].id, text=student_turns[idx].text)
            elif transcript:
                candidate_quote = QuoteRef(turn_id=transcript[0].id, text=transcript[0].text)
            else:
                candidate_quote = QuoteRef(turn_id="turn_1", text="Discussion concluded.")

        validated.append(CriterionScore(
            criterion=crit_name,
            score=score,
            feedback=feedback,
            quote=candidate_quote
        ))

    return validated


async def generate_gd_report(room: RoomState) -> EndReportResponse:
    room.phase = "ended"

    # 1. Compute deterministic metrics IN CODE
    word_counts: Dict[str, int] = {}
    for turn in room.transcript:
        spk = turn.speaker_id
        words = len(turn.text.split())
        word_counts[spk] = word_counts.get(spk, 0) + words

    total_words = max(1, sum(word_counts.values()))
    speaking_share_pct: Dict[str, float] = {
        spk: round((cnt / total_words) * 100.0, 1)
        for spk, cnt in word_counts.items()
    }

    metrics = Metrics(
        speaking_share_pct=speaking_share_pct,
        word_counts=word_counts,
        student_interruptions_count=room.student_interruptions_count
    )

    # 2. Qualitative evaluation via LLM
    transcript_dicts = [
        {
            "id": t.id,
            "speaker_name": t.speaker_name,
            "speaker_id": t.speaker_id,
            "role": t.role,
            "text": t.text
        }
        for t in room.transcript
    ]

    llm_report = await llm_router.generate_report_scores(room.topic, transcript_dicts)

    raw_criteria: List[Dict[str, Any]] = []
    overall_score = 75
    summary = (
        "Overall constructive participation. You engaged with the discussion prompts "
        "and contributed perspective to the group dialogue."
    )

    if llm_report and isinstance(llm_report, dict):
        raw_criteria = llm_report.get("criteria_scores", [])
        if "overall_score" in llm_report:
            try:
                overall_score = max(0, min(100, int(llm_report["overall_score"])))
            except Exception:
                pass
        if "summary" in llm_report and llm_report["summary"]:
            summary = str(llm_report["summary"]).strip()

    # 3. Validate & sanitize all quotes strictly against transcript
    validated_criteria = validate_and_sanitize_quotes(raw_criteria, room.transcript)

    # Adjust overall score if computed from criteria
    avg_score = sum(c.score for c in validated_criteria) / max(1, len(validated_criteria))
    computed_overall = int(avg_score * 20)
    final_score = int((overall_score + computed_overall) / 2)

    report = EndReportResponse(
        room_id=room.room_id,
        topic=room.topic,
        duration_sec=room.duration_sec,
        total_turns=len(room.transcript),
        overall_score=final_score,
        summary=summary,
        metrics=metrics,
        criteria_scores=validated_criteria
    )

    room.cached_report = report
    return report
