import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CONFIG } from '../data/config';
import { MOCK_SESSIONS } from '../data/mockHistory';
import { api } from '../services/api';
import { sttService } from '../services/speechRecognition';
import { ttsService } from '../services/speechSynthesis';
import { calculateMetrics } from '../services/metricsEngine';

const DiscussionContext = createContext(null);

export function DiscussionProvider({ children }) {
  // Screen router: 'landing' | 'dashboard' | 'setup' | 'arena' | 'report' | 'history' | 'insights'
  const [currentScreen, setCurrentScreen] = useState('landing');

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Session History
  const [sessionsHistory, setSessionsHistory] = useState(() => {
    try {
      const stored = localStorage.getItem("gd_arena_sessions");
      return stored ? JSON.parse(stored) : MOCK_SESSIONS;
    } catch {
      return MOCK_SESSIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem("gd_arena_sessions", JSON.stringify(sessionsHistory));
  }, [sessionsHistory]);

  // Session parameters
  const [topic, setTopic] = useState(CONFIG.PRESET_TOPICS[0]);
  const [aiCount, setAiCount] = useState(3);
  const [durationMinutes, setDurationMinutes] = useState(CONFIG.DEFAULT_DURATION_MINUTES);
  const [timeRemaining, setTimeRemaining] = useState(CONFIG.DEFAULT_DURATION_MINUTES * 60);

  // Live GD state
  const [participants, setParticipants] = useState([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [speakerStatus, setSpeakerStatus] = useState({});
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(CONFIG.MAX_TURN_SECONDS);
  const [isStudentSpeaking, setIsStudentSpeaking] = useState(false);
  const [sttInterimText, setSttInterimText] = useState('');
  const [transcript, setTranscript] = useState([]);
  const [interruptionCount, setInterruptionCount] = useState(0);
  const [currentReport, setCurrentReport] = useState(null);
  const [backendHealth, setBackendHealth] = useState({ ok: true, isMock: true, model: "Checking..." });

  // Refs for intervals & cancellation
  const roomTimerRef = useRef(null);
  const turnTimerRef = useRef(null);
  const turnAbortRef = useRef(null);
  const speakingDurationsRef = useRef({});
  const studentSpeechStartRef = useRef(null);
  const sessionStartTimeRef = useRef(null);
  const activeSpeakerRef = useRef(null);
  const transcriptRef = useRef([]);

  // Keep refs synchronized
  useEffect(() => { activeSpeakerRef.current = activeSpeakerId; }, [activeSpeakerId]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  // Initial Health Check
  useEffect(() => {
    api.health().then(status => setBackendHealth(status));
  }, []);

  function addToast(message, type = 'info') {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }

  function navigate(screen) {
    if (currentScreen === 'arena' && screen !== 'arena') {
      cleanupActiveSession();
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cleanupActiveSession() {
    clearInterval(roomTimerRef.current);
    clearInterval(turnTimerRef.current);
    ttsService.cancel();
    sttService.stop();
    if (turnAbortRef.current) turnAbortRef.current.abort();
  }

  /* ========== START GD SESSION ========== */
  function startSession({ selectedTopic, selectedAiCount, selectedDuration }) {
    cleanupActiveSession();

    const activeTopic = selectedTopic || topic;
    const count = selectedAiCount || aiCount;
    const durMins = selectedDuration || durationMinutes;

    setTopic(activeTopic);
    setAiCount(count);
    setDurationMinutes(durMins);
    setTimeRemaining(durMins * 60);

    // Assemble participant cards
    const availableKeys = ["aarav", "meera", "kabir", "ananya", "rohan"];
    const chosenAiKeys = availableKeys.slice(0, count);

    const roster = [
      { ...CONFIG.PERSONAS.you, isAi: false },
      { ...CONFIG.PERSONAS.moderator, isAi: true }
    ];
    chosenAiKeys.forEach(k => roster.push({ ...CONFIG.PERSONAS[k], isAi: true }));

    setParticipants(roster);
    setTranscript([]);
    setInterruptionCount(0);
    setIsStudentSpeaking(false);
    setSttInterimText('');
    speakingDurationsRef.current = {};
    roster.forEach(p => { speakingDurationsRef.current[p.id] = 0; });
    sessionStartTimeRef.current = Date.now();

    const initialStatuses = {};
    roster.forEach(p => initialStatuses[p.id] = 'idle');
    setSpeakerStatus(initialStatuses);

    navigate('arena');

    // Start Room Timer
    startRoomCountdown(durMins * 60);

    // Begin with Moderator Opening
    runModeratorOpening(activeTopic);
  }

  function startRoomCountdown(totalSecs) {
    let rem = totalSecs;
    clearInterval(roomTimerRef.current);
    roomTimerRef.current = setInterval(() => {
      rem -= 1;
      setTimeRemaining(rem);
      if (rem <= 0) {
        clearInterval(roomTimerRef.current);
        endSession();
      }
    }, 1000);
  }

  function startTurnCountdown(onExpire) {
    clearInterval(turnTimerRef.current);
    setTurnTimeRemaining(CONFIG.MAX_TURN_SECONDS);
    let rem = CONFIG.MAX_TURN_SECONDS;

    turnTimerRef.current = setInterval(() => {
      rem -= 1;
      setTurnTimeRemaining(rem);
      if (rem <= 0) {
        clearInterval(turnTimerRef.current);
        if (onExpire) onExpire();
      }
    }, 1000);
  }

  function formatTimestamp() {
    const elapsedSecs = Math.floor((Date.now() - (sessionStartTimeRef.current || Date.now())) / 1000);
    const m = Math.floor(elapsedSecs / 60);
    const s = elapsedSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function appendTranscriptLine(speaker, role, text, color, wasInterrupted = false) {
    const line = {
      id: `turn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      speaker,
      role,
      text: text.trim(),
      time: formatTimestamp(),
      interrupted: wasInterrupted,
      color: color || '#22D3EE'
    };
    setTranscript(prev => [...prev, line]);
    return line;
  }

  /* ========== TURN SEQUENCING ========== */
  async function runModeratorOpening(sessionTopic) {
    const mod = CONFIG.PERSONAS.moderator;
    setActiveSpeakerId('moderator');
    setSpeakerStatus(prev => ({ ...prev, moderator: 'thinking' }));

    try {
      turnAbortRef.current = new AbortController();
      const res = await api.generateTurn({
        persona: mod,
        topic: sessionTopic,
        transcript: [],
        signal: turnAbortRef.current.signal
      });

      setSpeakerStatus(prev => ({ ...prev, moderator: 'speaking' }));
      appendTranscriptLine(mod.name, mod.role, res.text, mod.color);
      await ttsService.speak(res.text, 'moderator');
    } catch {
      // Aborted or fallback
    } finally {
      setSpeakerStatus(prev => ({ ...prev, moderator: 'idle' }));
    }

    promptStudentTurn();
  }

  function promptStudentTurn() {
    setActiveSpeakerId('you');
    setSpeakerStatus(prev => ({ ...prev, you: 'speaking' }));

    startTurnCountdown(() => {
      // Student turn timeout
      setSpeakerStatus(prev => ({ ...prev, you: 'idle' }));
      addToast("Turn limit reached. Passing floor to participants.", "info");
      advanceToNextAiParticipant(0);
    });
  }

  async function advanceToNextAiParticipant(aiIndex) {
    const aiList = participants.filter(p => p.isAi && p.id !== 'moderator');
    if (aiIndex >= aiList.length) {
      // Cycle back to student
      promptStudentTurn();
      return;
    }

    const currentAi = aiList[aiIndex];
    setActiveSpeakerId(currentAi.id);
    setSpeakerStatus(prev => ({ ...prev, [currentAi.id]: 'thinking' }));

    startTurnCountdown(() => {
      advanceToNextAiParticipant(aiIndex + 1);
    });

    try {
      turnAbortRef.current = new AbortController();
      const res = await api.generateTurn({
        persona: currentAi,
        topic,
        transcript: transcriptRef.current,
        nextSpeaker: aiIndex + 1 < aiList.length ? aiList[aiIndex + 1].name : "You",
        signal: turnAbortRef.current.signal
      });

      setSpeakerStatus(prev => ({ ...prev, [currentAi.id]: 'speaking' }));
      appendTranscriptLine(currentAi.name, currentAi.role, res.text, currentAi.color);

      await ttsService.speak(res.text, currentAi.id);

      setSpeakerStatus(prev => ({ ...prev, [currentAi.id]: 'idle' }));
      clearInterval(turnTimerRef.current);

      setTimeout(() => {
        advanceToNextAiParticipant(aiIndex + 1);
      }, 700);

    } catch (err) {
      setSpeakerStatus(prev => ({ ...prev, [currentAi.id]: 'idle' }));
      if (err.message !== "Aborted") {
        advanceToNextAiParticipant(aiIndex + 1);
      }
    }
  }

  /* ========== INTERRUPTION HANDLING ========== */
  function interruptCurrentSpeaker() {
    const currentActive = activeSpeakerRef.current;
    if (currentActive && currentActive !== 'you') {
      ttsService.cancel();
      if (turnAbortRef.current) turnAbortRef.current.abort();

      const activeParticipant = participants.find(p => p.id === currentActive);
      const speakerName = activeParticipant ? activeParticipant.name : 'AI';

      // Log interruption timeline event
      const interruptEvent = {
        id: `interrupt-${Date.now()}`,
        isInterruption: true,
        type: 'interruption',
        timestamp: formatTimestamp(),
        text: `YOU INTERRUPTED ${speakerName.toUpperCase()}`,
        interruptedSpeaker: speakerName,
        time: formatTimestamp(),
      };

      setTranscript(prev => [...prev, interruptEvent]);
      setInterruptionCount(c => c + 1);
      setSpeakerStatus(prev => ({ ...prev, [currentActive]: 'interrupted' }));
      addToast(`You interrupted ${speakerName}! The floor is now yours.`, 'info');

      // Transfer turn to student
      setActiveSpeakerId('you');
      setSpeakerStatus(prev => ({ ...prev, you: 'speaking' }));
    }
  }

  function interruptActiveSpeaker() {
    interruptCurrentSpeaker();
  }

  /* ========== STUDENT SPEECH CONTROLS ========== */
  function startStudentSpeech() {
    if (isStudentSpeaking) return;

    interruptActiveSpeaker();

    setIsStudentSpeaking(true);
    setActiveSpeakerId('you');
    setSpeakerStatus(prev => ({ ...prev, you: 'speaking' }));
    setSttInterimText('');
    studentSpeechStartRef.current = Date.now();

    sttService.start({
      onInterim: (text) => setSttInterimText(text),
      onFinal: (text) => setSttInterimText(text),
      onError: () => addToast("Microphone error. You can type your response.", "warning")
    });
  }

  function stopStudentSpeech() {
    if (!isStudentSpeaking) return;

    setIsStudentSpeaking(false);
    sttService.stop();

    if (studentSpeechStartRef.current) {
      const elapsed = Math.round((Date.now() - studentSpeechStartRef.current) / 1000);
      speakingDurationsRef.current["you"] = (speakingDurationsRef.current["you"] || 0) + Math.max(1, elapsed);
    }

    const finalText = sttInterimText.trim();
    if (finalText.length >= 3) {
      appendTranscriptLine("You", "Student", finalText, "#22D3EE");
    } else {
      addToast("No speech recognized. Passing turn to next speaker.", "info");
    }

    setSttInterimText('');
    setSpeakerStatus(prev => ({ ...prev, you: 'idle' }));
    clearInterval(turnTimerRef.current);

    advanceToNextAiParticipant(0);
  }

  function submitTypedTurn(text) {
    if (!text || !text.trim()) return;

    interruptActiveSpeaker();
    speakingDurationsRef.current["you"] = (speakingDurationsRef.current["you"] || 0) + 12;

    appendTranscriptLine("You", "Student", text.trim(), "#22D3EE");
    setSpeakerStatus(prev => ({ ...prev, you: 'idle' }));
    clearInterval(turnTimerRef.current);

    advanceToNextAiParticipant(0);
  }

  function skipTurn() {
    if (activeSpeakerId && activeSpeakerId !== 'you') {
      ttsService.cancel();
      if (turnAbortRef.current) turnAbortRef.current.abort();
      setSpeakerStatus(prev => ({ ...prev, [activeSpeakerId]: 'idle' }));
      addToast("Skipped turn.", "info");
      promptStudentTurn();
    }
  }

  /* ========== END SESSION & EVALUATION ========== */
  function endSession() {
    cleanupActiveSession();

    // Closing Moderator line
    const mod = CONFIG.PERSONAS.moderator;
    appendTranscriptLine(mod.name, mod.role, CONFIG.MOCK_DIALOGUES.moderator.closing[0], mod.color);

    // Compute Metrics & Report
    const metrics = calculateMetrics(
      transcriptRef.current,
      speakingDurationsRef.current,
      participants,
      interruptionCount
    );

    const reportObj = {
      id: `sess-${Date.now()}`,
      topic,
      date: "Just now",
      duration: `${durationMinutes}m 00s`,
      score: metrics.overall,
      aiCount: participants.filter(p => p.isAi && p.id !== 'moderator').length,
      participants: participants.map(p => p.name),
      metrics,
      strengths: metrics.strengths,
      improvements: metrics.improvements,
      transcript: transcriptRef.current
    };

    setCurrentReport(reportObj);
    setSessionsHistory(prev => [reportObj, ...prev]);

    navigate('report');
  }

  function viewReport(report) {
    setCurrentReport(report);
    navigate('report');
  }

  return (
    <DiscussionContext.Provider
      value={{
        currentScreen,
        navigate,
        toasts,
        addToast,
        sessionsHistory,
        backendHealth,
        topic,
        setTopic,
        aiCount,
        setAiCount,
        durationMinutes,
        setDurationMinutes,
        timeRemaining,
        turnTimeRemaining,
        participants,
        activeSpeakerId,
        speakerStatus,
        isStudentSpeaking,
        sttInterimText,
        transcript,
        currentReport,
        startSession,
        startStudentSpeech,
        stopStudentSpeech,
        submitTypedTurn,
        skipTurn,
        interruptCurrentSpeaker,
        endSession,
        viewReport
      }}
    >
      {children}
    </DiscussionContext.Provider>
  );
}

export function useDiscussion() {
  const ctx = useContext(DiscussionContext);
  if (!ctx) throw new Error("useDiscussion must be used inside DiscussionProvider");
  return ctx;
}
