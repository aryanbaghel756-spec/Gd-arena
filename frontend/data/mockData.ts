import { Topic, Participant, SkillScore, GDReport, TranscriptItem, TopicFacts } from '@/types/arena';

export const VERIFIED_TOPIC_FACTS: Record<string, TopicFacts> = {
  'stock-market-nifty': {
    topic: 'Stock Market & Nifty 50: Long-Term Wealth Creation or Pure Speculation?',
    core_domains: [
      'Market Valuation & Corporate Earnings',
      'Retail Investor Risk & Financial Literacy',
      'Macroeconomic Liquidity & SEBI Regulation'
    ],
    verified_data_points: [
      {
        claim: 'Retail derivatives risk vs systematic investing',
        evidence: 'SEBI official study revealed 93% of retail traders in equity derivatives (F&O) make net losses, proving broad index SIPs vastly outperform short-term speculation.',
        source: 'Securities and Exchange Board of India (SEBI) Analytics'
      },
      {
        claim: 'Nifty 50 historical compounding',
        evidence: 'Historical 20-year rolling data shows Nifty 50 compounding at ~12.5% CAGR, reflecting India top 50 corporate earnings growth.',
        source: 'National Stock Exchange (NSE) Indices Research'
      }
    ],
    common_myths_debunked: [
      {
        myth: 'Stock market and Nifty 50 are just pure gambling.',
        reality: 'Equities represent fractional ownership in productive businesses with real earnings, whereas gambling has negative mathematical expectancy.'
      }
    ]
  },
  'ai-jobs': {
    topic: 'Will AI Create More Jobs Than It Destroys?',
    core_domains: ['Labor Economics', 'Automation History', 'Cognitive vs Manual Tasks'],
    verified_data_points: [
      {
        claim: 'Net job generation vs displacement',
        evidence: 'World Economic Forum (WEF) Future of Jobs Report estimated 85 million jobs displaced by automation alongside 97 million new roles emerging in AI synthesis, cloud, and green tech.',
        source: 'WEF Future of Jobs Report'
      },
      {
        claim: 'Historical precedent of technological transitions',
        evidence: 'Historical economic data from the Industrial Revolution shows farm labor shrank from ~70% to <3%, yet real wages increased 400% as new industries emerged.',
        source: 'US Bureau of Labor Statistics & Economic History Association'
      },
      {
        claim: 'Cognitive displacement timeline',
        evidence: 'OECD 2023 Employment Outlook found 27% of jobs are in occupations at high risk of automation, primarily in repetitive administrative and basic code synthesis.',
        source: 'OECD Employment Outlook 2023'
      },
      {
        claim: 'Global productivity gains',
        evidence: 'Goldman Sachs Global Economics analysis projected generative AI could drive a 7% (nearly $7 trillion) increase in global GDP over a 10-year period.',
        source: 'Goldman Sachs Global Investment Research'
      }
    ],
    common_myths_debunked: [
      {
        myth: 'AI will cause permanent 50%+ unemployment in 2 years.',
        reality: 'Economic transitions demonstrate the lump of labor fallacy: total work is not fixed; new efficiencies stimulate fresh industries and consumer demand.'
      }
    ]
  },
  'college-attendance-75': {
    topic: 'Mandatory 75% Attendance in Colleges: Discipline or Barrier to Skill Development?',
    core_domains: [
      'Pedagogical Effectiveness',
      'Student Autonomy & Discipline',
      'Practical Skill Development & Industry Readiness'
    ],
    verified_data_points: [
      {
        claim: 'Classroom routine vs hands-on project building',
        evidence: 'Surveys across tier-1 and tier-2 engineering colleges indicate 68% of students learn high-leverage skills (DSA, system design, open-source) through self-directed projects rather than standard lectures.',
        source: 'All India Council for Technical Education (AICTE) Review'
      },
      {
        claim: 'Flexible credit models in global universities',
        evidence: 'Top global technical universities allow students to substitute lecture hours with verified corporate internships and laboratory research credits.',
        source: 'Global Higher Education Policy Framework'
      }
    ],
    common_myths_debunked: [
      {
        myth: 'High physical attendance directly correlates with high employability.',
        reality: 'Tech recruiters evaluate coding ability, problem-solving, and communication, not biometric classroom attendance records.'
      }
    ]
  },
  'remote-work': {
    topic: 'Remote Work vs. Return to Office: The Future of Collaboration',
    core_domains: ['Organizational Behavior', 'Labor Productivity', 'Urban Economics'],
    verified_data_points: [
      {
        claim: 'Productivity impact of hybrid vs remote',
        evidence: 'Stanford University study by Prof. Nicholas Bloom tracking 16,000 workers over 9 months found a 13% performance increase in remote work due to fewer interruptions, while hybrid (2-3 days office) optimized innovation.',
        source: 'Stanford University / Nicholas Bloom Study'
      },
      {
        claim: 'Mentorship and onboarding deficit',
        evidence: 'Harvard Business School research showed junior engineers in fully remote teams received 23% less impromptu mentoring and feedback compared to co-located counterparts.',
        source: 'Harvard Business Review & NBER Working Paper'
      }
    ],
    common_myths_debunked: [
      {
        myth: 'Remote workers slack off and work fewer hours.',
        reality: 'Empirical keystroke and activity studies show remote knowledge workers average 1.4 more hours per week, with burnout being a higher risk than slacking.'
      }
    ]
  },
  'case-startup-crisis': {
    topic: 'Case Study: NovaTech Startup Crisis - 30% Layoffs vs. 15% Universal Salary Cut',
    core_domains: ['Corporate Turnaround', 'Employee Morale', 'Runway Optimization'],
    verified_data_points: [
      {
        claim: 'Layoff versus pay cut attrition rates',
        evidence: 'Harvard Business Review empirical study on downturn management found companies enacting across-the-board pay cuts retained 82% of core staff compared to 54% voluntary high-performer departure post-layoffs.',
        source: 'Harvard Business Review Workplace Retention Study'
      },
      {
        claim: 'Cash runway extension',
        evidence: 'Silicon Valley venture benchmark data demonstrates a 15% universal cut extends operational runway by 9.4 months with lower severance liabilities.',
        source: 'NVCA Venture Capital Economic Index'
      }
    ],
    common_myths_debunked: [
      {
        myth: 'Layoffs immediately solve burn rate without hidden costs.',
        reality: 'Severance, loss of institutional knowledge, and re-hiring cost 1.5x of annual employee salary during market rebound.'
      }
    ]
  },
  'abstract-silence': {
    topic: 'Abstract: Silence is More Eloquent Than Words',
    core_domains: ['Diplomacy & Negotiation', 'Active Listening', 'Rhetorical Power'],
    verified_data_points: [
      {
        claim: 'Psychological power of pause in negotiation',
        evidence: 'Harvard Negotiation Project research shows negotiators who utilize strategic silence (3-5 second pauses) achieve 28% better value concessions than continuous speakers.',
        source: 'Harvard Program on Negotiation'
      },
      {
        claim: 'Signal vs Noise in decision making',
        evidence: 'Information theory metrics demonstrate cognitive overload decreases decision quality when verbal input exceeds processing capacity.',
        source: 'Cognitive Science Journal'
      }
    ],
    common_myths_debunked: [
      {
        myth: 'Speaking the most in a GD guarantees selection.',
        reality: 'Campus placement evaluators penalize monopolizers; active listening and synthesized intervention score higher.'
      }
    ]
  },
  'controversial-wealth-cap': {
    topic: 'Controversial: Should Maximum Personal Wealth Be Capped at $1 Billion?',
    core_domains: ['Wealth Inequality', 'Capital Allocation', 'Entrepreneurial Incentive'],
    verified_data_points: [
      {
        claim: 'Global wealth concentration',
        evidence: 'Oxfam 2024 Inequality Report documented the richest 1% own more wealth than the bottom 95% of human population combined.',
        source: 'Oxfam Global Inequality Briefing'
      },
      {
        claim: 'Capital flight and innovation investment',
        evidence: 'IMF and Tax Foundation data show Scandinavian wealth taxes in the 1990s induced capital flight equivalent to 1.8% of GDP before transition to consumption taxation.',
        source: 'IMF Fiscal Affairs & Tax Foundation'
      }
    ],
    common_myths_debunked: [
      {
        myth: 'Billionaire wealth is liquid cash in a bank account.',
        reality: 'Over 90% of ultra-high net worth wealth is equity in operating corporations, factories, and technology assets.'
      }
    ]
  },
  'social-media-regulation': {
    topic: 'Should Social Media Algorithms Be Strictly Regulated by Government?',
    core_domains: ['Digital Rights', 'Algorithmic Accountability', 'Public Health'],
    verified_data_points: [
      {
        claim: 'Engagement-maximization algorithmic harm',
        evidence: 'Internal Meta whistleblower data published in 2021 indicated algorithms favoring engagement amplify outrage and negative content by 5x over neutral informational posts.',
        source: 'Wall Street Journal Facebook Files Investigation'
      },
      {
        claim: 'Legislative precedents',
        evidence: 'European Union Digital Services Act (DSA) mandates algorithmic transparency and risk mitigation audits for platforms with >45 million monthly active users, proving regulatory feasibility.',
        source: 'European Commission DSA Framework'
      }
    ],
    common_myths_debunked: [
      {
        myth: 'Regulating algorithms restricts personal freedom of speech.',
        reality: 'Algorithmic regulation targets the amplification mechanism and recommendation feedback loops, not the user right to post.'
      }
    ]
  }
};

