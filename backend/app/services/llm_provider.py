from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple, Optional
import json
from app.core.config import settings
from app.services.review_engine import review_engine, DetectedIssue

class BaseAnalysisProvider(ABC):
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @property
    @abstractmethod
    def is_available(self) -> bool:
        pass

    @abstractmethod
    async def analyze_content(
        self,
        text: str,
        brand_profile: Any,
        content_type: str = "blog",
        has_visual: bool = False,
        image_alt: str = ""
    ) -> Tuple[float, List[DetectedIssue], str, str]:
        """
        Returns:
            Tuple of (compliance_score, issues_list, summary, provider_used)
        """
        pass

class LocalDeterministicProvider(BaseAnalysisProvider):
    @property
    def provider_name(self) -> str:
        return "local_deterministic"

    @property
    def is_available(self) -> bool:
        return True

    async def analyze_content(
        self,
        text: str,
        brand_profile: Any,
        content_type: str = "blog",
        has_visual: bool = False,
        image_alt: str = ""
    ) -> Tuple[float, List[DetectedIssue], str, str]:
        score, issues, summary = review_engine.analyze(
            text=text,
            brand_profile=brand_profile,
            content_type=content_type,
            has_visual=has_visual,
            image_alt=image_alt
        )
        return score, issues, summary, self.provider_name

class OpenAIProvider(BaseAnalysisProvider):
    @property
    def provider_name(self) -> str:
        return "openai_gpt"

    @property
    def is_available(self) -> bool:
        return bool(settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"))

    async def analyze_content(
        self,
        text: str,
        brand_profile: Any,
        content_type: str = "blog",
        has_visual: bool = False,
        image_alt: str = ""
    ) -> Tuple[float, List[DetectedIssue], str, str]:
        if not self.is_available:
            # Graceful fallback to local rule-based engine
            local = LocalDeterministicProvider()
            return await local.analyze_content(text, brand_profile, content_type, has_visual, image_alt)

        try:
            import httpx
            # Call OpenAI chat completion with strict JSON response
            prompt = f"""
You are an expert brand governance and compliance auditor.
Analyze the following text against brand guidelines:
Brand: {getattr(brand_profile, 'name', 'Generic')}
Tone: {getattr(brand_profile, 'tone_voice', '')}
Content:
\"\"\"{text}\"\"\"

Return a valid JSON object with:
{{
  "compliance_score": float (0-100),
  "summary": str,
  "issues": [
    {{
      "rule_id": str,
      "category": "tone_of_voice" | "terminology" | "messaging" | "factual_accuracy" | "unsupported_claims" | "visual_consistency" | "accessibility" | "policy_violations",
      "severity": "critical" | "high" | "medium" | "low" | "informational",
      "excerpt": str,
      "explanation": str,
      "guideline_reference": str,
      "suggested_correction": str,
      "confidence": float
    }}
  ]
}}
"""
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                    json={
                        "model": settings.OPENAI_MODEL,
                        "messages": [
                            {"role": "system", "content": "You are a brand compliance auditor. Output only strict JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        "response_format": {"type": "json_object"},
                        "temperature": 0.2
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    content_str = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content_str)
                    raw_issues = parsed.get("issues", [])
                    issues = []
                    for idx, item in enumerate(raw_issues):
                        excerpt = item.get("excerpt", "")
                        start_pos = text.find(excerpt) if excerpt else 0
                        end_pos = start_pos + len(excerpt) if start_pos != -1 else 0
                        if start_pos == -1:
                            start_pos = 0
                            end_pos = len(text)
                        issues.append(DetectedIssue(
                            rule_id=item.get("rule_id", f"LLM-RULE-{idx+1}"),
                            category=item.get("category", "messaging"),
                            severity=item.get("severity", "medium"),
                            excerpt=excerpt,
                            start_pos=start_pos,
                            end_pos=end_pos,
                            explanation=item.get("explanation", ""),
                            guideline_reference=item.get("guideline_reference", "Brand Tone Guidelines"),
                            suggested_correction=item.get("suggested_correction", ""),
                            confidence=float(item.get("confidence", 0.9))
                        ))
                    score = float(parsed.get("compliance_score", 85.0))
                    summary = parsed.get("summary", "LLM brand evaluation complete.")
                    return score, issues, summary, self.provider_name
        except Exception:
            # Safe deterministic fallback
            pass

        local = LocalDeterministicProvider()
        return await local.analyze_content(text, brand_profile, content_type, has_visual, image_alt)

def get_analysis_provider(prefer_llm: bool = False) -> BaseAnalysisProvider:
    if prefer_llm and settings.AI_PROVIDER == "openai":
        provider = OpenAIProvider()
        if provider.is_available:
            return provider
    return LocalDeterministicProvider()
