from typing import List, Optional
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: 'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message text")

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User prompt or question")
    history: List[ChatMessage] = Field(default_factory=list, description="Previous messages in this session")
    brand_id: Optional[str] = Field(default=None, description="Optional Brand ID to ground the chatbot in specific guidelines")
    api_key: Optional[str] = Field(default=None, description="Optional custom Groq API key override")
    model: Optional[str] = Field(default=None, description="Optional Groq model override, e.g. llama-3.3-70b-versatile")
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0, description="Sampling temperature")

class ChatResponse(BaseModel):
    response: str
    model_used: str
    brand_id: Optional[str] = None
    brand_name: Optional[str] = None

class ChatStatusResponse(BaseModel):
    is_configured: bool
    model: str
    available_models: List[str]
    has_env_key: bool

class TestConnectionRequest(BaseModel):
    api_key: Optional[str] = None
    model: Optional[str] = None

class TestConnectionResponse(BaseModel):
    success: bool
    message: str
    model: str

class PromptSuggestion(BaseModel):
    id: str
    title: str
    prompt: str
    category: str