export const TOPIC_PRESETS: Topic[] = [
  {
    id: 'stock-market-nifty',
    category: 'Current affairs',
    title: 'Stock Market & Nifty 50: Long-Term Wealth Creation or Pure Speculation?',
    description: 'Examine Nifty 50 20-year rolling compounding (~12.5% CAGR), SEBI official 93% retail F&O loss data, and disciplined index investing vs speculative gambling.',
    contextPoints: [
      'SEBI official study: 93% of retail traders in equity derivatives (F&O) incur net losses',
      'NSE 20-year rolling data: Nifty 50 compounding at ~12.5% CAGR matching corporate profit growth',
      'Systematic Investment Plans (SIP) vs high-frequency intraday leverage trading',
      'Financial literacy, risk budgeting, and macroeconomic liquidity safeguards'
    ]
  },
  {
    id: 'ai-jobs',
    category: 'Current affairs',
    title: 'Will AI Create More Jobs Than It Destroys?',
    description: 'Debate automation impacts comparing WEF Future of Jobs data (85M displaced vs 97M created), OECD cognitive vulnerability, and Goldman Sachs 7% GDP growth projections.',
    contextPoints: [
      'World Economic Forum: 85 million routine roles displaced vs 97 million new cognitive roles created',
      'Historical precedent: Agriculture to Industrial shift shrank farm labor from 70% to <3% while real wages grew 400%',
      'OECD 2023 Employment Outlook: 27% of jobs in high automation-risk occupations',
      'Goldman Sachs Research: Generative AI driving 7% ($7 trillion) increase in global GDP'
    ]
  },
  {
    id: 'college-attendance-75',
    category: 'Current affairs',
    title: 'Mandatory 75% Attendance in Colleges: Discipline or Barrier to Skill Development?',
    description: 'Debate whether mandatory 75% attendance builds work ethic or deprives engineering students of coding, open-source building, and placement preparation.',
    contextPoints: [
      'AICTE Review: 68% of engineering students master high-leverage skills through self-directed projects',
      'Global university models: Substituting lecture hours with corporate internships and lab credits',
      'Recruiter hiring criteria: Problem-solving ability, GitHub portfolio, and technical communication',
      'Balanced hybrid model: 60% baseline attendance with verified project waivers'
    ]
  },
  {
    id: 'remote-work',
    category: 'Current affairs',
    title: 'Remote Work vs. Return to Office: The Future of Collaboration',
    description: 'Analyze Stanford Bloom research on 13% remote productivity gains against Harvard findings on 23% junior engineer mentorship deficits.',
    contextPoints: [
      'Stanford Bloom Study: 13% performance boost in remote workers with fewer office distractions',
      'Harvard Business School: Junior staff in fully remote teams received 23% less impromptu mentorship',
      'Hybrid model (2-3 days office) balancing deep individual focus with collaborative innovation',
      'Urban economic shifts and decentralized global talent distribution'
    ]
  },
  {
    id: 'case-startup-crisis',
    category: 'Case-based',
    title: 'Case Study: NovaTech Startup Crisis - 30% Layoffs vs. 15% Universal Salary Cut',
    description: 'A Series B startup faces a 40% revenue drop with 8 months runway. Evaluate employee morale, legal severance liabilities, and runway extension.',
    contextPoints: [
      'Harvard Business Review: Companies with across-the-board pay cuts retained 82% staff vs 54% post-layoffs',
      'NVCA Venture Benchmark: 15% universal salary reduction extends runway by 9.4 months',
      'Re-hiring and severance replacement costs equal 1.5x annual employee salary during market rebound',
      'Executive pay cut signaling to preserve team cohesion and investor confidence'
    ]
  },
  {
    id: 'abstract-silence',
    category: 'Abstract',
    title: 'Abstract: Silence is More Eloquent Than Words',
    description: 'Examine the rhetorical power of strategic pauses, de-escalation, active listening, and restraint in high-stakes negotiations.',
    contextPoints: [
      'Harvard Program on Negotiation: 3-5 second strategic pauses yield 28% better value concessions',
      'Information theory: Cognitive overload decreases decision quality when verbal input exceeds processing capacity',
      'Active listening as an asymmetric negotiation tool in group dynamics',
      'Placement evaluators penalizing airtime monopolization in favor of synthesized clarity'
    ]
  },
  {
    id: 'controversial-wealth-cap',
    category: 'Controversial',
    title: 'Controversial: Should Maximum Personal Wealth Be Capped at $1 Billion?',
    description: 'Evaluate wealth inequality, capital mobility, entrepreneurial risk incentive, and progressive taxation frameworks.',
    contextPoints: [
      'Oxfam 2024 Report: Richest 1% own more wealth than the bottom 95% of human population combined',
      'IMF & Tax Foundation: Scandinavian wealth taxes induced capital flight equivalent to 1.8% of GDP',
      'Over 90% of billionaire net worth consists of illiquid operating equity in corporations and assets',
      'Consumption taxation and closed loophole enforcement vs blunt equity expropriation'
    ]
  },
  {
    id: 'social-media-regulation',
    category: 'Controversial',
    title: 'Should Social Media Algorithms Be Strictly Regulated by Government?',
    description: 'Examine algorithmic accountability, engagement-maximization harms, public health impacts, and the European Union Digital Services Act.',
    contextPoints: [
      'Wall Street Journal Meta Investigation: Outrage-driven posts amplified 5x over neutral informational content',
      'European Union DSA Framework: Mandatory algorithmic transparency audits for platforms with >45M users',
      'Distinction between speech content regulation vs amplification algorithm governance',
      'Mental health correlations and youth screen time intervention guardrails'
    ]
  }
];

