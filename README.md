# GD Arena (Problem Statement 2)

## 1. What it does
GD Arena is a voice-first AI group discussion trainer built for Problem Statement 2 (GD Arena). It simulates realistic group discussions where a student converses with 3 to 5 distinct AI participants and an automated AI moderator in real time. Following the session, the application provides an in-depth, transcript-linked performance report scoring key communication competencies.

---

## 2. Done / Left / Plan

### Done
- Formalized complete API contract specification (`docs/API_CONTRACT.md`) and mock JSON payloads (`docs/mock_responses/*.json`).
- Configured repository structure with `.gitignore`, `backend/.env.example`, and `frontend/.env.example`.
- Designed multi-provider LLM abstraction architecture (Ollama, Groq, Gemini) with graceful degradation.
- Defined persona profiles (Aarav, Meera, Kabir, Ananya, Rohan, and Dr. Verma Moderator) with voice synthesis hints.

### Left
- FastAPI backend application implementation (`backend/main.py` and routers).
- In-memory / SQLite room and transcript persistence.
- Single-call LLM turn generation engine and moderator state machine.
- Speaking share and word count analytics engine.
- LLM qualitative evaluation with strict transcript quote verification.
- Automated pytests and end-to-end discussion simulation script.

### Plan
1. **Phase 1**: Contract & Mock Mode FastAPI backend with CORS.
2. **Phase 2**: Real LLM turn engine supporting switchable providers with automatic fallback.
3. **Phase 3**: Moderator state machine, timer tracking, interruption handling, and inactivity nudges.
4. **Phase 4**: Feedback report generator with deterministic metrics and verified transcript quotes.
5. **Phase 5**: Pytest suite and simulation script for verification.

---

## 3. Architecture and why

```mermaid
flowchart TB
    subgraph Client [Browser Client / Frontend]
        UI[Web UI]
        STT[Speech-to-Text / Web Speech API]
        TTS[SpeechSynthesis Audio Output]
    end

    subgraph Backend [FastAPI Backend Core]
        API[API Router / CORS]
        StateStore[In-Memory / SQLite Room & Transcript Store]
        ModStateMachine[Moderator State Machine]
        TurnEngine[Single-Call LLM Turn Engine]
        ReportEngine[Deterministic Metrics & Quote Validator]
    end

    subgraph LLM_Providers [LLM Provider Layer with Fallback]
        Ollama[Ollama Local Gemma 3 4B / Llama 3.2 3B]
        Groq[Groq Cloud LLaMA 3.3]
        Gemini[Google Gemini 2.0]
    end

    UI -->|STT Text| API
    API --> StateStore
    API --> ModStateMachine
    ModStateMachine --> TurnEngine
    TurnEngine --> LLM_Providers
    TurnEngine -->|AI Turn & Voice Hints| API
    API -->|Turn Audio Text| TTS
    API -->|POST /end| ReportEngine
    ReportEngine -->|Report JSON| UI
```

### Why this architecture?
- **Single-Call Per Turn**: Passing recent turns (~6 turns) to a single LLM prompt enables the model to choose both the natural speaker and write their contribution, simulating realistic cross-participant debate without multiplying latency or token usage.
- **Rule-Based Moderator State Machine**: Enforces structured GD phases (`opening` -> `discussion` -> `closing` -> `ended`) and handles timing reliably without unpredictable model drift.
- **Multi-Provider Fallback**: Prevents failures during live demonstrations by falling back smoothly from local Ollama to Groq or Gemini, and finally to a canned moderator line with `degraded: true`.
- **Verified Transcript Quotations**: Ensures evaluative remarks are grounded in actual student statements by programmatically verifying quote existence in code.

---

## 4. What we added
- `docs/API_CONTRACT.md`: Complete OpenAPI-aligned contract defining request/response shapes, error formatting, and turn protocol.
- `docs/mock_responses/*.json`: Complete set of canned JSON responses for all endpoints.
- `.gitignore`: Security and cleanliness rules excluding virtual environments, secrets, large models (`.gguf`, `.bin`), and media.
- `backend/.env.example` & `frontend/.env.example`: Configuration templates with placeholder variables.

---

## 5. How to run it

### Prerequisites
- Python 3.10+
- (Optional for local LLM) [Ollama](https://ollama.com/) with `gemma3:4b` or `llama3.2:3b` installed

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
5. Run in mock mode (no API keys required):
   ```bash
   uvicorn main:app --reload --port 8000
   ```
6. Verify the server is running:
   ```bash
   curl http://localhost:8000/api/health
   ```

*(Live deployment URL will be provided once deployed)*

---

## 6. Tools and AI used
- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic v2.
- **LLM Engine**: Multi-provider support for Ollama (local open-weight models), Groq API, and Google Gemini API.
- **Speech**: Browser Web Speech API for client-side Speech-to-Text and SpeechSynthesis for Text-to-Speech playback.
- **AI Transparency**: Every participant entity returned by the API contains `"is_ai": true` (including moderator). The frontend displays badges and disclaimers indicating all participants are simulated AI personas.

---

## 7. Who it is for
GD Arena is designed for students, job applicants, and interview candidates preparing for group discussions in campus placements, MBA admissions, and competitive corporate hiring rounds. It offers an accessible, low-anxiety environment to practice impromptu articulation, active listening, and structured debate.
