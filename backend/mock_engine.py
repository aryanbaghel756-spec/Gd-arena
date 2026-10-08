import time
from typing import Optional, List, Dict
from .models import (
    TurnDetail, NextTurnResponse, EndReportResponse, Metrics, CriterionScore, QuoteRef, Topic, TopicsResponse
)
from .store import RoomState
from .personas import PERSONA_CATALOG, MODERATOR

MOCK_TOPICS = [
    Topic(
        id="ai-jobs",
        title="Will AI Create More Jobs Than It Destroys?",
        category="Technology & Economy",
        difficulty="Medium",
        suggested_duration_sec=300,
        context="Debate whether rapid AI automation will cause permanent unemployment or lead to high-value job creation."
    ),
    Topic(
        id="remote-work",
        title="Remote Work vs. Return to Office: The Future of Collaboration",
        category="Workplace & Society",
        difficulty="Easy",
        suggested_duration_sec=300,
        context="Examine productivity, work-life balance, corporate culture, and mentorship."
    ),
    Topic(
        id="social-media-regulation",
        title="Should Social Media Algorithms Be Strictly Regulated by Government?",
        category="Ethics & Policy",
        difficulty="Hard",
        suggested_duration_sec=300,
        context="Discuss freedom of speech, mental health, algorithmic bias, and state control."
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

    # Handle interruption if supplied
    if interrupted_turn_id:
        room.mark_interrupted(interrupted_turn_id)

    # 1. Opening phase: If transcript is empty, moderator starts
    if len(room.transcript) == 0:
        room.phase = "opening"
        text = f"Welcome everyone to today's group discussion on '{room.topic}'. The floor is now open. Who would like to initiate?"
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

    # 2. Record student text if provided
    if student_text and student_text.strip():
        room.phase = "discussion"
        room.add_turn(
            speaker_id="student",
            speaker_name="You",
            role="student",
            text=student_text.strip(),
            is_ai=False,
            t_ms=student_ended_ms or now_ms
        )

    # 3. Check for closing phase timing
    if remaining_sec <= 60 and room.phase != "closing" and room.phase != "ended":
        room.phase = "closing"
        text = "We are entering the final minute. Let us begin our concluding observations. Please summarize your final stance."
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

    # 4. If UI calls /next with NO student text
    if not student_text or not student_text.strip():
        # Check if consecutive AI turns >= 2 -> Hand floor back to student
        if room.consecutive_ai_turns >= 2:
            return NextTurnResponse(
                turn=None,
                next_actor="student",
                phase=room.phase,  # type: ignore
                remaining_sec=remaining_sec,
                nudge=None,
                degraded=False
            )

        # Inactivity check: if no student text for > 40 seconds, provide a nudge
        if (now_ms - room.last_student_turn_ms) > 40000:
            return NextTurnResponse(
                turn=None,
                next_actor="student",
                phase=room.phase,  # type: ignore
                remaining_sec=remaining_sec,
                nudge="The discussion has paused. Share your thoughts or pose a counter-question to the group.",
                degraded=False
            )

    # 5. Pick an AI participant to respond
    # Choose participant round-robin from room participants
    p_idx = len(room.transcript) % len(room.participants)
    persona_obj = room.participants[p_idx]
    pid = persona_obj.id

    canned_responses: Dict[str, List[str]] = {
        "aarav": [
            "Historically, every technological leap from the steam engine to the internet generated net-positive employment across new sectors.",
            "If we analyze sector data, automation displaces routine cognitive labor while dramatically scaling demand for AI integration specialists.",
            "The data indicates that productivity gains typically reinvest into adjacent consumer and infrastructure industries."
        ],
        "meera": [
            "Imagine AI taking care of all repetitive analytical grunt work, freeing human creativity for arts, humanities, and strategic innovation!",
            "Rather than viewing AI as a replacement, we should design human-in-the-loop collaborative frameworks where everyone has an AI co-pilot.",
            "Think about entirely novel career paths like ethical algorithm designers and digital ecosystem curators that didn't exist two years ago."
        ],
        "kabir": [
            "While that sounds optimistic, what about the severe transitional unemployment for workers who cannot re-skill in six months?",
            "We have to challenge the assumption that market self-correction is painless; structural inequality will widen before it improves.",
            "Who bears the economic cost during this massive transition period if corporate profits decouple from domestic labor?"
        ],
        "ananya": [
            "I agree with Kabir's concern regarding transition friction, but as Aarav noted, proactive public-private skilling programs can bridge that gap.",
            "Both sides make valid points; perhaps the critical solution lies in strong government-funded transition safety nets.",
            "Building on that perspective, our focus should be guiding educational reform to teach critical synthesis rather than rote mechanics."
        ],
        "rohan": [
            "The reality is simple: nations that hesitate to adopt AI will lose competitive advantage globally. Adaptability is not optional.",
            "We cannot halt progress out of fear of disruption; proactive investment in high-tech skills is our only viable path forward.",
            "Decisive leadership and aggressive tech adoption will separate winning economies from stagnant ones in the coming decade."
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

    # After AI speaks, decide next_actor:
    # If this was first AI turn after student, next can be "ai" for cross-talk
    # If 2 consecutive AI turns, next is "student"
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

    # Compute word counts and speaking share deterministically IN CODE
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

    # Extract real turns for quotes
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
            feedback="Initiated or contributed early with clear conceptual framing.",
            quote=QuoteRef(
                turn_id=first_student_turn.id if first_student_turn else "turn_1",
                text=first_student_turn.text if first_student_turn else "Welcome everyone."
            )
        ),
        CriterionScore(
            criterion="Idea quality",
            score=4,
            feedback="Presented substantive arguments distinguishing between automation categories.",
            quote=default_quote
        ),
        CriterionScore(
            criterion="Building on others",
            score=4,
            feedback="Directly referenced prior perspectives and expanded on economic trade-offs.",
            quote=default_quote
        ),
        CriterionScore(
            criterion="Listening",
            score=4,
            feedback="Demonstrated patience and allowed other participants to finish without unnecessary interruption.",
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
            feedback="Summarized the key takeaways cleanly in the concluding portion of the session.",
            quote=QuoteRef(
                turn_id=last_student_turn.id if last_student_turn else "turn_1",
                text=last_student_turn.text if last_student_turn else "Concluding thoughts."
            )
        )
    ]

    return EndReportResponse(
        room_id=room.room_id,
        topic=room.topic,
        duration_sec=room.duration_sec,
        total_turns=len(room.transcript),
        overall_score=78,
        summary="You demonstrated strong initiative by opening the discussion with an apt historical parallel. Your points were logical, though you could engage more directly with counter-arguments raised by Kabir.",
        metrics=metrics,
        criteria_scores=criteria
    )
