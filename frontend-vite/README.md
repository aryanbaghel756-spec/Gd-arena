# GD Arena - AI-Powered Group Discussion Platform

**GD Arena** is a production-grade, enterprise-ready AI Group Discussion training and evaluation platform built with **React + Vite** for Hackathon Problem Statement 2.

Students practice voice-based group discussions with simulated AI personas and an active moderator, with real-time turn taking, voice speech-to-text, multi-persona speech synthesis, instant turn interruptions, and a transcript-linked performance audit report.

---

## ⚡ Quick Start

### 1. Requirements
- Node.js 18+ (tested on Node v24.21.0 & npm 11.19.0)
- Google Chrome or Microsoft Edge (for native Web Speech API support)

### 2. Development Server
The application is pre-configured and running at **[http://localhost:5173](http://localhost:5173)**:
```bash
# Navigate to project directory
cd C:\Users\hp\.gemini\antigravity\scratch\gd-arena

# Install dependencies (already completed)
npm.cmd install

# Start Vite dev server
npm.cmd run dev -- --port 5173 --host
```

### 3. Production Build
```bash
npm.cmd run build
```

---

## 🏗️ Architecture & Project Structure

```
gd-arena/
├── docs/
│   ├── API_CONTRACT.md          # Single source of truth for backend API specification
│   └── CONTRACT_REQUESTS.md     # Documented UI requests & fallback specifications
├── public/
│   └── favicon.svg              # Custom high-tech vector emblem
├── src/
│   ├── assets/vectors/          # Hand-crafted SVG illustrations
│   │   ├── HeroArenaVector.jsx      # Discussion core with orbital persona nodes & waveforms
│   │   ├── AuthFlowVector.jsx       # Voice input ➔ neural nodes ➔ audit graph
│   │   ├── DashboardVectors.jsx     # Voice activity, AI analysis & radar icons
│   │   └── EmptyStateVector.jsx     # Empty state vector illustrations
│   ├── components/
│   │   ├── common/Navbar.jsx        # Navigation shell, status chip & user profile dropdown
│   │   ├── common/Toast.jsx         # Accessible floating notification alerts
│   │   ├── auth/LandingPage.jsx     # High-impact landing page with vector graphics
│   │   ├── auth/AuthModal.jsx       # Sign In / Sign Up tabbed modal with 1-click Demo User access
│   │   ├── dashboard/DashboardPage.jsx # Student dashboard, stats, recent practice & insights
│   │   ├── setup/SetupPage.jsx      # Topic selector, participant sliders & persona strip
│   │   ├── arena/                   # Live GD Arena room
│   │   │   ├── ArenaPage.jsx            # Arena layout, timers & turn management
│   │   │   ├── ParticipantCard.jsx      # State cards (Idle, Thinking, Speaking, Interrupted)
│   │   │   ├── ModeratorCard.jsx        # Prominent facilitator card with guidance cues
│   │   │   ├── LiveTranscript.jsx       # Auto-scrolling transcript stream with badges
│   │   │   └── ControlDock.jsx          # PTT mic button, Spacebar listener & typed fallback
│   │   ├── report/ReportPage.jsx    # SVG score ring, skill bars, donut chart & quote links
│   │   ├── history/HistoryPage.jsx  # Past sessions log with search and report review
│   │   └── insights/InsightsPage.jsx# Longitudinal skill growth and trajectory analysis
│   ├── context/
│   │   ├── AuthContext.jsx          # User session management ("Aryan Sharma" demo user)
│   │   └── DiscussionContext.jsx    # Turn state machine, timers, speech & transcript
│   ├── data/
│   │   ├── config.js                # Personas, preset topics & mock dialogue dataset
│   │   └── mockHistory.js           # Seeded session history for credible demo evaluation
│   ├── services/
│   │   ├── api.js                   # API client respecting VITE_API_URL + mock fallbacks
│   │   ├── speechRecognition.js     # Web Speech STT service
│   │   ├── speechSynthesis.js       # Multi-persona TTS with distinct pitch/rates
│   │   └── metricsEngine.js         # Client-side heuristic scoring & quote link extractor
│   ├── styles/
│   │   ├── index.css                # Dark arena theme, CSS variables & glassmorphism
│   │   └── print.css                # Clean print layout for report download
│   ├── App.jsx                      # App root & screen router
│   └── main.jsx                     # Vite React entrypoint
├── index.html                       # HTML container
├── package.json
└── vite.config.js
```

---

## 👥 Personas Roster (Problem Statement 2)

| Persona | Role | Voice Style & Color | Debate Behavior |
| :--- | :--- | :--- | :--- |
| **You** | Student | Cyan (`#22D3EE`) | Participant via voice (PTT / Spacebar) or typed fallback |
| **Moderator** | Facilitator | Violet (`#8B5CF6`) | Guides debate direction, tracks time, enforces turn discipline |
| **Aarav** | Analyst | Blue (`#3B82F6`) | Data-driven, empirical metrics, macroeconomic trade-offs |
| **Meera** | Creative | Pink (`#EC4899`) | Human-centric, societal paradigms, future opportunities |
| **Kabir** | Critic | Orange/Red (`#F97316`) | Skeptical, challenges naive consensus, questions incentives |
| **Ananya** | Collaborator| Emerald (`#10B981`) | Diplomatic, synthesizes viewpoints, builds on teammates |
| **Rohan** | Debater | Amber (`#F59E0B`) | Assertive rhetoric, historical precedents, decisive momentum |

---

## 🔌 Backend API Integration

Base URL: Configured via environment variable `VITE_API_URL` (defaults to `http://localhost:8000`).
The backend contract is documented in [docs/API_CONTRACT.md](docs/API_CONTRACT.md):

1. `GET /api/health` ➔ `{ ok: true, model: "gemma3:4b" }`
2. `POST /api/turn` ➔ Generates persona response from recent transcript
3. `POST /api/stt` ➔ Transcribes student voice audio via Whisper
4. `POST /api/tts` ➔ Synthesizes persona audio stream
5. `POST /api/feedback` ➔ Returns structured evaluation metrics

*When backend is offline, the app seamlessly defaults to built-in browser speech recognition, speech synthesis, and local mock dialogue engines.*

---

## 🎯 Key Demo Flow for Evaluators

1. **Landing Page**: Click **"Launch Demo Mode"** to instantly sign in as **Aryan Sharma** without filling forms.
2. **Dashboard**: Inspect the welcome card, quick metrics, recent session cards, and competency diagnoses.
3. **Setup Screen**: Click **"Start Practice"**, choose a topic (or type a custom one), select participant count, and click **"Enter the Arena"**.
4. **Live Discussion**:
   - The Moderator opens the session and prompts your turn.
   - **Hold the Spacebar** (or click & hold the center mic) to speak.
   - **Interruption Test**: While Kabir or Aarav is speaking, hold the Spacebar—observe the instant speech cancellation, request abortion, and "Interrupted" badge.
5. **Feedback Report**:
   - Animated SVG circular score ring counts up to your score.
   - 5 competency bars breakdown.
   - Chart.js Speaking Time Share Donut Chart.
   - **Transcript-Linked Quotes**: Click any quote chip under "Strengths" or "Areas for Improvement" to watch the report scroll directly to that exact turn in the audit transcript and flash an neon highlight.
6. **History & Insights**: Review past sessions, search by topic, and inspect longitudinal skill growth.
