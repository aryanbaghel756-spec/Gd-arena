import time
from typing import Optional, Dict, Any
from .models import TurnDetail, NextTurnResponse
from .store import RoomState
from .personas import PERSONA_CATALOG, MODERATOR
from .llm.router import llm_router
from .facts_db import get_facts_for_topic
from .database import get_or_create_student
from .satisfaction import process_student_utterance_and_learnings, analyze_student_intent

async def advance_room_turn(
    room: RoomState,
    student_text: Optional[str] = None,
    student_started_ms: Optional[int] = None,
    student_ended_ms: Optional[int] = None,
    interrupted_turn_id: Optional[str] = None
) -> NextTurnResponse:
    now_ms = int(time.time() * 1000)
    remaining_sec = room.get_remaining_sec()
    verified_facts = get_facts_for_topic(room.topic)
    student_profile = get_or_create_student(room.student_id)

    # 1. Handle interruption if supplied
    if interrupted_turn_id:
        room.mark_interrupted(interrupted_turn_id)

    # 2. Opening phase: If transcript is empty, moderator starts with evidence-based framing
    if len(room.transcript) == 0:
        room.phase = "opening"
        text = (
            f"Welcome everyone to today's group discussion on '{room.topic}'. "
            f"Please substantiate your perspectives with empirical logic and real-world examples. Who would like to initiate?"
        )
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

    # 3. Process student speech, extract learnings and satisfaction signals
    student_intent = None
    if student_text and student_text.strip():
        if room.phase == "opening":
            room.phase = "discussion"

        # Record student turn
        room.add_turn(
            speaker_id="student",
            speaker_name="You",
            role="student",
            text=student_text.strip(),
            is_ai=False,
            t_ms=student_ended_ms or now_ms
        )

        # Update student profile, check if query resolved or concepts learned
        learning_res = process_student_utterance_and_learnings(
            student_id=room.student_id,
            topic=room.topic,
            student_text=student_text.strip()
        )
        student_intent = learning_res["intent"]
        student_profile = learning_res["updated_profile"]

        if student_intent.get("is_satisfied_signal"):
            room.is_satisfied = True

    # 4. Phase and Satisfaction Logic:
    # If scheduled time is low, but student is still actively probing or unsatisfied, do NOT abruptly cut off!
    if remaining_sec <= 40 and room.phase == "discussion":
        if room.is_satisfied:
            # Student is satisfied -> Proceed to closing round
            room.phase = "closing"
            text = "Since the core perspectives and doubts have been thoroughly examined, let us conclude with our final synthesized remarks."
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
            # Student is still probing -> Grant grace extension and invite targeted answers
            text = "We have reached our initial time allotment, but an open inquiry remains on the floor. Let us ensure the query is satisfactorily addressed with concrete evidence."
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

    # 5. Empty student text flow (AI just spoke or student is reflecting)
    if not student_text or not student_text.strip():
        # If 2 consecutive AI turns have completed, return floor to student
        if room.consecutive_ai_turns >= 2:
            return NextTurnResponse(
                turn=None,
                next_actor="student",
                phase=room.phase,  # type: ignore
                remaining_sec=remaining_sec,
                nudge=None,
                degraded=False
            )

        # Inactivity nudge: if student has been silent for > 35 seconds
        if (now_ms - room.last_student_turn_ms) > 35000:
            prompt_fact = verified_facts.get("verified_data_points", [{}])[0].get("claim", "empirical evidence")
            return NextTurnResponse(
                turn=None,
                next_actor="student",
                phase=room.phase,  # type: ignore
                remaining_sec=remaining_sec,
                nudge=f"The floor is open. How would you evaluate the real-world trade-off concerning {prompt_fact}?",
                degraded=False
            )

    # 6. Generate next AI turn via LLM Router with verified facts and student memory
    recent_turns = [
        {
            "id": t.id,
            "speaker_id": t.speaker_id,
            "speaker_name": t.speaker_name,
            "role": t.role,
            "text": t.text
        }
        for t in room.transcript[-6:]
    ]
    available_personas = [
        {
            "id": p.id,
            "name": p.name,
            "persona": p.persona,
            "system_prompt": PERSONA_CATALOG.get(p.id, {}).get("system_prompt", "")
        }
        for p in room.participants
    ]

    llm_result, provider_used, is_degraded = await llm_router.generate_turn(
        topic=room.topic,
        recent_turns=recent_turns,
        available_personas=available_personas,
        phase=room.phase,
        verified_facts=verified_facts,
        student_profile=student_profile
    )

    # 7. Fallback degradation handling if all LLM providers failed
    if is_degraded or not llm_result:
        fallback_data = verified_facts.get("verified_data_points", [{}])[0]
        fallback_text = (
            f"Let us focus on verified empirical data. For instance, {fallback_data.get('evidence', 'studies show structural shifts take years to equilibrate')}. "
            "How does that impact your perspective?"
        )
        mod_turn = room.add_turn(
            speaker_id="moderator",
            speaker_name=MODERATOR["name"],
            role="moderator",
            text=fallback_text,
            is_ai=True,
            t_ms=now_ms
        )
        return NextTurnResponse(
            turn=TurnDetail(
                id=mod_turn.id,
                speaker_id="moderator",
                speaker_name=MODERATOR["name"],
                role="moderator",
                text=fallback_text,
                t_ms=now_ms,
                voice=MODERATOR["voice"]
            ),
            next_actor="student",
            phase=room.phase,  # type: ignore
            remaining_sec=remaining_sec,
            nudge=None,
            degraded=True
        )

    # 8. Normal LLM response success
    spk_id = llm_result.get("speaker", room.participants[0].id)
    text = llm_result.get("text", "").strip()
    if not text:
        text = "We should analyze this from verified economic principles rather than speculation."

    persona_info = PERSONA_CATALOG.get(spk_id, PERSONA_CATALOG["aarav"])
    speaker_name = persona_info["name"]
    voice = persona_info["voice"]

    ai_turn = room.add_turn(
        speaker_id=spk_id,
        speaker_name=speaker_name,
        role="participant",
        text=text,
        is_ai=True,
        t_ms=now_ms
    )

    next_actor: str = "ai" if room.consecutive_ai_turns < 2 else "student"

    return NextTurnResponse(
        turn=TurnDetail(
            id=ai_turn.id,
            speaker_id=spk_id,
            speaker_name=speaker_name,
            role="participant",
            text=text,
            t_ms=now_ms,
            voice=voice
        ),
        next_actor=next_actor,  # type: ignore
        phase=room.phase,       # type: ignore
        remaining_sec=remaining_sec,
        nudge=None,
        degraded=False
    )
