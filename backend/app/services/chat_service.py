import os
import json
from typing import List, Optional, Tuple
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, BaseMessage
from langchain_groq import ChatGroq
from app.core.config import settings
from app.models.brand import BrandProfile
from app.schemas.chat import ChatMessage

# Recommended models on Groq
AVAILABLE_GROQ_MODELS = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "allam-2-7b",
]

DEFAULT_GROQ_MODEL = "qwen/qwen3.8-27b"

def get_available_models(api_key: Optional[str] = None) -> List[str]:
    """
    Dynamically discover available text models on the user's Groq account.
    """
    resolved_key = resolve_api_key(api_key)
    if not resolved_key:
        return AVAILABLE_GROQ_MODELS
    try:
        from groq import Groq
        client = Groq(api_key=resolved_key)
        models = client.models.list()
        chat_models = [
            m.id for m in models.data
            if "whisper" not in m.id.lower() and "guard" not in m.id.lower()
        ]
        if chat_models:
            preferred = (settings.GROQ_MODEL or DEFAULT_GROQ_MODEL).strip()
            if preferred in chat_models:
                chat_models.remove(preferred)
                chat_models.insert(0, preferred)
            return chat_models
    except Exception:
        pass
    return AVAILABLE_GROQ_MODELS

def resolve_api_key(custom_key: Optional[str] = None) -> Optional[str]:
    """
    Resolve Groq API key with priority:
    1. Explicit custom key from client request
    2. settings.GROQ_API_KEY from .env / config
    3. os.environ["GROQ_API_KEY"]
    """
    if custom_key and custom_key.strip():
        return custom_key.strip()
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip():
        return settings.GROQ_API_KEY.strip()
    env_key = os.environ.get("GROQ_API_KEY", "").strip()
    if env_key:
        return env_key
    return None

def build_system_prompt(brand: Optional[BrandProfile] = None) -> str:
    """
    Construct the brand-governance system prompt for the Groq model.
    If a BrandProfile is provided, inject its specific voice, rules, prohibited terms,
    preferred terminology, approved facts, and disclaimers.
    """
    base_prompt = (
        "You are Inkloom Copilot, an elite AI Brand Governance and Creative Compliance Assistant "
        "integrated into Inkloom AI SaaS. Your mission is to help marketing teams, copywriters, "
        "and brand managers produce 100% on-brand, factually corroborated, and policy-compliant content.\n\n"
        "Core Capabilities:\n"
        "1. Brand Voice Alignment: Ensure copy matches the brand's tone, style, and persona.\n"
        "2. Compliance & Governance: Identify prohibited terms, clichés, unverified claims, or missing disclosures.\n"
        "3. Copy Rewriting & Polishing: Rewrite user drafts into elegant, punchy, on-brand variations.\n"
        "4. Knowledge Grounding: Clarify corporate claims against approved brand facts.\n\n"
        "Formatting Guidelines:\n"
        "- Respond in clear, crisp Markdown with bullet points, headings, or blockquotes where helpful.\n"
        "- When suggesting copy revisions, offer 1-2 distinct alternatives (e.g. 'Option A: Direct & Bold', 'Option B: Empathetic & Polished').\n"
        "- Highlight any brand rule violations or warnings clearly.\n"
    )

    if not brand:
        return (
            base_prompt +
            "\nContext: No specific brand profile is currently selected. Operate as a general "
            "enterprise brand strategist, compliance reviewer, and editorial copilot."
        )

    # Compile brand specifics
    brand_context = [
        f"\n--- ACTIVE BRAND GUIDELINES: {brand.name} ---",
        f"Industry: {brand.industry or 'Technology'}",
        f"Description: {brand.description or 'Enterprise brand'}",
        f"Tone of Voice: {brand.tone_voice or 'Confident, professional, accessible'}",
    ]

    if brand.tone_rules and isinstance(brand.tone_rules, list):
        brand_context.append("Tone Rules:")
        for rule in brand.tone_rules:
            if isinstance(rule, dict):
                rule_name = rule.get("rule", "")
                rule_desc = rule.get("description", "")
                brand_context.append(f"  • {rule_name}: {rule_desc}")
            else:
                brand_context.append(f"  • {rule}")

    if brand.prohibited_terms and isinstance(brand.prohibited_terms, list):
        brand_context.append("Prohibited Terminology (NEVER use these; flag if found):")
        for term in brand.prohibited_terms:
            if isinstance(term, dict):
                t = term.get("term", "")
                reason = term.get("reason", "")
                sugg = term.get("suggestion", "")
                brand_context.append(f"  • \"{t}\" (Reason: {reason}) -> Suggest: \"{sugg}\"")
            else:
                brand_context.append(f"  • \"{term}\"")

    if brand.preferred_terms and isinstance(brand.preferred_terms, list):
        brand_context.append("Preferred Lexicon:")
        for pref in brand.preferred_terms:
            if isinstance(pref, dict):
                term = pref.get("term", "")
                replaces = ", ".join(pref.get("replaces", [])) if isinstance(pref.get("replaces"), list) else pref.get("replaces", "")
                rationale = pref.get("rationale", "")
                brand_context.append(f"  • Use \"{term}\" instead of [{replaces}] ({rationale})")
            else:
                brand_context.append(f"  • {pref}")

    if brand.approved_facts and isinstance(brand.approved_facts, list):
        brand_context.append("Verified Brand Facts & Approved Claims (Only corroborate these):")
        for fact in brand.approved_facts:
            if isinstance(fact, dict):
                claim = fact.get("claim", "")
                cat = fact.get("category", "")
                brand_context.append(f"  • [{cat}] {claim}")
            else:
                brand_context.append(f"  • {fact}")

    if brand.required_disclaimers and isinstance(brand.required_disclaimers, list):
        brand_context.append("Mandatory Disclaimers:")
        for disc in brand.required_disclaimers:
            brand_context.append(f"  • {json.dumps(disc) if isinstance(disc, dict) else disc}")

    if brand.content_restrictions and isinstance(brand.content_restrictions, list):
        brand_context.append("Content Restrictions:")
        for rest in brand.content_restrictions:
            brand_context.append(f"  • {json.dumps(rest) if isinstance(rest, dict) else rest}")

    brand_context.append("--- END OF ACTIVE BRAND GUIDELINES ---")
    brand_context.append(
        f"\nSTRICT INSTRUCTION: Apply {brand.name}'s rules, preferred lexicon, and tone of voice strictly. "
        "Whenever the user asks you to write, rewrite, or inspect copy, evaluate it against these exact guidelines."
    )

    return base_prompt + "\n" + "\n".join(brand_context)

