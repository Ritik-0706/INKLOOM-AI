from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.brand import BrandProfile
from app.core.config import settings
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatStatusResponse,
    TestConnectionRequest,
    TestConnectionResponse,
    PromptSuggestion,
)
from app.services.chat_service import (
    generate_chat_response,
    test_groq_connection,
    resolve_api_key,
    get_available_models,
    AVAILABLE_GROQ_MODELS,
    DEFAULT_GROQ_MODEL,
)

router = APIRouter()

SUGGESTED_PROMPTS: List[PromptSuggestion] = [
    PromptSuggestion(
        id="audit-headline",
        title="Check Headline Compliance",
        prompt="Review this marketing headline against our brand guidelines and highlight any violations or clichés: 'The world's #1 groundbreaking AI platform that guarantees 10x ROI overnight!'",
        category="compliance"
    ),
    PromptSuggestion(
        id="rewrite-tone",
        title="Rewrite in Brand Voice",
        prompt="Rewrite the following draft email announcement to sound confident, empathetic, and professional while adhering strictly to our tone of voice:\n\n'Hey folks, obviously you guys know our servers had a hiccup yesterday. Don't worry, our ninja devs fixed it ASAP. Hurry up and log back in!'",
        category="rewrite"
    ),
    PromptSuggestion(
        id="prohibited-words",
        title="List Prohibited Keywords",
        prompt="What are our active brand's prohibited terms and approved alternatives? Give me a quick reference cheat sheet.",
        category="guidelines"
    ),
    PromptSuggestion(
        id="verify-claims",
        title="Verify Factual Claims",
        prompt="Does our knowledge base substantiate the claim that our platform delivers 99.99% uptime and was founded in 2021?",
        category="claims"
    ),
    PromptSuggestion(
        id="draft-announcement",
        title="Draft Product Announcement",
        prompt="Draft a 2-paragraph LinkedIn announcement for our new enterprise governance feature, including mandatory beta disclaimer.",
        category="rewrite"
    ),
]

@router.get("/status", response_model=ChatStatusResponse)
def get_chat_status(
    current_user: User = Depends(get_current_user)
):
    """
    Check if the Groq AI service is configured and retrieve available models.
    """
    has_env_key = bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip())
    resolved = resolve_api_key()
    available = get_available_models(resolved)
    return ChatStatusResponse(
        is_configured=bool(resolved),
        model=settings.GROQ_MODEL or DEFAULT_GROQ_MODEL,
        available_models=available,
        has_env_key=has_env_key,
    )

@router.get("/suggested-prompts", response_model=List[PromptSuggestion])
def get_suggested_prompts(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve curated prompt starters for brand compliance and copy generation.
    """
    return SUGGESTED_PROMPTS

@router.post("/test-connection", response_model=TestConnectionResponse)
async def test_connection(
    request: TestConnectionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Test connectivity to Groq using the provided or configured API key.
    """
    success, message, model = await test_groq_connection(
        api_key=request.api_key,
        model=request.model
    )
    return TestConnectionResponse(
        success=success,
        message=message,
        model=model,
    )

@router.post("/message", response_model=ChatResponse)
async def send_chat_message(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit a prompt to Groq via LangChain, grounded in active brand guidelines.
    """
    brand: Optional[BrandProfile] = None
    if payload.brand_id:
        brand = db.query(BrandProfile).filter(
            BrandProfile.id == payload.brand_id,
            BrandProfile.organization_id == current_user.organization_id,
            BrandProfile.is_active == True
        ).first()
        if not brand:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Brand profile '{payload.brand_id}' not found in your organization."
            )

    try:
        reply_text, model_used = await generate_chat_response(
            message=payload.message,
            history=payload.history,
            brand=brand,
            api_key=payload.api_key,
            model=payload.model,
            temperature=payload.temperature or 0.7,
        )
        return ChatResponse(
            response=reply_text,
            model_used=model_used,
            brand_id=brand.id if brand else None,
            brand_name=brand.name if brand else None,
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        error_msg = str(e)
        if "invalid_api_key" in error_msg.lower() or "401" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Groq API key provided. Please verify your Groq API key."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Groq Chat error: {error_msg}"
        )
