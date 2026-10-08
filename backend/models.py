from typing import List, Optional, Dict, Literal
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


# --- Topics ---
class Topic(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str
    suggested_duration_sec: int
    context: str

class TopicsResponse(BaseModel):
    topics: List[Topic]


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

class CreateRoomResponse(BaseModel):
    room_id: str
    topic: str
    language: str
    duration_sec: int
    created_at_ms: int
    moderator: Participant
    participants: List[Participant]

class TranscriptTurn(BaseModel):
    id: str
    speaker_id: str
    speaker_name: str
    role: Literal["student", "participant", "moderator"]
    is_ai: bool
    text: str
    t_ms: int
    interrupted: bool = False

class GetRoomResponse(BaseModel):
    room_id: str
    topic: str
    language: str
    phase: Literal["opening", "discussion", "closing", "ended"]
    duration_sec: int
    remaining_sec: int
    moderator: Participant
    participants: List[Participant]
    transcript: List[TranscriptTurn]


# --- Turn Advance ---
class NextTurnRequest(BaseModel):
    student_text: Optional[str] = None
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


# --- Report ---
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

class EndReportResponse(BaseModel):
    room_id: str
    topic: str
    duration_sec: int
    total_turns: int
    overall_score: int
    summary: str
    metrics: Metrics
    criteria_scores: List[CriterionScore]
