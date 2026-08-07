"""
AI Service - Dual path: Ollama (primary) + Google Gemini (fallback)
Falls back to structured mock data if both are unavailable.
"""
import json
import logging
import asyncio
from typing import Optional

import httpx

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        from app.core.config import settings
        self.settings = settings
        self._ollama_available: Optional[bool] = None

    async def _check_ollama(self) -> bool:
        """Check if Ollama is reachable."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.settings.OLLAMA_HOST}/api/tags")
                return resp.status_code == 200
        except Exception:
            return False

    async def _use_ollama(self) -> bool:
        if not self.settings.USE_OLLAMA:
            return False
        if self._ollama_available is None:
            self._ollama_available = await self._check_ollama()
        return self._ollama_available

    async def _ollama_chat(self, messages: list[dict]) -> str:
        import ollama
        response = ollama.chat(
            model=self.settings.OLLAMA_MODEL,
            messages=messages,
            options={"temperature": 0.3},
        )
        return response["message"]["content"]

    async def _gemini_chat(self, prompt: str) -> str:
        if not self.settings.GEMINI_API_KEY or not self.settings.USE_GEMINI_FALLBACK:
            raise RuntimeError("Gemini not configured")
        import google.generativeai as genai
        genai.configure(api_key=self.settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(self.settings.GEMINI_MODEL)
        response = model.generate_content(prompt)
        return response.text

    async def classify_document(self, text: str) -> dict:
        """Classify document into KMRL categories."""
        truncated = text[:2000] if len(text) > 2000 else text
        prompt = f"""You are a document classifier for Kochi Metro Rail Limited (KMRL).
Classify the following document into EXACTLY ONE of these categories:
Finance, HR, Operations, Maintenance, Legal, Procurement, Safety, Tender, Meeting Minutes, Invoices, Reports

Document text:
{truncated}

Respond with ONLY valid JSON in this exact format:
{{"category": "Finance", "confidence": 0.92, "keywords": ["budget", "revenue", "expenditure"]}}"""

        # Try Ollama
        if await self._use_ollama():
            try:
                result = await self._ollama_chat([{"role": "user", "content": prompt}])
                # Extract JSON from response
                start = result.find("{")
                end = result.rfind("}") + 1
                if start >= 0 and end > start:
                    return json.loads(result[start:end])
            except Exception as e:
                logger.warning(f"Ollama classification failed: {e}")
                self._ollama_available = False

        # Try Gemini
        try:
            result = await self._gemini_chat(prompt)
            start = result.find("{")
            end = result.rfind("}") + 1
            if start >= 0 and end > start:
                return json.loads(result[start:end])
        except Exception as e:
            logger.warning(f"Gemini classification failed: {e}")

        # Fallback: keyword-based classification
        text_lower = text.lower()
        if any(k in text_lower for k in ["financial", "revenue", "budget", "expenditure", "invoice", "payment"]):
            return {"category": "Finance", "confidence": 0.78, "keywords": ["finance", "budget"]}
        elif any(k in text_lower for k in ["safety", "accident", "hazard", "fire", "emergency"]):
            return {"category": "Safety", "confidence": 0.82, "keywords": ["safety", "emergency"]}
        elif any(k in text_lower for k in ["tender", "bid", "rfp", "procurement", "vendor"]):
            return {"category": "Procurement", "confidence": 0.79, "keywords": ["tender", "procurement"]}
        elif any(k in text_lower for k in ["maintenance", "repair", "inspection", "track", "rolling stock"]):
            return {"category": "Maintenance", "confidence": 0.81, "keywords": ["maintenance", "inspection"]}
        elif any(k in text_lower for k in ["hr", "human resource", "employee", "recruitment", "policy"]):
            return {"category": "HR", "confidence": 0.77, "keywords": ["hr", "employee"]}
        elif any(k in text_lower for k in ["legal", "contract", "agreement", "court", "litigation"]):
            return {"category": "Legal", "confidence": 0.80, "keywords": ["legal", "contract"]}
        else:
            return {"category": "Operations", "confidence": 0.72, "keywords": ["operations", "KMRL"]}

    async def summarize_document(self, text: str, title: str = "") -> dict:
        """Generate structured AI summary of a document."""
        truncated = text[:3000] if len(text) > 3000 else text
        prompt = f"""You are an AI assistant for Kochi Metro Rail Limited (KMRL).
