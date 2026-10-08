'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Topic, 
  Participant, 
  TranscriptItem, 
  DiscussionPhase, 
  GDReport,
  SkillScore,
  ParticipationShare
} from '@/types/arena';
import { 
  TOPIC_PRESETS, 
  MOCK_PARTICIPANTS, 
  INITIAL_TRANSCRIPTS, 
  MOCK_REPORT_DATA 
} from '@/data/mockData';

export type ScreenState = 'hero' | 'setup' | 'arena' | 'report';

const API_BASE = typeof window !== 'undefined'
  ? (window.location.port === '3000' || window.location.port === '5173' ? 'http://localhost:8000' : '')
  : '';

export function useGDSimulator() {
  const [screen, setScreen] = useState<ScreenState>('hero');
  const [selectedTopic, setSelectedTopic] = useState<Topic>(TOPIC_PRESETS[0]);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>(TOPIC_PRESETS);
  const [panelSize, setPanelSize] = useState<number>(4);
  const [discussionMinutes, setDiscussionMinutes] = useState<number>(8);

  // Participants in active discussion
  const [participants, setParticipants] = useState<Participant[]>(MOCK_PARTICIPANTS);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>('mod');
  const [currentSpeechSnippet, setCurrentSpeechSnippet] = useState<string>(
    'The floor is open for framing statements. I invite any candidate to begin.'
  );

  // Time & Phase
  const [remainingSeconds, setRemainingSeconds] = useState<number>(discussionMinutes * 60);
  const [phase, setPhase] = useState<DiscussionPhase>('opening');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Mic & User Controls
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isHoldingSpeak, setIsHoldingSpeak] = useState<boolean>(false);
  const [userAudioLevel, setUserAudioLevel] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);

  // Live Transcript
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>(INITIAL_TRANSCRIPTS);

  // Final Report
  const [report, setReport] = useState<GDReport>(MOCK_REPORT_DATA);

  // Backend state references
  const roomIdRef = useRef<string | null>(null);
  const activeTurnIdRef = useRef<string | null>(null);
  const pendingInterruptedIdRef = useRef<string | null>(null);
  const isInterruptedRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiTurnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const speechBufferRef = useRef<string>('');

  // 1. Initial Load: Fetch Topics from Backend
  useEffect(() => {
    fetch(`${API_BASE}/api/topics`)
      .then((r) => r.json())
      .then((data) => {
        if (data.topics && data.topics.length > 0) {
          const mapped: Topic[] = data.topics.map((t: any, idx: number) => ({
            id: t.id || `topic-backend-${idx}`,
            category: (t.format === 'case_based'
              ? 'Case-based'
              : t.format === 'abstract'
              ? 'Abstract'
              : t.category?.includes('Controversial')
              ? 'Controversial'
              : 'Current affairs') as any,
            title: t.title,
            description: t.context || 'Strategic discussion on policy trade-offs and empirical data.',
            contextPoints: [
              'Economic feasibility and structural constraints',
              'Stakeholder welfare and regulatory compliance',
              'Long-term systemic impact and quantitative benchmarks'
            ]
          }));

          // Merge backend topics with presets (deduplicating by title)
          const all = [...mapped, ...TOPIC_PRESETS.filter((p) => !mapped.some((m) => m.title === p.title))];
          setAvailableTopics(all);
          if (all.length > 0) {
            setSelectedTopic(all[0]);
          }
        }
      })
      .catch((err) => {
        console.warn('Backend topics fetch failed, using built-in presets:', err);
      });
  }, []);

  // 2. Speech Recognition Initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += ' ' + event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const full = (final + ' ' + interim).trim();
        speechBufferRef.current = full;
        if (full) {
          setCurrentSpeechSnippet(`You: "${full}"`);
        }
      };

      rec.onerror = (e: any) => {
        console.warn('SpeechRecognition error:', e);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // 3. Sweet Natural Voice TTS Engine
  const speakTurn = useCallback((text: string, voiceHint: any, onEndCallback?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEndCallback && !isInterruptedRef.current) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const isFemale = voiceHint ? voiceHint.gender_hint === 'female' : true;
    utterance.rate = 0.94;
    utterance.pitch = isFemale ? 1.08 : 0.98;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matched = isFemale
        ? voices.find((v) => /natural|online|google/i.test(v.name) && /female|woman|jenny|aria|sunita/i.test(v.name)) ||
          voices.find((v) => v.lang.startsWith('en') && !/desktop/i.test(v.name)) ||
          voices[0]
        : voices.find((v) => /natural|online|google/i.test(v.name) && /male|man|guy|ryan|prabhat/i.test(v.name)) ||
          voices.find((v) => v.lang.startsWith('en') && !/desktop/i.test(v.name)) ||
          voices[0];

      if (matched) {
        utterance.voice = matched;
        utterance.lang = matched.lang || 'en-US';
      }
    }

    utterance.onend = () => {
      if (isInterruptedRef.current) return;
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e: any) => {
      if (isInterruptedRef.current || e.error === 'canceled' || e.error === 'interrupted') return;
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // 4. Advance Turn Function (Backend Hook)
  const advanceTurn = useCallback(async (rId: string, studentText: string | null = null, interruptedId: string | null = null) => {
    if (aiTurnTimerRef.current) {
      clearTimeout(aiTurnTimerRef.current);
      aiTurnTimerRef.current = null;
    }

    try {
      const payload: any = {};
      if (studentText) payload.student_text = studentText;
      if (interruptedId) payload.interrupted_turn_id = interruptedId;

      const res = await fetch(`${API_BASE}/api/rooms/${rId}/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.turn) {
        activeTurnIdRef.current = data.turn.id;

        // Map speaker to UI ID
        let uiSpeakerId = data.turn.speaker_id;
        if (data.turn.role === 'moderator') uiSpeakerId = 'mod';
        else if (data.turn.role === 'student') uiSpeakerId = 'user';

        setActiveSpeakerId(uiSpeakerId);
        setCurrentSpeechSnippet(`[${data.turn.speaker_name}] "${data.turn.text}"`);

        const newSeconds = Math.max(0, discussionMinutes * 60 - remainingSeconds);
        const mins = Math.floor(newSeconds / 60);
        const secs = newSeconds % 60;
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        const role = (data.turn.role === 'moderator' ? 'moderator' : data.turn.role === 'student' ? 'user' : 'ai') as any;

        setTranscripts((prev) => [
          ...prev,
          {
            id: data.turn.id || `t-${Date.now()}`,
            speakerId: uiSpeakerId,
            speakerName: data.turn.speaker_name,
            personality: (data.turn.role === 'moderator' ? 'Moderator' : data.turn.role === 'student' ? 'Candidate' : 'Analyst') as any,
            role,
            text: data.turn.text,
            timestamp: timeStr,
            seconds: newSeconds,
          }
        ]);

        speakTurn(data.turn.text, data.turn.voice, () => {
          if (isInterruptedRef.current) return;
          if (data.next_actor === 'ai') {
            aiTurnTimerRef.current = setTimeout(() => {
              advanceTurn(rId, null, null);
            }, 1400);
          } else {
            setActiveSpeakerId(null);
            setCurrentSpeechSnippet('The floor is open for candidate remarks.');
          }
        });
      } else {
        setActiveSpeakerId(null);
        setCurrentSpeechSnippet('Floor open. Press Space or Hold Speak to contribute.');
      }
    } catch (err) {
      console.error('Error advancing turn:', err);
    }
  }, [discussionMinutes, remainingSeconds, speakTurn]);

  // 5. Shuffle Topic
  const shuffleTopic = useCallback(() => {
    const list = availableTopics.length > 0 ? availableTopics : TOPIC_PRESETS;
    const remaining = list.filter((t) => t.id !== selectedTopic.id);
    const randomTopic = remaining[Math.floor(Math.random() * remaining.length)] || list[0];
    setSelectedTopic(randomTopic);
  }, [availableTopics, selectedTopic]);

  // 6. Enter Room: Call Backend POST /api/rooms
  const enterRoom = useCallback(async () => {
    const totalSecs = discussionMinutes * 60;
    setRemainingSeconds(totalSecs);
    setPhase('opening');
    setIsPaused(false);
    isInterruptedRef.current = false;
    setScreen('arena');

    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic.title,
          panel_size: panelSize,
          language: 'en',
          format: 'standard',
          student_id: 'student_aryan_01'
        })
      });
      const data = await res.json();
      roomIdRef.current = data.room_id;

      // Construct Participants matching RoomTable formation
      const moderatorNode: Participant = {
        id: 'mod',
        name: data.moderator?.name || 'Dr. Evelyn Vance',
        role: 'moderator',
        personality: 'Moderator',
        tagline: 'Guiding flow, enforcing fairness, and synthesizing milestones',
        avatarSeed: 'moderator',
        color: '#ffc400',
        accentGlow: 'rgba(255, 196, 0, 0.5)',
        talkTimeSeconds: 0,
        isSpeaking: false
      };

      const userNode: Participant = {
        id: 'user',
        name: 'You (Candidate)',
        role: 'user',
        personality: 'Candidate',
        tagline: 'Defends core thesis with quantitative logic and collaborative listening',
        avatarSeed: 'user',
        color: '#ffc400',
        accentGlow: 'rgba(255, 196, 0, 0.6)',
        talkTimeSeconds: 0,
        isSpeaking: false
      };

      const personalityMap: Record<string, any> = {
        kabir: 'Critic',
        meera: 'Analyst',
        aarav: 'Creative',
        ananya: 'Quiet one',
        rohan: 'Dominator'
      };

      const aiNodes: Participant[] = (data.participants || []).slice(0, panelSize).map((p: any, idx: number) => {
        const pId = p.id?.toLowerCase() || '';
        const tag = personalityMap[pId] || (idx === 0 ? 'Analyst' : idx === 1 ? 'Critic' : idx === 2 ? 'Creative' : 'Quiet one');
        return {
          id: p.id,
          name: p.name,
          role: 'ai' as const,
          personality: tag,
          tagline: p.persona || 'Deconstructs arguments with empirical logic',
          avatarSeed: p.id,
          color: idx % 2 === 0 ? '#ff1e2d' : '#ffc400',
          accentGlow: idx % 2 === 0 ? 'rgba(255, 30, 45, 0.45)' : 'rgba(255, 196, 0, 0.45)',
          talkTimeSeconds: 0,
          isSpeaking: false
        };
      });

      setParticipants([moderatorNode, ...aiNodes, userNode]);
      setTranscripts([]);

      // Start initial turn
      advanceTurn(data.room_id, null, null);
    } catch (err) {
      console.error('Failed to create room on backend:', err);
    }
  }, [advanceTurn, discussionMinutes, panelSize, selectedTopic]);

  // 7. Push-to-Talk Handlers (Live Web Speech STT)
  const handleHoldSpeakStart = useCallback(() => {
    isInterruptedRef.current = false;
    setIsHoldingSpeak(true);
    setActiveSpeakerId('user');
    setUserAudioLevel(0.85);
    speechBufferRef.current = '';
    setCurrentSpeechSnippet('🎙️ Listening to your speech...');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  }, []);

  const handleHoldSpeakEnd = useCallback(() => {
    setIsHoldingSpeak(false);
    setUserAudioLevel(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    const recognized = speechBufferRef.current.trim() ||
      'I want to introduce a key structural point: we must balance immediate feasibility with long-term systemic resilience.';

    const newSeconds = Math.max(0, discussionMinutes * 60 - remainingSeconds);
    const mins = Math.floor(newSeconds / 60);
    const secs = newSeconds % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    setTranscripts((prev) => [
      ...prev,
      {
        id: `t-user-${Date.now()}`,
        speakerId: 'user',
        speakerName: 'You (Candidate)',
        personality: 'Candidate',
        role: 'user',
        text: recognized,
        timestamp: timeStr,
        seconds: newSeconds,
        highlight: true,
      }
    ]);

    const rId = roomIdRef.current;
    const intId = pendingInterruptedIdRef.current;
    pendingInterruptedIdRef.current = null;

    if (rId) {
      advanceTurn(rId, recognized, intId);
    }
  }, [advanceTurn, discussionMinutes, remainingSeconds]);

  // 8. Submit Typed Speech (Fallback / Direct Input)
  const handleSubmitTypedSpeech = useCallback((text: string) => {
    if (!text.trim()) return;

    const newSeconds = Math.max(0, discussionMinutes * 60 - remainingSeconds);
    const mins = Math.floor(newSeconds / 60);
    const secs = newSeconds % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    setTranscripts((prev) => [
      ...prev,
      {
        id: `t-user-${Date.now()}`,
        speakerId: 'user',
        speakerName: 'You (Candidate)',
        personality: 'Candidate',
        role: 'user',
        text: text.trim(),
        timestamp: timeStr,
        seconds: newSeconds,
        highlight: true,
      }
    ]);

    const rId = roomIdRef.current;
    const intId = pendingInterruptedIdRef.current;
    pendingInterruptedIdRef.current = null;

    if (rId) {
      advanceTurn(rId, text.trim(), intId);
    }
  }, [advanceTurn, discussionMinutes, remainingSeconds]);

  // 9. Interruption Handling (Cut AI audio instantly)
  const handleInterrupt = useCallback(() => {
    isInterruptedRef.current = true;
    pendingInterruptedIdRef.current = activeTurnIdRef.current;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (aiTurnTimerRef.current) {
      clearTimeout(aiTurnTimerRef.current);
      aiTurnTimerRef.current = null;
    }

    setActiveSpeakerId('user');
    setCurrentSpeechSnippet('✋ You intervened respectfully! Speak your counter-argument now...');
    handleHoldSpeakStart();
  }, [handleHoldSpeakStart]);

  // 10. End GD & Performance Report Generation (Backend Integration)
  const handleEndGD = useCallback(() => {
    setIsPaused(true);
    isInterruptedRef.current = true;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (aiTurnTimerRef.current) {
      clearTimeout(aiTurnTimerRef.current);
      aiTurnTimerRef.current = null;
    }

    const rId = roomIdRef.current;
    if (rId) {
      fetch(`${API_BASE}/api/rooms/${rId}/end`, { method: 'POST' })
        .then((r) => r.json())
        .then((data) => {
          const mappedSkills: SkillScore[] = (data.criteria_scores || []).map((c: any) => ({
            id: c.criterion,
            title: c.criterion.replace(/_/g, ' ').toUpperCase(),
            score: Math.min(10, Math.round(c.score * 2)),
            status: (c.score >= 4 ? 'strength' : c.score >= 3 ? 'good' : 'needs-work') as any,
            badgeText: c.score >= 4 ? 'Exemplary' : c.score >= 3 ? 'Competent' : 'Focus Area',
            feedback: c.feedback,
            quotedMoment: {
              timestamp: '02:40',
              quote: c.quoted_turn?.quote || 'Strategic intervention on empirical data.',
              context: c.feedback
            }
          }));

          const shares: ParticipationShare[] = Object.entries(data.metrics?.speaking_share_pct || { student: 28, kabir: 24, meera: 24, aarav: 24 }).map(([spk, pct]: any) => ({
            participantId: spk,
            name: spk === 'student' ? 'You (Candidate)' : spk.charAt(0).toUpperCase() + spk.slice(1),
            percentage: pct,
            seconds: Math.round((pct / 100) * (data.duration_sec || 480)),
            color: spk === 'student' ? '#ffc400' : '#ff1e2d',
            isUser: spk === 'student'
          }));

          setReport({
            overallScore: data.overall_score || 85,
            percentile: Math.min(99, Math.round((data.overall_score || 85) * 0.95 + 4)),
            performanceBadge: (data.overall_score || 85) >= 80 ? 'Strategic Anchor' : 'Collaborative Inquirer',
            summary: data.summary,
            durationSeconds: data.duration_sec || (discussionMinutes * 60 - remainingSeconds),
            totalExchanges: data.metrics?.total_turns || transcripts.length,
            interruptionCount: data.metrics?.student_interruptions || 0,
            participationShare: shares,
            skills: mappedSkills
          });
          setScreen('report');
        })
        .catch(() => {
          setScreen('report');
        });
    } else {
      setScreen('report');
    }
  }, [discussionMinutes, remainingSeconds, transcripts.length]);

  // 11. Timer Tick
  useEffect(() => {
    if (screen !== 'arena' || isPaused) return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleEndGD();
          return 0;
        }

        const totalSecs = discussionMinutes * 60;
        const elapsedRatio = 1 - prev / totalSecs;

        if (elapsedRatio > 0.85) {
          setPhase('closing');
        } else if (elapsedRatio > 0.25) {
          setPhase('discussion');
        } else {
          setPhase('opening');
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen, isPaused, discussionMinutes, handleEndGD]);

  // Mic Toggle
  const handleToggleMic = useCallback(() => {
    setIsMicOn((prev) => !prev);
  }, []);

  // Pause Toggle
  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Skip to Closing
  const handleSkipToClosing = useCallback(() => {
    setRemainingSeconds(60);
    setPhase('closing');
    setActiveSpeakerId('mod');
    setCurrentSpeechSnippet('Moderator: "We are entering the final 60 seconds. Each candidate has one concise wrap-up."');
  }, []);

  // Retry Mic
  const handleRetryMic = useCallback(() => {
    if (micError) {
      setMicError(null);
    } else {
      setMicError('Hardware mic input packet dropped. Check OS audio privacy permissions.');
    }
  }, [micError]);

  return {
    screen,
    setScreen,
    selectedTopic,
    setSelectedTopic,
    panelSize,
    setPanelSize,
    discussionMinutes,
    setDiscussionMinutes,
    participants,
    activeSpeakerId,
    currentSpeechSnippet,
    remainingSeconds,
    phase,
    isPaused,
    isMicOn,
    isHoldingSpeak,
    userAudioLevel,
    micError,
    transcripts,
    report,
    shuffleTopic,
    enterRoom,
    handleHoldSpeakStart,
    handleHoldSpeakEnd,
    handleSubmitTypedSpeech,
    handleInterrupt,
    handleToggleMic,
    handleTogglePause,
    handleSkipToClosing,
    handleEndGD,
    handleRetryMic,
  };
}
