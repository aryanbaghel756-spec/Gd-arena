import time
import json
from typing import Optional, List, Dict
from .models import (
    TurnDetail, NextTurnResponse, EndReportResponse, Metrics, CriterionScore, QuoteRef,
    Topic, TopicsResponse, MissedOpportunity
)
from .store import RoomState
from .personas import PERSONA_CATALOG, MODERATOR
from .facts_db import get_facts_for_topic
from .satisfaction import process_student_utterance_and_learnings
from .database import update_student_progress, get_connection

MOCK_TOPICS = [
    Topic(
        id="ai-jobs",
        title="Will AI Create More Jobs Than It Destroys?",
        category="Technology & Economy",
        difficulty="Medium",
        suggested_duration_sec=300,
        context="Debate whether rapid AI automation will cause permanent unemployment or lead to high-value job creation based on WEF and OECD data.",
        format="standard"
    ),
    Topic(
        id="case-startup-crisis",
        title="Case Study: NovaTech Crisis - 30% Layoffs vs. 15% Salary Cuts",
        category="Corporate Strategy & Crisis",
        difficulty="Hard",
        suggested_duration_sec=300,
        context="A Series B startup faces a 40% revenue drop with 8 months runway. Debate employee retention vs burn reduction.",
        format="case_based"
    ),
    Topic(
        id="abstract-silence",
        title="Abstract: Silence is More Eloquent Than Words",
        category="Philosophy & Leadership",
        difficulty="Hard",
        suggested_duration_sec=300,
        context="Interpret the strategic, diplomatic, and interpersonal dimensions of silence versus verbal articulation in leadership.",
        format="abstract"
    ),
    Topic(
        id="controversial-wealth-cap",
        title="Controversial: Should Maximum Personal Wealth Be Capped at $1 Billion?",
        category="Public Policy & Ethics",
        difficulty="Hard",
        suggested_duration_sec=300,
        context="Examine wealth inequality, capital mobility, investment incentives, and progressive taxation.",
        format="controversial"
    ),
    Topic(
        id="remote-work",
        title="Remote Work vs. Return to Office: The Future of Collaboration",
        category="Workplace & Society",
        difficulty="Easy",
        suggested_duration_sec=300,
        context="Examine Stanford/Bloom research on productivity, mentorship deficit, and urban economic shifts.",
        format="standard"
    )
]

def get_mock_topics() -> TopicsResponse:
    return TopicsResponse(topics=MOCK_TOPICS)

def register_custom_topic(title: str, category: str = "Custom Debate", difficulty: str = "Medium") -> Topic:
    slug = "".join(c if c.isalnum() else "-" for c in title.lower()).strip("-")
    facts = get_facts_for_topic(title)
    new_topic = Topic(
        id=slug,
        title=title,
        category=category,
        difficulty=difficulty,
        suggested_duration_sec=facts.get("suggested_duration_sec", 300),
        context=facts.get("context", f"Custom debate scenario for {title}"),
        format="custom"
    )
    if not any(t.id == slug for t in MOCK_TOPICS):
        MOCK_TOPICS.append(new_topic)
    return new_topic

