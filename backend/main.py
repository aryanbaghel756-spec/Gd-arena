import time
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from .config import LLM_PROVIDER, MOCK_MODE, FRONTEND_ORIGIN
from .models import (
    HealthResponse,
    TopicsResponse,
    CreateRoomRequest,
    CreateRoomResponse,
    GetRoomResponse,
    NextTurnRequest,
    NextTurnResponse,
    EndReportResponse,
    SatisfactionRequest,
    SatisfactionResponse,
    FactsResponse,
    StudentProfileResponse
)
from .store import room_store
from .mock_engine import get_mock_topics, advance_mock_turn, generate_mock_report
from .moderator import advance_room_turn
from .report_generator import generate_gd_report
from .facts_db import get_facts_for_topic
from .database import get_or_create_student

app = FastAPI(
    title="GD Arena API",
    description="Voice-first group discussion trainer with AI personas, evidence-based debate, and student memory (Problem Statement 2)",
    version="1.1.0"
)

# --- CORS Configuration ---
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
if FRONTEND_ORIGIN and FRONTEND_ORIGIN not in allowed_origins:
    allowed_origins.append(FRONTEND_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow cross-laptop connection
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Standard Error Handling ---
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    code_map = {
        400: "BAD_REQUEST",
        404: "NOT_FOUND",
        409: "CONFLICT",
        422: "VALIDATION_ERROR",
        500: "INTERNAL_ERROR"
    }
    code = code_map.get(exc.status_code, "ERROR")
    if exc.status_code == 404 and "Room" in str(exc.detail):
        code = "ROOM_NOT_FOUND"
    message = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": code, "message": message}}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": f"Invalid request body: {str(exc.errors()[0].get('msg', 'validation failed'))}"
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": f"An unexpected error occurred: {str(exc)}"
            }
        }
    )

# --- Endpoints ---

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        mock_mode=MOCK_MODE,
        provider=LLM_PROVIDER,
        active_providers=["ollama", "groq", "gemini"],
        timestamp=datetime.now(timezone.utc).isoformat()
    )

@app.get("/api/topics", response_model=TopicsResponse)
async def list_topics():
    return get_mock_topics()

@app.post("/api/rooms", response_model=CreateRoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(req: CreateRoomRequest):
    room = room_store.create_room(
        topic=req.topic,
        panel_size=req.panel_size,
        language=req.language,
        student_id=req.student_id or "student_default"
    )
    return CreateRoomResponse(
        room_id=room.room_id,
        topic=room.topic,
        language=room.language,
        duration_sec=room.duration_sec,
        created_at_ms=room.created_at_ms,
        moderator=room.moderator,
        participants=room.participants,
        student_id=room.student_id
    )

@app.get("/api/rooms/{id}", response_model=GetRoomResponse)
async def get_room(id: str):
    room = room_store.get_room(id)
    if not room:
        raise HTTPException(status_code=404, detail=f"Room '{id}' was not found.")
    return room.to_get_room_response()

@app.post("/api/rooms/{id}/next", response_model=NextTurnResponse)
async def advance_turn(id: str, req: NextTurnRequest):
    room = room_store.get_room(id)
    if not room:
        raise HTTPException(status_code=404, detail=f"Room '{id}' was not found.")

    if room.phase == "ended":
        raise HTTPException(status_code=400, detail="This discussion room has already concluded.")

    if MOCK_MODE:
        return advance_mock_turn(
            room=room,
            student_text=req.student_text,
            student_started_ms=req.student_started_ms,
            student_ended_ms=req.student_ended_ms,
            interrupted_turn_id=req.interrupted_turn_id
        )

    return await advance_room_turn(
        room=room,
        student_text=req.student_text,
        student_started_ms=req.student_started_ms,
        student_ended_ms=req.student_ended_ms,
        interrupted_turn_id=req.interrupted_turn_id
    )

@app.post("/api/rooms/{id}/end", response_model=EndReportResponse)
async def end_room(id: str):
    room = room_store.get_room(id)
    if not room:
        raise HTTPException(status_code=404, detail=f"Room '{id}' was not found.")

    if room.cached_report:
        return room.cached_report

    if MOCK_MODE:
        return generate_mock_report(room)

    return await generate_gd_report(room)

# --- Advanced Endpoints: Facts, Satisfaction & Student Memory ---

@app.get("/api/rooms/{id}/facts", response_model=FactsResponse)
async def get_room_facts(id: str):
    room = room_store.get_room(id)
    if not room:
        raise HTTPException(status_code=404, detail=f"Room '{id}' was not found.")
    facts = get_facts_for_topic(room.topic)
    return FactsResponse(
        topic=room.topic,
        core_domains=facts.get("core_domains", []),
        verified_data_points=facts.get("verified_data_points", []),
        common_myths_debunked=facts.get("common_myths_debunked", [])
    )

@app.post("/api/rooms/{id}/satisfaction", response_model=SatisfactionResponse)
async def mark_satisfaction(id: str, req: SatisfactionRequest):
    room = room_store.get_room(id)
    if not room:
        raise HTTPException(status_code=404, detail=f"Room '{id}' was not found.")
    room.is_satisfied = req.is_satisfied
    if req.notes:
        room.satisfaction_notes = req.notes
    return SatisfactionResponse(
        room_id=room.room_id,
        is_satisfied=room.is_satisfied,
        message="Student satisfaction status recorded successfully."
    )

@app.get("/api/students/{id}/profile", response_model=StudentProfileResponse)
async def get_student_profile(id: str):
    profile = get_or_create_student(id)
    return StudentProfileResponse(**profile)

@app.get("/api/students/{id}/roadmap")
async def get_student_roadmap(id: str):
    profile = get_or_create_student(id)
    return {
        "student_id": id,
        "name": profile["name"],
        "roadmap": profile["roadmap"],
        "known_concepts": profile["known_concepts"],
        "weak_areas": profile["weak_areas"]
    }