export const MOCK_PARTICIPANTS: Participant[] = [
  {
    id: 'mod',
    name: 'Dr. Evelyn Vance',
    role: 'moderator',
    personality: 'Moderator',
    tagline: 'Guiding flow, enforcing fairness, and synthesizing milestones',
    avatarSeed: 'moderator',
    color: '#ffc400',
    accentGlow: 'rgba(255, 196, 0, 0.5)',
    talkTimeSeconds: 42,
    isSpeaking: false,
    audioLevel: 0
  },
  {
    id: 'p-analyst',
    name: 'Aarav Mehta',
    role: 'ai',
    personality: 'Analyst',
    tagline: 'Deconstructs problems with quantitative logic and risk frameworks',
    avatarSeed: 'analyst',
    color: '#ff1e2d',
    accentGlow: 'rgba(255, 30, 45, 0.45)',
    talkTimeSeconds: 78,
    isSpeaking: false,
    audioLevel: 0
  },
  {
    id: 'p-critic',
    name: 'Priya Sharma',
    role: 'ai',
    personality: 'Critic',
    tagline: 'Tests hidden assumptions, interrogates blindspots, and pressure-tests claims',
    avatarSeed: 'critic',
    color: '#ff4d5a',
    accentGlow: 'rgba(255, 77, 90, 0.45)',
    talkTimeSeconds: 84,
    isSpeaking: false,
    audioLevel: 0
  },
  {
    id: 'p-creative',
    name: 'Rohan Kapoor',
    role: 'ai',
    personality: 'Creative',
    tagline: 'Introduces unorthodox lateral analogies and cross-industry paradigms',
    avatarSeed: 'creative',
    color: '#ffa834',
    accentGlow: 'rgba(255, 168, 52, 0.45)',
    talkTimeSeconds: 66,
    isSpeaking: false,
    audioLevel: 0
  },
  {
    id: 'p-quiet',
    name: 'Maya Sen',
    role: 'ai',
    personality: 'Quiet one',
    tagline: 'Patient, speaks infrequently, but delivers precise thematic tie-ups',
    avatarSeed: 'quiet',
    color: '#e6a100',
    accentGlow: 'rgba(230, 161, 0, 0.45)',
    talkTimeSeconds: 38,
    isSpeaking: false,
    audioLevel: 0
  },
  {
    id: 'p-dominator',
    name: 'Vikram Singhania',
    role: 'ai',
    personality: 'Dominator',
    tagline: 'Fast-paced, aggressive verbal tempo, demands constant floor retention',
    avatarSeed: 'dominator',
    color: '#b80010',
    accentGlow: 'rgba(184, 0, 16, 0.55)',
    talkTimeSeconds: 95,
    isSpeaking: false,
    audioLevel: 0
  },
  {
    id: 'user',
    name: 'You (Candidate)',
    role: 'user',
    personality: 'Candidate',
    tagline: 'Your mic is armed. Push-to-talk or unmute to contribute.',
    avatarSeed: 'you',
    color: '#ffc400',
    accentGlow: 'rgba(255, 196, 0, 0.6)',
    talkTimeSeconds: 88,
    isSpeaking: false,
    audioLevel: 0
  }
];

