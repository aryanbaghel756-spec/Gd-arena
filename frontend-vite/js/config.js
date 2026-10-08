/**
 * GD Arena - Configuration Module
 * ------------------------------------------------------------------
 * Purpose: Defines global constants, persona profiles, discussion topics,
 * mock response datasets, and speech configuration settings.
 * All properties are exposed on window.GD.config.
 */

// Initialize global namespace
window.GD = window.GD || {};

window.GD.config = {
  // Backend connection settings
  USE_MOCK: true,
  BASE_URL: "http://localhost:8000",
  REQUEST_TIMEOUT_MS: 20000,

  // Speech engine modes: "browser" (Web Speech API) or "backend" (Whisper / TTS endpoint)
  STT_MODE: "browser",
  TTS_MODE: "browser",

  // Timing limits
  MAX_TURN_SECONDS: 60,
  DEFAULT_DURATION_MINUTES: 3,

  // Preset discussion topics
  PRESET_TOPICS: [
    "Should AI replace human jobs?",
    "Social media: boon or bane?",
    "Work from home vs office",
    "Is online education the future?"
  ],

  // Participant personas with distinct personalities, visual colors, and speech styles
  PERSONAS: {
    you: {
      id: "you",
      name: "You",
      role: "Student",
      color: "#22d3ee", // Cyan
      badge: "Participant",
      style: "Your unique perspective and arguments",
      avatarLetter: "U",
      voiceSettings: { pitch: 1.0, rate: 1.0 }
    },
    moderator: {
      id: "moderator",
      name: "Moderator",
      role: "Facilitator",
      color: "#8b5cf6", // Violet
      badge: "Moderator",
      style: "Guides conversation, tracks time, and ensures fair participation",
      avatarLetter: "M",
      systemPrompt: "You are the GD Moderator. Guide the group, maintain civil order, introduce topics, and keep time. Keep remarks concise (under 40 words), polite, and neutral.",
      voiceSettings: { pitch: 0.95, rate: 1.0 }
    },
    aarav: {
      id: "aarav",
      name: "Aarav",
      role: "Analyst",
      color: "#3b82f6", // Blue
      badge: "Data-Driven",
      style: "Logical, structured, and focused on verifiable facts and economic metrics",
      avatarLetter: "A",
      systemPrompt: "You are Aarav, an analytical GD participant. Emphasize empirical data, economic trends, and pragmatic trade-offs. Speak in 2-3 spoken sentences, max 55 words, without markdown.",
      voiceSettings: { pitch: 0.9, rate: 1.05 }
    },
    meera: {
      id: "meera",
      name: "Meera",
      role: "Creative",
      color: "#ec4899", // Pink
      badge: "Visionary",
      style: "Big-picture thinker, human-centric, exploring future possibilities",
      avatarLetter: "M",
      systemPrompt: "You are Meera, a creative and empathetic GD participant. Focus on societal impact, artistic nuance, and emerging paradigms. Speak in 2-3 spoken sentences, max 55 words, conversational tone.",
      voiceSettings: { pitch: 1.15, rate: 1.0 }
    },
    kabir: {
      id: "kabir",
      name: "Kabir",
      role: "Critic",
      color: "#f97316", // Red-Orange
      badge: "Skeptical",
      style: "Challenges assumptions, highlights edge cases, and questions easy consensus",
      avatarLetter: "K",
      systemPrompt: "You are Kabir, a sharp critical thinker in a GD. Respectfully scrutinize superficial claims, highlight unintended consequences, and demand evidence. Speak in 2-3 spoken sentences, max 55 words.",
      voiceSettings: { pitch: 0.85, rate: 1.08 }
    },
    ananya: {
      id: "ananya",
      name: "Ananya",
      role: "Collaborator",
      color: "#10b981", // Green
      badge: "Diplomatic",
      style: "Synthesizes diverse views, finds common ground, and builds on others' ideas",
      avatarLetter: "N",
      systemPrompt: "You are Ananya, a collaborative GD participant. Bridge opposing viewpoints, reference what teammates said, and propose balanced solutions. Speak in 2-3 spoken sentences, max 55 words.",
      voiceSettings: { pitch: 1.05, rate: 0.98 }
    },
    rohan: {
      id: "rohan",
      name: "Rohan",
      role: "Debater",
      color: "#f59e0b", // Amber
      badge: "Assertive",
      style: "Energetic, persuasive, uses strong rhetoric and real-world case studies",
      avatarLetter: "R",
      systemPrompt: "You are Rohan, an assertive GD participant. Make persuasive arguments with confidence, cite real-world precedents, and drive momentum. Speak in 2-3 spoken sentences, max 55 words.",
      voiceSettings: { pitch: 1.0, rate: 1.12 }
    }
  },

  // Mock dialogue generation bank for offline or demo use
  MOCK_DIALOGUES: {
    moderator: {
      intro: [
        "Welcome everyone to this group discussion on the topic: '{topic}'. Let's maintain constructive dialogue, listen actively, and respect each speaker's time. The floor is now open.",
        "Good day participants. Today's discussion centers around '{topic}'. Let's hear clear insights, supported arguments, and balanced counterpoints. You may begin.",
        "Welcome to the GD Arena. We are evaluating clarity, teamwork, and depth on '{topic}'. Let's kick off with our opening viewpoints."
      ],
      transition: [
        "Thank you. Let's pass the floor to {nextSpeaker} for their perspective on this.",
        "That brings up an interesting angle. {nextSpeaker}, what is your take on this direction?",
        "Good points raised. Let's hear from {nextSpeaker} next to build upon this.",
        "Continuing the momentum, {nextSpeaker}, please share your thoughts."
      ],
      interruptedWarning: [
        "Let's ensure we let each other complete our core points before jumping in.",
        "Please maintain turn discipline so everyone has adequate room to elaborate."
      ],
      closing: [
        "We have reached the end of our allotted time. Excellent participation, active counter-arguments, and mutual engagement from everyone. The discussion is now concluded."
      ]
    },

    aarav: [
      "If we examine the macroeconomic data, technological shifts have historically displaced specific tasks rather than entire professions, while generating higher-value analytical roles.",
      "Looking at productivity statistics, companies adopting modern frameworks report a 25% efficiency surge, though short-term labor reallocation challenges remain acute.",
      "We must evaluate the cost-benefit matrix. Without structural upskilling programs, the transition will create measurable inequality in the labor index.",
      "The empirical evidence points to a hybrid model where augmented systems boost per-capita output without rendering human judgment obsolete."
    ],

    meera: [
      "I see this not just as an economic issue, but as a deeply human transformation where empathy and emotional intelligence become our core currencies.",
      "What excites me is how this frees human potential from mundane repetition, opening up uncharted frontiers for creativity and social collaboration.",
      "We shouldn't underestimate the psychological dimension. When the boundaries of community change, our collective sense of purpose and belonging must evolve too.",
      "Building on the earlier observation, think about the cultural diversity this enables when geographic barriers dissolve completely."
    ],

    kabir: [
      "I have to challenge that optimistic narrative. Who actually bears the downside risk when these accelerated disruptions fail in real-world scenarios?",
      "That sounds ideal in theory, but systemic friction and institutional inertia tell a very different story. We can't overlook corporate monopolies controlling the rails.",
      "Let's not conflate operational efficiency with meaningful societal progress. If the average worker loses bargaining leverage, the overall system weakens.",
      "While I hear the benefits being cited, history shows that regulatory safeguards always lag dangerously behind implementation speed."
    ],

    ananya: [
      "I appreciate Kabir's caution and Aarav's data points. If we synthesize both, the real solution lies in proactive public policy paired with responsible adoption.",
      "I agree with the point made by Meera regarding the human element. We can preserve core values while strategically welcoming sustainable innovation.",
      "There is valuable truth on both sides here. Rather than viewing this as a zero-sum contest, we should establish guardrails that empower smaller stakeholders.",
      "Building on our teammate's insight, the middle ground is clear: gradual integration with mandatory safety nets creates the strongest collective outcome."
    ],

    rohan: [
      "Let's be decisive here. First-mover advantage determines which nations and organizations lead the next century, so hesitation is our biggest liability.",
      "Look at leading global enterprises—those that embraced structural disruption dominated their sectors, while the hesitant faded into irrelevance.",
      "To counter that concern, the pace of modern iteration allows us to correct course in real time far faster than legacy bureaucratic models ever could.",
      "We must take an assertive stance. Proactive leadership and decisive investment will solve the implementation hurdles as we scale."
    ]
  }
};
