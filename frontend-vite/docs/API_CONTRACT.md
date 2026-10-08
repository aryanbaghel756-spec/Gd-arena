# Backend API Contract - GD Arena (Problem Statement 2)

This document represents the **single source of truth** for backend integration between the frontend and the local AI backend (Ollama LLM + Whisper STT + TTS).

Base URL: Configured via environment variable `VITE_API_URL` (defaults to `http://localhost:8000`).

---

## 1. System Health Check

Check connectivity and active LLM model availability.

- **Endpoint**: `GET /api/health`
- **Headers**: None required
- **Success Response (200 OK)**:
```json
{
  "ok": true,
  "model": "gemma3:4b"
}
```
- **Error Response (503 Service Unavailable)**:
```json
{
  "ok": false,
  "error": "Ollama service unavailable"
}
```

---

## 2. Generate Participant Turn

Generates a context-aware spoken response from an AI persona or moderator transition based on the recent discussion transcript.

- **Endpoint**: `POST /api/turn`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "persona": {
    "id": "kabir",
    "name": "Kabir",
    "role": "Critic",
    "systemPrompt": "You are Kabir, a sharp critical thinker in a GD. Scrutinize superficial claims, highlight unintended consequences, and demand evidence. Speak in 2-3 spoken sentences, max 55 words."
  },
  "topic": "Should AI replace human jobs?",
  "transcript": [
    {
      "speaker": "You",
      "role": "Student",
      "text": "I believe AI will augment worker productivity rather than eliminate entire professions.",
      "time": "00:45",
      "interrupted": false
    }
  ],
  "nextSpeaker": "Ananya",
  "maxWords": 60
}
```
- **Success Response (200 OK)**:
```json
{
  "text": "While that sounds optimistic in theory, historical transitions show severe friction and wage stagnation before any widespread retraining takes effect."
}
```
- **Error Response (500 Internal Server Error)**:
```json
{
  "error": "Generation failed or timed out"
}
```

---

## 3. Speech-To-Text (Whisper STT)

Transcribes a student voice utterance from a recorded audio blob.

- **Endpoint**: `POST /api/stt`
- **Headers**: `Content-Type: multipart/form-data`
- **Form Data**:
  - `audio`: Binary audio file (`audio/webm` or `audio/wav`)
- **Success Response (200 OK)**:
```json
{
  "text": "I agree with Aarav's point regarding productivity statistics, but we must also safeguard entry-level jobs.",
  "segments": [
    {
      "start": 0.0,
      "end": 3.8,
      "text": "I agree with Aarav's point regarding productivity statistics, but we must also safeguard entry-level jobs."
    }
  ]
}
```

---

## 4. Text-To-Speech (TTS, Optional)

Synthesizes audio for an AI persona turn.

- **Endpoint**: `POST /api/tts`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "text": "Looking at productivity statistics, companies adopting modern frameworks report measurable surges.",
  "personaId": "aarav"
}
```
- **Success Response (200 OK)**:
  - Binary Audio Stream (`Content-Type: audio/wav` or `audio/mpeg`)
- **Note**: If the backend TTS is unavailable, the frontend gracefully falls back to browser `window.speechSynthesis`.

---

## 5. Generate Evaluation Feedback

Generates structured discussion performance feedback and quote-linked evaluations.

- **Endpoint**: `POST /api/feedback`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "topic": "Should AI replace human jobs?",
  "transcript": [ ... ],
  "metrics": {
    "speakingSharePct": 26,
    "interruptionsCount": 1,
    "contributionsCount": 3
  }
}
```
- **Success Response (200 OK)**:
```json
{
  "overall": 82,
  "skills": {
    "opening": 4.5,
    "building": 4.0,
    "clarity": 4.2,
    "listening": 3.8,
    "participation": 4.0
  },
  "strengths": [
    {
      "text": "Took decisive initiative by opening the discussion with structured arguments.",
      "quote": "I believe AI will augment worker productivity...",
      "time": "00:45"
    }
  ],
  "improvements": [
    {
      "text": "At 01:42 you interrupted Kabir. Practice active listening pauses.",
      "quote": "Interrupted Kabir while discussing systemic friction",
      "time": "01:42"
    }
  ]
}
```

---

## 6. Shared Data Contract: Transcript Entry

Every transcript line in the live session and feedback audit follows this exact schema:

```typescript
interface TranscriptEntry {
  id: string;              // Unique identifier e.g. "turn-1718000000-42"
  speaker: string;         // "You" | "Moderator" | "Aarav" | "Meera" | "Kabir" | "Ananya" | "Rohan"
  role: string;            // "Student" | "Facilitator" | "Analyst" | "Creative" | "Critic" | "Collaborator" | "Debater"
  text: string;            // Spoken utterance
  time: string;            // Timestamp string e.g. "01:24"
  startMs: number;         // Millisecond epoch timestamp
  endMs: number;           // Millisecond epoch timestamp
  interrupted: boolean;    // true if student interjected or turn was cut short
  color?: string;          // Hex accent color
}
```
