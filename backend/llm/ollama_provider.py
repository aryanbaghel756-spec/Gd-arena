import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from .base import BaseLLMProvider
from .prompts import build_turn_prompt, build_report_prompt

logger = logging.getLogger(__name__)

class OllamaProvider(BaseLLMProvider):
    def __init__(self, base_url: str, model: str):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def generate_turn(
        self,
        topic: str,
        recent_turns: List[Dict[str, Any]],
        available_personas: List[Dict[str, Any]],
        phase: str,
        verified_facts: Optional[Dict[str, Any]] = None,
        student_profile: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, str]]:
        prompt = build_turn_prompt(topic, recent_turns, available_personas, phase, verified_facts, student_profile)
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {"temperature": 0.6, "num_predict": 180}
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                if res.status_code == 200:
                    raw = res.json().get("response", "{}")
                    data = json.loads(raw)
                    if "speaker" in data and "text" in data:
                        return data
        except Exception as e:
            logger.warning(f"Ollama generate_turn failed: {e}")
        return None

    async def generate_report_scores(
        self,
        topic: str,
        transcript: List[Dict[str, Any]],
        student_profile: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        prompt = build_report_prompt(topic, transcript, student_profile)
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {"temperature": 0.3, "num_predict": 600}
        }
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                if res.status_code == 200:
                    raw = res.json().get("response", "{}")
                    return json.loads(raw)
        except Exception as e:
            logger.warning(f"Ollama generate_report_scores failed: {e}")
        return None
