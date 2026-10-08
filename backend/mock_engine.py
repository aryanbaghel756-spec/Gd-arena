import time
from typing import Optional, List, Dict
from .models import (
    TurnDetail, NextTurnResponse, EndReportResponse, Metrics, CriterionScore, QuoteRef, Topic, TopicsResponse
)
from .store import RoomState
from .personas import PERSONA_CATALOG, MODERATOR
from .facts_db import get_facts_for_topic
from .satisfaction import process_student_utterance_and_learnings

MOCK_TOPICS = [
    Topic(
        id="ai-jobs",
        title="Will AI Create More Jobs Than It Destroys?",
        category="Technology & Economy",
        difficulty="Medium",
        suggested_duration_sec=300,
        context="Debate whether rapid AI automation will cause permanent unemployment or lead to high-value job creation based on WEF and OECD data."
    ),
    Topic(
        id="remote-work",
        title="Remote Work vs. Return to Office: The Future of Collaboration",
        category="Workplace & Society",
        difficulty="Easy",
        suggested_duration_sec=300,
        context="Examine Stanford/Bloom research on productivity, mentorship deficit, and urban economic shifts."
    ),
    Topic(
        id="social-media-regulation",
        title="Should Social Media Algorithms Be Strictly Regulated by Government?",
        category="Ethics & Policy",
        difficulty="Hard",
        suggested_duration_sec=300,
        context="Discuss EU Digital Services Act precedents, algorithmic amplification harms, and free speech protections."
    )
]

def get_mock_topics() -> TopicsResponse:
    return TopicsResponse(topics=MOCK_TOPICS)

