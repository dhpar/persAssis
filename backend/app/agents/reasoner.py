from backend.app.config import LOCAL_MODEL
from backend.app.prompts_loader import get_active_prompt
from ollama import ChatResponse, chat

# Default system prompt (fallback if none in database)
DEFAULT_SYSTEM_PROMPT = """
    You are a senior software engineer and technical assistant.
    Be precise, factual, and explicit about uncertainty.
    Do not invent facts or make assumptions.
"""


def ReasonerAgent(input_text: str):
    # Try to load from database, fall back to default
    system_prompt = get_active_prompt("reasoner_system") or DEFAULT_SYSTEM_PROMPT
    
    userPrompt = f"""
        Task: {input_text}
        Provide a clear, structured answer.
    """
    
    answer: ChatResponse = chat(
        model=LOCAL_MODEL, 
        messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': userPrompt}
        ]
    )
    if answer is None:
        return "No response generated"
    
    return answer.message.content
