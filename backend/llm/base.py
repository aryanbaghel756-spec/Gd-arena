from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_turn(
        self,
        topic: str,
        recent_turns: List[Dict[str, Any]],
        available_personas: List[Dict[str, Any]],
        phase: str
    ) -> Optional[Dict[str, str]]:
        """
        Returns JSON: {"speaker": "speaker_id", "text": "1-3 sentences"}
        """
        pass

    @abstractmethod
    async def generate_report_scores(
        self,
        topic: str,
        transcript: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """
        Returns qualitative scores for the 6 criteria with quoted turn_id and text.
        """
        pass
