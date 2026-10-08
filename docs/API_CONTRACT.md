# GD Arena - API Contract Specification

> **Version**: 1.0.0  
> **Problem Statement**: Problem Statement 2 (GD Arena)  
> **Target Audience**: Frontend & Backend Engineers  
> **Rule**: This document is the source of truth for all API shapes. Field names must never change without updating this contract and mock response files in the same commit.

---

## 1. Overview & Base URL

- **Base URL**: `http://localhost:8000` (or `http://<LAN_IP>:8000`)
- **Headers**: `Content-Type: application/json`
- **CORS**: Configured for `http://localhost:5173` and `FRONTEND_ORIGIN`
- **Mock Mode**: When `MOCK_MODE=true` is set on the backend, all endpoints return deterministic canned responses identical to the shapes defined below. Zero API keys or local LLM required for frontend testing.

---

## 2. Standard Error Format

All error responses across all endpoints follow this standard JSON envelope with an appropriate HTTP status code (`400`, `404`, `422`, `500`):

```json
{
  "error": {
    "code": "ROOM_NOT_FOUND",
    "message": "Room 'room_123' does not exist."
  }
}
```

Standard error codes:
- `VALIDATION_ERROR`: Invalid request payload or parameter out of bounds.
- `ROOM_NOT_FOUND`: The requested room ID does not exist.
- `ROOM_ALREADY_ENDED`: Attempted turn in a room that has already concluded.
- `PROVIDER_ERROR`: Downstream AI provider issue (falls back to degraded response when possible).

---

## 3. Endpoints

### 3.1 `GET /api/health`
Health check endpoint reporting backend operational status, current LLM provider, and mock mode status.

