import json
from app.agents.base import BaseAgent
from app.llm.local_llm import LocalLLM, Query
from app.config import VERIFIER_MODEL

SYSTEM_PROMPT = """
    You are a strict fact-checker and reviewer.
    Your job is to identify:
    - Factual errors
    - Unsupported claims
    - Logical gaps
    Respond in JSON only.
"""

def VerifierAgent(input_text: Query):
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
        system=SYSTEM_PROMPT
    )
    return LocalLLM(query)
