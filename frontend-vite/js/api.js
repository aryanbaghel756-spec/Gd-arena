/**
 * GD Arena - Backend API & Mock Fallback Layer
 * ------------------------------------------------------------------
 * Purpose: Centralizes ALL network communication with the local backend
 * (Ollama LLM, Whisper STT, TTS endpoints). Provides high-fidelity mock
 * implementations with cancellation support so the entire frontend runs
 * flawlessly offline or without an active server.
 *
 * This is the ONLY file the backend team needs to touch or inspect.
 */

// Initialize global namespace
window.GD = window.GD || {};

(function () {
  const config = window.GD.config;

  // Track recent mock line indices to avoid back-to-back repetitions
  const lastMockIndices = {};

  /* ========== HELPER UTILITIES ========== */

  /**
   * Safe fetch with timeout and external AbortSignal chaining
   */
  async function fetchWithTimeout(url, options = {}, timeoutMs = config.REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error("Request timed out")), timeoutMs);

    // If caller provided an AbortSignal, abort when it aborts
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
   * Promisified delay that rejects if signal is aborted
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

  /* ========== API IMPLEMENTATION ========== */

  window.GD.api = {
    /**
     * Check backend health and model availability
     * Returns: { ok: boolean, model?: string, isMock: boolean, error?: string }
     */
    async health() {
      if (config.USE_MOCK) {
        return {
          ok: true,
          model: "Mock Mode (Local Offline)",
          isMock: true
        };
      }

      try {
        const response = await fetchWithTimeout(`${config.BASE_URL}/api/health`, {
          method: "GET"
        }, 3000);

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        return {
          ok: true,
          model: data.model || "Connected",
          isMock: false
        };
      } catch (err) {
        console.warn("[API] Health check failed, operating offline/fallback:", err.message);
        return {
          ok: false,
          error: err.message,
          isMock: false
        };
      }
    },

    /**
     * Generate an AI persona turn or moderator transition
     * Params:
     *   - persona: { id, name, role, systemPrompt }
     *   - topic: string
     *   - transcript: Array of transcript entries [{ id, speaker, role, text, time, interrupted }]
     *   - nextSpeaker: string (name of next participant)
     *   - signal: AbortSignal (for cancellation on student interruption)
     * Returns: { text: string }
     */
    async generateTurn({ persona, topic, transcript = [], nextSpeaker = "", signal }) {
      // 1. REAL BACKEND CALL (when USE_MOCK is false)
      if (!config.USE_MOCK) {
        try {
          const recentTranscript = transcript.slice(-6).map(entry => ({
            speaker: entry.speaker,
            role: entry.role,
            text: entry.text,
            time: entry.time,
            interrupted: !!entry.interrupted
          }));

          const response = await fetchWithTimeout(`${config.BASE_URL}/api/turn`, {
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

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to generate turn`);
          }

          const data = await response.json();
          if (data && data.text) {
            return { text: data.text.trim() };
          }
        } catch (err) {
          if (err.name === "AbortError" || err.message === "Aborted") {
            throw err; // Allow turn cancellation to propagate
          }
          console.warn("[API] Real backend generateTurn failed, falling back to mock:", err.message);
          // Fall through to mock generator on network failure
        }
      }

      // 2. MOCK FALLBACK GENERATOR
      // Simulate natural thinking delay (1100ms - 1900ms) with abort support
      const delay = Math.floor(1100 + Math.random() * 800);
      await waitWithAbort(delay, signal);

      // Handle Moderator special cases
      if (persona.id === "moderator") {
        const modDialogues = config.MOCK_DIALOGUES.moderator;

        // Discussion Opening
        if (transcript.length === 0) {
          const intros = modDialogues.intro;
          const chosen = intros[Math.floor(Math.random() * intros.length)];
          return { text: chosen.replace("{topic}", topic) };
        }

        // Standard Turn Transition
        const transitions = modDialogues.transition;
        const chosen = transitions[Math.floor(Math.random() * transitions.length)];
        return { text: chosen.replace("{nextSpeaker}", nextSpeaker || "the next participant") };
      }

      // Regular AI Personas
      const personaPool = config.MOCK_DIALOGUES[persona.id] || [
        "In examining this issue, we must balance immediate feasibility against long-term societal resilience.",
        "That is a valid point, though we cannot overlook the structural constraints affecting implementation."
      ];

      // Pick a line that wasn't used in the immediate previous turn by this persona
      const lastIndex = lastMockIndices[persona.id];
      let candidateIndex = Math.floor(Math.random() * personaPool.length);
      if (personaPool.length > 1 && candidateIndex === lastIndex) {
        candidateIndex = (candidateIndex + 1) % personaPool.length;
      }
      lastMockIndices[persona.id] = candidateIndex;

      let generated = personaPool[candidateIndex];

      // If there's a recent speaker who isn't the moderator, occasionally add a contextual bridge
      const lastEntry = transcript.filter(t => t.speaker !== "Moderator" && t.speaker !== persona.name).pop();
      if (lastEntry && Math.random() > 0.45 && !generated.toLowerCase().includes("building on")) {
        const prefixes = [
          `Adding to what ${lastEntry.speaker} pointed out, `,
          `While I understand ${lastEntry.speaker}'s view, `,
          `To build on ${lastEntry.speaker}'s observation, `
        ];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        generated = prefix + generated.charAt(0).toLowerCase() + generated.slice(1);
      }

      return { text: generated };
    },

    /**
     * Transcribe speech audio blob via backend Whisper STT
     * Params: blob (Blob/File from MediaRecorder)
     * Returns: { text: string, segments?: Array }
     */
    async transcribe(blob) {
      if (config.USE_MOCK || !blob) {
        return {
          text: "I believe we should evaluate both the risks and the innovative possibilities carefully.",
          segments: []
        };
      }

      const formData = new FormData();
      formData.append("audio", blob, "speech.webm");

      try {
        const response = await fetchWithTimeout(`${config.BASE_URL}/api/stt`, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: STT failed`);
        }

        return await response.json();
      } catch (err) {
        console.warn("[API] Whisper STT endpoint unavailable, returning fallback text:", err.message);
        return {
          text: "I believe we must balance technological progress with proper regulatory frameworks.",
          segments: []
        };
      }
    },

    /**
     * Synthesize speech audio blob via backend TTS
     * Params: text (string), personaId (string)
     * Returns: Blob | null
     */
    async speak(text, personaId) {
      if (config.USE_MOCK || config.TTS_MODE === "browser") {
        return null; // Signals caller to use native window.speechSynthesis
      }

      try {
        const response = await fetchWithTimeout(`${config.BASE_URL}/api/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, personaId })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.blob();
      } catch (err) {
        console.warn("[API] Backend TTS unavailable, defaulting to browser synthesis:", err.message);
        return null;
      }
    },

    /**
     * Generate structured feedback report via LLM
     * Params: { topic, transcript, metrics }
     * Returns: { overall: number, skills: Object, strengths: Array, improvements: Array }
     */
    async generateFeedback({ topic, transcript, metrics }) {
      if (!config.USE_MOCK) {
        try {
          const response = await fetchWithTimeout(`${config.BASE_URL}/api/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, transcript, metrics }),
            timeoutMs: 15000
          });

          if (response.ok) {
            const data = await response.json();
            if (data && data.overall) {
              return data;
            }
          }
        } catch (err) {
          console.warn("[API] Backend feedback generation failed, using client metrics engine:", err.message);
        }
      }

      // Default client-side fallback (handled by app.js metrics calculator)
      return null;
    }
  };
})();