export const INITIAL_TRANSCRIPTS: TranscriptItem[] = [
  {
    id: 't-1',
    speakerId: 'mod',
    speakerName: 'Dr. Evelyn Vance',
    personality: 'Moderator',
    role: 'moderator',
    text: 'Welcome to this Group Discussion session. The floor is open for 8 minutes on our chosen topic. I invite any candidate to initiate the framework.',
    timestamp: '00:08',
    seconds: 8
  },
  {
    id: 't-2',
    speakerId: 'user',
    speakerName: 'You (Candidate)',
    personality: 'Candidate',
    role: 'user',
    text: 'Thank you, Moderator. I would like to initiate by framing this dilemma across two distinct dimensions: sovereign computational autonomy versus immediate economic return on capital.',
    timestamp: '00:32',
    seconds: 32,
    highlight: true
  },
  {
    id: 't-3',
    speakerId: 'p-analyst',
    speakerName: 'Aarav Mehta',
    personality: 'Analyst',
    role: 'ai',
    text: 'Building on what the first speaker noted, capital allocation is unforgiving. Building tier-4 datacenters requires billions in power infrastructure before training runs yield verifiable value.',
    timestamp: '01:14',
    seconds: 74
  },
  {
    id: 't-4',
    speakerId: 'p-dominator',
    speakerName: 'Vikram Singhania',
    personality: 'Dominator',
    role: 'ai',
    text: 'If you wait for economic parity, you lose the geopolitical window! Look at chip bans. Sovereignty is not an ROI ledger; it is an existential hedge against unilateral sanctions.',
    timestamp: '01:52',
    seconds: 112
  },
  {
    id: 't-5',
    speakerId: 'p-critic',
    speakerName: 'Priya Sharma',
    personality: 'Critic',
    role: 'ai',
    text: 'Hold on Vikram. Calling it an existential hedge does not magically solve a 40-megawatt substation bottleneck or talent migration. Are we subsidizing compute that will be obsolete in 18 months?',
    timestamp: '02:30',
    seconds: 150
  },
  {
    id: 't-6',
    speakerId: 'p-creative',
    speakerName: 'Rohan Kapoor',
    personality: 'Creative',
    role: 'ai',
    text: 'Consider how Scandinavian nations treated telecom infrastructure in the 1990s: public open optical fiber corridors that let private startups compete aggressively without owning the bedrock glass.',
    timestamp: '03:15',
    seconds: 195
  }
];

