import os
import sys
from unittest.mock import AsyncMock, patch, MagicMock
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.brand import BrandProfile
from app.services.chat_service import (
    build_system_prompt,
    build_langchain_messages,
    generate_chat_response,
    resolve_api_key,
)
from app.schemas.chat import ChatMessage

client = TestClient(app)

@pytest.fixture
def auth_token():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@inkloom.ai", "password": "password123"}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    # Fallback to tester user registration
    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "chat_tester@example.com",
            "password": "StrongPassword123!",
            "full_name": "Chat Tester",
            "organization_name": "Test Org"
        }
    )
    return reg_response.json()["access_token"]

def test_chat_status_requires_auth():
    response = client.get("/api/v1/chat/status")
    assert response.status_code == 401

def test_chat_status_authenticated(auth_token):
    response = client.get(
        "/api/v1/chat/status",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "model" in data
    assert "available_models" in data
    assert "qwen/qwen3.8-27b" in data["available_models"]

def test_chat_suggested_prompts(auth_token):
    response = client.get(
        "/api/v1/chat/suggested-prompts",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    prompts = response.json()
    assert len(prompts) >= 4
    categories = [p["category"] for p in prompts]
    assert "compliance" in categories
    assert "rewrite" in categories

def test_chat_message_missing_key_returns_400(auth_token):
    # Ensure no API key in payload or config
    with patch("app.services.chat_service.resolve_api_key", return_value=None):
        response = client.post(
            "/api/v1/chat/message",
            json={"message": "Hello AI"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 400
        assert "Groq API key is not configured" in response.json()["detail"]

def test_build_system_prompt_with_brand():
    mock_brand = MagicMock(spec=BrandProfile)
    mock_brand.name = "Acme Corp"
    mock_brand.industry = "Fintech"
    mock_brand.description = "Global payment solutions"
    mock_brand.tone_voice = "Bold, transparent, authoritative"
    mock_brand.tone_rules = [{"rule": "No passive voice", "description": "Use active verbs"}]
    mock_brand.prohibited_terms = [{"term": "cheap", "reason": "Devalues quality", "suggestion": "cost-effective"}]
    mock_brand.preferred_terms = [{"term": "client", "replaces": ["customer"], "rationale": "High-touch"}]
    mock_brand.approved_facts = [{"claim": "Founded in 2020", "category": "Company"}]
    mock_brand.required_disclaimers = ["Past performance does not guarantee future results."]
    mock_brand.content_restrictions = ["No speculative price forecasts."]

    prompt = build_system_prompt(mock_brand)
    assert "Acme Corp" in prompt
    assert "Bold, transparent, authoritative" in prompt
    assert "No passive voice" in prompt
    assert "cheap" in prompt
    assert "cost-effective" in prompt
    assert "client" in prompt
    assert "Founded in 2020" in prompt
    assert "Past performance" in prompt

def test_build_langchain_messages():
    history = [
        ChatMessage(role="user", content="Hi"),
        ChatMessage(role="assistant", content="Hello! How can I help with your brand today?")
    ]
    msgs = build_langchain_messages("System instructions", history, "Is this copy compliant?")
    assert len(msgs) == 4
    assert msgs[0].content == "System instructions"
    assert msgs[1].content == "Hi"
    assert msgs[2].content == "Hello! How can I help with your brand today?"
    assert msgs[3].content == "Is this copy compliant?"

@pytest.mark.asyncio
async def test_generate_chat_response_mocked():
    with patch("app.services.chat_service.ChatGroq") as mock_groq_class:
        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.content = "Your headline is 100% compliant with brand guidelines."
        mock_instance.ainvoke = AsyncMock(return_value=mock_response)
        mock_groq_class.return_value = mock_instance

        reply, model = await generate_chat_response(
            message="Check headline",
            history=[],
            brand=None,
            api_key="gsk_mock_test_key_12345",
            model="qwen/qwen3.8-27b",
            temperature=0.5
        )

        assert "100% compliant" in reply
        assert model == "qwen/qwen3.8-27b"
        mock_instance.ainvoke.assert_awaited_once()

def test_chat_message_endpoint_mocked(auth_token):
    with patch("app.api.v1.chat.generate_chat_response", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = ("Brand voice looks great! Here are 2 alternatives.", "qwen/qwen3.8-27b")

        response = client.post(
            "/api/v1/chat/message",
            json={
                "message": "Rewrite this paragraph",
                "api_key": "gsk_test_mock",
                "model": "qwen/qwen3.8-27b"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "Brand voice looks great" in data["response"]
        assert data["model_used"] == "qwen/qwen3.8-27b"
