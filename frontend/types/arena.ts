export type DiscussionPhase = 'opening' | 'discussion' | 'closing';

export type PersonaTag = 
  | 'Analyst' 
  | 'Critic' 
  | 'Creative' 
  | 'Quiet one' 
  | 'Dominator' 
  | 'Moderator' 
  | 'Candidate';

export interface Participant {
  id: string;
  name: string;
  role: 'moderator' | 'ai' | 'user';
  personality: PersonaTag;
  tagline: string;
  avatarSeed: string;
  color: string;
  accentGlow: string;
  talkTimeSeconds: number;
  isSpeaking: boolean;
  audioLevel?: number; // 0 to 1
}

export type TopicCategory = 'Abstract' | 'Case-based' | 'Controversial' | 'Current affairs';

export interface Topic {
  id: string;
  category: TopicCategory;
  title: string;
  description: string;
  contextPoints: string[];
}

export interface TranscriptItem {
  id: string;
  speakerId: string;
  speakerName: string;
  personality: PersonaTag;
  role: 'moderator' | 'ai' | 'user';
  text: string;
  timestamp: string;
  seconds: number;
  highlight?: boolean;
}

export interface SkillScore {
  id: string;
  title: string;
  score: number; // out of 10
  status: 'strength' | 'needs-work' | 'good';
  badgeText: string;
  feedback: string;
  quotedMoment: {
    timestamp: string;
    quote: string;
    context: string;
  };
}

export interface ParticipationShare {
  participantId: string;
  name: string;
  percentage: number;
  seconds: number;
  color: string;
  isUser?: boolean;
}

export interface GDReport {
  overallScore: number; // e.g. 86 / 100
  percentile: number;   // e.g. 88 (top 12%)
  performanceBadge: string; // e.g. "Strategic Anchor"
  summary: string;
  durationSeconds: number;
  totalExchanges: number;
  interruptionCount: number;
  participationShare: ParticipationShare[];
  skills: SkillScore[];
}

export interface FactDataPoint {
  claim: string;
  evidence: string;
  source: string;
}

export interface MythDebunk {
  myth: string;
  reality: string;
}

export interface TopicFacts {
  topic: string;
  core_domains: string[];
  verified_data_points: FactDataPoint[];
  common_myths_debunked: MythDebunk[];
}

