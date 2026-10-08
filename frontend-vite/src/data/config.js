/**
 * GD Arena - Personas, Preset Topics, and Mock Dialogue Dataset
 */

export const CONFIG = {
  // Timing parameters
  DEFAULT_DURATION_MINUTES: 3,
  MAX_TURN_SECONDS: 60,

  // Preset Discussion Topics strictly aligned with requirements
  PRESET_TOPICS: [
    "Should AI replace human jobs?",
    "Is remote work the future?",
    "Social media: benefit or threat?"
  ],

  // Participant Personas as strictly defined in specifications
  PERSONAS: {
    you: {
      id: "you",
      name: "You",
      role: "Student",
      badge: "Participant",
      color: "#38bdf8", // Sky Blue
      avatarLetter: "U",
      style: "Your personal perspective, argumentation, and responses",
      personality: "Student participant preparing for group discussions",
      voiceSettings: { pitch: 1.0, rate: 1.0 }
    },
    moderator: {
      id: "moderator",
      name: "Moderator",
      role: "Facilitator",
      badge: "Facilitator",
      color: "#a855f7", // Purple / Violet
      avatarLetter: "M",
      style: "Controls discussion flow, timing and turn-taking",
      personality: "Controls discussion flow, timing and turn-taking",
      systemPrompt: "You are the GD Moderator. Guide the group, maintain order, introduce topics, and regulate turns. Speak in 2 concise sentences, max 40 words.",
      voiceSettings: { pitch: 0.95, rate: 1.0 }
    },
    aarav: {
      id: "aarav",
      name: "Aarav",
      role: "Analyst",
      badge: "Logical & Fact-Focused",
      color: "#3b82f6", // Blue
      avatarLetter: "A",
      style: "Logical, fact-focused, cause-and-effect oriented",
      personality: "Logical, fact-focused, cause-and-effect oriented",
      systemPrompt: "You are Aarav, an analytical GD participant. Emphasize empirical data, economic trends, and cause-and-effect logic. Speak in 2-3 spoken sentences, max 50 words.",
      voiceSettings: { pitch: 0.9, rate: 1.05 }
    },
    meera: {
      id: "meera",
      name: "Meera",
      role: "Creative",
      badge: "Innovative & Big-Picture",
      color: "#ec4899", // Pink / Magenta
      avatarLetter: "M",
      style: "Innovative, imaginative, big-picture",
      personality: "Innovative, imaginative, big-picture",
      systemPrompt: "You are Meera, a creative and big-picture GD participant. Focus on human potential, lateral solutions, and visionary perspectives. Speak in 2-3 spoken sentences, max 50 words.",
      voiceSettings: { pitch: 1.15, rate: 1.0 }
    },
    kabir: {
      id: "kabir",
      name: "Kabir",
      role: "Critic",
      badge: "Skeptical & Challenging",
      color: "#f97316", // Orange
      avatarLetter: "K",
      style: "Skeptical, challenging, finds flaws",
      personality: "Skeptical, challenging, finds flaws",
      systemPrompt: "You are Kabir, a critical thinker in a GD. Scrutinize superficial claims, point out flaws, and question easy consensus. Speak in 2-3 spoken sentences, max 50 words.",
      voiceSettings: { pitch: 0.85, rate: 1.08 }
    },
    ananya: {
      id: "ananya",
      name: "Ananya",
      role: "Collaborator",
      badge: "Balanced & Supportive",
      color: "#10b981", // Emerald
      avatarLetter: "N",
      style: "Balanced, supportive, builds common ground",
      personality: "Balanced, supportive, builds common ground",
      systemPrompt: "You are Ananya, a collaborative GD participant. Bridge opposing viewpoints, build on others' arguments, and find common ground. Speak in 2-3 spoken sentences, max 50 words.",
      voiceSettings: { pitch: 1.05, rate: 0.98 }
    },
    rohan: {
      id: "rohan",
      name: "Rohan",
      role: "Debater",
      badge: "Assertive & Persuasive",
      color: "#eab308", // Amber
      avatarLetter: "R",
      style: "Assertive, persuasive, rhetorical",
      personality: "Assertive, persuasive, rhetorical",
      systemPrompt: "You are Rohan, an assertive GD participant. Make persuasive rhetorical arguments with conviction and real-world precedents. Speak in 2-3 spoken sentences, max 50 words.",
      voiceSettings: { pitch: 1.0, rate: 1.12 }
    }
  },

  // Mock Dialogue Pool
  MOCK_DIALOGUES: {
    moderator: {
      intro: [
        "Welcome participants to today's group discussion on '{topic}'. Let's maintain constructive dialogue, listen actively, and respect each speaker's time. The floor is now open for initial thoughts.",
        "Good day everyone. Our discussion centers around '{topic}'. Let us hear structured arguments, factual support, and balanced viewpoints. You may begin.",
        "Welcome to the Arena. We are evaluating clarity, teamwork, and depth on '{topic}'. Let us kick off with our opening remarks."
      ],
      transition: [
        "Thank you. Let's pass the floor to {nextSpeaker} for their perspective on this.",
        "That brings up an interesting angle. {nextSpeaker}, what is your take on this direction?",
        "Good points raised. Let's hear from {nextSpeaker} next to build upon this.",
        "Continuing our momentum, {nextSpeaker}, please share your thoughts."
      ],
      closing: [
        "We have reached the end of our allotted time. Excellent participation, active counter-arguments, and mutual engagement from everyone. The discussion is now concluded."
      ]
    },

    aarav: [
      "If we examine the macroeconomic data, technological shifts have historically displaced specific manual tasks while generating higher-value analytical roles.",
      "Looking at productivity statistics, organizations adopting modern frameworks report measurable surges, though transition friction remains acute.",
      "We must evaluate the cost-benefit matrix. Without structural upskilling programs, the transition will create measurable inequality in the labor index.",
      "The empirical evidence points toward a collaborative model where automated systems boost output without rendering human judgment obsolete."
    ],

    meera: [
      "I see this not just as an economic issue, but as a deeply human transformation where empathy and emotional intelligence become our core strengths.",
      "What excites me is how this frees human potential from mundane repetition, opening up uncharted frontiers for creativity and social collaboration.",
      "We shouldn't underestimate the psychological dimension. When the boundaries of community change, our collective sense of purpose and belonging must evolve too.",
      "Building on the earlier observation, think about the global accessibility this enables when geographic barriers dissolve completely."
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
