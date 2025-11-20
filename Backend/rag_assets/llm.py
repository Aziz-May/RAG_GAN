"""LLM client wrapper for OpenRouter via openai library.
Gracefully degrades if API key missing or authentication fails.
"""
from __future__ import annotations
import os
from typing import List
from openai import OpenAI
from app.core.config import Settings 
settings=Settings()

OPENROUTER_API_KEY, LLM_MODEL = settings.OPENROUTER_API_KEY, settings.LLM_MODEL

print("LLM_MODEL from config:", LLM_MODEL)
print("OPENROUTER_API_KEY from config:", OPENROUTER_API_KEY)

FALLBACK_ANSWER = (
    "[LLM unavailable] Unable to retrieve a model-generated answer right now. "
    "Please verify your OPENROUTER_API_KEY or internet connectivity."
)

class LLMClient:
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY
        self.base_url =  "https://openrouter.ai/api/v1"
        self._client = None
        print(self.api_key, self.base_url)
        if self.api_key:
            try:
                self._client = OpenAI(api_key=self.api_key, base_url=self.base_url)
            except Exception as e:
                print(f"Failed to init OpenAI client: {e}")
                self._client = None
        else:
            print(f"Environment variable {OPENROUTER_API_KEY} not set; using fallback responses.")

    def chat(self, prompt: str) -> str:
        if not self._client:
            print("LLM client not initialized; returning fallback answer.")
            return FALLBACK_ANSWER
        try:
            resp = self._client.chat.completions.create(
                model=LLM_MODEL,
                messages=[{"role": "user", "content": prompt}],
            )
            # Newer openai python may return .choices list with message
            choice = resp.choices[0].message.content
            
            return choice.strip()
        except Exception as e:
            print(f"LLM request failed: {e}")
            return FALLBACK_ANSWER
