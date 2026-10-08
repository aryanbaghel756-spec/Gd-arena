from typing import List, Optional, Dict, Literal, Any
from pydantic import BaseModel, Field

# --- Standard Error ---
class ErrorDetail(BaseModel):
    code: str
    message: str

class ErrorResponse(BaseModel):
    error: ErrorDetail


# --- Health ---
class HealthResponse(BaseModel):
    status: str = "healthy"
    mock_mode: bool
    provider: str
    active_providers: List[str]
    timestamp: str


# --- Topics & Verified Facts ---
class Topic(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str
    suggested_duration_sec: int
    context: str
    format: Optional[str] = "standard"  # standard, case_based, abstract, controversial

class TopicsResponse(BaseModel):
    topics: List[Topic]

class FactDataPoint(BaseModel):
    claim: str
    evidence: str
    source: str

class MythDebunk(BaseModel):
    myth: str
    reality: str

class FactsResponse(BaseModel):
    topic: str
    core_domains: List[str]
    verified_data_points: List[FactDataPoint]
    common_myths_debunked: List[MythDebunk]

class CustomTopicRequest(BaseModel):
    title: str = Field(min_length=3, description="Custom debate topic or scenario")
    category: Optional[str] = "Custom Debate"
    difficulty: Optional[Literal["Easy", "Medium", "Hard"]] = "Medium"

class CustomTopicResponse(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str
    suggested_duration_sec: int
    context: str
    format: str = "custom"
    core_domains: List[str]
    verified_data_points: List[FactDataPoint]


# --- Voice & Participants ---
class VoiceHint(BaseModel):
    gender_hint: Literal["male", "female"]
    pitch: float = 1.0
    rate: float = 1.0

class Participant(BaseModel):
    id: str
    name: str
    persona: str
    role: Literal["participant", "moderator"] = "participant"
    is_ai: bool = True
    voice: VoiceHint


# --- Rooms ---
class CreateRoomRequest(BaseModel):
    topic: str
    panel_size: int = Field(ge=3, le=5, default=4)
    language: Literal["en", "hinglish"] = "en"
    format: Literal["standard", "case_based", "abstract", "controversial", "fishbowl"] = "standard"
    patience_sec: int = Field(ge=2, le=15, default=5)
    student_id: Optional[str] = "student_default"

class CreateRoomResponse(BaseModel):
    room_id: str
    topic: str
    language: str
    format: str = "standard"
    patience_sec: int = 5
    duration_sec: int
    created_at_ms: int
    moderator: Participant
    participants: List[Participant]
    student_id: Optional[str] = "student_default"

class TranscriptTurn(BaseModel):
    id: str
    speaker_id: str
    speaker_name: str
    role: Literal["student", "participant", "moderator"]
    is_ai: bool
    text: str
    t_ms: int
    interrupted: bool = False

class JoinRoomRequest(BaseModel):
    student_id: str = Field(min_length=2, description="Unique identifier of joining friend/student")
    student_name: str = Field(min_length=2, default="Friend")

class JoinRoomResponse(BaseModel):
    room_id: str
    student_id: str
    student_name: str
    total_human_count: int
    ai_participant_count: int
    message: str

class GetRoomResponse(BaseModel):
    room_id: str
    topic: str
    language: str
    format: str = "standard"
    patience_sec: int = 5
    phase: Literal["opening", "discussion", "closing", "ended"]
    duration_sec: int
    remaining_sec: int
    moderator: Participant
    participants: List[Participant]
    human_participants: Optional[List[Dict[str, str]]] = None
    transcript: List[TranscriptTurn]


# --- Turn Advance ---
class NextTurnRequest(BaseModel):
    student_text: Optional[str] = None
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    student_started_ms: Optional[int] = None
    student_ended_ms: Optional[int] = None
    interrupted_turn_id: Optional[str] = None

class TurnDetail(BaseModel):
    id: str
    speaker_id: str
    speaker_name: str
    role: Literal["participant", "moderator"]
    text: str
    t_ms: int
    voice: VoiceHint

class NextTurnResponse(BaseModel):
    turn: Optional[TurnDetail] = None
    next_actor: Literal["ai", "student"]
    phase: Literal["opening", "discussion", "closing", "ended"]
    remaining_sec: int
    nudge: Optional[str] = None
    degraded: bool = False


# --- Report & "What You Could Have Said" ---
class QuoteRef(BaseModel):
    turn_id: str
    text: str

class CriterionScore(BaseModel):
    criterion: str
    score: int = Field(ge=1, le=5)
    feedback: str
    quote: QuoteRef

class Metrics(BaseModel):
    speaking_share_pct: Dict[str, float]
    word_counts: Dict[str, int]
    student_interruptions_count: int

class MissedOpportunity(BaseModel):
    turn_id: str
    speaker_name: str
    trigger_text: str
    student_response: Optional[str] = None
    ai_feedback: Optional[str] = None
    how_to_improve: Optional[str] = None
    suggested_response: str
    missed_angle: str

class ImprovementPlan(BaseModel):
    biggest_improvement_area: str
    next_gd_goals: List[str]
    practice_challenge: str

class EndReportResponse(BaseModel):
    room_id: str
    topic: str
    duration_sec: int
    total_turns: int
    overall_score: int
    summary: str
    metrics: Metrics
    criteria_scores: List[CriterionScore]
    what_you_could_have_said: Optional[List[MissedOpportunity]] = []
    improvement_plan: Optional[ImprovementPlan] = None


# --- Student Profile & Satisfaction ---
class SatisfactionRequest(BaseModel):
    is_satisfied: bool = True
    notes: Optional[str] = None

class SatisfactionResponse(BaseModel):
    room_id: str
    is_satisfied: bool
    message: str

class RoadmapMilestone(BaseModel):
    milestone: int
    goal: str
    status: str
    recommended_topic: str

class StudentProfileResponse(BaseModel):
    student_id: str
    name: str
    known_concepts: List[str]
    weak_areas: List[str]
    resolved_queries: List[str]
    pending_queries: List[str]
    roadmap: List[RoadmapMilestone]
    total_sessions: int
    average_score: float
    created_at_ms: int
    updated_at_ms: int