- **Method**: `GET`
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "mock_mode": true,
  "provider": "ollama",
  "active_providers": ["ollama", "groq", "gemini"],
  "timestamp": "2026-10-08T11:45:00Z"
}
```

---

### 3.2 `GET /api/topics`
Fetches the curated catalog of group discussion topics.

- **Method**: `GET`
- **Response**: `200 OK`
```json
{
  "topics": [
    {
      "id": "ai-jobs",
      "title": "Will AI Create More Jobs Than It Destroys?",
      "category": "Technology & Economy",
      "difficulty": "Medium",
      "suggested_duration_sec": 300,
      "context": "Debate whether rapid AI automation will cause permanent unemployment or lead to high-value job creation."
    },
    {
      "id": "remote-work",
      "title": "Remote Work vs. Return to Office: The Future of Collaboration",
      "category": "Workplace & Society",
      "difficulty": "Easy",
      "suggested_duration_sec": 300,
      "context": "Examine productivity, work-life balance, corporate culture, and mentorship."
    },
    {
      "id": "social-media-regulation",
      "title": "Should Social Media Algorithms Be Strictly Regulated by Government?",
      "category": "Ethics & Policy",
      "difficulty": "Hard",
      "suggested_duration_sec": 300,
      "context": "Discuss freedom of speech, mental health, algorithmic bias, and state control."
    }
  ]
}
```

---

### 3.3 `POST /api/rooms`
Creates a new discussion room with a specified topic, panel size, and language. Initializes the AI participants and moderator.

- **Method**: `POST`
- **Request Body**:
```json
{
  "topic": "Will AI Create More Jobs Than It Destroys?",
  "panel_size": 4,
  "language": "en"
}
```
*Constraints*:
- `panel_size`: integer between `3` and `5` (inclusive).
- `language`: `"en"` or `"hinglish"`.

- **Response**: `201 Created`
```json
{
  "room_id": "room_a1b2c3d4",
  "topic": "Will AI Create More Jobs Than It Destroys?",
  "language": "en",
  "duration_sec": 300,
  "created_at_ms": 1728374000000,
  "moderator": {
    "id": "moderator",
    "name": "Dr. Verma",
    "role": "moderator",
    "is_ai": true,
    "voice": {
      "gender_hint": "female",
      "pitch": 1.0,
      "rate": 1.0
    }
  },
  "participants": [
    {
      "id": "aarav",
      "name": "Aarav",
      "persona": "Analyst (logical, fact-focused, data-driven)",
      "is_ai": true,
      "voice": {
        "gender_hint": "male",
        "pitch": 0.95,
        "rate": 1.05
      }
    },
    {
      "id": "meera",
      "name": "Meera",
      "persona": "Creative (innovative, big-picture, unconventional solutions)",
      "is_ai": true,
      "voice": {
        "gender_hint": "female",
        "pitch": 1.1,
        "rate": 1.0
      }
    },
    {
      "id": "kabir",
      "name": "Kabir",
      "persona": "Critic (skeptical, challenges assumptions, finds flaws)",
      "is_ai": true,
      "voice": {
        "gender_hint": "male",
        "pitch": 0.9,
        "rate": 0.95
      }
    },
    {
      "id": "ananya",
      "name": "Ananya",
      "persona": "Collaborator (balanced, supportive, synthesizes common ground)",
      "is_ai": true,
      "voice": {
        "gender_hint": "female",
        "pitch": 1.05,
        "rate": 1.0
      }
    }
  ]
}
```

*Notes for Frontend UI*:
- Every participant has `"is_ai": true`. The UI **must** visually badge each AI participant with an AI chip or icon.
- `panel_size` determines whether 3, 4, or 5 participants are picked from `[Aarav, Meera, Kabir, Ananya, Rohan]`.

---

### 3.4 `GET /api/rooms/{id}`
Returns the full state, timer info, and complete transcript for reconnects, refreshes, or live syncing.

- **Method**: `GET`
- **Response**: `200 OK`
```json
{
  "room_id": "room_a1b2c3d4",
  "topic": "Will AI Create More Jobs Than It Destroys?",
  "language": "en",
  "phase": "discussion",
  "duration_sec": 300,
  "remaining_sec": 215,
  "moderator": {
    "id": "moderator",
    "name": "Dr. Verma",
    "role": "moderator",
    "is_ai": true,
    "voice": {
      "gender_hint": "female",
      "pitch": 1.0,
      "rate": 1.0
    }
  },
  "participants": [
    {
      "id": "aarav",
      "name": "Aarav",
      "persona": "Analyst (logical, fact-focused, data-driven)",
      "is_ai": true,
      "voice": { "gender_hint": "male", "pitch": 0.95, "rate": 1.05 }
    },
    {
      "id": "meera",
      "name": "Meera",
      "persona": "Creative (innovative, big-picture, unconventional solutions)",
      "is_ai": true,
      "voice": { "gender_hint": "female", "pitch": 1.1, "rate": 1.0 }
    },
    {
      "id": "kabir",
      "name": "Kabir",
      "persona": "Critic (skeptical, challenges assumptions, finds flaws)",
      "is_ai": true,
      "voice": { "gender_hint": "male", "pitch": 0.9, "rate": 0.95 }
    },
    {
      "id": "ananya",
      "name": "Ananya",
      "persona": "Collaborator (balanced, supportive, synthesizes common ground)",
      "is_ai": true,
      "voice": { "gender_hint": "female", "pitch": 1.05, "rate": 1.0 }
    }
  ],
  "transcript": [
    {
      "id": "turn_1",
      "speaker_id": "moderator",
      "speaker_name": "Dr. Verma",
      "role": "moderator",
      "is_ai": true,
      "text": "Welcome everyone to today's group discussion on 'Will AI Create More Jobs Than It Destroys?'. The floor is now open. Who would like to initiate?",
      "t_ms": 1728374001000,
      "interrupted": false
    },
    {
      "id": "turn_2",
      "speaker_id": "student",
      "speaker_name": "You",
      "role": "student",
      "is_ai": false,
      "text": "I would like to start. Looking back at history, industrial revolutions always created far more jobs than they displaced.",
      "t_ms": 1728374015000,
      "interrupted": false
    }
  ]
}
```

---

### 3.5 `POST /api/rooms/{id}/next`
Advances the group discussion by one turn.

#### Dialogue Flow Mechanics:
1. **Student Turn Submission**:
   - The user finishes speaking (push-to-talk released or silence detected).
   - Frontend calls `POST /api/rooms/{id}/next` with `{ student_text, student_started_ms, student_ended_ms, interrupted_turn_id? }`.
   - Backend records the student turn in the transcript, decides the next speaker (AI or Moderator), and returns `{ turn: {...}, next_actor: "ai" | "student", ... }`.
2. **AI Speech Playback**:
   - Frontend plays `turn.text` aloud using browser `window.speechSynthesis` using `turn.voice` pitch/rate/gender hints.
3. **AI Follow-up / Floor Handoff**:
   - When the AI finishes speaking, the frontend calls `POST /api/rooms/{id}/next` with `{}` (empty body or no `student_text`).
   - The backend decides whether another AI participant should respond (`next_actor: "ai"`, `turn: {...}`) OR if the discussion should pause for the student (`next_actor: "student"`, `turn: null` or moderator prompt).
4. **Interruptions**:
   - If the user interrupts while an AI is speaking, the frontend cancels TTS immediately and submits `interrupted_turn_id: "turn_x"`.
   - Backend marks `turn_x` as interrupted and prioritizes the student's text.
5. **Silence / Nudge**:
   - If student has not spoken for an extended duration, backend supplies a `nudge` text in the response.

- **Method**: `POST`
- **Request Body**:
```json
{
  "student_text": "While that's true, modern AI displaces cognitive skills, not just repetitive manual labor.",
  "student_started_ms": 1728374030000,
  "student_ended_ms": 1728374038000,
  "interrupted_turn_id": "turn_3"
}
```
*(All fields are optional when advancing AI-to-AI turns)*

- **Response**: `200 OK` (Case A: AI Speaks Next)
```json
{
  "turn": {
    "id": "turn_4",
    "speaker_id": "kabir",
    "speaker_name": "Kabir",
    "role": "participant",
    "text": "Exactly my concern. A software engineer displaced by AI cannot become a data curator overnight without massive frictional unemployment.",
    "t_ms": 1728374040000,
    "voice": {
      "gender_hint": "male",
      "pitch": 0.9,
      "rate": 0.95
    }
  },
  "next_actor": "ai",
  "phase": "discussion",
  "remaining_sec": 195,
  "nudge": null,
  "degraded": false
}
```

- **Response**: `200 OK` (Case B: Floor Passed to Student)
```json
{
  "turn": null,
  "next_actor": "student",
  "phase": "discussion",
  "remaining_sec": 170,
  "nudge": null,
  "degraded": false
}
```

- **Response**: `200 OK` (Case C: Inactivity Nudge)
```json
{
  "turn": null,
  "next_actor": "student",
  "phase": "discussion",
  "remaining_sec": 140,
  "nudge": "The panel is quiet. Share your viewpoint on how governments should handle reskilling programs.",
  "degraded": false
}
```

- **Response**: `200 OK` (Case D: Degradation Fallback)
```json
{
  "turn": {
    "id": "turn_5",
    "speaker_id": "moderator",
    "speaker_name": "Dr. Verma",
    "role": "moderator",
    "text": "Let us keep our arguments focused on the economic implications. Who wants to build on that?",
    "t_ms": 1728374045000,
    "voice": {
      "gender_hint": "female",
      "pitch": 1.0,
      "rate": 1.0
    }
  },
  "next_actor": "student",
  "phase": "discussion",
  "remaining_sec": 130,
  "nudge": null,
  "degraded": true
}
```

---

### 3.6 `POST /api/rooms/{id}/end`
Concludes the discussion and generates the performance report.

- **Method**: `POST`
- **Request Body**: `{}` (Empty JSON object)
- **Response**: `200 OK`
```json
{
  "room_id": "room_a1b2c3d4",
  "topic": "Will AI Create More Jobs Than It Destroys?",
  "duration_sec": 300,
  "total_turns": 14,
  "overall_score": 78,
  "summary": "You demonstrated strong initiative by opening the discussion with an apt historical parallel. Your points were logical, though you could engage more directly with counter-arguments raised by Kabir.",
  "metrics": {
    "speaking_share_pct": {
      "student": 28.5,
      "aarav": 22.0,
      "meera": 18.2,
      "kabir": 20.1,
      "moderator": 11.2
    },
    "word_counts": {
      "student": 194,
      "aarav": 150,
      "meera": 124,
      "kabir": 137,
      "moderator": 76
    },
    "student_interruptions_count": 1
  },
  "criteria_scores": [
    {
      "criterion": "Starting the discussion",
      "score": 5,
      "feedback": "Took the lead right after the moderator's opening prompt, setting a constructive tone.",
      "quote": {
        "turn_id": "turn_2",
        "text": "I would like to start. Looking back at history, industrial revolutions always created far more jobs than they displaced."
      }
    },
    {
      "criterion": "Idea quality",
      "score": 4,
      "feedback": "Highlighted the critical difference between manual automation and cognitive displacement.",
      "quote": {
        "turn_id": "turn_4",
        "text": "While that's true, modern AI displaces cognitive skills, not just repetitive manual labor."
      }
    },
    {
      "criterion": "Building on others",
      "score": 3,
      "feedback": "Acknowledged Aarav's data point but could have explicitly tied your point to Meera's creative solutions.",
      "quote": {
        "turn_id": "turn_6",
        "text": "Building on what Aarav mentioned about IT sector growth, we also have to look at regional impact."
      }
    },
    {
      "criterion": "Listening",
      "score": 4,
      "feedback": "Attentive listener; did not speak over colleagues except for one purposeful intervention.",
      "quote": {
        "turn_id": "turn_6",
        "text": "Building on what Aarav mentioned about IT sector growth, we also have to look at regional impact."
      }
    },
    {
      "criterion": "Handling interruptions",
      "score": 4,
      "feedback": "Handled Kabir's interjection smoothly and maintained your composure.",
      "quote": {
        "turn_id": "turn_8",
        "text": "I understand your concern Kabir, but retraining programs can be subsidized by tech tax."
      }
    },
    {
      "criterion": "Ending strongly",
      "score": 4,
      "feedback": "Delivered a balanced concluding remark synthesizing technology and human adaptability.",
      "quote": {
        "turn_id": "turn_12",
        "text": "In conclusion, AI will transform employment rather than eliminate it, provided governments invest heavily in reskilling."
      }
    }
  ]
}
```

*Crucial Backend Guarantee*:
- Speaking share and word counts are computed **deterministically in code**.
- Every single quote inside `criteria_scores` is **strictly validated** against the transcript. If an LLM hallucinated a quote that is not present in the room transcript, the validation engine drops or replaces it with an authentic utterance from the session.

---

## 4. Personas Specification

| ID | Name | Role | Speaking Style | Voice Hint |
|---|---|---|---|---|
| `moderator` | Dr. Verma | Facilitator | Guiding, calm, neutral, enforces turns and time | Female, pitch 1.0, rate 1.0 |
| `aarav` | Aarav | Analyst | Logical, fact-oriented, citations, cause-and-effect, no fluff | Male, pitch 0.95, rate 1.05 |
| `meera` | Meera | Creative | Innovative, analogies, unconventional perspectives | Female, pitch 1.1, rate 1.0 |
| `kabir` | Kabir | Critic | Skeptical, pokes holes in arguments, asks tough 'what if' questions | Male, pitch 0.9, rate 0.95 |
| `ananya` | Ananya | Collaborator | Supportive, bridges opposing views, seeks common ground | Female, pitch 1.05, rate 1.0 |
| `rohan` | Rohan | Debater | Assertive, persuasive, rhetorical devices, defends stance firmly | Male, pitch 1.0, rate 1.1 |

---

## 5. Advanced Endpoints: Verified Real Facts, Dynamic Satisfaction & Student Memory

### 5.1 `GET /api/rooms/{id}/facts`
Returns verified real-world empirical data points, research studies (WEF, OECD, Stanford), and debunked myths for the room's debate topic.

- **Method**: `GET`
- **Response**: `200 OK`
```json
{
  "topic": "Will AI Create More Jobs Than It Destroys?",
  "core_domains": [
    "Labor Economics",
    "Automation History",
    "Cognitive vs Manual Tasks"
  ],
  "verified_data_points": [
    {
      "claim": "Net job generation vs displacement",
      "evidence": "World Economic Forum (WEF) Future of Jobs Report estimated 85 million jobs displaced alongside 97 million new roles emerging in AI synthesis, cloud, and green tech.",
      "source": "WEF Future of Jobs Report"
    },
    {
      "claim": "Historical precedent of tech shifts",
      "evidence": "Historical economic data from 19th-century Agricultural to Industrial revolution shows farm labor shrank from ~70% to <3%, yet real wages increased 400% through industrial diversification.",
      "source": "US Bureau of Labor Statistics & Economic History Association"
    }
  ],
  "common_myths_debunked": [
    {
      "myth": "AI will cause permanent 50%+ unemployment in 2 years.",
      "reality": "Economic transitions show 'lump of labor fallacy'—the total amount of work is not fixed; novel efficiencies stimulate new demand and industries."
    }
  ]
}
```

---

### 5.2 `POST /api/rooms/{id}/satisfaction`
Allows the student to explicitly signal satisfaction with the answers provided by the AI panel, or request continued inquiry.

- **Method**: `POST`
- **Request Body**:
```json
{
  "is_satisfied": true,
  "notes": "Clarified reskilling subsidy timeline"
}
```
- **Response**: `200 OK`
```json
{
  "room_id": "room_a1b2c3d4",
  "is_satisfied": true,
  "message": "Student satisfaction status recorded successfully."
}
```

---

### 5.3 `GET /api/students/{id}/profile`
Retrieves persistent student profile, known concepts ("isse ye aata hai"), resolved queries, and personalized skill roadmap across GD sessions.

- **Method**: `GET`
- **Response**: `200 OK`
```json
{
  "student_id": "student_default",
  "name": "Student Discussant",
  "known_concepts": [
    "Basic Group Discussion structure and decorum",
    "Opening statement articulation",
    "Will AI Create More Jobs Than It Destroys?: Net job generation vs displacement"
  ],
  "weak_areas": [
    "Neutralizing aggressive debaters with poise",
    "Synthesizing high-pressure consensus"
  ],
  "resolved_queries": [
    "What about transitional unemployment for non-technical workers?"
  ],
  "pending_queries": [],
  "roadmap": [
    {
      "milestone": 1,
      "goal": "Master Fact-Grounded Counter-Arguments",
      "status": "completed",
      "recommended_topic": "ai-jobs"
    },
    {
      "milestone": 2,
      "goal": "Lead Multi-Stakeholder Consensus Synthesis",
      "status": "in_progress",
      "recommended_topic": "remote-work"
    },
    {
      "milestone": 3,
      "goal": "Navigate High-Pressure Policy Interventions",
      "status": "pending",
      "recommended_topic": "social-media-regulation"
    }
  ],
  "total_sessions": 2,
  "average_score": 80.5,
  "created_at_ms": 1728374000000,
  "updated_at_ms": 1728374500000
}
```

---

### 5.4 `GET /api/students/{id}/roadmap`
Convenience endpoint fetching the student's dynamic learning roadmap milestones.

- **Method**: `GET`
- **Response**: `200 OK`
```json
{
  "student_id": "student_default",
  "name": "Student Discussant",
  "roadmap": [
    {
      "milestone": 1,
      "goal": "Master Fact-Grounded Counter-Arguments",
      "status": "completed",
      "recommended_topic": "ai-jobs"
    },
    {
      "milestone": 2,
      "goal": "Lead Multi-Stakeholder Consensus Synthesis",
      "status": "in_progress",
      "recommended_topic": "remote-work"
    }
  ],
  "known_concepts": [
    "Basic Group Discussion structure and decorum",
    "Net job generation vs displacement (WEF Data)"
  ],
  "weak_areas": [
    "Neutralizing aggressive debaters with poise"
  ]
}
```

