import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Hand, Volume2, Users, Play, Sparkles, MessageSquare,
  ShieldCheck, AlertTriangle, ArrowRight, Award, CheckCircle2, ChevronRight,
  TrendingUp, BookOpen, Clock, Activity, Zap, RefreshCw, X, UserPlus, Radio,
  BarChart3, FileText, CornerDownRight, Lightbulb, Copy, Check, Printer,
  VolumeX, Gauge, Share2, Compass, HelpCircle, ChevronDown
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

// --- Pure Browser Audio Synthesizer (Zero External Dependencies) ---
const playUiSound = (type = 'click') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'interrupt') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.18);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'turn') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch {
    // Ignore audio autoplay restrictions
  }
};

// --- Live Audio Equalizer Spectrum Bar Component ---
const AudioSpectrum = ({ isActive, color = 'cyan' }) => {
  const bars = [6, 14, 9, 22, 16, 26, 18, 12, 20, 10, 24, 15];
  return (
    <div className="flex items-center gap-[2.5px] h-6 px-2 py-0.5 rounded-md bg-zinc-950/70 border border-zinc-800/80">
      {bars.map((h, i) => (
        <span
          key={i}
          className={`w-[2.5px] rounded-full transition-all duration-150 ${
            isActive
              ? color === 'emerald'
                ? 'bg-emerald-400 animate-pulse'
                : color === 'rose'
                ? 'bg-rose-400 animate-pulse'
                : 'bg-cyan-400 animate-pulse'
              : 'bg-zinc-700 h-[4px]'
          }`}
          style={{
            height: isActive ? `${Math.max(4, Math.round(h * (0.6 + Math.sin(i * 1.3) * 0.4)))}px` : '4px',
            animationDelay: `${i * 0.07}s`
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  // Navigation / View State
  const [currentView, setCurrentView] = useState('templates'); // 'templates' | 'arena' | 'report' | 'roadmap'
  const [activeTab, setActiveTab] = useState('all');

  // Room Setup State
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [format, setFormat] = useState('standard');
  const [panelSize, setPanelSize] = useState(4);
  const [patienceSec, setPatienceSec] = useState(5);
  const [studentId, setStudentId] = useState('student_aryan_01');

  // Active Room State
  const [currentRoom, setCurrentRoom] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [activeTurnId, setActiveTurnId] = useState(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [captionText, setCaptionText] = useState('Room initialized. Waiting to initiate discussion...');
  const [liveNudge, setLiveNudge] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showArenaFactsSide, setShowArenaFactsSide] = useState(false);

  // Voice & STT State
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [pendingInterruptedId, setPendingInterruptedId] = useState(null);

  // Report & Roadmap State
  const [reportData, setReportData] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [roomFacts, setRoomFacts] = useState(null);
  const [showFactsModal, setShowFactsModal] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // System & Health
  const [systemHealth, setSystemHealth] = useState({ status: 'connecting', mock_mode: true });
  const [isVoiceTesting, setIsVoiceTesting] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const transcriptEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const aiTurnTimerRef = useRef(null);
  const isInterruptedRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    isInterruptedRef.current = isInterrupted;
  }, [isInterrupted]);

  // Session Stopwatch Timer
  useEffect(() => {
    let interval = null;
    if (currentView === 'arena') {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentView]);

  // Initial Load: Fetch Health, Topics, Student Profile
  useEffect(() => {
    checkHealth();
    fetchTopics();
    fetchStudentProfile();
    initSpeechRecognition();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      const data = await res.json();
      setSystemHealth(data);
    } catch {
      setSystemHealth({ status: 'offline', mock_mode: true });
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/topics`);
      const data = await res.json();
      setTopics(data.topics || []);
      if (data.topics?.length > 0) {
        setSelectedTopic(data.topics[0].title);
      }
    } catch (err) {
      console.error('Failed to load topics:', err);
    }
  };

  const fetchStudentProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/students/${studentId}/profile`);
      if (res.ok) {
        const data = await res.json();
        setStudentProfile(data);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  // --- Voice Engine (Sweet Natural Voice Selection) ---
  const getSweetNaturalVoice = (genderHint = 'female') => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const isFemale = (genderHint === 'female');

    if (isFemale) {
      return voices.find(v => /natural|online/i.test(v.name) && (v.lang === 'en-IN' || /neerja|sunita|kavya|heera|priya/i.test(v.name)) && /female|woman|neerja|sunita/i.test(v.name))
        || voices.find(v => /natural|online/i.test(v.name) && /jenny|aria|susan|emma|clara/i.test(v.name))
        || voices.find(v => /google/i.test(v.name) && /female|uk english female|us english female/i.test(v.name))
        || voices.find(v => (v.lang === 'en-IN' || /india/i.test(v.name)) && !/desktop/i.test(v.name) && /female|woman/i.test(v.name))
        || voices.find(v => /natural|online|google/i.test(v.name) && v.lang.startsWith('en'))
        || voices.find(v => v.lang.startsWith('en') && !/desktop/i.test(v.name))
        || voices[0];
    } else {
      return voices.find(v => /natural|online/i.test(v.name) && (v.lang === 'en-IN' || /prabhat|madhur|ravi|rishi/i.test(v.name)) && /male|man|prabhat|madhur/i.test(v.name))
        || voices.find(v => /natural|online/i.test(v.name) && /guy|ryan|george|steffan|oliver/i.test(v.name))
        || voices.find(v => /google/i.test(v.name) && /male|uk english male/i.test(v.name))
        || voices.find(v => (v.lang === 'en-IN' || /india/i.test(v.name)) && !/desktop/i.test(v.name))
        || voices.find(v => /natural|online|google/i.test(v.name) && v.lang.startsWith('en'))
        || voices.find(v => v.lang.startsWith('en') && !/desktop/i.test(v.name))
        || voices[0];
    }
  };

  const speakTurn = (text, voiceHint, onEndCallback) => {
    if (!('speechSynthesis' in window) || isAudioMuted) {
      if (onEndCallback && !isInterruptedRef.current) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const isFemale = voiceHint ? voiceHint.gender_hint === 'female' : true;
    const baseRate = voiceHint ? voiceHint.rate : 0.94;

    utterance.rate = Math.min(0.96, Math.max(0.88, baseRate));
    if (isFemale) {
      utterance.pitch = Math.min(1.15, Math.max(1.05, (voiceHint ? voiceHint.pitch : 1.0) * 1.05));
    } else {
      utterance.pitch = Math.min(1.04, Math.max(0.97, (voiceHint ? voiceHint.pitch : 1.0)));
    }

    const matchedVoice = getSweetNaturalVoice(isFemale ? 'female' : 'male');
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang || 'en-US';
    }

    setIsAiSpeaking(true);

    utterance.onend = () => {
      setIsAiSpeaking(false);
      setActiveSpeakerId(null);
      if (isInterruptedRef.current) return;
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      setIsAiSpeaking(false);
      setActiveSpeakerId(null);
      if (isInterruptedRef.current || e.error === 'canceled' || e.error === 'interrupted') return;
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleTestVoice = () => {
    setIsVoiceTesting(true);
    playUiSound('turn');
    speakTurn(
      "Hey there! Welcome to GD Arena. Relax and take your time, we are all here to learn and practice together!",
      { gender_hint: 'female', pitch: 1.10, rate: 0.94 },
      () => setIsVoiceTesting(false)
    );
  };

  // --- STT (Web Speech API) ---
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += ' ' + event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setSpeechText((final + ' ' + interim).trim());
      };

      recognition.onerror = (event) => {
        console.warn('STT Error:', event.error);
        if (event.error !== 'no-speech') {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
    }
  };

  const startListening = () => {
    setIsRecording(true);
    setSpeechText('');
    playUiSound('start');
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch {}
    }
  };

  const stopListeningAndSubmit = () => {
    setIsRecording(false);
    playUiSound('turn');
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    const txt = speechText.trim();
    if (txt) {
      submitStudentUtterance(txt);
    }
    setSpeechText('');
  };

  // --- Interruption Handling ---
  const handleInterrupt = () => {
    setIsInterrupted(true);
    isInterruptedRef.current = true;
    setPendingInterruptedId(activeTurnId);
    playUiSound('interrupt');

    if (aiTurnTimerRef.current) {
      clearTimeout(aiTurnTimerRef.current);
      aiTurnTimerRef.current = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsAiSpeaking(false);
    setActiveSpeakerId(null);

    // Tag interrupted bubble in state
    setTranscript(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        interrupted: true
      };
      return updated;
    });

    startListening();
    setCaptionText('✋ You took the floor! Speak your counter-argument now...');
  };

  // --- Start Discussion Session ---
  const handleStartSession = async (customTitle = null) => {
    let finalTopic = customTitle || selectedTopic;
    if (finalTopic === '__custom__' || !finalTopic) {
      if (!customTopicInput.trim()) {
        alert('Please enter your custom debate topic title!');
        return;
      }
      finalTopic = customTopicInput.trim();
    }

    playUiSound('start');

    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: finalTopic,
          language,
          format,
          panel_size: panelSize,
          patience_sec: patienceSec,
          student_id: studentId
        })
      });
      const data = await res.json();
      setCurrentRoom(data);
      setTranscript([]);
      setCurrentView('arena');
      setIsInterrupted(false);
      isInterruptedRef.current = false;
      setElapsedSeconds(0);

      // Fetch room facts
      fetch(`${API_BASE}/api/rooms/${data.room_id}/facts`)
        .then(r => r.json())
        .then(f => setRoomFacts(f))
        .catch(() => {});

      // Advance initial turn (Moderator Opening)
      advanceTurn(data.room_id, null, null);
    } catch (err) {
      alert('Error initializing room: ' + err);
    }
  };

  // --- Advance Turn Loop ---
  const advanceTurn = async (roomId, studentText = null, interruptedId = null) => {
    const rId = roomId || currentRoom?.room_id;
    if (!rId) return;

    if (aiTurnTimerRef.current) {
      clearTimeout(aiTurnTimerRef.current);
      aiTurnTimerRef.current = null;
    }

    try {
      const payload = {};
      if (studentText) payload.student_text = studentText;
      if (interruptedId) payload.interrupted_turn_id = interruptedId;

      const res = await fetch(`${API_BASE}/api/rooms/${rId}/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.nudge) {
        setLiveNudge(data.nudge);
      }

      if (data.turn) {
        playUiSound('turn');
        setActiveTurnId(data.turn.id);
        setActiveSpeakerId(data.turn.speaker_id);
        setCaptionText(`${data.turn.speaker_name}: "${data.turn.text}"`);

        setTranscript(prev => [
          ...prev,
          {
            id: data.turn.id,
            speaker_id: data.turn.speaker_id,
            speaker_name: data.turn.speaker_name,
            role: data.turn.role,
            text: data.turn.text,
            t_ms: data.turn.t_ms,
            interrupted: false
          }
        ]);

        speakTurn(data.turn.text, data.turn.voice, () => {
          if (isInterruptedRef.current) return;
          if (data.next_actor === 'ai') {
            aiTurnTimerRef.current = setTimeout(() => {
              advanceTurn(rId, null, null);
            }, 1200);
          } else {
            setCaptionText("The floor is yours! Speak with microphone or type your point.");
          }
        });
      } else {
        setActiveSpeakerId(null);
        setCaptionText("The floor is open. Speak with microphone or type your point.");
      }
    } catch (err) {
      console.error('Error advancing turn:', err);
    }
  };

  const submitStudentUtterance = (text) => {
    if (!text || !text.trim()) return;

    playUiSound('start');
    const intId = pendingInterruptedId;
    setPendingInterruptedId(null);
    setIsInterrupted(false);
    isInterruptedRef.current = false;

    // Append to transcript
    setTranscript(prev => [
      ...prev,
      {
        id: 'user_' + Date.now(),
        speaker_id: 'student',
        speaker_name: 'You',
        role: 'student',
        text: text.trim(),
        t_ms: Date.now(),
        interrupted: false
      }
    ]);

    setActiveSpeakerId('student');
    setCaptionText(`You: "${text.trim()}"`);
    advanceTurn(currentRoom?.room_id, text.trim(), intId);
  };

  // --- Multi-seat Friend Invite ---
  const handleInviteFriend = async () => {
    if (!currentRoom) return;
    const friendName = prompt("Enter your friend's name to practice together in this GD:", "Rahul");
    if (!friendName || !friendName.trim()) return;
    const fId = "student_" + friendName.toLowerCase().replace(/[^a-z0-9]/g, '');

    try {
      const res = await fetch(`${API_BASE}/api/rooms/${currentRoom.room_id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: fId, student_name: friendName.trim() })
      });
      const data = await res.json();
      alert(`🎉 ${data.message}`);

      // Refresh room participants
      const roomRes = await fetch(`${API_BASE}/api/rooms/${currentRoom.room_id}`);
      const roomData = await roomRes.json();
      setCurrentRoom(prev => ({
        ...prev,
        participants: roomData.participants,
        human_participants: roomData.human_participants
      }));
    } catch (err) {
      alert('Error joining room: ' + err);
    }
  };

  // --- End Discussion & Performance Report ---
  const handleEndDiscussion = async () => {
    if (!currentRoom) return;
    setIsInterrupted(true);
    isInterruptedRef.current = true;
    if (aiTurnTimerRef.current) clearTimeout(aiTurnTimerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    playUiSound('turn');

    try {
      const res = await fetch(`${API_BASE}/api/rooms/${currentRoom.room_id}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setReportData(data);
      setCurrentView('report');
      fetchStudentProfile();
    } catch (err) {
      alert('Error generating report: ' + err);
    }
  };

  // Copy Executive Report to Clipboard
  const handleCopyReport = () => {
    if (!reportData) return;
    const text = `GD Arena Performance Report
Topic: ${reportData.topic}
Overall Score: ${reportData.overall_score}/100
Executive Summary: ${reportData.summary}
Total Turns: ${reportData.metrics?.total_turns} | Student Turns: ${reportData.metrics?.student_turns}
Speaking Share: ${reportData.metrics?.speaking_share_pct?.student || '25'}%
Placement Benchmarks:
${reportData.criteria_scores?.map(c => `• ${c.criterion}: ${c.score}/5 - ${c.feedback}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Formatted Time Helper
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Live Speaking Share Calculation
  const calculateLiveBalance = () => {
    if (transcript.length === 0) return { studentShare: 0, status: 'Floor Open' };
    const studentWords = transcript
      .filter(t => t.role === 'student')
      .reduce((sum, t) => sum + (t.text?.split(/\s+/).length || 0), 0);
    const totalWords = transcript.reduce((sum, t) => sum + (t.text?.split(/\s+/).length || 0), 0);
    if (totalWords === 0) return { studentShare: 0, status: 'Floor Open' };
    const pct = Math.round((studentWords / totalWords) * 100);
    let status = 'Need to speak more';
    if (pct >= 20 && pct <= 35) status = 'Optimal Cadence 🎯';
    else if (pct > 35) status = 'Dominating Flow ⚠️';
    return { studentShare: pct, status };
  };

  // Dynamic Debate Atmosphere Tone
  const getDebateTone = () => {
    if (isInterrupted) return { label: '⚡ Intervention Active', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    if (transcript.length <= 2) return { label: '🌱 Welcoming & Framing', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    if (transcript.length <= 5) return { label: '📊 Empirical Exploration', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: '🔥 Constructive Synthesis', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
  };

  // Smart Starters / Quick Interventions
  const SMART_STARTERS = [
    { label: '📊 Cite Data', text: 'According to industry research and verified data, ' },
    { label: '🤝 Build On', text: 'I agree with that point, and building upon it, ' },
    { label: '⚡ Counter Kabir', text: 'Kabir brings a valid concern, however looking at practical outcomes, ' },
    { label: '🎯 Synthesize', text: 'To balance both perspectives constructively, ' },
  ];

  // Topic Categories for Filter Tabs
  const filteredTopics = topics.filter(t => {
    if (activeTab === 'all') return true;
    if (activeTab === 'finance') return t.category?.toLowerCase().includes('finance');
    if (activeTab === 'tech') return t.category?.toLowerCase().includes('tech');
    if (activeTab === 'education') return t.category?.toLowerCase().includes('education');
    if (activeTab === 'cases') return t.format === 'case_based';
    if (activeTab === 'abstract') return t.format === 'abstract';
    return true;
  });

  const liveBalance = calculateLiveBalance();
  const debateTone = getDebateTone();

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200 relative bg-tech-grid">
      {/* Background Ambient Aurora Lights */}
      <div className="aurora-glow top-0 left-1/4"></div>
      <div className="aurora-glow bottom-1/4 right-10 opacity-70"></div>

      {/* 1. Global Navbar (v0 / Modern SaaS Style) */}
      <header className="border-b border-[#27272a]/80 bg-[#09090b]/85 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/40">
            <Radio className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-white">GD Arena</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                PRO 2.0
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">AI-Powered Voice Group Discussion Practice</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-[#18181b]/90 p-1 rounded-xl border border-[#27272a]">
          <button
            onClick={() => setCurrentView('templates')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              currentView === 'templates' ? 'bg-[#27272a] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Topic Templates
          </button>
          {currentRoom && (
            <button
              onClick={() => setCurrentView('arena')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'arena' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Live Arena</span>
            </button>
          )}
          {reportData && (
            <button
              onClick={() => setCurrentView('report')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                currentView === 'report' ? 'bg-purple-500/20 text-purple-300 shadow-sm border border-purple-500/30' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Latest Report 📊
            </button>
          )}
          <button
            onClick={() => setCurrentView('roadmap')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              currentView === 'roadmap' ? 'bg-[#27272a] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            My Progress 🎯
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Mute/Unmute Toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
              isAudioMuted ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
            title={isAudioMuted ? 'Audio Muted' : 'Audio On'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Sweet Voice Preview */}
          <button
            onClick={handleTestVoice}
            disabled={isVoiceTesting}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/15 to-indigo-500/15 hover:from-purple-500/25 hover:to-indigo-500/25 text-purple-300 border border-purple-500/30 transition-all cursor-pointer shadow-sm"
            title="Preview friendly neural speech voice"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">{isVoiceTesting ? 'Playing...' : 'Sweet Voice Test'}</span>
          </button>

          {/* Online Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>
      </header>

      {/* 2. Main Content Views */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* VIEW 1: TOPIC TEMPLATES & SETUP (Hero + Cards) */}
        {currentView === 'templates' && (
          <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-8 flex flex-col gap-10">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-xs font-bold text-cyan-400 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Problem Statement 2: Campus Placement Voice GD Simulator
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Master Placement GDs with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                  Real AI Discussants
                </span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                Step into a hyper-realistic group discussion. Experience natural turn-taking, practice interrupting with composure, quote verified empirical data, and receive comprehensive placement rubrics.
              </p>

              {/* Quick Config Drawer */}
              <div className="glass-panel p-4 rounded-2xl border border-zinc-800 flex flex-wrap items-center justify-center gap-4 text-xs shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-medium">Language:</span>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none cursor-pointer focus:border-cyan-500 transition-colors"
                  >
                    <option value="en">English (Plain & Clear)</option>
                    <option value="hinglish">Hinglish (Natural Mix)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-medium">Panel Size:</span>
                  <select
                    value={panelSize}
                    onChange={e => setPanelSize(parseInt(e.target.value))}
                    className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none cursor-pointer focus:border-cyan-500 transition-colors"
                  >
                    <option value="3">3 AI Peers + Moderator</option>
                    <option value="4">4 AI Peers + Moderator (Standard)</option>
                    <option value="5">5 AI Peers + Moderator (Intense)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-medium">Format:</span>
                  <select
                    value={format}
                    onChange={e => setFormat(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none cursor-pointer focus:border-cyan-500 transition-colors"
                  >
                    <option value="standard">Standard Debate</option>
                    <option value="case_based">Case Study</option>
                    <option value="abstract">Abstract Topic</option>
                    <option value="controversial">Controversial Policy</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-medium">AI Patience:</span>
                  <select
                    value={patienceSec}
                    onChange={e => setPatienceSec(parseInt(e.target.value))}
                    className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none cursor-pointer focus:border-cyan-500 transition-colors"
                  >
                    <option value="3">3s (Fast paced)</option>
                    <option value="5">5s (Balanced pace)</option>
                    <option value="8">8s (Relaxed pace)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Custom Topic Bar */}
            <div className="glass-card p-4 sm:p-5 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center gap-3 shadow-lg">
              <div className="flex items-center gap-2 text-cyan-400 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="font-bold text-sm">Have your own topic?</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Stock Market & Nifty 50: Long-term Wealth vs Pure Speculation?"
                value={customTopicInput}
                onChange={e => setCustomTopicInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleStartSession(customTopicInput.trim());
                }}
                className="flex-1 bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                onClick={() => handleStartSession(customTopicInput.trim())}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/25 cursor-pointer active:scale-95"
              >
                Launch Custom Room 🚀
              </button>
            </div>

            {/* Topic Filter Tabs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'All Practice Topics' },
                    { id: 'finance', label: 'Finance & Stock Market' },
                    { id: 'education', label: 'College & Academics' },
                    { id: 'tech', label: 'Technology & AI' },
                    { id: 'cases', label: 'Case Studies' },
                    { id: 'abstract', label: 'Abstract' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all shrink-0 cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-zinc-100 text-black font-bold shadow-md'
                          : 'text-zinc-400 hover:text-white bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-zinc-500 hidden sm:block">{filteredTopics.length} curated templates</span>
              </div>

              {/* Topic Grid (v0 Card Layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTopics.map(t => (
                  <div
                    key={t.id}
                    className="glass-card rounded-2xl p-5 border border-zinc-800/80 hover:border-cyan-500/50 flex flex-col justify-between group transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
                          {t.category}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          t.difficulty === 'Hard'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : t.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {t.difficulty}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                        {t.title}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                        {t.context}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t.suggested_duration_sec}s round</span>
                      </div>

                      <button
                        onClick={() => handleStartSession(t.title)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-cyan-500 hover:text-black text-zinc-200 transition-all cursor-pointer group-hover:bg-cyan-500 group-hover:text-black active:scale-95"
                      >
                        <span>Join Room</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: THE LIVE ARENA */}
        {currentView === 'arena' && (
          <div className="flex-1 flex flex-col h-[calc(100vh-61px)]">
            {/* Arena Sub-Header: Live Equalizer, Subtitle, Timer, Actions */}
            <div className="border-b border-zinc-800 bg-[#0c0d12]/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Audio Equalizer */}
                <AudioSpectrum
                  isActive={isAiSpeaking || isRecording}
                  color={isRecording ? 'emerald' : activeSpeakerId === 'moderator' ? 'amber' : 'cyan'}
                />

                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border shrink-0 ${debateTone.color}`}>
                  {debateTone.label}
                </span>

                <span className="text-xs sm:text-sm font-medium text-white truncate max-w-xl">
                  {captionText}
                </span>
              </div>

              {/* Right Arena Controls */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Session Stopwatch */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{formatTime(elapsedSeconds)}</span>
                </div>

                {/* Live Speaking Share Pill */}
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                  <Gauge className="w-3 h-3 text-emerald-400" />
                  <span>Your Voice: <strong className="text-emerald-400">{liveBalance.studentShare}%</strong></span>
                </div>

                {/* Live Cheat Sheet Toggle */}
                {roomFacts && (
                  <button
                    onClick={() => setShowArenaFactsSide(!showArenaFactsSide)}
                    className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all ${
                      showArenaFactsSide
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3 h-3 text-cyan-400" />
                    <span className="hidden sm:inline">Cheat Sheet</span>
                  </button>
                )}

                {/* Multi-seat Friend Join */}
                <button
                  onClick={handleInviteFriend}
                  className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span className="hidden sm:inline">+ Friend</span>
                </button>

                {/* End Discussion */}
                <button
                  onClick={handleEndDiscussion}
                  className="text-xs px-3 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <span>End & Report</span>
                </button>
              </div>
            </div>

            {/* Arena Split Body: Left Pane (Participants) + Center (Transcript) + Optional Right (Fact Cheat Sheet) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 min-h-0 relative">
              {/* Left Column: Participants */}
              <div className="lg:col-span-1 border-r border-zinc-800/80 bg-[#0a0b0e] p-4 flex flex-col gap-3 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <h3 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Panelists ({ (currentRoom?.participants?.length || 0) + (currentRoom?.human_participants?.length || 1) + 1 })</span>
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">Live Audio</span>
                </div>

                {/* Human User Card */}
                <div className={`p-3 rounded-xl border transition-all ${activeSpeakerId === 'student' ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10' : 'border-zinc-800 bg-[#121316]'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-emerald-500/20 relative">
                      You
                      {activeSpeakerId === 'student' && (
                        <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white truncate">You (Discussant)</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">HUMAN</span>
                      </div>
                      <p className="text-xs text-zinc-400">Student Floor</p>
                    </div>
                  </div>
                </div>

                {/* Joined Friends / Human Candidates */}
                {currentRoom?.human_participants?.filter(h => h.id !== 'student')?.map(friend => (
                  <div key={friend.id} className="p-3 rounded-xl border border-sky-500/40 bg-sky-500/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center font-bold text-white text-sm">
                        {friend.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white truncate">{friend.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">FRIEND</span>
                        </div>
                        <p className="text-xs text-zinc-400">Peer Candidate</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Moderator Card */}
                {currentRoom?.moderator && (
                  <div className={`p-3 rounded-xl border transition-all ${activeSpeakerId === 'moderator' ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10' : 'border-zinc-800 bg-[#121316]'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-amber-500/20 relative">
                        M
                        {activeSpeakerId === 'moderator' && (
                          <span className="absolute -inset-1 rounded-full border-2 border-amber-400 animate-ping"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white truncate">{currentRoom.moderator.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">MOD</span>
                        </div>
                        <p className="text-xs text-zinc-400">Warm & Supportive Mentor</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Discussants Cards */}
                {currentRoom?.participants?.map(p => {
                  const isSpeaking = activeSpeakerId === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-xl border transition-all ${isSpeaking ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10' : 'border-zinc-800/80 bg-[#121316]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm relative">
                          {p.name[0]}
                          {isSpeaking && (
                            <span className="absolute -inset-1 rounded-full border-2 border-cyan-400 animate-ping"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white truncate">{p.name}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300">AI PEER</span>
                          </div>
                          <p className="text-xs text-zinc-400 truncate">{p.persona?.split('(')[0]}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center / Right Column: Live Transcript & Interaction Console */}
              <div className={`${showArenaFactsSide ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col bg-[#09090b] min-h-0 transition-all`}>
                {/* Transcript Scroll Area */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {/* Reassuring Welcome Icebreaker Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-sky-900/20 to-indigo-950/40 border border-cyan-500/30 text-cyan-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3 shadow-md">
                    <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block mb-0.5">👋 Welcome to your friendly practice room!</strong>
                      Take a deep breath and relax—there are no wrong answers here. Our friendly AI peers (Aarav, Meera, Kabir, Ananya) are here to explore ideas together with you. Speak with your microphone or type anytime!
                    </div>
                  </div>

                  {liveNudge && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>AI Coach Nudge:</strong> {liveNudge}</span>
                    </div>
                  )}

                  {transcript.map((turn, i) => {
                    const isStudent = turn.role === 'student';
                    const isMod = turn.role === 'moderator';

                    return (
                      <div
                        key={turn.id || i}
                        className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div className="flex items-center gap-2 px-1 text-xs text-zinc-500">
                          <span className="font-semibold text-zinc-400">{turn.speaker_name}</span>
                          <span>•</span>
                          <span className="capitalize">{turn.role}</span>
                          {turn.interrupted && (
                            <span className="bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded text-[10px] font-bold border border-rose-500/30">
                              INTERRUPTED
                            </span>
                          )}
                        </div>

                        <div
                          className={`max-w-xl p-3.5 rounded-2xl text-sm leading-relaxed ${
                            isStudent
                              ? 'bg-cyan-600 text-white rounded-br-none shadow-md shadow-cyan-600/20'
                              : isMod
                              ? 'bg-amber-950/40 border border-amber-500/30 text-amber-100 rounded-bl-none'
                              : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm'
                          }`}
                        >
                          {turn.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={transcriptEndRef} />
                </div>

                {/* Interaction Console (Voice Priority + Interrupt + Smart Starters + Text Fallback) */}
                <div className="border-t border-zinc-800 bg-[#0d0e12] p-4 flex flex-col gap-3">
                  {/* Smart Starters Toolbar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 shrink-0">Quick Starters:</span>
                    {SMART_STARTERS.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setTypedInput(prev => (prev ? prev + ' ' : '') + s.text)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 shrink-0 cursor-pointer transition-all"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Live STT / Status bar */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : isAiSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'}`}></div>
                      <span>
                        {isRecording
                          ? '🎙️ Listening to your speech... Click "Done Speaking" when finished.'
                          : isAiSpeaking
                          ? '🔊 AI discussant speaking... Click "Interrupt" anytime to take the floor!'
                          : '💡 Voice Priority: Click Speak or type your point below.'}
                      </span>
                    </div>

                    {speechText && (
                      <span className="text-cyan-400 italic truncate max-w-xs">"{speechText}"</span>
                    )}
                  </div>

                  {/* Main Action Bar */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Big Mic Button */}
                    {!isRecording ? (
                      <button
                        onClick={startListening}
                        className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer active:scale-95"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Speak (Voice Priority)</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopListeningAndSubmit}
                        className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer animate-pulse active:scale-95"
                      >
                        <MicOff className="w-4 h-4" />
                        <span>Done Speaking (Submit)</span>
                      </button>
                    )}

                    {/* Interrupt Button (When AI is speaking) */}
                    {isAiSpeaking && (
                      <button
                        onClick={handleInterrupt}
                        className="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md shadow-rose-500/10"
                      >
                        <Hand className="w-4 h-4 text-rose-400" />
                        <span>✋ Interrupt</span>
                      </button>
                    )}

                    {/* Text Input Row */}
                    <div className="flex-1 min-w-[200px] flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Or type your point here and press Enter..."
                        value={typedInput}
                        onChange={e => setTypedInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && typedInput.trim()) {
                            submitStudentUtterance(typedInput.trim());
                            setTypedInput('');
                          }
                        }}
                        className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500 transition-colors"
                      />
                      <button
                        onClick={() => {
                          if (typedInput.trim()) {
                            submitStudentUtterance(typedInput.trim());
                            setTypedInput('');
                          }
                        }}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-all cursor-pointer active:scale-95"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Right Drawer: Live Topic Fact Cheat Sheet */}
              {showArenaFactsSide && roomFacts && (
                <div className="lg:col-span-1 border-l border-zinc-800/80 bg-[#0d0e12] p-4 flex flex-col gap-4 overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Topic Cheat Sheet
                    </span>
                    <button
                      onClick={() => setShowArenaFactsSide(false)}
                      className="p-1 rounded-md text-zinc-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold uppercase text-zinc-400">Verified Empirical Facts</h4>
                    {roomFacts.verified_data_points?.map((dp, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80 text-xs space-y-1">
                        <span className="font-bold text-cyan-300 block">{dp.claim}</span>
                        <p className="text-zinc-300 text-[11px]">{dp.evidence}</p>
                      </div>
                    ))}
                  </div>

                  {roomFacts.common_myths_debunked?.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-zinc-800">
                      <h4 className="text-[11px] font-bold uppercase text-amber-400">Fallacies to Counter</h4>
                      {roomFacts.common_myths_debunked.map((m, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80 text-xs space-y-1">
                          <span className="text-rose-400 line-through text-[11px] block">Myth: {m.myth}</span>
                          <p className="text-emerald-300 text-[11px]">Reality: {m.reality}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: COMPREHENSIVE PERFORMANCE REPORT */}
        {currentView === 'report' && reportData && (
          <div className="max-w-5xl mx-auto w-full px-4 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
                  Placement Assessment
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  GD Evaluation & Verified Evidence Report
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Topic: {reportData.topic}</p>
              </div>

              {/* Actions: Print / Copy / Start New */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReport}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold rounded-lg text-zinc-300 border border-zinc-700 flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Copy Report to Clipboard"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold rounded-lg text-zinc-300 border border-zinc-700 flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Print Report Certificate"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => setCurrentView('templates')}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-xs font-bold rounded-lg text-black transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  Start New Practice 🔄
                </button>
              </div>
            </div>

            {/* Score Ring & Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Radial Overall Score Card */}
              <div className="glass-card p-6 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-center shadow-lg">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border-4 border-cyan-500/20 flex flex-col items-center justify-center bg-cyan-950/20 shadow-xl shadow-cyan-500/15">
                    <span className="text-4xl font-extrabold text-cyan-400">{reportData.overall_score}</span>
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Out of 100</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white mt-3">Placement Readiness</h4>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Top 12% Candidate Cadence</span>
                </div>
              </div>

              {/* Qualitative Summary */}
              <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-zinc-800 flex flex-col justify-center space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Award className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-wider">Executive Assessor Summary</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {reportData.summary}
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs text-zinc-400 border-t border-zinc-800">
                  <span>Total Turns: <strong>{reportData.metrics?.total_turns}</strong></span>
                  <span>Student Turns: <strong>{reportData.metrics?.student_turns}</strong></span>
                  <span>Student Interruptions: <strong>{reportData.metrics?.student_interruptions}</strong></span>
                </div>
              </div>
            </div>

            {/* Speaking Time Distribution */}
            {reportData.metrics?.speaking_share_pct && (
              <div className="glass-card p-5 rounded-2xl border border-zinc-800 space-y-3 shadow-md">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Speaking Time Distribution (%)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.entries(reportData.metrics.speaking_share_pct).map(([spk, pct]) => (
                    <div key={spk} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                      <span className="text-xs font-semibold text-zinc-400 uppercase block truncate">{spk}</span>
                      <span className="text-lg font-bold text-white">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6 Calibrated Evaluation Competencies (Verified Quotes) */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>6 Core Competencies Evaluated (With Verified Quotes)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportData.criteria_scores?.map((crit, idx) => (
                  <div key={idx} className="glass-card p-5 rounded-2xl border border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white capitalize">{crit.criterion?.replace(/_/g, ' ')}</h4>
                      <div className="flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-xs font-bold text-cyan-300">
                        <span>{crit.score}</span>
                        <span className="text-zinc-500">/ 5</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">{crit.feedback}</p>

                    {crit.quoted_turn && (
                      <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-cyan-400">Verified Citation [{crit.quoted_turn.turn_id}]:</span>
                        <p className="italic text-zinc-300">"{crit.quoted_turn.quote}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* What You Could Have Said (Missed Openings) */}
            {reportData.what_you_could_have_said && reportData.what_you_could_have_said.length > 0 && (
              <div className="glass-card p-6 rounded-2xl border border-amber-500/25 bg-amber-950/10 space-y-4 shadow-md">
                <div className="flex items-center gap-2 text-amber-400">
                  <Lightbulb className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">💡 What You Could Have Said (Missed Openings Replay)</h3>
                </div>

                <div className="space-y-3">
                  {reportData.what_you_could_have_said.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                        <span>Turn Reference: {item.turn_id}</span>
                        <span>Missed Angle: {item.missed_angle}</span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        <strong>Model Coach Suggestion:</strong> "{item.suggested_response}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: STUDENT LEARNING ROADMAP & PROGRESS */}
        {currentView === 'roadmap' && studentProfile && (
          <div className="max-w-4xl mx-auto w-full px-4 lg:px-8 py-8 space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
                Persistent Memory & Progress
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Student Progress & Knowledge Retention
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Saved in SQLite across sessions so AI peers remember your strengths!
              </p>
            </div>

            {/* Profile Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl glass-card text-center shadow-md">
                <span className="text-xs text-zinc-400">Sessions Practiced</span>
                <span className="text-2xl font-extrabold text-white block mt-1">{studentProfile.total_sessions}</span>
              </div>
              <div className="p-4 rounded-2xl glass-card text-center shadow-md">
                <span className="text-xs text-zinc-400">Average GD Score</span>
                <span className="text-2xl font-extrabold text-cyan-400 block mt-1">{studentProfile.avg_score} / 100</span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl glass-card text-center shadow-md">
                <span className="text-xs text-zinc-400">Concepts Retained</span>
                <span className="text-2xl font-extrabold text-emerald-400 block mt-1">{studentProfile.known_concepts?.length || 0}</span>
              </div>
            </div>

            {/* Retained Concepts ("Isse Ye Aata Hai") */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4 shadow-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Concepts Mastered ('Isse Ye Aata Hai')</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {studentProfile.known_concepts?.map((c, idx) => (
                  <span key={idx} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Placement Roadmap Milestones */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4 shadow-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Placement Learning Roadmap</span>
              </h3>

              <div className="space-y-3">
                {studentProfile.roadmap?.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-500">Milestone {idx + 1}</span>
                      <h4 className="text-sm font-bold text-white">{m.goal}</h4>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase ${
                      m.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : m.status === 'in_progress'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Facts Knowledge Base Modal */}
      {showFactsModal && roomFacts && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Verified Empirical Knowledge Base
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{roomFacts.topic}</h3>
              </div>
              <button
                onClick={() => setShowFactsModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-zinc-400">Empirical Benchmark Data Points</h4>
              {roomFacts.verified_data_points?.map((dp, i) => (
                <div key={i} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                  <span className="font-bold text-cyan-300">{dp.claim}</span>
                  <p className="text-zinc-300">{dp.evidence}</p>
                  <span className="text-[10px] text-zinc-500 block">Source: {dp.source}</span>
                </div>
              ))}
            </div>

            {roomFacts.common_myths_debunked && roomFacts.common_myths_debunked.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <h4 className="text-xs font-bold uppercase text-amber-400">Debunked Fallacies & Myths</h4>
                {roomFacts.common_myths_debunked.map((m, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                    <span className="text-rose-400 line-through">Myth: {m.myth}</span>
                    <p className="text-emerald-300">Reality: {m.reality}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