def advance_mock_turn(
    room: RoomState,
    student_text: Optional[str] = None,
    student_started_ms: Optional[int] = None,
    student_ended_ms: Optional[int] = None,
    interrupted_turn_id: Optional[str] = None
) -> NextTurnResponse:
    now_ms = int(time.time() * 1000)
    remaining_sec = room.get_remaining_sec()
    verified_facts = get_facts_for_topic(room.topic)

    # Handle interruption if supplied
    if interrupted_turn_id:
        room.mark_interrupted(interrupted_turn_id)

    # 1. Opening phase: If transcript is empty, moderator starts
    if len(room.transcript) == 0:
        room.phase = "opening"
        text = f"Welcome everyone to today's group discussion on '{room.topic}'. Let us anchor our viewpoints in verified empirical evidence. Who would like to initiate?"
        mod_turn = room.add_turn(
            speaker_id="moderator",
            speaker_name=MODERATOR["name"],
            role="moderator",
            text=text,
            is_ai=True,
            t_ms=now_ms
        )
        return NextTurnResponse(
            turn=TurnDetail(
                id=mod_turn.id,
                speaker_id="moderator",
                speaker_name=MODERATOR["name"],
                role="moderator",
                text=text,
                t_ms=now_ms,
                voice=MODERATOR["voice"]
            ),
            next_actor="student",
            phase="opening",
            remaining_sec=remaining_sec,
            nudge=None,
            degraded=False
        )

    # 2. Record student text if provided & process satisfaction/learnings
    if student_text and student_text.strip():
        if room.phase == "opening":
            room.phase = "discussion"
        room.add_turn(
            speaker_id="student",
            speaker_name="You",
            role="student",
            text=student_text.strip(),
            is_ai=False,
            t_ms=student_ended_ms or now_ms
        )
        learning = process_student_utterance_and_learnings(room.student_id, room.topic, student_text.strip())
        if learning["intent"]["is_satisfied_signal"]:
            room.is_satisfied = True

    # 3. Dynamic closing logic: only close if student is satisfied or explicit end
    if remaining_sec <= 40 and room.phase == "discussion":
        if room.is_satisfied:
            room.phase = "closing"
            text = "As the fundamental questions have been satisfactorily explored, let us begin our concluding remarks."
            mod_turn = room.add_turn(
                speaker_id="moderator",
                speaker_name=MODERATOR["name"],
                role="moderator",
                text=text,
                is_ai=True,
                t_ms=now_ms
            )
            return NextTurnResponse(
                turn=TurnDetail(
                    id=mod_turn.id,
                    speaker_id="moderator",
                    speaker_name=MODERATOR["name"],
                    role="moderator",
                    text=text,
                    t_ms=now_ms,
                    voice=MODERATOR["voice"]
                ),
                next_actor="student",
                phase="closing",
                remaining_sec=remaining_sec,
                nudge=None,
                degraded=False
            )
        else:
            # Grant dynamic continuation so student gets real answers
            text = "We have covered our baseline time, but you have an open inquiry. Let us provide a concrete factual resolution."
            mod_turn = room.add_turn(
                speaker_id="moderator",
                speaker_name=MODERATOR["name"],
                role="moderator",
                text=text,
                is_ai=True,
                t_ms=now_ms
            )
            return NextTurnResponse(
                turn=TurnDetail(
                    id=mod_turn.id,
                    speaker_id="moderator",
                    speaker_name=MODERATOR["name"],
                    role="moderator",
                    text=text,
                    t_ms=now_ms,
                    voice=MODERATOR["voice"]
                ),
                next_actor="ai",
                phase="discussion",
                remaining_sec=remaining_sec,
                nudge=None,
                degraded=False
            )

    # 4. If UI calls /next with NO student text
    if not student_text or not student_text.strip():
        if room.consecutive_ai_turns >= 2:
            return NextTurnResponse(
                turn=None,
                next_actor="student",
                phase=room.phase,  # type: ignore
                remaining_sec=remaining_sec,
                nudge=None,
                degraded=False
            )

        if (now_ms - room.last_student_turn_ms) > 35000:
            fact_ref = verified_facts.get("verified_data_points", [{}])[0].get("claim", "data")
            return NextTurnResponse(
                turn=None,
                next_actor="student",
                phase=room.phase,  # type: ignore
                remaining_sec=remaining_sec,
                nudge=f"The floor is yours. Consider how the verified data on '{fact_ref}' influences your conclusion.",
                degraded=False
            )

    # 5. Pick an AI participant to respond with real verified facts
    p_idx = len(room.transcript) % len(room.participants)
    persona_obj = room.participants[p_idx]
    pid = persona_obj.id

    canned_responses: Dict[str, List[str]] = {
        "aarav": [
            "According to the World Economic Forum, 85 million routine roles will be displaced alongside 97 million new tech and synthesis roles, proving net-positive expansion.",
            "Historical Bureau of Labor Statistics data shows farm employment dropped from 70% to under 3%, yet real median wages rose 400% through industrial diversification.",
            "Goldman Sachs estimates generative AI will lift global GDP by 7% (nearly $7 trillion) over 10 years, fueling adjacent service employment."
        ],
        "meera": [
            "Rather than viewing AI as automated replacement, Stanford studies highlight collaborative co-piloting where knowledge workers spend 40% more time on high-level strategy.",
            "Imagine entirely new vocational disciplines like algorithmic ethics auditor and prompt systems architects that did not exist three years ago.",
            "When routine tasks are automated, human resources shift toward empathetic healthcare, creative education, and fundamental research."
        ],
        "kabir": [
            "While long-term trends look positive, the OECD 2023 report flags that 27% of current occupations face high automation risk with painful transitional friction.",
            "We must challenge the 'lump of labor' assumption: displaced workers cannot easily transition into AI engineering within a six-month retraining window.",
            "If corporate productivity decoupling concentrates profits in top tech monopolies, how will local tax bases sustain displaced labor without intervention?"
        ],
        "ananya": [
            "Kabir makes a valid point regarding transition friction; however, combining public reskilling grants with private tech apprenticeships can bridge that gap.",
            "Looking at both perspectives, the resolution lies in robust safety nets paired with active labor market policies as demonstrated in Nordic economies.",
            "Synthesizing Aarav's data and Kabir's concern, the transition speed is the true risk factor, which targeted policy can effectively mitigate."
        ],
        "rohan": [
            "The geopolitical reality is decisive: economies that delay AI deployment risk severe competitiveness decline against nations actively investing in automation.",
            "Aggressive modernization and proactive curriculum reform are our only sustainable strategies in an interconnected global digital economy.",
            "We cannot let transition hesitancy paralyze technological leadership; proactive reskilling at scale is the required national imperative."
        ]
    }

    responses_list = canned_responses.get(pid, canned_responses["aarav"])
    ai_text = responses_list[len(room.transcript) % len(responses_list)]

    ai_turn = room.add_turn(
        speaker_id=pid,
        speaker_name=persona_obj.name,
        role="participant",
        text=ai_text,
        is_ai=True,
        t_ms=now_ms
    )

    next_actor: str = "ai" if room.consecutive_ai_turns < 2 else "student"

    return NextTurnResponse(
        turn=TurnDetail(
            id=ai_turn.id,
            speaker_id=pid,
            speaker_name=persona_obj.name,
            role="participant",
            text=ai_text,
            t_ms=now_ms,
            voice=persona_obj.voice
        ),
        next_actor=next_actor,  # type: ignore
        phase=room.phase,       # type: ignore
        remaining_sec=remaining_sec,
        nudge=None,
        degraded=False
    )