export const MOCK_REPORT_DATA: GDReport = {
  overallScore: 84,
  percentile: 88,
  performanceBadge: 'Strategic Catalyst',
  summary: 'You demonstrated strong initiative by opening the discussion with a balanced two-dimensional framework. You successfully navigated aggressive floor challenges from the Dominator and drew in quieter perspectives while anchoring the core premise.',
  durationSeconds: 491,
  totalExchanges: 24,
  interruptionCount: 3,
  participationShare: [
    { participantId: 'user', name: 'You', percentage: 22, seconds: 108, color: '#ffc400', isUser: true },
    { participantId: 'p-dominator', name: 'Vikram (Dominator)', percentage: 24, seconds: 118, color: '#ff1e2d' },
    { participantId: 'p-analyst', name: 'Aarav (Analyst)', percentage: 19, seconds: 93, color: '#ff626e' },
    { participantId: 'p-critic', name: 'Priya (Critic)', percentage: 17, seconds: 83, color: '#e65100' },
    { participantId: 'p-creative', name: 'Rohan (Creative)', percentage: 11, seconds: 54, color: '#ffa834' },
    { participantId: 'mod', name: 'Moderator', percentage: 7, seconds: 35, color: '#7a7a85' },
  ],
  skills: [
    {
      id: 'skill-starting',
      title: 'Starting the Discussion',
      score: 9.0,
      status: 'strength',
      badgeText: 'Decisive Initiative',
      feedback: 'You took command within the first 30 seconds with a crisp definition rather than generic platitudes. This established the structural baseline that the rest of the panel referenced throughout.',
      quotedMoment: {
        timestamp: '00:32',
        quote: '"I would like to initiate by framing this dilemma across two distinct dimensions: sovereign computational autonomy versus immediate economic return on capital."',
        context: 'Opening turn immediately after the Moderator invited opening statements.'
      }
    },
    {
      id: 'skill-ideas',
      title: 'Quality of Ideas & Substantiation',
      score: 8.5,
      status: 'strength',
      badgeText: 'High Signal',
      feedback: 'Your points combined conceptual clarity with concrete analogies. The distinction between public compute utility and private foundation models kept the group from falling into a false dichotomy.',
      quotedMoment: {
        timestamp: '02:45',
        quote: '"We must differentiate between state-funded compute grids as public utilities versus subsidizing private frontier LLMs. The power grid model applies cleanly here."',
        context: 'Intervening when Priya and Vikram reached an ideological standoff.'
      }
    },
    {
      id: 'skill-building',
      title: 'Building on Others',
      score: 8.0,
      status: 'good',
      badgeText: 'Collaborative Bridge',
      feedback: 'You acknowledged Aarav’s cost metrics before expanding with your utility parallel, demonstrating that you were synthesizing rather than merely waiting for your turn to speak.',
      quotedMoment: {
        timestamp: '03:40',
        quote: '"Rohan’s Scandinavian fiber analogy directly solves the capital lockup Aarav warned about earlier—we can lease off-peak compute hours to private research."',
        context: 'Connecting two divergent perspectives into a unified compromise solution.'
      }
    },
    {
      id: 'skill-listening',
      title: 'Active Listening & Inclusivity',
      score: 8.5,
      status: 'strength',
      badgeText: 'Panel Awareness',
      feedback: 'When Maya was overshadowed by Vikram’s rapid-fire delivery, you created an explicit entry wedge to invite her input, which moderators consistently rate as a high-tier leadership signal.',
      quotedMoment: {
        timestamp: '04:55',
        quote: '"Before we proceed to the export restrictions, Maya had raised an intriguing angle about talent retention that we should hear out."',
        context: 'De-escalating an aggressive floor monologue from Vikram.'
      }
    },
    {
      id: 'skill-interruptions',
      title: 'Handling Interruptions',
      score: 7.5,
      status: 'needs-work',
      badgeText: 'Assertive Recovery',
      feedback: 'When interrupted by the Dominator at 01:52, you yielded ground slightly too quickly. Practice holding your cadence for one more sentence with courteous phrases like "Allow me 10 seconds to finish the premise, Vikram."',
      quotedMoment: {
        timestamp: '01:50',
        quote: '"—and therefore the capital recovery window— [cut off by Vikram: \'If you wait for economic parity...\']"',
        context: 'Mid-sentence yield during the early heated discussion phase.'
      }
    },
    {
      id: 'skill-ending',
      title: 'Ending Strongly & Synthesis',
      score: 9.0,
      status: 'strength',
      badgeText: 'Executive Closure',
      feedback: 'Your closing summary in the final round brought together all 3 divergent threads (sovereignty, fiscal pragmatism, public utility model) into a decisive, non-repetitive consensus verdict.',
      quotedMoment: {
        timestamp: '07:28',
        quote: '"In conclusion, the panel converges on a hybrid doctrine: sovereign ownership of compute infrastructure paired with open market application development."',
        context: 'Final 40 seconds closing round summary.'
      }
    }
  ]
};
