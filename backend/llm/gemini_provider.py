import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from .base import BaseLLMProvider
from .prompts import build_turn_prompt, build_report_prompt

logger = logging.getLogger(__name__)

class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        self.api_key = api_key
        self.model = model

    def _get_url(self) -> str:
        return f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

    async def generate_turn(
        self,
        topic: str,
        recent_turns: List[Dict[str, Any]],
        available_personas: List[Dict[str, Any]],
        phase: str
    ) -> Optional[Dict[str, str]]:
        if not self.api_key or "your_gemini" in self.api_key:
            return None

        prompt = build_turn_prompt(topic, recent_turns, available_personas, phase)
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.7,
                "maxOutputTokens": 150
            }
        }
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(self._get_url(), json=payload)
                if res.status_code == 200:
                    candidates = res.json().get("candidates", [])
                    if candidates:
                        text = candidates[0]["content"]["parts"][0]["text"]
                        data = json.loads(text)
                        if "speaker" in data and "text" in data:
                            return data
                else:
                    logger.warning(f"Gemini API returned {res.status_code}: {res.text}")
        except Exception as e:
            logger.warning(f"Gemini generate_turn failed: {e}")
        return None

    async def generate_report_scores(
        self,
        topic: str,
        transcript: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        if not self.api_key or "your_gemini" in self.api_key:
            return None

        prompt = build_report_prompt(topic, transcript)
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.3,
                "maxOutputTokens": 600
            }
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(self._get_url(), json=payload)
                if res.status_code == 200:
                    candidates = res.json().get("candidates", [])
                    if candidates:
                        text = candidates[0]["content"]["parts"][0]["text"]
                        return json.loads(text)
        except Exception as e:
            logger.warning(f"Gemini generate_report_scores failed: {e}")
        return None
