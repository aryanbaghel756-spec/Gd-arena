# GD Arena 🎙️🔷

> **Voice-first web platform where students practise Group Discussions (GD) with adaptive AI participants and an autonomous moderator, followed by an actionable evaluation report.**

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

---

## 🌟 Key Features

### 1. Hexagonal Honeycomb Canvas Background
- Full-screen `<canvas>` with 60 FPS cap, `devicePixelRatio` crisp scaling, and smooth decay.
- Dominated by crimson red (`#ff1e2d`, `#b80010`) and golden amber (`#ffc400`, `#ffe066`) with slow-cycling RGB accent shimmers on hex edges.
- Cursor soft light source with ~220px falloff radius.
- Concentric traveling pulse ripples radiating across the grid every few seconds.
- Automatically pauses when the tab is hidden and respects `prefers-reduced-motion` settings.

### 2. Realistic Beveled Button System (`HexButton` & `RectButton`)
- **Variants**: `primary`, `secondary`, `danger`, `ghost`, and `icon`.
- **Aesthetics**: Beveled metallic/glass borders, top inner highlight, bottom inner shadow, outer bloom, and noise texture.
- **Cursor Spotlight**: Dynamic pointer tracking via CSS variables (`--mx`, `--my`) casting a radial gradient spotlight that follows the cursor.
- **Tactile Feedback**: 2px active depression, small hover lift, and an expanding shockwave ripple ring on click.
- **Accessibility**: 44px+ touch targets, high-contrast yellow focus rings, and screen-reader `aria-label` support.

### 3. Transparent & Realistic Arena Simulation
- **AI Transparency Badge**: Clearly visible *"Notice: All participants other than you are AI"* notice.
- **Round Table**: Holographic central audio core surrounded by distinct AI personas (*Analyst Aarav*, *Critic Priya*, *Creative Rohan*, *Dominator Vikram*, *Quiet Maya*), *Moderator Dr. Evelyn Vance*, and *You*.
- **Voice-First Controls**:
  - `[Hold to Speak]` large hex button with Spacebar hotkey support and audio level meters.
  - `[Mic On/Off]`, `[Interrupt]`, `[Captions]`, `[Pause]`, `[Skip to Closing Round]`, `[End GD]`.
  - Realistic mic permission status and error recovery banner with `[Retry]` and `[Type instead]` modal fallback.
- **Live Transcript Panel**: Auto-scrolling speaker stream with timestamps and live captions toggle.

### 4. 6-Dimensional Performance Evaluation Report
- Circular score gauge ring (out of 100) with percentile ranking.
- Speaking-time distribution segmented share bar.
- 6 evaluated competencies:
  1. Starting the discussion
  2. Quality of ideas & substantiation
  3. Building on others
  4. Active listening & inclusivity
  5. Handling interruptions
  6. Ending strongly & synthesis
- Every competency includes an **expandable quoted transcript moment** with exact timestamp and speaker quote.
- Actions: `[Download Report]`, `[Copy Transcript]`, `[Practise Again]`, and `[Share]`.

---

## ⌨️ Hotkeys

| Hotkey | Action |
| --- | --- |
| `Space` (Hold) | Push-to-Talk (Transmitting) |
| `M` | Toggle Continuous Microphone |
| `I` | Respectful Interruption Request |
| `C` | Toggle Live Captions |
| `Esc` | Pause Arena Clock |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion & HTML5 Canvas
- **Icons**: Lucide React