Analyze this document titled "{title}" and provide a structured summary.

Document text:
{truncated}

Respond with ONLY valid JSON in this exact format:
{{
  "executive_summary": "Brief 2-3 sentence summary",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "action_items": ["Action 1", "Action 2"],
  "important_dates": [{{"date": "2024-03-31", "description": "Deadline"}}],
  "risk_level": "low",
  "responsible_department": "Operations",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}}"""

        # Try Ollama
        if await self._use_ollama():
            try:
                result = await self._ollama_chat([{"role": "user", "content": prompt}])
                start = result.find("{")
                end = result.rfind("}") + 1
                if start >= 0 and end > start:
                    return json.loads(result[start:end])
            except Exception as e:
                logger.warning(f"Ollama summarization failed: {e}")
                self._ollama_available = False

        # Try Gemini
        try:
            result = await self._gemini_chat(prompt)
            start = result.find("{")
            end = result.rfind("}") + 1
            if start >= 0 and end > start:
                return json.loads(result[start:end])
        except Exception as e:
            logger.warning(f"Gemini summarization failed: {e}")

        # Structured fallback
        return {
            "executive_summary": f"This document '{title}' contains important information for KMRL operations and requires review by the relevant department heads.",
            "key_points": [
                "Document requires stakeholder review and approval",
                "Compliance with KMRL operational standards required",
                "Regular follow-up needed on action items"
            ],
            "action_items": ["Review and approve document", "Distribute to relevant teams"],
            "important_dates": [],
            "risk_level": "medium",
            "responsible_department": "Operations",
            "keywords": ["KMRL", "document", "operations", "review"],
        }

    async def chat(self, message: str, context: str, history: list[dict]) -> str:
        """RAG-aware chat response."""
        system_prompt = f"""You are IntelliBot, the AI assistant for Kochi Metro Rail Limited (KMRL) IntelliDocs system.
You help users find information in KMRL documents and answer questions about metro operations.

Context from relevant KMRL documents:
{context}

Be concise, professional, and helpful. If you don't know something from the context, say so."""

        messages = [{"role": "system", "content": system_prompt}]
        for h in history[-6:]:  # Last 6 messages for context
            messages.append(h)
        messages.append({"role": "user", "content": message})

        # Try Ollama
        if await self._use_ollama():
            try:
                return await self._ollama_chat(messages)
            except Exception as e:
                logger.warning(f"Ollama chat failed: {e}")
                self._ollama_available = False

        # Try Gemini
        try:
            full_prompt = f"{system_prompt}\n\nUser: {message}\nAssistant:"
            return await self._gemini_chat(full_prompt)
        except Exception as e:
            logger.warning(f"Gemini chat failed: {e}")

        # Fallback response
        return (
            f"Based on KMRL IntelliDocs, I can help you with information about '{message}'. "
            "The system contains documents across Operations, Finance, HR, Maintenance, Legal, and Procurement departments. "
            "Please try the Semantic Search feature for more specific document queries, or check the uploaded documents in the Documents section."
        )

    async def generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        """Generate text embeddings using sentence-transformers."""
        try:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer(self.settings.EMBEDDING_MODEL)
            embeddings = model.encode(texts).tolist()
            return embeddings
        except Exception as e:
            logger.warning(f"Embedding generation failed: {e}")
            # Return random embeddings as fallback (for demo)
            import random
            return [[random.uniform(-1, 1) for _ in range(384)] for _ in texts]