def advance_mock_turn(
    room: RoomState,
    student_text: Optional[str] = None,
    student_started_ms: Optional[int] = None,
    student_ended_ms: Optional[int] = None,
    interrupted_turn_id: Optional[str] = None,
    student_id: Optional[str] = None,
    student_name: Optional[str] = None
) -> NextTurnResponse:
    now_ms = int(time.time() * 1000)
    remaining_sec = room.get_remaining_sec()
    verified_facts = get_facts_for_topic(room.topic)
    is_hinglish = (room.language == "hinglish")

    if interrupted_turn_id:
        room.mark_interrupted(interrupted_turn_id)

    # 1. Opening phase: If transcript is empty, moderator starts
    if len(room.transcript) == 0:
        room.phase = "opening"
        if room.format == "case_based":
            text = (
                f"Welcome to this Case-Study GD on '{room.topic}'. "
                "Analyze the stakeholder trade-offs between runway survival and employee morale. Who will begin?"
                if not is_hinglish else
                f"Welcome everyone! Aaj hum case study discuss kar rahe hain: '{room.topic}'. "
                "Kon start karega with problem analysis?"
            )
        elif room.format == "abstract":
            text = (
                f"Welcome everyone to this Abstract GD on '{room.topic}'. "
                "Look beyond literal meanings and present multidimensional interpretations. The floor is open."
                if not is_hinglish else
                f"Welcome everyone! Aaj ka abstract topic hai: '{room.topic}'. "
                "Isko different perspectives se interpret karke initiate kijiye."
            )
        elif room.format == "fishbowl":
            text = (
                f"Welcome to the Fishbowl GD on '{room.topic}'. "
                "Inner circle participants will initiate the debate. Observer may enter the circle when ready."
                if not is_hinglish else
                f"Welcome to the Fishbowl GD on '{room.topic}'. "
                "Inner circle se start karenge, jab aap ready ho circle enter karke speak kar sakte hain."
            )
        else:
            text = (
                f"Welcome everyone to today's group discussion on '{room.topic}'. Let us anchor our viewpoints in verified empirical evidence. Who would like to initiate?"
                if not is_hinglish else
                f"Welcome everyone to today's discussion on '{room.topic}'. Data aur logic ke basis par discuss karte hain. Kon start karega?"
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

    # 2. Record student text if provided & process satisfaction/learnings
    if student_text and student_text.strip():
        if room.phase == "opening":
            room.phase = "discussion"
        
        spk_id = student_id or "student"
        spk_name = student_name or room.human_participants.get(spk_id, "You")
        room.add_turn(
            speaker_id=spk_id,
            speaker_name=spk_name,
            role="student",
            text=student_text.strip(),
            is_ai=False,
            t_ms=student_ended_ms or now_ms
        )
        learning = process_student_utterance_and_learnings(room.student_id, room.topic, student_text.strip())
        if learning["intent"]["is_satisfied_signal"]:
            room.is_satisfied = True

    # 3. Dynamic closing logic
    if remaining_sec <= 40 and room.phase == "discussion":
        if room.is_satisfied:
            room.phase = "closing"
            text = (
                "As the fundamental questions have been satisfactorily explored, let us begin our concluding remarks."
                if not is_hinglish else
                "Sabhi major points aur doubts cover ho chuke hain, chaliye ab final conclusion summarize karte hain."
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
                phase="closing",
                remaining_sec=remaining_sec,
                nudge=None,
                degraded=False
            )
        else:
            text = (
                "We have reached our baseline time, but you have an open inquiry. Let us provide a concrete factual resolution."
                if not is_hinglish else
                "Baseline time ho gaya hai par student ka query open hai. Let's make sure unko clear answer mile."
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

        pause_threshold_ms = room.patience_sec * 6000
        if (now_ms - room.last_student_turn_ms) > pause_threshold_ms:
            fact_ref = verified_facts.get("verified_data_points", [{}])[0].get("claim", "data")
            nudge_msg = (
                f"You haven't spoken recently. How does the verified evidence on '{fact_ref}' shape your view?"
                if not is_hinglish else
                f"Aap thodi der se chup hain. '{fact_ref}' par aapka kya take hai, share kijiye."
            )
            return NextTurnResponse(
                turn=None,
                next_actor="student",
                phase=room.phase,  # type: ignore
                remaining_sec=remaining_sec,
                nudge=nudge_msg,
                degraded=False
            )

    # 5. Pick an AI participant to respond
    p_idx = len(room.transcript) % len(room.participants)
    persona_obj = room.participants[p_idx]
    pid = persona_obj.id

    canned_responses: Dict[str, List[str]] = {
        "aarav": [
            "Looking at the data from the World Economic Forum, 85 million routine jobs will change, but 97 million new roles will be created in tech and green energy." if not is_hinglish else "WEF ke data ke mutabik 85 million jobs automate hongi par 97 million nayi roles create hongi, so net growth positive hai.",
            "History shows that when farming was mechanized, it did not end work; it created millions of better-paying factory and office jobs." if not is_hinglish else "Historical data dekhein toh farm labor 70% se ghat kar 3% hua tha, par wages 400% badhi industrialization ki wajah se.",
            "Reports from Goldman Sachs show AI will boost the global economy by 7%, which directly creates new local businesses and service jobs." if not is_hinglish else "Goldman Sachs estimate karta hai ki AI se global GDP 7% badhegi, jo local services me nayi jobs generate karegi."
        ],
        "meera": [
            "Let us think of AI as a helpful assistant rather than a replacement. It takes away repetitive work so we can focus on creative thinking." if not is_hinglish else "AI ko replacement ki jagah co-pilot samjho. Stanford study kehti hai log routine kaam ki jagah strategy me 40% zyada time spend kar rahe hain.",
            "Think about jobs like prompt designer or digital ethics reviewer. These roles did not even exist three years ago." if not is_hinglish else "Socho algorithmic ethics aur digital systems architecture jaise naye careers jo 3 saal pehle exist bhi nahi karte the.",
            "When routine data work is automated, people can spend more time on healthcare, teaching, and human-centric roles." if not is_hinglish else "Jab routine tasks automate hote hain, human capital creative education aur empathetic healthcare me invest hota hai."
        ],
        "kabir": [
            "That sounds positive, but OECD studies show that 27% of jobs face high risk. How do non-technical workers adapt without struggle?" if not is_hinglish else "Long term toh theek hai, par OECD 2023 report kehti hai 27% jobs high risk par hain. Short term me un workers ka kya hoga?",
            "We must be realistic: a displaced factory worker cannot become a software engineer in just a few months." if not is_hinglish else "Hume ye nahi bhulna chahiye ki ground level par ek displaced worker 6 mahine me AI engineer nahi ban sakta.",
            "If big tech companies take all the profits, how will local communities support workers who lose their regular jobs?" if not is_hinglish else "Agar sarra profit top tech giants me consolidate hoga, toh local workers ko support karne ke liye tax safety net kahan se aayega?"
        ],
        "ananya": [
            "Kabir makes a very fair point about transition hurdles, but free reskilling grants paired with apprenticeships can bridge that gap." if not is_hinglish else "Kabir ka point valid hai transition friction par, par agar government reskilling grants de aur companies apprenticeship de, toh ye gap bridge ho sakta hai.",
            "Looking at both sides, the best solution is giving workers financial support while training them in modern digital tools." if not is_hinglish else "Dono sides ko dekh kar, Nordic model jaise active labor policies aur transition security hi best practical solution hai.",
            "Aarav shows the long-term growth, and Kabir shows the immediate pain. The real answer is managing the transition speed carefully." if not is_hinglish else "Aarav ka data aur Kabir ka concern combine karein toh speed of transition hi asli challenge hai, jisko policy se solve kiya ja sakta hai."
        ],
        "rohan": [
            "In the global economy, nations and companies that hesitate to adopt AI will quickly fall behind international competitors." if not is_hinglish else "Geopolitical reality simple hai: jo desh AI adopt karne me delay karega, woh global market me peeche chhoot jayega.",
            "Instead of fearing job cuts, colleges must update their syllabus immediately to equip students with practical skills." if not is_hinglish else "Hume execution speed badhani hogi. Proactive curriculum update hi hamara sabse strong defense hai.",
            "We cannot afford to delay progress out of fear. Fast execution and practical training are our greatest advantages." if not is_hinglish else "Fear of disruption ki wajah se leadership lose nahi kar sakte. Scale par skilling karna hi national priority hona chahiye."
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

    # "What You Could Have Said" replay
    what_you_could_have_said = [
        MissedOpportunity(
            turn_id="turn_3",
            speaker_name="Kabir",
            trigger_text="While long-term trends look positive, what about transitional unemployment?",
            suggested_response="I acknowledge Kabir's point on friction, but according to Nordic active labor studies, transition voucher programs reduce frictional unemployment duration by 45%.",
            missed_angle="Pivoting from obstacle to proactive policy solution with empirical evidence"
        )
    ]

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
        criteria_scores=criteria,
        what_you_could_have_said=what_you_could_have_said
    )