def generate_mock_report(room: RoomState) -> EndReportResponse:
    room.phase = "ended"

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

    student_turns = [t for t in room.transcript if t.role == "student"]
    first_student_turn = student_turns[0] if student_turns else (
        room.transcript[0] if room.transcript else None
    )
    last_student_turn = student_turns[-1] if student_turns else (
        room.transcript[-1] if room.transcript else None
    )

    default_quote = QuoteRef(
        turn_id=first_student_turn.id if first_student_turn else "turn_1",
        text=first_student_turn.text if first_student_turn else "Initiating discussion."
    )

    criteria = [
        CriterionScore(
            criterion="Starting the discussion",
            score=5 if (student_turns and student_turns[0].id in ["turn_1", "turn_2"]) else 3,
            feedback="Initiated or contributed early with clear conceptual framing grounded in historical parallels.",
            quote=QuoteRef(
                turn_id=first_student_turn.id if first_student_turn else "turn_1",
                text=first_student_turn.text if first_student_turn else "Welcome everyone."
            )
        ),
        CriterionScore(
            criterion="Idea quality",
            score=4,
            feedback="Presented substantive arguments distinguishing between automation categories and real economic impact.",
            quote=default_quote
        ),
        CriterionScore(
            criterion="Building on others",
            score=4,
            feedback="Directly referenced prior perspectives and integrated empirical evidence on labor market transitions.",
            quote=default_quote
        ),
        CriterionScore(
            criterion="Listening",
            score=4,
            feedback="Demonstrated active listening and allowed other participants to substantiate their positions.",
            quote=default_quote
        ),
        CriterionScore(
            criterion="Handling interruptions",
            score=4,
            feedback="Maintained composure and held the floor effectively during lively exchanges.",
            quote=default_quote
        ),
        CriterionScore(
            criterion="Ending strongly",
            score=4,
            feedback="Synthesized the discussion cleanly with actionable policy and educational recommendations.",
            quote=QuoteRef(
                turn_id=last_student_turn.id if last_student_turn else "turn_1",
                text=last_student_turn.text if last_student_turn else "Concluding thoughts."
            )
        )
    ]

    from .database import update_student_progress, get_connection
    import json

    # Update persistent student progress in SQLite
    update_student_progress(
        student_id=room.student_id,
        session_score=82
    )

    try:
        conn = get_connection()
        conn.execute("""
        INSERT OR REPLACE INTO reports (room_id, student_id, topic, overall_score, summary, metrics_json, criteria_scores_json, created_at_ms)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            room.room_id,
            room.student_id,
            room.topic,
            82,
            "Strong, fact-grounded discussion.",
            json.dumps(metrics.model_dump()),
            json.dumps([c.model_dump() for c in criteria]),
            room.created_at_ms
        ))
        conn.commit()
        conn.close()
    except Exception:
        pass

    return EndReportResponse(
        room_id=room.room_id,
        topic=room.topic,
        duration_sec=room.duration_sec,
        total_turns=len(room.transcript),
        overall_score=82,
        summary="Strong, fact-grounded discussion. You demonstrated clear logical reasoning, effectively probed counter-arguments, and synthesized consensus around labor transition solutions.",
        metrics=metrics,
        criteria_scores=criteria
    )
