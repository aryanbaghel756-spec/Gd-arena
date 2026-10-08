/**
 * Realistic Mock Session History for Dashboard & History Page
 */

export const MOCK_SESSIONS = [
  {
    id: "sess-2026-041",
    topic: "Should AI replace human jobs?",
    date: "Today, 10:30 AM",
    duration: "3m 00s",
    score: 84,
    aiCount: 4,
    participants: ["You", "Moderator", "Aarav", "Kabir", "Meera", "Ananya"],
    metrics: {
      speakingSharePct: 28,
      studentSeconds: 52,
      contributionsCount: 3,
      interruptionsCount: 1,
      ideasCount: 5,
      skills: {
        opening: 4.5,
        building: 4.2,
        clarity: 4.0,
        listening: 3.8,
        participation: 4.4
      }
    },
    strengths: [
      {
        text: "Demonstrated decisive proactive leadership by opening the discussion early with clear assertions.",
        quote: "I believe AI will augment worker productivity rather than eliminate entire professions.",
        time: "00:32"
      },
      {
        text: "Constructively acknowledged empirical data cited by Aarav, reinforcing collaborative synthesis.",
        quote: "Building on Aarav's point regarding productivity statistics...",
        time: "01:45"
      }
    ],
    improvements: [
      {
        text: "At 02:14 you interrupted Kabir. Allow peers to finish their thoughts before interjecting.",
        quote: "Interrupted Kabir while discussing systemic friction",
        time: "02:14"
      }
    ],
    transcript: [
      {
        id: "t1",
        speaker: "Moderator",
        role: "Facilitator",
        text: "Welcome participants to today's group discussion on 'Should AI replace human jobs?'. Let's maintain constructive dialogue. The floor is now open.",
        time: "00:00",
        interrupted: false,
        color: "#8b5cf6"
      },
      {
        id: "t2",
        speaker: "You",
        role: "Student",
        text: "I believe AI will augment worker productivity rather than eliminate entire professions. Historically, automation shifts task allocation rather than deleting human utility.",
        time: "00:32",
        interrupted: false,
        color: "#22d3ee"
      },
      {
        id: "t3",
        speaker: "Aarav",
        role: "Analyst",
        text: "Looking at productivity statistics, companies adopting modern frameworks report a 25% efficiency surge, though short-term labor reallocation challenges remain acute.",
        time: "01:05",
        interrupted: false,
        color: "#3b82f6"
      },
      {
        id: "t4",
        speaker: "Kabir",
        role: "Critic",
        text: "I have to challenge that optimistic narrative. Who actually bears the downside risk when institutional inertia slows down retraining programs?",
        time: "01:40",
        interrupted: true,
        color: "#f97316"
      },
      {
        id: "t5",
        speaker: "You",
        role: "Student",
        text: "Building on Aarav's point regarding productivity statistics, public-private retraining partnerships can absorb transition shocks while preserving economic momentum.",
        time: "01:45",
        interrupted: false,
        color: "#22d3ee"
      },
      {
        id: "t6",
        speaker: "Meera",
        role: "Creative",
        text: "What excites me is how this frees human potential from mundane repetition, opening up uncharted frontiers for creativity and social collaboration.",
        time: "02:25",
        interrupted: false,
        color: "#ec4899"
      },
      {
        id: "t7",
        speaker: "Moderator",
        role: "Facilitator",
        text: "We have reached the end of our allotted time. Excellent participation, active counter-arguments, and mutual engagement from everyone. The discussion is now concluded.",
        time: "03:00",
        interrupted: false,
        color: "#8b5cf6"
      }
    ]
  },
  {
    id: "sess-2026-039",
    topic: "Work from home vs office",
    date: "Yesterday, 4:15 PM",
    duration: "5m 00s",
    score: 79,
    aiCount: 3,
    participants: ["You", "Moderator", "Aarav", "Meera", "Rohan"],
    metrics: {
      speakingSharePct: 22,
      studentSeconds: 65,
      contributionsCount: 2,
      interruptionsCount: 0,
      ideasCount: 4,
      skills: {
        opening: 3.5,
        building: 4.5,
        clarity: 4.2,
        listening: 4.4,
        participation: 3.6
      }
    },
    strengths: [
      {
        text: "Strong synthesis of hybrid work models balancing mental health with organizational cohesion.",
        quote: "A hybrid framework delivers flexibility without compromising cross-team serendipity.",
        time: "02:10"
      }
    ],
    improvements: [
      {
        text: "Increase speaking frequency early in the session to establish stronger initial presence.",
        quote: "First contribution delayed until minute 2",
        time: "02:10"
      }
    ]
  },
  {
    id: "sess-2026-035",
    topic: "Is online education the future?",
    date: "3 days ago",
    duration: "3m 00s",
    score: 88,
    aiCount: 4,
    participants: ["You", "Moderator", "Ananya", "Kabir", "Aarav", "Meera"],
    metrics: {
      speakingSharePct: 31,
      studentSeconds: 58,
      contributionsCount: 4,
      interruptionsCount: 0,
      ideasCount: 6,
      skills: {
        opening: 5.0,
        building: 4.6,
        clarity: 4.5,
        listening: 4.2,
        participation: 4.8
      }
    },
    strengths: [
      {
        text: "Exceptional opening framing with statistics on remote access in Tier-2 and Tier-3 institutions.",
        quote: "Digital credentials democratize pedagogical access across underserved geographies.",
        time: "00:20"
      }
    ],
    improvements: [
      {
        text: "Address retention rate drop-offs when counter-arguing Kabir's skepticism.",
        quote: "Countered credential value but bypassed completion rate drop-off",
        time: "01:50"
      }
    ]
  }
];
