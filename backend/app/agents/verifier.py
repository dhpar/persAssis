from app.llm.local_llm import LocalLLM, Query
from app.config import VERIFIER_MODEL
from app.prompts_loader import get_active_prompt

# Default system prompt (fallback if none in database)
DEFAULT_SYSTEM_PROMPT = """
    You are a strict fact-checker and reviewer.
    Your job is to identify:
    - Factual errors
    - Unsupported claims
    - Logical gaps
    Respond in JSON only.
"""


def VerifierAgent(input_text: Query):
    # Try to load from database, fall back to default
    system_prompt = get_active_prompt("verifier_system") or DEFAULT_SYSTEM_PROMPT
    
    prompt = f"""
        Review the following answer:
        \"\"\"
        {input_text.prompt}
        \"\"\"
        Respond with JSON:
        {{
        "ok": true | false,
        "issues": "short explanation if false"
        }}
    """
    query = Query(
        prompt=prompt,
        model=VERIFIER_MODEL,
        system=system_prompt
    )
    return LocalLLM(query)
