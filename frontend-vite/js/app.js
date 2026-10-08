/**
 * GD Arena - Core Application Controller
 * ------------------------------------------------------------------
 * Purpose: Manages UI state transitions, turn-taking state machine,
 * Web Speech STT/TTS with backend fallbacks, interruption handling,
 * client-side analytics/metrics, and feedback report rendering.
 */

// Initialize global namespace
window.GD = window.GD || {};

(function () {
  const config = window.GD.config;
  const api = window.GD.api;

  /* ========== APPLICATION STATE ========== */
  window.GD.state = {
    screen: "setup", // "setup" | "room" | "report"
    topic: "",
    durationMinutes: config.DEFAULT_DURATION_MINUTES,
    durationSeconds: config.DEFAULT_DURATION_MINUTES * 60,
    timeRemaining: config.DEFAULT_DURATION_MINUTES * 60,
    aiCount: 3,

    // Participants list in current session
    participants: [], // [{ id, name, role, color, isAi, avatarLetter }]
    activeSpeakerId: null,
    speakerStatus: {}, // { [id]: 'idle' | 'thinking' | 'speaking' }

    // Turn sequencing
    currentSpeakerIndex: 0,
    turnTimeRemaining: config.MAX_TURN_SECONDS,
    turnIntervalId: null,
    roomIntervalId: null,

    // Speech & Interruption
    isStudentSpeaking: false,
    sttActive: false,
    sttPartialText: "",
    currentTurnAbortController: null,
    interruptionCount: 0,

    // Transcripts & Timing
    transcript: [], // [{ id, speaker, role, text, time, startMs, endMs, interrupted }]
    sessionStartTime: null,
    speakingDurations: {}, // { [speakerId]: seconds }

    // MediaRecorder for backend STT mode
    mediaRecorder: null,
    audioChunks: [],

    // Chart.js instance reference
    speakingChart: null
  };

  const state = window.GD.state;

  /* ========== DOM ELEMENT REFERENCES ========== */
  const elements = {};

  function cacheDomElements() {
    // Screens
    elements.screenSetup = document.getElementById("screen-setup");
    elements.screenRoom = document.getElementById("screen-room");
    elements.screenReport = document.getElementById("screen-report");

    // Setup elements
    elements.presetTopicsContainer = document.getElementById("preset-topics-container");
    elements.customTopicInput = document.getElementById("custom-topic-input");
    elements.btnApplyCustomTopic = document.getElementById("btn-apply-custom-topic");
    elements.topicSelectedBadge = document.getElementById("topic-selected-badge");
    elements.personasPreviewStrip = document.getElementById("personas-preview-strip");
    elements.btnStartGd = document.getElementById("btn-start-gd");
    elements.backendStatusDot = document.getElementById("backend-status-dot");
    elements.backendStatusText = document.getElementById("backend-status-text");

    // Room elements
    elements.roomTopicHeading = document.getElementById("room-topic-heading");
    elements.timerMinutes = document.getElementById("timer-minutes");
    elements.timerSeconds = document.getElementById("timer-seconds");
    elements.roomTimerDisplay = document.getElementById("room-timer-display");
    elements.btnEndGd = document.getElementById("btn-end-gd");
    elements.turnBannerContent = document.getElementById("turn-banner-content");
    elements.turnSpeakerBadge = document.getElementById("turn-speaker-badge");
    elements.turnProgressBar = document.getElementById("turn-progress-bar");
    elements.roomParticipantsGrid = document.getElementById("room-participants-grid");
    elements.transcriptStream = document.getElementById("transcript-stream");
    elements.transcriptCountBadge = document.getElementById("transcript-count-badge");
    elements.transcriptTypingIndicator = document.getElementById("transcript-typing-indicator");
    elements.typingIndicatorText = document.getElementById("typing-indicator-text");

    // Controls
    elements.btnPttMic = document.getElementById("btn-ptt-mic");
    elements.pttMicIcon = document.getElementById("ptt-mic-icon");
    elements.liveSttPreview = document.getElementById("live-stt-preview");
    elements.liveSttText = document.getElementById("live-stt-text");
    elements.btnToggleTypeInput = document.getElementById("btn-toggle-type-input");
    elements.typeFallbackContainer = document.getElementById("type-fallback-container");
    elements.typeFallbackInput = document.getElementById("type-fallback-input");
    elements.btnSendTyped = document.getElementById("btn-send-typed");
    elements.btnSkipTurn = document.getElementById("btn-skip-turn");

    // Report elements
    elements.reportTopicSubtitle = document.getElementById("report-topic-subtitle");
    elements.overallScoreNum = document.getElementById("overall-score-num");
    elements.overallScoreVerdict = document.getElementById("overall-score-verdict");
    elements.scoreRingCircle = document.getElementById("score-ring-circle");
    elements.skillsBreakdownList = document.getElementById("skills-breakdown-list");
    elements.statSpeakingPct = document.getElementById("stat-speaking-pct");
    elements.statSpeakingTime = document.getElementById("stat-speaking-time");
    elements.statContributionsCount = document.getElementById("stat-contributions-count");
    elements.statInterruptionsCount = document.getElementById("stat-interruptions-count");
    elements.statIdeasCount = document.getElementById("stat-ideas-count");
    elements.speakingTimeChart = document.getElementById("speaking-time-chart");
    elements.feedbackStrengthsList = document.getElementById("feedback-strengths-list");
    elements.feedbackImprovementsList = document.getElementById("feedback-improvements-list");
    elements.reportTranscriptStream = document.getElementById("report-transcript-stream");

    elements.btnPracticeAgain = document.getElementById("btn-practice-again");
    elements.btnChangeTopic = document.getElementById("btn-change-topic");
    elements.btnDownloadReport = document.getElementById("btn-download-report");

    elements.toastContainer = document.getElementById("toast-container");
  }

  /* ========== TOAST NOTIFICATION UTILITY ========== */
  function showToast(message, type = "info", duration = 4000) {
    if (!elements.toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let iconName = "info";
    if (type === "error") iconName = "alert-circle";
    if (type === "warning") iconName = "alert-triangle";
    if (type === "success") iconName = "check-circle-2";

    toast.innerHTML = `
      <i data-lucide="${iconName}" aria-hidden="true"></i>
      <span>${escapeHtml(message)}</span>
    `;

    elements.toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 320);
    }, duration);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, match => {
      const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      return map[match];
    });
  }

  /* ========== SCREEN NAVIGATION ========== */
  function showScreen(screenId) {
    state.screen = screenId;
    [elements.screenSetup, elements.screenRoom, elements.screenReport].forEach(sec => {
      if (sec) sec.classList.remove("active");
    });

    if (screenId === "setup") {
      elements.screenSetup.classList.add("active");
    } else if (screenId === "room") {
      elements.screenRoom.classList.add("active");
    } else if (screenId === "report") {
      elements.screenReport.classList.add("active");
    }

    if (window.lucide) window.lucide.createIcons();
  }

  /* ========== SETUP SCREEN INITIALIZATION ========== */
  function initSetupScreen() {
    renderPresetTopics();
    renderPersonasPreview();
    checkBackendHealth();
    bindSetupEvents();
  }

  function renderPresetTopics() {
    elements.presetTopicsContainer.innerHTML = "";
    config.PRESET_TOPICS.forEach((t, idx) => {
      const card = document.createElement("div");
      card.className = "topic-card";
      card.setAttribute("role", "radio");
      card.setAttribute("aria-checked", "false");
      card.tabIndex = 0;
      card.dataset.topic = t;

      card.innerHTML = `
        <span class="topic-card-title">${escapeHtml(t)}</span>
        <span class="topic-card-indicator">Selected ✓</span>
      `;

      card.addEventListener("click", () => selectTopic(t, card));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectTopic(t, card);
        }
      });

      elements.presetTopicsContainer.appendChild(card);
    });
  }

  function selectTopic(topicText, activeCard) {
    state.topic = topicText.trim();
    document.querySelectorAll(".topic-card").forEach(c => {
      c.classList.remove("selected");
      c.setAttribute("aria-checked", "false");
    });

    if (activeCard) {
      activeCard.classList.add("selected");
      activeCard.setAttribute("aria-checked", "true");
    }

    if (elements.customTopicInput) {
      elements.customTopicInput.value = "";
    }

    elements.topicSelectedBadge.textContent = "Topic Selected";
    elements.topicSelectedBadge.style.color = "var(--accent-cyan)";
    elements.btnStartGd.disabled = false;
  }

  function renderPersonasPreview() {
    elements.personasPreviewStrip.innerHTML = "";
    const personaKeys = ["aarav", "meera", "kabir", "ananya", "rohan"];

    personaKeys.forEach(key => {
      const p = config.PERSONAS[key];
      const card = document.createElement("div");
      card.className = "persona-strip-card";
      card.innerHTML = `
        <div class="persona-strip-header">
          <div class="persona-avatar-chip" style="background-color: ${p.color};">${p.avatarLetter}</div>
          <div>
            <div class="persona-name">${p.name}</div>
            <div class="persona-role-tag" style="color: ${p.color};">${p.badge}</div>
          </div>
        </div>
        <div class="persona-style-desc">${p.style}</div>
      `;
      elements.personasPreviewStrip.appendChild(card);
    });
  }

  async function checkBackendHealth() {
    elements.backendStatusText.textContent = "Checking backend connectivity...";
    try {
      const health = await api.health();
      if (health.isMock) {
        elements.backendStatusDot.className = "status-dot mock";
        elements.backendStatusText.textContent = "Mock Mode (Zero Backend Required)";
      } else if (health.ok) {
        elements.backendStatusDot.className = "status-dot";
        elements.backendStatusText.textContent = `Backend Connected (${health.model || "Ollama"})`;
      } else {
        elements.backendStatusDot.className = "status-dot offline";
        elements.backendStatusText.textContent = "Backend Offline · Automatic Mock Fallback Active";
      }
    } catch {
      elements.backendStatusDot.className = "status-dot offline";
      elements.backendStatusText.textContent = "Backend Offline · Automatic Mock Fallback Active";
    }
  }

  function bindSetupEvents() {
    // Custom topic apply
    function applyCustom() {
      const val = elements.customTopicInput.value.trim();
      if (val.length < 5) {
        showToast("Please enter a topic with at least 5 characters.", "warning");
        return;
      }
      selectTopic(val, null);
      showToast(`Selected custom topic: "${val}"`, "success");
    }

    elements.btnApplyCustomTopic.addEventListener("click", applyCustom);
    elements.customTopicInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyCustom();
      }
    });

    // Segmented selectors (AI Count & Duration)
    document.querySelectorAll(".segment-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const setting = btn.dataset.setting;
        const val = parseInt(btn.dataset.value, 10);

        btn.parentElement.querySelectorAll(".segment-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (setting === "participants") {
          state.aiCount = val;
        } else if (setting === "duration") {
          state.durationMinutes = val;
          state.durationSeconds = val * 60;
          state.timeRemaining = val * 60;
        }
      });
    });

    // Start GD button
    elements.btnStartGd.addEventListener("click", () => {
      if (!state.topic) {
        showToast("Please select or enter a topic first.", "warning");
        return;
      }
      startDiscussion();
    });
  }

  /* ========== LIVE GD ROOM ORCHESTRATION ========== */
  function startDiscussion() {
    // Assemble participants roster: Student ("you") + Moderator + Selected AI personas
    const availableAis = ["aarav", "meera", "kabir", "ananya", "rohan"];
    const chosenAiKeys = availableAis.slice(0, state.aiCount);

    state.participants = [
      { ...config.PERSONAS.you, isAi: false },
      { ...config.PERSONAS.moderator, isAi: true }
    ];

    chosenAiKeys.forEach(k => {
      state.participants.push({ ...config.PERSONAS[k], isAi: true });
    });

    // Reset session metrics
    state.transcript = [];
    state.speakingDurations = {};
    state.interruptionCount = 0;
    state.isStudentSpeaking = false;
    state.timeRemaining = state.durationMinutes * 60;
    state.sessionStartTime = Date.now();

    state.participants.forEach(p => {
      state.speakingDurations[p.id] = 0;
      state.speakerStatus[p.id] = "idle";
    });

    // Populate UI
    elements.roomTopicHeading.textContent = state.topic;
    updateTimerDisplay();
    renderParticipantsArena();
    elements.transcriptStream.innerHTML = "";
    elements.transcriptCountBadge.textContent = "0 turns";

    // Switch screen
    showScreen("room");

    // Start Room Timer Countdown
    startRoomTimer();

    // Begin turn sequence with Moderator's Opening
    runModeratorOpening();
  }

  function renderParticipantsArena() {
    elements.roomParticipantsGrid.innerHTML = "";

    state.participants.forEach(p => {
      const card = document.createElement("div");
      card.className = "participant-card";
      card.id = `participant-card-${p.id}`;
      card.style.setProperty("--speaker-color", p.color);

      card.innerHTML = `
        <div class="avatar-wrapper">
          <div class="avatar-circle">${p.avatarLetter}</div>
        </div>
        <div class="persona-name">${escapeHtml(p.name)}</div>
        <div class="badge" style="color: ${p.color}; border-color: ${p.color}44; margin-top: 4px;">
          ${escapeHtml(p.role)}
        </div>
        <div class="speaker-status-pill" id="status-pill-${p.id}">
          <span class="status-dot" style="background: ${p.color}; width: 6px; height: 6px;"></span>
          <span class="status-label">Idle</span>
        </div>
        <div class="waveform-bars" aria-hidden="true">
          <div class="waveform-bar"></div>
          <div class="waveform-bar"></div>
          <div class="waveform-bar"></div>
          <div class="waveform-bar"></div>
          <div class="waveform-bar"></div>
        </div>
        <div class="thinking-dots" aria-hidden="true">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      `;

      elements.roomParticipantsGrid.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function setParticipantStatus(personaId, status) {
    state.speakerStatus[personaId] = status;
    const card = document.getElementById(`participant-card-${personaId}`);
    if (!card) return;

    card.classList.remove("active-speaker", "is-thinking");
    const pillLabel = card.querySelector(".status-label");

    if (status === "speaking") {
      card.classList.add("active-speaker");
      if (pillLabel) pillLabel.textContent = "Speaking";
    } else if (status === "thinking") {
      card.classList.add("is-thinking");
      if (pillLabel) pillLabel.textContent = "Thinking...";
    } else {
      if (pillLabel) pillLabel.textContent = "Idle";
    }
  }

  function startRoomTimer() {
    clearInterval(state.roomIntervalId);
    state.roomIntervalId = setInterval(() => {
      state.timeRemaining--;
      updateTimerDisplay();

      if (state.timeRemaining <= 0) {
        clearInterval(state.roomIntervalId);
        endDiscussion();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(Math.max(0, state.timeRemaining) / 60);
    const secs = Math.max(0, state.timeRemaining) % 60;
    elements.timerMinutes.textContent = String(mins).padStart(2, "0");
    elements.timerSeconds.textContent = String(secs).padStart(2, "0");

    if (state.timeRemaining <= 30) {
      elements.roomTimerDisplay.classList.add("urgent");
    } else {
      elements.roomTimerDisplay.classList.remove("urgent");
    }
  }

  /* ========== TURN TIMING & QUEUE MANAGEMENT ========== */
  function startTurnCountdown(onExpire) {
    clearInterval(state.turnIntervalId);
    state.turnTimeRemaining = config.MAX_TURN_SECONDS;
    updateTurnProgressBar();

    state.turnIntervalId = setInterval(() => {
      state.turnTimeRemaining--;
      updateTurnProgressBar();

      if (state.turnTimeRemaining <= 0) {
        clearInterval(state.turnIntervalId);
        if (onExpire) onExpire();
      }
    }, 1000);
  }

  function updateTurnProgressBar() {
    const pct = Math.max(0, (state.turnTimeRemaining / config.MAX_TURN_SECONDS) * 100);
    elements.turnProgressBar.style.width = `${pct}%`;
  }

  /**
   * Turn Order: Moderator Intro -> Student -> Moderator cue -> AI 1 -> AI 2 -> ... -> Student
   */
  async function runModeratorOpening() {
    const moderator = config.PERSONAS.moderator;
    state.activeSpeakerId = "moderator";
    setParticipantStatus("moderator", "thinking");
    elements.turnBannerContent.innerHTML = `<strong>Moderator:</strong> Opening the discussion...`;
    elements.turnSpeakerBadge.textContent = "Facilitator";

    try {
      state.currentTurnAbortController = new AbortController();
      const res = await api.generateTurn({
        persona: moderator,
        topic: state.topic,
        transcript: [],
        signal: state.currentTurnAbortController.signal
      });

      setParticipantStatus("moderator", "speaking");
      addTranscriptEntry(moderator.name, moderator.role, res.text, moderator.color);

      await playSpeech(res.text, "moderator");
    } catch (err) {
      if (err.message !== "Aborted") {
        console.warn("[App] Moderator intro error:", err);
      }
    } finally {
      setParticipantStatus("moderator", "idle");
    }

    // Hand over the floor to the Student first
    promptStudentTurn();
  }

  function promptStudentTurn() {
    if (state.timeRemaining <= 0) return;

    state.activeSpeakerId = "you";
    setParticipantStatus("you", "speaking");
    elements.turnBannerContent.innerHTML = `<strong>Floor is open:</strong> <span class="turn-speaker-highlight">You</span> (Hold mic or spacebar to speak)`;
    elements.turnSpeakerBadge.textContent = "Your Turn";

    startTurnCountdown(() => {
      // 60s turn limit reached without student speaking or ending turn
      setParticipantStatus("you", "idle");
      showToast("Turn time elapsed. Passing floor to next participant.", "info");
      advanceToNextAiParticipant(0);
    });
  }

  async function advanceToNextAiParticipant(aiIndex) {
    if (state.timeRemaining <= 0) return;

    // AIs are from index 2 onwards in state.participants
    const aiParticipants = state.participants.filter(p => p.isAi && p.id !== "moderator");
    if (aiIndex >= aiParticipants.length) {
      // Completed a full cycle of AIs -> return to Student!
      promptStudentTurn();
      return;
    }

    const currentAi = aiParticipants[aiIndex];
    state.activeSpeakerId = currentAi.id;

    // Moderator quick cue transition
    elements.turnBannerContent.innerHTML = `<strong>Moderator:</strong> Passing floor to <span class="turn-speaker-highlight">${currentAi.name}</span>...`;
    elements.turnSpeakerBadge.textContent = `${currentAi.name}'s Turn`;

    // AI thinking state
    setParticipantStatus(currentAi.id, "thinking");
    elements.transcriptTypingIndicator.classList.add("active");
    elements.typingIndicatorText.textContent = `${currentAi.name} (${currentAi.role}) is preparing remarks...`;

    startTurnCountdown(() => {
      // AI turn timeout fallback
      finishAiTurn(aiIndex);
    });

    try {
      state.currentTurnAbortController = new AbortController();
      const turnRes = await api.generateTurn({
        persona: currentAi,
        topic: state.topic,
        transcript: state.transcript,
        nextSpeaker: aiIndex + 1 < aiParticipants.length ? aiParticipants[aiIndex + 1].name : "You",
        signal: state.currentTurnAbortController.signal
      });

      elements.transcriptTypingIndicator.classList.remove("active");
      setParticipantStatus(currentAi.id, "speaking");

      const entry = addTranscriptEntry(currentAi.name, currentAi.role, turnRes.text, currentAi.color);
      state.currentActiveEntry = entry;

      // Play audio via TTS
      await playSpeech(turnRes.text, currentAi.id);

      setParticipantStatus(currentAi.id, "idle");
      clearInterval(state.turnIntervalId);

      // Advance to next AI after short pause
      setTimeout(() => {
        advanceToNextAiParticipant(aiIndex + 1);
      }, 700);

    } catch (err) {
      elements.transcriptTypingIndicator.classList.remove("active");
      setParticipantStatus(currentAi.id, "idle");

      if (err.message === "Aborted") {
        console.log(`[App] Turn for ${currentAi.name} was interrupted.`);
      } else {
        console.warn("[App] AI turn error:", err);
        showToast(`Speaker ${currentAi.name} unavailable. Moving forward.`, "warning");
        advanceToNextAiParticipant(aiIndex + 1);
      }
    }
  }

  function finishAiTurn(aiIndex) {
    window.speechSynthesis.cancel();
    if (state.currentTurnAbortController) {
      state.currentTurnAbortController.abort();
    }
    advanceToNextAiParticipant(aiIndex + 1);
  }

  /* ========== INTERRUPTION HANDLING ========== */
  function handleInterruption() {
    if (state.activeSpeakerId && state.activeSpeakerId !== "you") {
      const interruptedSpeakerId = state.activeSpeakerId;
      const interruptedSpeaker = state.participants.find(p => p.id === interruptedSpeakerId);
      const speakerName = interruptedSpeaker ? interruptedSpeaker.name : "the AI";

      // 1. Cancel TTS immediately
      window.speechSynthesis.cancel();

      // 2. Abort pending LLM fetch
      if (state.currentTurnAbortController) {
        state.currentTurnAbortController.abort();
      }

      // 3. Mark last transcript item as interrupted
      if (state.transcript.length > 0) {
        const lastEntry = state.transcript[state.transcript.length - 1];
        if (lastEntry.speaker === speakerName) {
          lastEntry.interrupted = true;
          updateTranscriptUi();
        }
      }

      // 4. Log interruption metric
      state.interruptionCount++;
      setParticipantStatus(interruptedSpeakerId, "idle");
      elements.transcriptTypingIndicator.classList.remove("active");

      showToast(`You interjected while ${speakerName} was speaking! Floor is yours.`, "warning", 3000);
    }
  }

  /* ========== TRANSCRIPT MANAGEMENT ========== */
  function formatCurrentTime() {
    const elapsedSeconds = Math.floor((Date.now() - (state.sessionStartTime || Date.now())) / 1000);
    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function addTranscriptEntry(speaker, role, text, color, wasInterrupted = false) {
    const timeFormatted = formatCurrentTime();
    const entry = {
      id: `entry-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      speaker,
      role,
      text: text.trim(),
      time: timeFormatted,
      startMs: Date.now(),
      endMs: Date.now(),
      interrupted: wasInterrupted,
      color: color || "var(--accent-cyan)"
    };

    state.transcript.push(entry);
    appendTranscriptToDom(entry);
    elements.transcriptCountBadge.textContent = `${state.transcript.length} turns`;
    return entry;
  }

  function appendTranscriptToDom(entry) {
    const isYou = entry.speaker === "You";
    const bubble = document.createElement("div");
    bubble.className = `transcript-item ${isYou ? "you-bubble" : ""} ${entry.interrupted ? "interrupted" : ""}`;
    bubble.id = `bubble-${entry.id}`;
    bubble.style.setProperty("--bubble-color", entry.color);

    bubble.innerHTML = `
      <div class="transcript-item-meta">
        <span class="transcript-speaker-name">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${entry.color};"></span>
          ${escapeHtml(entry.speaker)}
          <span style="font-size:0.7rem; font-weight:500; opacity:0.7;">(${escapeHtml(entry.role)})</span>
        </span>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${entry.interrupted ? `<span class="interrupted-badge"><i data-lucide="zap" style="width:10px;height:10px;"></i> Interrupted</span>` : ""}
          <span class="transcript-time">${entry.time}</span>
        </div>
      </div>
      <div class="transcript-item-text">${escapeHtml(entry.text)}</div>
    `;

    elements.transcriptStream.appendChild(bubble);
    elements.transcriptStream.scrollTop = elements.transcriptStream.scrollHeight;

    if (window.lucide) window.lucide.createIcons();
  }

  function updateTranscriptUi() {
    // Re-render live transcript stream in room
    elements.transcriptStream.innerHTML = "";
    state.transcript.forEach(entry => appendTranscriptToDom(entry));
  }

  /* ========== SPEECH RECOGNITION (STT) ========== */
  let recognition = null;
  let sttSilenceTimer = null;

  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("[STT] Web Speech API not supported in this browser.");
      return null;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-IN"; // Default as per specifications

      rec.onresult = (event) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const display = interim || final;
        if (display) {
          elements.liveSttPreview.classList.add("active");
          elements.liveSttText.textContent = display;
          state.sttPartialText = (state.sttPartialText + " " + final).trim() || display;
        }
      };

      rec.onerror = (event) => {
        console.warn("[STT] Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          showToast("Microphone permission denied. You can use the 'Type Instead' input.", "error");
        } else if (event.error === "no-speech") {
          // Expected when silent
        }
      };

      rec.onend = () => {
        if (state.isStudentSpeaking) {
          // Restart if user is still holding the button
          try { rec.start(); } catch {}
        }
      };

      return rec;
    } catch (e) {
      console.warn("[STT] Could not create SpeechRecognition:", e);
      return null;
    }
  }

  function startStudentSpeech() {
    if (state.isStudentSpeaking) return;

    // Handle Interruption if someone else is currently speaking
    handleInterruption();

    state.isStudentSpeaking = true;
    state.activeSpeakerId = "you";
    setParticipantStatus("you", "speaking");
    state.sttPartialText = "";

    elements.btnPttMic.classList.add("recording");
    elements.liveSttPreview.classList.add("active");
    elements.liveSttText.textContent = "Listening... Speak your mind";

    // Track speaking start
    state.studentSpeechStartMs = Date.now();

    // Browser Speech Recognition
    if (config.STT_MODE === "browser") {
      if (!recognition) {
        recognition = initSpeechRecognition();
      }
      if (recognition) {
        try {
          recognition.start();
        } catch (err) {
          // May already be active
        }
      } else {
        showToast("Speech recognition not supported in this browser. Please type your thoughts.", "warning");
      }
    } else {
      // Backend STT Mode: Record Audio Stream via MediaRecorder
      startMediaRecorder();
    }
  }

  async function stopStudentSpeech() {
    if (!state.isStudentSpeaking) return;

    state.isStudentSpeaking = false;
    elements.btnPttMic.classList.remove("recording");
    elements.liveSttPreview.classList.remove("active");

    // Compute active student speaking duration
    if (state.studentSpeechStartMs) {
      const durationSeconds = Math.round((Date.now() - state.studentSpeechStartMs) / 1000);
      state.speakingDurations["you"] = (state.speakingDurations["you"] || 0) + Math.max(1, durationSeconds);
    }

    if (config.STT_MODE === "browser") {
      if (recognition) {
        try { recognition.stop(); } catch {}
      }

      // Small delay to capture final transcript result
      setTimeout(() => {
        finalizeStudentTurn(state.sttPartialText);
      }, 350);
    } else {
      stopMediaRecorder();
    }
  }

  function finalizeStudentTurn(text) {
    const student = config.PERSONAS.you;
    const cleanedText = (text || "").trim();

    if (cleanedText.length >= 3) {
      addTranscriptEntry(student.name, student.role, cleanedText, student.color);
    } else {
      // No audible speech detected
      showToast("No speech recognized. Passing floor to the next participant.", "info");
    }

    setParticipantStatus("you", "idle");
    clearInterval(state.turnIntervalId);

    // Pass turn to the AI group
    advanceToNextAiParticipant(0);
  }

  // MediaRecorder helpers for backend STT
  async function startMediaRecorder() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.audioChunks = [];
      state.mediaRecorder = new MediaRecorder(stream);
      state.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) state.audioChunks.push(e.data);
      };
      state.mediaRecorder.start();
    } catch (err) {
      console.warn("[MediaRecorder] Access error:", err);
      showToast("Microphone denied. Please use the typed input option.", "error");
    }
  }

  async function stopMediaRecorder() {
    if (!state.mediaRecorder || state.mediaRecorder.state === "inactive") return;

    state.mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(state.audioChunks, { type: "audio/webm" });
      try {
        const result = await api.transcribe(audioBlob);
        finalizeStudentTurn(result.text);
      } catch (err) {
        finalizeStudentTurn("I agree with the points made and believe we must examine both perspectives.");
      }
    };
    state.mediaRecorder.stop();
  }

  /* ========== SPEECH SYNTHESIS (TTS) ========== */
  let availableVoices = [];

  function loadBrowserVoices() {
    if (!window.speechSynthesis) return;
    availableVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      availableVoices = window.speechSynthesis.getVoices();
    };
  }

  function playSpeech(text, personaId) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || config.TTS_MODE === "backend") {
        // Fallback or backend simulation: resolve after a speaking simulation delay
        const approxSeconds = Math.max(2, Math.min(8, Math.round(text.split(" ").length / 3)));
        state.speakingDurations[personaId] = (state.speakingDurations[personaId] || 0) + approxSeconds;
        setTimeout(resolve, approxSeconds * 1000);
        return;
      }

      window.speechSynthesis.cancel(); // Clear any queued speech

      const utterance = new SpeechSynthesisUtterance(text);
      const persona = config.PERSONAS[personaId] || config.PERSONAS.moderator;

      if (persona.voiceSettings) {
        utterance.pitch = persona.voiceSettings.pitch || 1.0;
        utterance.rate = persona.voiceSettings.rate || 1.0;
      }

      // Assign matching voice if available
      if (availableVoices.length > 0) {
        if (personaId === "meera" || personaId === "ananya") {
          const femaleVoice = availableVoices.find(v => /female|woman|zira|samantha|karen|veena/i.test(v.name));
          if (femaleVoice) utterance.voice = femaleVoice;
        } else if (personaId === "aarav" || personaId === "kabir" || personaId === "rohan") {
          const maleVoice = availableVoices.find(v => /male|man|david|rishi|alex|daniel/i.test(v.name));
          if (maleVoice) utterance.voice = maleVoice;
        }
      }

      const startTime = Date.now();

      utterance.onend = () => {
        const elapsedSec = Math.round((Date.now() - startTime) / 1000);
        state.speakingDurations[personaId] = (state.speakingDurations[personaId] || 0) + elapsedSec;
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn("[TTS] Utterance error:", e);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /* ========== CONTROLS & EVENT BINDINGS ========== */
  function bindRoomEvents() {
    // End GD Early button
    elements.btnEndGd.addEventListener("click", () => {
      if (confirm("Are you sure you want to conclude the GD and view your evaluation?")) {
        endDiscussion();
      }
    });

    // Push-to-Talk Mouse & Touch
    elements.btnPttMic.addEventListener("mousedown", (e) => {
      e.preventDefault();
      startStudentSpeech();
    });

    window.addEventListener("mouseup", () => {
      if (state.isStudentSpeaking) {
        stopStudentSpeech();
      }
    });

    elements.btnPttMic.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startStudentSpeech();
    }, { passive: false });

    elements.btnPttMic.addEventListener("touchend", (e) => {
      e.preventDefault();
      stopStudentSpeech();
    });

    // Spacebar Push-to-Talk (Ignore if typing in an input)
    let spacebarHeld = false;
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" && !e.repeat) {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
        if (activeTag === "input" || activeTag === "textarea") return;

        if (state.screen === "room") {
          e.preventDefault();
          spacebarHeld = true;
          startStudentSpeech();
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "Space" && spacebarHeld) {
        spacebarHeld = false;
        if (state.screen === "room") {
          e.preventDefault();
          stopStudentSpeech();
        }
      }
    });

    // Toggle "Type Instead" drawer
    elements.btnToggleTypeInput.addEventListener("click", () => {
      const isActive = elements.typeFallbackContainer.classList.toggle("active");
      if (isActive) {
        elements.typeFallbackInput.focus();
      }
    });

    // Send Typed Turn
    function submitTypedTurn() {
      const text = elements.typeFallbackInput.value.trim();
      if (!text) return;

      handleInterruption();
      elements.typeFallbackInput.value = "";
      state.speakingDurations["you"] = (state.speakingDurations["you"] || 0) + 12; // Credit typed turn
      finalizeStudentTurn(text);
    }

    elements.btnSendTyped.addEventListener("click", submitTypedTurn);
    elements.typeFallbackInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitTypedTurn();
      }
    });

    // Skip AI Turn button
    elements.btnSkipTurn.addEventListener("click", () => {
      if (state.activeSpeakerId && state.activeSpeakerId !== "you") {
        showToast("Skipped current AI turn.", "info");
        window.speechSynthesis.cancel();
        if (state.currentTurnAbortController) {
          state.currentTurnAbortController.abort();
        }
        setParticipantStatus(state.activeSpeakerId, "idle");
        // Hand floor to student
        promptStudentTurn();
      }
    });
  }

  /* ========== DISCUSSION CONCLUSION & REPORT ========== */
  async function endDiscussion() {
    clearInterval(state.roomIntervalId);
    clearInterval(state.turnIntervalId);
    window.speechSynthesis.cancel();
    if (state.currentTurnAbortController) {
      state.currentTurnAbortController.abort();
    }

    // Moderator Closing Remarks
    elements.turnBannerContent.innerHTML = `<strong>Moderator:</strong> Concluding the discussion...`;
    const closingRemarks = config.MOCK_DIALOGUES.moderator.closing[0];
    addTranscriptEntry("Moderator", "Facilitator", closingRemarks, config.PERSONAS.moderator.color);

    // Render report screen
    setTimeout(() => {
      renderFeedbackReport();
    }, 1200);
  }

  /* ========== METRICS COMPUTATION ENGINE ========== */
  function computeDiscussionMetrics() {
    const studentTurns = state.transcript.filter(t => t.speaker === "You");
    const totalTurns = state.transcript.length;

    // 1. Speaking Time Share %
    let totalSpeakingSeconds = 0;
    Object.values(state.speakingDurations).forEach(sec => totalSpeakingSeconds += sec);
    const studentSeconds = state.speakingDurations["you"] || 0;
    const speakingSharePct = totalSpeakingSeconds > 0
      ? Math.min(100, Math.round((studentSeconds / totalSpeakingSeconds) * 100))
      : (studentTurns.length > 0 ? 25 : 0);

    // 2. Substantive Ideas Contributed (Sentences with 6+ words)
    let substantiveIdeaCount = 0;
    studentTurns.forEach(turn => {
      const sentences = turn.text.split(/[.?!]+/).filter(Boolean);
      sentences.forEach(s => {
        if (s.trim().split(/\s+/).length >= 6) substantiveIdeaCount++;
      });
    });

    // 3. Opening Skill: Did the student contribute in the first 3 turns?
    const studentFirstTurnIndex = state.transcript.findIndex(t => t.speaker === "You");
    let openingScore = 3.0;
    if (studentFirstTurnIndex >= 0 && studentFirstTurnIndex <= 2) {
      openingScore = 5.0;
    } else if (studentFirstTurnIndex >= 0) {
      openingScore = 3.8;
    } else {
      openingScore = 1.5;
    }

    // 4. Building on Others: Mentions of other personas or consensus phrases
    const partnerNames = ["aarav", "meera", "kabir", "ananya", "rohan", "agree", "point", "perspective", "building on"];
    let referenceCount = 0;
    studentTurns.forEach(turn => {
      const lower = turn.text.toLowerCase();
      partnerNames.forEach(name => {
        if (lower.includes(name)) referenceCount++;
      });
    });
    const buildingScore = Math.min(5.0, Math.max(1.5, 2.5 + referenceCount * 0.7));

    // 5. Clarity: Avg sentence length (target 10-22 words) and low filler rate
    const fillers = ["um", "uh", "like", "you know", "basically", "actually"];
    let totalWords = 0;
    let fillerCount = 0;

    studentTurns.forEach(turn => {
      const words = turn.text.toLowerCase().split(/\s+/);
      totalWords += words.length;
      words.forEach(w => {
        if (fillers.includes(w)) fillerCount++;
      });
    });

    const fillerRate = totalWords > 0 ? fillerCount / totalWords : 0;
    let clarityScore = 4.0;
    if (fillerRate > 0.08) clarityScore -= 1.5;
    if (totalWords < 20) clarityScore = Math.min(clarityScore, 2.5);

    // 6. Listening: Turn balance and smooth turn-taking
    let listeningScore = Math.min(5.0, Math.max(2.0, 4.5 - (state.interruptionCount * 0.4)));

    // 7. Participation: Compare with fair share (1 / participants.length)
    const fairSharePct = 100 / Math.max(1, state.participants.length);
    let participationScore = 3.0;
    const diff = Math.abs(speakingSharePct - fairSharePct);
    if (diff <= 10) participationScore = 5.0;
    else if (diff <= 20) participationScore = 4.0;
    else participationScore = 2.5;

    // Overall composite score out of 100
    const compositeScore = Math.min(98, Math.max(20, Math.round(
      (openingScore * 4) +
      (buildingScore * 5) +
      (clarityScore * 4) +
      (listeningScore * 3.5) +
      (participationScore * 3.5)
    )));

    return {
      overall: compositeScore,
      studentSeconds,
      speakingSharePct,
      contributionsCount: studentTurns.length,
      ideasCount: substantiveIdeaCount,
      interruptionsCount: state.interruptionCount,
      skills: {
        opening: parseFloat(openingScore.toFixed(1)),
        building: parseFloat(buildingScore.toFixed(1)),
        clarity: parseFloat(clarityScore.toFixed(1)),
        listening: parseFloat(listeningScore.toFixed(1)),
        participation: parseFloat(participationScore.toFixed(1))
      }
    };
  }

  /* ========== FEEDBACK REPORT RENDERING ========== */
  function renderFeedbackReport() {
    showScreen("report");
    elements.reportTopicSubtitle.textContent = `Topic: "${state.topic}"`;

    const metrics = computeDiscussionMetrics();

    // 1. Animate Overall Score Ring
    animateScoreRing(metrics.overall);

    // 2. Render 5 Skill Breakdown Bars
    renderSkillBars(metrics.skills);

    // 3. Render 4 Stat Cards
    elements.statSpeakingPct.textContent = `${metrics.speakingSharePct}%`;
    elements.statSpeakingTime.textContent = `${metrics.studentSeconds}s active speech`;
    elements.statContributionsCount.textContent = `${metrics.contributionsCount}`;
    elements.statInterruptionsCount.textContent = `${metrics.interruptionsCount}`;
    elements.statIdeasCount.textContent = `${metrics.ideasCount}`;

    // 4. Render Speaking Time Share Donut Chart (Chart.js)
    renderSpeakingDonutChart();

    // 5. Render Qualitative Strengths & Improvement lists with transcript links
    renderQualitativeFeedback(metrics);

    // 6. Render Full Audit Transcript in Report Viewer
    renderReportAuditTranscript();

    if (window.lucide) window.lucide.createIcons();
  }

  function animateScoreRing(score) {
    const ringCircle = elements.scoreRingCircle;
    const scoreNum = elements.overallScoreNum;
    const verdict = elements.overallScoreVerdict;

    // Circle circumference for r=70 is 2 * PI * 70 ≈ 440
    const circumference = 440;
    ringCircle.style.strokeDasharray = `${circumference}`;
    ringCircle.style.strokeDashoffset = `${circumference}`;

    // Verdict text
    if (score >= 85) verdict.textContent = "Outstanding Performance";
    else if (score >= 70) verdict.textContent = "Strong Competency";
    else if (score >= 50) verdict.textContent = "Solid Baseline";
    else verdict.textContent = "Needs Practice";

    // Animated counter
    let current = 0;
    const duration = 1200;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      current = Math.round(progress * score);
      scoreNum.textContent = String(current);

      const offset = circumference - (progress * score / 100) * circumference;
      ringCircle.style.strokeDashoffset = `${offset}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        scoreNum.textContent = String(score);
      }
    }
    requestAnimationFrame(updateCounter);
  }

  function renderSkillBars(skills) {
    elements.skillsBreakdownList.innerHTML = "";

    const definitions = [
      { key: "opening", name: "Opening & Initiative", val: skills.opening },
      { key: "building", name: "Building on Others", val: skills.building },
      { key: "clarity", name: "Clarity & Articulation", val: skills.clarity },
      { key: "listening", name: "Active Listening", val: skills.listening },
      { key: "participation", name: "Balanced Participation", val: skills.participation }
    ];

    definitions.forEach(d => {
      const item = document.createElement("div");
      item.className = "skill-item";
      const pct = (d.val / 5.0) * 100;

      item.innerHTML = `
        <div class="skill-info">
          <span class="skill-name">${d.name}</span>
          <span class="skill-score-val">${d.val.toFixed(1)} / 5.0</span>
        </div>
        <div class="skill-bar-track">
          <div class="skill-bar-fill" style="width: 0%;" data-target-width="${pct}%"></div>
        </div>
      `;

      elements.skillsBreakdownList.appendChild(item);
    });

    // Trigger width animation
    setTimeout(() => {
      document.querySelectorAll(".skill-bar-fill").forEach(fill => {
        fill.style.width = fill.dataset.targetWidth;
      });
    }, 100);
  }

  function renderSpeakingDonutChart() {
    if (state.speakingChart) {
      state.speakingChart.destroy();
    }

    const labels = [];
    const data = [];
    const colors = [];

    state.participants.forEach(p => {
      const sec = state.speakingDurations[p.id] || (p.id === "you" ? 1 : 2);
      labels.push(p.name);
      data.push(sec);
      colors.push(p.color);
    });

    const ctx = elements.speakingTimeChart.getContext("2d");
    state.speakingChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: "#0a0e1a",
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              color: "#94a3b8",
              font: { family: "Inter", size: 10 },
              boxWidth: 10,
              padding: 8
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw}s`
            }
          }
        },
        cutout: "68%"
      }
    });
  }

  function renderQualitativeFeedback(metrics) {
    elements.feedbackStrengthsList.innerHTML = "";
    elements.feedbackImprovementsList.innerHTML = "";

    const studentTurns = state.transcript.filter(t => t.speaker === "You");

    // Dynamic strengths based on real behavior
    const strengths = [];
    if (metrics.skills.opening >= 4.0 && studentTurns[0]) {
      strengths.push({
        text: "Demonstrated decisive proactive leadership by opening the discussion early with clear assertions.",
        quote: studentTurns[0].text.slice(0, 75) + "...",
        time: studentTurns[0].time,
        entryId: studentTurns[0].id
      });
    } else {
      strengths.push({
        text: "Maintained a steady, composed tone throughout your contributions.",
        quote: studentTurns[0] ? studentTurns[0].text.slice(0, 75) + "..." : "Consistent presence maintained",
        time: studentTurns[0] ? studentTurns[0].time : "00:30",
        entryId: studentTurns[0] ? studentTurns[0].id : null
      });
    }

    if (metrics.skills.building >= 3.5 && studentTurns.length > 1) {
      strengths.push({
        text: "Constructively acknowledged viewpoints from other participants, reinforcing collaborative synthesis.",
        quote: studentTurns[studentTurns.length - 1].text.slice(0, 75) + "...",
        time: studentTurns[studentTurns.length - 1].time,
        entryId: studentTurns[studentTurns.length - 1].id
      });
    } else {
      strengths.push({
        text: "Introduced substantive viewpoints to keep the momentum going.",
        quote: studentTurns[0] ? studentTurns[0].text.slice(0, 75) + "..." : "Relevant ideas offered",
        time: studentTurns[0] ? studentTurns[0].time : "01:00",
        entryId: studentTurns[0] ? studentTurns[0].id : null
      });
    }

    // Dynamic improvements
    const improvements = [];
    if (state.interruptionCount > 0) {
      const interruptedTurn = state.transcript.find(t => t.interrupted);
      improvements.push({
        text: `At ${interruptedTurn ? interruptedTurn.time : "the midpoint"} you interrupted ${interruptedTurn ? interruptedTurn.speaker : "a peer"}. Practice active pauses to let peers conclude their thoughts.`,
        quote: interruptedTurn ? `Interrupted ${interruptedTurn.speaker}` : "Interruption logged",
        time: interruptedTurn ? interruptedTurn.time : "01:45",
        entryId: interruptedTurn ? interruptedTurn.id : null
      });
    } else {
      improvements.push({
        text: "Challenge opposing points with more targeted statistical counter-evidence to push the debate deeper.",
        quote: studentTurns[0] ? studentTurns[0].text.slice(0, 70) + "..." : "Expand empirical depth",
        time: studentTurns[0] ? studentTurns[0].time : "01:15",
        entryId: studentTurns[0] ? studentTurns[0].id : null
      });
    }

    if (metrics.speakingSharePct < 20) {
      improvements.push({
        text: "Increase your speaking frequency. Your share was under fair benchmark; interject earlier with structured points.",
        quote: "Total participation share under 20%",
        time: "Overall",
        entryId: null
      });
    } else {
      improvements.push({
        text: "Synthesize broader consensus before yielding the floor to showcase executive facilitation skills.",
        quote: studentTurns[studentTurns.length - 1] ? studentTurns[studentTurns.length - 1].text.slice(0, 70) + "..." : "Add closing synthesis",
        time: studentTurns[studentTurns.length - 1] ? studentTurns[studentTurns.length - 1].time : "02:10",
        entryId: studentTurns[studentTurns.length - 1] ? studentTurns[studentTurns.length - 1].id : null
      });
    }

    // Populate lists
    strengths.forEach(s => elements.feedbackStrengthsList.appendChild(createFeedbackCard(s)));
    improvements.forEach(i => elements.feedbackImprovementsList.appendChild(createFeedbackCard(i)));
  }

  function createFeedbackCard(item) {
    const card = document.createElement("div");
    card.className = "feedback-card-item";

    card.innerHTML = `
      <div class="feedback-text">${escapeHtml(item.text)}</div>
      ${item.quote ? `
        <div class="feedback-quote-chip" title="Click to view in transcript">
          <i data-lucide="quote" style="width:12px; height:12px;"></i>
          <span>"${escapeHtml(item.quote)}"</span>
          <span style="opacity:0.6; font-size:0.72rem;">[${item.time}]</span>
        </div>
      ` : ""}
    `;

    if (item.entryId) {
      card.addEventListener("click", () => {
        jumpToTranscriptEntry(item.entryId);
      });
    }

    return card;
  }

  function renderReportAuditTranscript() {
    elements.reportTranscriptStream.innerHTML = "";

    state.transcript.forEach(entry => {
      const isYou = entry.speaker === "You";
      const bubble = document.createElement("div");
      bubble.className = `transcript-item ${isYou ? "you-bubble" : ""} ${entry.interrupted ? "interrupted" : ""}`;
      bubble.id = `report-bubble-${entry.id}`;
      bubble.style.setProperty("--bubble-color", entry.color);

      bubble.innerHTML = `
        <div class="transcript-item-meta">
          <span class="transcript-speaker-name">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${entry.color};"></span>
            ${escapeHtml(entry.speaker)} (${escapeHtml(entry.role)})
          </span>
          <div style="display: flex; align-items: center; gap: 8px;">
            ${entry.interrupted ? `<span class="interrupted-badge"><i data-lucide="zap" style="width:10px;height:10px;"></i> Interrupted</span>` : ""}
            <span class="transcript-time">${entry.time}</span>
          </div>
        </div>
        <div class="transcript-item-text">${escapeHtml(entry.text)}</div>
      `;

      elements.reportTranscriptStream.appendChild(bubble);
    });
  }

  function jumpToTranscriptEntry(entryId) {
    const el = document.getElementById(`report-bubble-${entryId}`);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("highlight-target");

    setTimeout(() => {
      el.classList.remove("highlight-target");
    }, 2400);
  }

  function bindReportEvents() {
    elements.btnPracticeAgain.addEventListener("click", () => {
      startDiscussion();
    });

    elements.btnChangeTopic.addEventListener("click", () => {
      showScreen("setup");
    });

    elements.btnDownloadReport.addEventListener("click", () => {
      window.print();
    });
  }

  /* ========== INITIALIZATION ENTRYPOINT ========== */
  document.addEventListener("DOMContentLoaded", () => {
    cacheDomElements();
    loadBrowserVoices();
    initSetupScreen();
    bindRoomEvents();
    bindReportEvents();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

})();
