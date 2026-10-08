import logging
from typing import List, Dict, Any, Optional
from ..config import (
    LLM_PROVIDER,
    OLLAMA_URL, OLLAMA_MODEL,
    GROQ_API_KEY, GROQ_MODEL,
    GEMINI_API_KEY, GEMINI_MODEL
)
from .base import BaseLLMProvider
from .ollama_provider import OllamaProvider
from .groq_provider import GroqProvider
from .gemini_provider import GeminiProvider

logger = logging.getLogger(__name__)

class LLMRouter:
    def __init__(self):
        self.providers: Dict[str, BaseLLMProvider] = {
            "ollama": OllamaProvider(base_url=OLLAMA_URL, model=OLLAMA_MODEL),
            "groq": GroqProvider(api_key=GROQ_API_KEY, model=GROQ_MODEL),
            "gemini": GeminiProvider(api_key=GEMINI_API_KEY, model=GEMINI_MODEL)
        }
        self.primary_provider_name = LLM_PROVIDER if LLM_PROVIDER in self.providers else "ollama"

    def _get_provider_chain(self) -> List[tuple[str, BaseLLMProvider]]:
        order = [self.primary_provider_name]
        for name in ["ollama", "groq", "gemini"]:
            if name not in order:
                order.append(name)
        return [(name, self.providers[name]) for name in order]

    async def generate_turn(
        self,
        topic: str,
        recent_turns: List[Dict[str, Any]],
        available_personas: List[Dict[str, Any]],
        phase: str,
        verified_facts: Optional[Dict[str, Any]] = None,
        student_profile: Optional[Dict[str, Any]] = None
    ) -> tuple[Optional[Dict[str, str]], str, bool]:
        """
        Attempts generation using provider chain.
        Returns: (result_dict, provider_used, is_degraded)
        """
        chain = self._get_provider_chain()
        for name, provider in chain:
            try:
                res = await provider.generate_turn(
                    topic=topic,
                    recent_turns=recent_turns,
                    available_personas=available_personas,
                    phase=phase,
                    verified_facts=verified_facts,
                    student_profile=student_profile
                )
                if res and "speaker" in res and "text" in res:
                    valid_ids = {p["id"] for p in available_personas} | {"moderator"}
                    if res["speaker"] not in valid_ids:
                        res["speaker"] = available_personas[0]["id"]
                    return res, name, False
            except Exception as e:
                logger.warning(f"Provider {name} failed: {e}. Trying next...")

        # All providers failed -> Return None to trigger graceful degradation
        return None, "none", True

    async def generate_report_scores(
        self,
        topic: str,
        transcript: List[Dict[str, Any]],
        student_profile: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        chain = self._get_provider_chain()
        for name, provider in chain:
            try:
                res = await provider.generate_report_scores(
                    topic=topic,
                    transcript=transcript,
                    student_profile=student_profile
                )
                if res and "criteria_scores" in res:
                    return res
            except Exception as e:
                logger.warning(f"Provider {name} failed during report generation: {e}")
        return None

# Global LLM Router instance
llm_router = LLMRouter()
