"""Gemini client wrapper with Key Rotation and Auto-Failover."""

import logging
from src.core.config import settings
from src.llm.key_rotator import GeminiKeyRotator

logger = logging.getLogger("ai.gemini_client")


def _is_rate_limit_or_quota_error(e: Exception) -> bool:
    err_str = str(e).lower()
    err_type = type(e).__name__.lower()
    return any(term in err_str or term in err_type for term in ["429", "resourceexhausted", "quota", "rate limit", "too many requests"])


def generate_content(prompt: str, system_instruction: str | None = None) -> str:
    import google.generativeai as genai

    rotator = GeminiKeyRotator.get_instance()
    max_attempts = max(1, min(len(rotator.keys), 5)) if rotator.keys else 1
    last_error = None

    for attempt in range(max_attempts):
        key = rotator.get_next_key()
        genai.configure(api_key=key)
        try:
            try:
                model = genai.GenerativeModel(
                    model_name=settings.GEMINI_MODEL,
                    system_instruction=system_instruction,
                )
                response = model.generate_content(prompt)
            except TypeError:
                # Fallback for google-generativeai < 0.4.0
                model = genai.GenerativeModel(model_name=settings.GEMINI_MODEL)
                full_prompt = f"CHỈ DẪN HỆ THỐNG:\n{system_instruction}\n\n{prompt}" if system_instruction else prompt
                response = model.generate_content(full_prompt)
            try:
                usage = response.usage_metadata
                logger.info(
                    "gemini token_usage prompt=%s output=%s total=%s model=%s",
                    getattr(usage, "prompt_token_count", "?"),
                    getattr(usage, "candidates_token_count", "?"),
                    getattr(usage, "total_token_count", "?"),
                    settings.GEMINI_MODEL,
                )
            except Exception:
                pass
            return response.text or ""
        except Exception as e:
            last_error = e
            if _is_rate_limit_or_quota_error(e):
                rotator.report_rate_limit(key, cooldown_seconds=60.0)
                logger.warning("Gemini key rate-limited on attempt %d/%d. Retrying with next key...", attempt + 1, max_attempts)
                continue
            logger.error("Gemini generate_content error: %s", e)
            raise e

    if last_error:
        raise last_error
    return ""


def generate_content_stream(prompt: str, system_instruction: str | None = None):
    """Stream Gemini response token by token. Yields text chunks as they arrive."""
    import google.generativeai as genai

    rotator = GeminiKeyRotator.get_instance()
    key = rotator.get_next_key()
    genai.configure(api_key=key)

    try:
        try:
            model = genai.GenerativeModel(
                model_name=settings.GEMINI_MODEL,
                system_instruction=system_instruction,
            )
        except TypeError:
            model = genai.GenerativeModel(model_name=settings.GEMINI_MODEL)

        response = model.generate_content(prompt, stream=True)
        for chunk in response:
            try:
                text = chunk.text
                if text:
                    yield text
            except Exception:
                continue
    except Exception as e:
        if _is_rate_limit_or_quota_error(e):
            rotator.report_rate_limit(key, cooldown_seconds=60.0)
        logger.error("Gemini stream error: %s", e)
        raise


def chat_completion(messages: list[dict], model: str | None = None, temperature: float = 0.3) -> str:
    """Execute OpenAI-style chat messages against Gemini with key rotation and failover."""
    import google.generativeai as genai

    system_parts = [m.get("content", "") for m in messages if m.get("role") == "system" and m.get("content")]
    system_instruction = "\n\n".join(system_parts) if system_parts else None

    dialogue = [m for m in messages if m.get("role") != "system" and m.get("content")]
    if not dialogue:
        return ""

    prompt_parts = []
    if len(dialogue) == 1:
        prompt = dialogue[0]["content"]
    else:
        for msg in dialogue:
            role_label = "Assistant" if msg.get("role") == "assistant" else "User"
            prompt_parts.append(f"{role_label}: {msg['content']}")
        prompt = "\n\n".join(prompt_parts)

    target_model = model or settings.GEMINI_MODEL
    rotator = GeminiKeyRotator.get_instance()
    max_attempts = max(1, min(len(rotator.keys), 5)) if rotator.keys else 1

    for attempt in range(max_attempts):
        try:
            key = rotator.get_next_key()
        except Exception as e:
            logger.warning("No Gemini API key available: %s", e)
            return ""

        genai.configure(api_key=key)
        try:
            generation_config = genai.types.GenerationConfig(temperature=temperature)
            try:
                gen_model = genai.GenerativeModel(
                    model_name=target_model,
                    system_instruction=system_instruction,
                    generation_config=generation_config,
                )
                response = gen_model.generate_content(prompt)
            except TypeError:
                gen_model = genai.GenerativeModel(
                    model_name=target_model,
                    generation_config=generation_config,
                )
                full_prompt = f"CHỈ DẪN HỆ THỐNG:\n{system_instruction}\n\n{prompt}" if system_instruction else prompt
                response = gen_model.generate_content(full_prompt)
            return response.text or ""
        except Exception as e:
            if _is_rate_limit_or_quota_error(e):
                rotator.report_rate_limit(key, cooldown_seconds=60.0)
                logger.warning("Gemini rate limit hit on attempt %d/%d. Retrying...", attempt + 1, max_attempts)
                continue
            logger.error("Gemini chat_completion error (attempt %d/%d): %s", attempt + 1, max_attempts, e)
            if attempt == max_attempts - 1:
                return ""

    return ""


