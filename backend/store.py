import time
import uuid
from typing import Dict, List, Optional
from .models import Participant, TranscriptTurn, GetRoomResponse, EndReportResponse
from .personas import get_selected_participants, get_moderator_participant
from .database import get_connection

class RoomState:
    def __init__(
        self,
        room_id: str,
        topic: str,
        panel_size: int,
        language: str = "en",
        format: str = "standard",
        patience_sec: int = 5,
        duration_sec: int = 300,
        student_id: str = "student_default"
    ):
        self.room_id = room_id
        self.student_id = student_id
        self.topic = topic
        self.panel_size = panel_size
        self.language = language
        self.format = format
        self.patience_sec = patience_sec
        self.duration_sec = duration_sec
        self.created_at_ms = int(time.time() * 1000)
        self.phase: str = "opening"
        self.moderator = get_moderator_participant()
        self.participants = get_selected_participants(panel_size)
        self.transcript: List[TranscriptTurn] = []
        self.student_interruptions_count: int = 0
        self.last_student_turn_ms: int = self.created_at_ms
        self.consecutive_ai_turns: int = 0
        self.cached_report: Optional[EndReportResponse] = None
        self.is_satisfied: bool = False
        self.satisfaction_notes: str = ""
        self.in_fishbowl_circle: bool = (format != "fishbowl")  # If fishbowl, starts outside circle

    def get_remaining_sec(self) -> int:
        elapsed = (time.time() * 1000 - self.created_at_ms) / 1000.0
        remaining = int(self.duration_sec - elapsed)
        if remaining <= 0 and not self.is_satisfied:
            return 30
        return max(0, remaining)

    def add_turn(
        self,
        speaker_id: str,
        speaker_name: str,
        role: str,
        text: str,
        is_ai: bool,
        t_ms: Optional[int] = None,
        interrupted: bool = False
    ) -> TranscriptTurn:
        turn_num = len(self.transcript) + 1
        turn_id = f"turn_{turn_num}"
        turn_time = t_ms if t_ms is not None else int(time.time() * 1000)
        
        turn = TranscriptTurn(
            id=turn_id,
            speaker_id=speaker_id,
            speaker_name=speaker_name,
            role=role,  # type: ignore
            is_ai=is_ai,
            text=text.strip(),
            t_ms=turn_time,
            interrupted=interrupted
        )
        self.transcript.append(turn)
        
        if not is_ai:
            self.last_student_turn_ms = turn_time
            self.consecutive_ai_turns = 0
            self.in_fishbowl_circle = True
        else:
            self.consecutive_ai_turns += 1

        try:
            conn = get_connection()
            conn.execute("""
            INSERT OR REPLACE INTO turns (id, room_id, speaker_id, speaker_name, role, is_ai, text, t_ms, interrupted)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (turn_id, self.room_id, speaker_id, speaker_name, role, 1 if is_ai else 0, text.strip(), turn_time, 1 if interrupted else 0))
            conn.commit()
            conn.close()
        except Exception:
            pass

        return turn

    def mark_interrupted(self, turn_id: str) -> bool:
        for t in self.transcript:
            if t.id == turn_id:
                t.interrupted = True
                self.student_interruptions_count += 1
                try:
                    conn = get_connection()
                    conn.execute("UPDATE turns SET interrupted = 1 WHERE room_id = ? AND id = ?", (self.room_id, turn_id))
                    conn.commit()
                    conn.close()
                except Exception:
                    pass
                return True
        return False

    def to_get_room_response(self) -> GetRoomResponse:
        return GetRoomResponse(
            room_id=self.room_id,
            topic=self.topic,
            language=self.language,
            format=self.format,
            patience_sec=self.patience_sec,
            phase=self.phase,  # type: ignore
            duration_sec=self.duration_sec,
            remaining_sec=self.get_remaining_sec(),
            moderator=self.moderator,
            participants=self.participants,
            transcript=self.transcript
        )


class RoomStore:
    def __init__(self):
        self._rooms: Dict[str, RoomState] = {}

    def create_room(
        self,
        topic: str,
        panel_size: int = 4,
        language: str = "en",
        format: str = "standard",
        patience_sec: int = 5,
        student_id: str = "student_default"
    ) -> RoomState:
        room_id = f"room_{uuid.uuid4().hex[:8]}"
        room = RoomState(
            room_id=room_id,
            topic=topic,
            panel_size=panel_size,
            language=language,
            format=format,
            patience_sec=patience_sec,
            student_id=student_id
        )
        self._rooms[room_id] = room

        try:
            conn = get_connection()
            conn.execute("""
            INSERT OR REPLACE INTO rooms (room_id, student_id, topic, panel_size, language, phase, created_at_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (room_id, student_id, topic, panel_size, language, "opening", room.created_at_ms))
            conn.commit()
            conn.close()
        except Exception:
            pass

        return room

    def get_room(self, room_id: str) -> Optional[RoomState]:
        return self._rooms.get(room_id)

    def delete_room(self, room_id: str) -> bool:
        if room_id in self._rooms:
            del self._rooms[room_id]
            return True
        return False

room_store = RoomStore()
