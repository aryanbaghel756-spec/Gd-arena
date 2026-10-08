import time
from typing import Optional, Dict, Any
from .models import TurnDetail, NextTurnResponse
from .store import RoomState
from .personas import PERSONA_CATALOG, MODERATOR
from .llm.router import llm_router

async def advance_room_turn(
    room: RoomState,
    student_text: Optional[str] = None,
    student_started_ms: Optional[int] = None,
    student_ended_ms: Optional[int] = None,
    interrupted_turn_id: Optional[str] = None
) -> NextTurnResponse:
    now_ms = int(time.time() * 1000)
    remaining_sec = room.get_remaining_sec()

    # 1. Handle interruption if supplied
    if interrupted_turn_id:
        room.mark_interrupted(interrupted_turn_id)

    # 2. Opening phase: If transcript is empty, moderator starts
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

    # 3. Record student turn if provided
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

    # 4. Timer / Phase logic: Check closing round
    if remaining_sec <= 60 and room.phase == "discussion":
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

    # 5. Empty student text flow (AI just finished speaking or student is silent)
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

        # Inactivity nudge: if student has been silent for > 40 seconds
        if (now_ms - room.last_student_turn_ms) > 40000:
            return NextTurnResponse(
                turn=None,
                next_actor="student",
                phase=room.phase,  # type: ignore
                remaining_sec=remaining_sec,
                nudge="The discussion is open. Feel free to challenge recent points or propose a fresh perspective.",
                degraded=False
            )

    # 6. Generate next AI turn via LLM Router
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
        phase=room.phase
    )

    # 7. Fallback degradation handling if all LLM providers failed
    if is_degraded or not llm_result:
        fallback_text = "Let us keep our arguments focused on the key real-world implications. Who wants to build on that?"
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
        text = "I think we need to examine this from both short-term and long-term perspectives."

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
