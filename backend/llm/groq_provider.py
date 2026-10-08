import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from .base import BaseLLMProvider
from .prompts import build_turn_prompt, build_report_prompt

logger = logging.getLogger(__name__)

class GroqProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model: str = "llama-3.3-70b-versatile"):
        self.api_key = api_key
        self.model = model
        self.endpoint = "https://api.groq.com/openai/v1/chat/completions"

    async def generate_turn(
        self,
        topic: str,
        recent_turns: List[Dict[str, Any]],
        available_personas: List[Dict[str, Any]],
        phase: str
    ) -> Optional[Dict[str, str]]:
        if not self.api_key or "your_groq" in self.api_key:
            return None

        prompt = build_turn_prompt(topic, recent_turns, available_personas, phase)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "temperature": 0.7,
            "max_tokens": 150
        }
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(self.endpoint, headers=headers, json=payload)
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"]
                    data = json.loads(content)
                    if "speaker" in data and "text" in data:
                        return data
                else:
                    logger.warning(f"Groq API returned {res.status_code}: {res.text}")
        except Exception as e:
            logger.warning(f"Groq generate_turn failed: {e}")
        return None

    async def generate_report_scores(
        self,
        topic: str,
        transcript: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        if not self.api_key or "your_groq" in self.api_key:
            return None

        prompt = build_report_prompt(topic, transcript)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "temperature": 0.3,
            "max_tokens": 600
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(self.endpoint, headers=headers, json=payload)
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"]
                    return json.loads(content)
        except Exception as e:
            logger.warning(f"Groq generate_report_scores failed: {e}")
        return None