def build_langchain_messages(
    system_prompt: str,
    history: List[ChatMessage],
    current_message: str
) -> List[BaseMessage]:
    """
    Convert system prompt, past conversation history, and current message into LangChain messages.
    """
    messages: List[BaseMessage] = [SystemMessage(content=system_prompt)]

    # Limit history to the last 15 messages to preserve context budget
    trimmed_history = history[-15:] if len(history) > 15 else history

    for item in trimmed_history:
        role = item.role.lower().strip()
        if role == "user":
            messages.append(HumanMessage(content=item.content))
        elif role == "assistant":
            messages.append(AIMessage(content=item.content))
        elif role == "system":
            messages.append(SystemMessage(content=item.content))

    messages.append(HumanMessage(content=current_message))
    return messages

async def generate_chat_response(
    message: str,
    history: List[ChatMessage],
    brand: Optional[BrandProfile] = None,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.7,
) -> Tuple[str, str]:
    """
    Invoke the Groq model through LangChain and return (response_text, model_name).
    """
    resolved_key = resolve_api_key(api_key)
    if not resolved_key:
        raise ValueError(
            "Groq API key is not configured. Please supply your API key in the chat settings "
            "or set GROQ_API_KEY in the backend .env configuration."
        )

    requested_model = (model or settings.GROQ_MODEL or DEFAULT_GROQ_MODEL).strip()
    if requested_model == "llama-3.3-70b-versatile" or not requested_model:
        selected_model = (settings.GROQ_MODEL or DEFAULT_GROQ_MODEL).strip()
    else:
        selected_model = requested_model

    system_prompt = build_system_prompt(brand)
    langchain_messages = build_langchain_messages(system_prompt, history, message)

    llm = ChatGroq(
        groq_api_key=resolved_key,
        model=selected_model,
        temperature=temperature,
        max_retries=2,
    )

    result = await llm.ainvoke(langchain_messages)
    return str(result.content), selected_model

async def test_groq_connection(api_key: Optional[str] = None, model: Optional[str] = None) -> Tuple[bool, str, str]:
    """
    Quick test of the Groq API key and model connectivity using a lightweight prompt.
    """
    resolved_key = resolve_api_key(api_key)
    if not resolved_key:
        return False, "Groq API key is missing.", (model or settings.GROQ_MODEL or DEFAULT_GROQ_MODEL)

    requested_model = (model or settings.GROQ_MODEL or DEFAULT_GROQ_MODEL).strip()
    if requested_model == "llama-3.3-70b-versatile" or not requested_model:
        selected_model = (settings.GROQ_MODEL or DEFAULT_GROQ_MODEL).strip()
    else:
        selected_model = requested_model
    try:
        llm = ChatGroq(
            groq_api_key=resolved_key,
            model=selected_model,
            temperature=0.1,
            max_tokens=30,
            max_retries=1,
        )
        test_msg = [HumanMessage(content="Respond with 'Connected' in one word.")]
        res = await llm.ainvoke(test_msg)
        return True, f"Successfully connected to Groq ({selected_model})! Response: {res.content.strip()}", selected_model
    except Exception as e:
        return False, f"Failed to connect to Groq: {str(e)}", selected_model
