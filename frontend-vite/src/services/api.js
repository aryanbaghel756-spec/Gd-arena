/**
 * GD Arena - API Service Layer
 * Single Source of Truth for Backend Communication (Ollama LLM + Whisper STT + TTS)
 * Implements strict error handling, AbortController support, and zero-config mock fallbacks.
 */

import { CONFIG } from '../data/config';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const REQUEST_TIMEOUT_MS = 20000;

// Track recent mock dialogue selections to ensure varied, non-repeating lines
const lastMockIndices = {};

/**
 * Fetch wrapper with timeout and AbortSignal chaining
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error("Request timed out")), timeoutMs);

  if (options.signal) {
    if (options.signal.aborted) {
      clearTimeout(timeoutId);
      throw new Error("Aborted");
    }
    options.signal.addEventListener("abort", () => controller.abort(options.signal.reason), { once: true });
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Delay with abort support
 */
function waitWithAbort(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) {
      return reject(new Error("Aborted"));
    }
    const timeoutId = setTimeout(() => {
      if (signal) signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(timeoutId);
      reject(new Error("Aborted"));
    }

    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

export const api = {
  /**
   * Health check endpoint: GET /api/health
   */
  async health() {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/api/health`, { method: "GET" }, 2500);
      if (response.ok) {
        const data = await response.json();
        return { ok: true, model: data.model || "Connected", isMock: false };
      }
    } catch {
      // Backend offline
    }
    return { ok: true, model: "Local Mock Simulation", isMock: true };
  },

  /**
   * Generate AI Turn: POST /api/turn
   */
  async generateTurn({ persona, topic, transcript = [], nextSpeaker = "", signal }) {
    // 1. Attempt Real Backend
    try {
      const recentTranscript = transcript.slice(-6).map(e => ({
        speaker: e.speaker,
        role: e.role,
        text: e.text,
        time: e.time,
        interrupted: !!e.interrupted
      }));

      const response = await fetchWithTimeout(`${BASE_URL}/api/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: {
            id: persona.id,
            name: persona.name,
            role: persona.role,
            systemPrompt: persona.systemPrompt || ""
          },
          topic,
          transcript: recentTranscript,
          nextSpeaker,
          maxWords: 60
        }),
        signal
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.text) {
          return { text: data.text.trim() };
        }
      }
    } catch (err) {
      if (err.name === "AbortError" || err.message === "Aborted") {
        throw err;
      }
      // Fall through to mock generator
    }

    // 2. High-Fidelity Mock Generator (Simulate realistic thinking delay)
    const thinkingDelay = Math.floor(1100 + Math.random() * 800);
    await waitWithAbort(thinkingDelay, signal);

    if (persona.id === "moderator") {
      const mod = CONFIG.MOCK_DIALOGUES.moderator;
      if (transcript.length === 0) {
        const chosen = mod.intro[Math.floor(Math.random() * mod.intro.length)];
        return { text: chosen.replace("{topic}", topic) };
      }
      const transitionChosen = mod.transition[Math.floor(Math.random() * mod.transition.length)];
      return { text: transitionChosen.replace("{nextSpeaker}", nextSpeaker || "the next participant") };
    }

    const pool = CONFIG.MOCK_DIALOGUES[persona.id] || [
      "In examining this issue, we must balance immediate feasibility against long-term societal resilience."
    ];

    const lastIdx = lastMockIndices[persona.id];
    let candidateIdx = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && candidateIdx === lastIdx) {
      candidateIdx = (candidateIdx + 1) % pool.length;
    }
    lastMockIndices[persona.id] = candidateIdx;

    let line = pool[candidateIdx];

    // Contextual bridge referencing previous participant
    const lastNonMod = transcript.filter(t => t.speaker !== "Moderator" && t.speaker !== persona.name).pop();
    if (lastNonMod && Math.random() > 0.45 && !line.toLowerCase().includes("building on")) {
      const bridges = [
        `Adding to what ${lastNonMod.speaker} noted, `,
        `While I appreciate ${lastNonMod.speaker}'s perspective, `,
        `To build upon ${lastNonMod.speaker}'s observation, `
      ];
      const bridge = bridges[Math.floor(Math.random() * bridges.length)];
      line = bridge + line.charAt(0).toLowerCase() + line.slice(1);
    }

    return { text: line };
  },

  /**
   * Whisper STT: POST /api/stt
   */
  async transcribe(audioBlob) {
    if (!audioBlob) {
      return { text: "I believe we should evaluate both the risks and innovative opportunities.", segments: [] };
    }

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "speech.webm");

      const response = await fetchWithTimeout(`${BASE_URL}/api/stt`, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }

    return {
      text: "I believe we must balance technological progress with proper regulatory frameworks.",
      segments: []
    };
  },

  /**
   * TTS Synthesize: POST /api/tts
   */
  async speak(text, personaId) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, personaId })
      });

      if (response.ok) {
        return await response.blob();
      }
    } catch {
      // Browser SpeechSynthesis fallback
    }
    return null;
  },

  /**
   * Generate Evaluation Feedback: POST /api/feedback
   */
  async generateFeedback({ topic, transcript, metrics }) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, transcript, metrics }),
        timeoutMs: 12000
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.overall) return data;
      }
    } catch {
      // Handled by metricsEngine fallback
    }
    return null;
  }
};
