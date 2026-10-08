import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Hand, Volume2, Users, Play, Sparkles, MessageSquare,
  ShieldCheck, AlertTriangle, ArrowRight, Award, CheckCircle2, ChevronRight,
  TrendingUp, BookOpen, Clock, Activity, Zap, RefreshCw, X, UserPlus, Radio,
  BarChart3, FileText, CornerDownRight, Lightbulb
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

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

  // System & Health
  const [systemHealth, setSystemHealth] = useState({ status: 'connecting', mock_mode: true });
  const [isVoiceTesting, setIsVoiceTesting] = useState(false);

  const transcriptEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const aiTurnTimerRef = useRef(null);
  const isInterruptedRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    isInterruptedRef.current = isInterrupted;
  }, [isInterrupted]);

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
    if (!('speechSynthesis' in window)) {
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
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch {}
    }
  };

  const stopListeningAndSubmit = () => {
    setIsRecording(false);
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

    setCaptionText(`You: "${text.trim()}"`);
    advanceTurn(currentRoom?.room_id, text.trim(), intId);
  };

  // --- Multi-seat Friend Invite ---
  const handleInviteFriend = async () => {
    if (!currentRoom) return;
    const friendName = prompt("Enter your friend's name to practice together:", "Rahul");
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

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* 1. Global Navbar (v0 / Modern SaaS Style) */}
      <header className="border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Radio className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-white">GD Arena</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">v2.0</span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">AI-Powered Voice Group Discussion Practice</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
          <button
            onClick={() => setCurrentView('templates')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentView === 'templates' ? 'bg-[#27272a] text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
          >
            Topic Templates
          </button>
          {currentRoom && (
            <button
              onClick={() => setCurrentView('arena')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentView === 'arena' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30' : 'text-zinc-400 hover:text-white'}`}
            >
              Live Arena 🎙️
            </button>
          )}
          {reportData && (
            <button
              onClick={() => setCurrentView('report')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentView === 'report' ? 'bg-purple-500/20 text-purple-300 shadow-sm border border-purple-500/30' : 'text-zinc-400 hover:text-white'}`}
            >
              Latest Report 📊
            </button>
          )}
          <button
            onClick={() => setCurrentView('roadmap')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentView === 'roadmap' ? 'bg-[#27272a] text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
          >
            My Progress 🎯
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTestVoice}
            disabled={isVoiceTesting}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
            title="Preview friendly neural speech voice"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isVoiceTesting ? 'Playing...' : 'Sweet Voice Test'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>
      </header>

      {/* 2. Main Content Views */}
      <main className="flex-1 flex flex-col">
        {/* VIEW 1: TOPIC TEMPLATES & SETUP (Hero + Cards) */}
        {currentView === 'templates' && (
          <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-8 flex flex-col gap-10">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                Problem Statement 2: Campus Placement GD Simulator
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                Master Campus Placements in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">GD Arena</span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                Practice group discussions with realistic AI peers who listen, disagree, and build on your ideas.
                Experience natural turn-taking with verified empirical data, zero repetitive answers, and instant actionable reports.
              </p>

              {/* Quick Config Drawer */}
              <div className="glass-panel p-4 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Language:</span>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-white text-xs outline-none cursor-pointer"
                  >
                    <option value="en">English (Plain & Clear)</option>
                    <option value="hinglish">Hinglish (Natural Student Mix)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Panel Size:</span>
                  <select
                    value={panelSize}
                    onChange={e => setPanelSize(parseInt(e.target.value))}
                    className="bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-white text-xs outline-none cursor-pointer"
                  >
                    <option value="3">3 AI Peers + Moderator</option>
                    <option value="4">4 AI Peers + Moderator</option>
                    <option value="5">5 AI Peers + Moderator</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Format:</span>
                  <select
                    value={format}
                    onChange={e => setFormat(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-white text-xs outline-none cursor-pointer"
                  >
                    <option value="standard">Standard Debate</option>
                    <option value="case_based">Case Study</option>
                    <option value="abstract">Abstract Topic</option>
                    <option value="controversial">Controversial Policy</option>
                    <option value="fishbowl">Fishbowl Practice</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">AI Patience:</span>
                  <select
                    value={patienceSec}
                    onChange={e => setPatienceSec(parseInt(e.target.value))}
                    className="bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-white text-xs outline-none cursor-pointer"
                  >
                    <option value="3">3s (Fast paced)</option>
                    <option value="5">5s (Balanced pace)</option>
                    <option value="8">8s (Relaxed pace)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Custom Topic Bar */}
            <div className="glass-card p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 text-cyan-400 shrink-0">
                <Lightbulb className="w-5 h-5" />
                <span className="font-semibold text-sm">Have your own topic?</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Stock Market & Nifty 50: Long-term Wealth vs Pure Speculation?"
                value={customTopicInput}
                onChange={e => setCustomTopicInput(e.target.value)}
                className="flex-1 bg-zinc-900/90 border border-zinc-700/80 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                onClick={() => handleStartSession(customTopicInput.trim())}
                className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black font-semibold text-xs rounded-lg transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                Launch Custom Room 🚀
              </button>
            </div>

            {/* Topic Filter Tabs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
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
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all shrink-0 cursor-pointer ${activeTab === tab.id ? 'bg-zinc-100 text-black font-bold' : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-zinc-500 hidden sm:block">{filteredTopics.length} templates available</span>
              </div>

              {/* Topic Grid (v0 Card Layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTopics.map(t => (
                  <div
                    key={t.id}
                    className="glass-card rounded-xl p-5 border border-zinc-800/80 hover:border-cyan-500/50 flex flex-col justify-between group transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {t.category}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${t.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : t.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
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
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-500 hover:text-black text-zinc-200 transition-all cursor-pointer group-hover:bg-cyan-500 group-hover:text-black"
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
            {/* Arena Sub-Header: Live Captions & Multi-seat Invite */}
            <div className="border-b border-zinc-800 bg-[#0f172a] px-4 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-cyan-400 text-black px-2 py-0.5 rounded shrink-0">
                  LIVE CAPTIONS
                </span>
                <span className="text-sm font-medium text-white truncate">
                  {captionText}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {roomFacts && (
                  <button
                    onClick={() => setShowFactsModal(true)}
                    className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3 text-cyan-400" />
                    <span>Fact Sheet</span>
                  </button>
                )}

                <button
                  onClick={handleInviteFriend}
                  className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>+ Friend</span>
                </button>

                <button
                  onClick={handleEndDiscussion}
                  className="text-xs px-3 py-1 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>End & Report</span>
                </button>
              </div>
            </div>

            {/* Arena Split Body: Left Pane (Participants) + Right Pane (Transcript & Voice Bar) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 min-h-0">
              {/* Left Column: Participants */}
              <div className="lg:col-span-1 border-r border-zinc-800/80 bg-[#0c0d10] p-4 flex flex-col gap-3 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <h3 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">
                    Panelists ({currentRoom?.participants?.length + 2 || 6})
                  </h3>
                  <span className="text-[11px] text-zinc-500">Live Turn Audio</span>
                </div>

                {/* Human User Card */}
                <div className={`p-3 rounded-xl border transition-all ${activeSpeakerId === 'student' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-[#121316]'}`}>
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

                {/* Moderator Card */}
                {currentRoom?.moderator && (
                  <div className={`p-3 rounded-xl border transition-all ${activeSpeakerId === 'moderator' ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 bg-[#121316]'}`}>
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
                        <p className="text-xs text-zinc-400">Friendly Mentor</p>
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

              {/* Right Column: Live Transcript & Interaction Console */}
              <div className="lg:col-span-3 flex flex-col bg-[#09090b] min-h-0">
                {/* Transcript Scroll Area */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {/* Reassuring Welcome Icebreaker Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-sky-900/20 to-indigo-950/40 border border-cyan-500/30 text-cyan-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block mb-0.5">👋 Welcome to your friendly practice room!</strong>
                      Take a deep breath and relax—there are no wrong answers here. Our friendly AI peers (Aarav, Meera, Kabir, Ananya) are here to explore ideas together with you. Speak with your microphone or type anytime!
                    </div>
                  </div>

                  {liveNudge && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>Nudge:</strong> {liveNudge}</span>
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
                              ? 'bg-cyan-600 text-white rounded-br-none shadow-md shadow-cyan-600/15'
                              : isMod
                              ? 'bg-amber-950/40 border border-amber-500/30 text-amber-100 rounded-bl-none'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm'
                          }`}
                        >
                          {turn.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={transcriptEndRef} />
                </div>

                {/* Interaction Console (Voice Priority + Interrupt + Text Fallback) */}
                <div className="border-t border-zinc-800 bg-[#0e0f13] p-4 flex flex-col gap-3">
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
                        className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Speak (Voice Priority)</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopListeningAndSubmit}
                        className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer animate-pulse"
                      >
                        <MicOff className="w-4 h-4" />
                        <span>Done Speaking (Submit)</span>
                      </button>
                    )}

                    {/* Interrupt Button (When AI is speaking) */}
                    {isAiSpeaking && (
                      <button
                        onClick={handleInterrupt}
                        className="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
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
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition-all cursor-pointer"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: COMPREHENSIVE PERFORMANCE REPORT */}
        {currentView === 'report' && reportData && (
          <div className="max-w-5xl mx-auto w-full px-4 lg:px-8 py-8 space-y-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Performance Assessment
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  GD Evaluation & Verified Evidence Report
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Topic: {reportData.topic}</p>
              </div>

              <button
                onClick={() => setCurrentView('templates')}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg text-white border border-zinc-700 cursor-pointer"
              >
                Start New Practice 🔄
              </button>
            </div>

            {/* Score Ring & Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Radial Overall Score Card */}
              <div className="glass-card p-6 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border-4 border-cyan-500/20 flex flex-col items-center justify-center bg-cyan-950/20 shadow-xl shadow-cyan-500/15">
                    <span className="text-4xl font-extrabold text-cyan-400">{reportData.overall_score}</span>
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Out of 100</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white mt-3">Placement Readiness</h4>
                <p className="text-xs text-zinc-400 mt-1">Based on 6 calibrated campus assessment benchmarks</p>
              </div>

              {/* Qualitative Summary */}
              <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-zinc-800 flex flex-col justify-center space-y-3">
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
              <div className="glass-card p-5 rounded-xl border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Speaking Time Distribution (%)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.entries(reportData.metrics.speaking_share_pct).map(([spk, pct]) => (
                    <div key={spk} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
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
                  <div key={idx} className="glass-card p-5 rounded-xl border border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white capitalize">{crit.criterion?.replace(/_/g, ' ')}</h4>
                      <div className="flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-xs font-bold text-cyan-300">
                        <span>{crit.score}</span>
                        <span className="text-zinc-500">/ 5</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">{crit.feedback}</p>

                    {crit.quoted_turn && (
                      <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-400 space-y-1">
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
              <div className="glass-card p-6 rounded-2xl border border-amber-500/20 bg-amber-950/10 space-y-4">
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
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
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
              <div className="p-4 rounded-xl glass-card text-center">
                <span className="text-xs text-zinc-400">Sessions Practiced</span>
                <span className="text-2xl font-bold text-white block mt-1">{studentProfile.total_sessions}</span>
              </div>
              <div className="p-4 rounded-xl glass-card text-center">
                <span className="text-xs text-zinc-400">Average GD Score</span>
                <span className="text-2xl font-bold text-cyan-400 block mt-1">{studentProfile.avg_score} / 100</span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-4 rounded-xl glass-card text-center">
                <span className="text-xs text-zinc-400">Concepts Retained</span>
                <span className="text-2xl font-bold text-emerald-400 block mt-1">{studentProfile.known_concepts?.length || 0}</span>
              </div>
            </div>

            {/* Retained Concepts ("Isse Ye Aata Hai") */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Concepts Mastered ('Isse Ye Aata Hai')</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {studentProfile.known_concepts?.map((c, idx) => (
                  <span key={idx} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Placement Roadmap Milestones */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
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
                    <span className={`text-xs px-2.5 py-1 rounded font-bold uppercase ${m.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : m.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
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
          <div className="bg-[#121316] border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Verified Empirical Knowledge Base
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{roomFacts.topic}</h3>
              </div>
              <button
                onClick={() => setShowFactsModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
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
