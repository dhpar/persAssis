from ollama import ChatResponse, chat
from app.config import LOCAL_MODEL

SYSTEM_PROMPT = """
    You are a senior software engineer and technical assistant.
    Be precise, factual, and explicit about uncertainty.
    Do not invent facts.
"""

def ReasonerAgent(input_text: str):
    userPrompt = f"""
        Task: {input_text}
        Provide a clear, structured answer.
    """
    
    answer: ChatResponse = chat(
        model= LOCAL_MODEL, 
        messages= [
            { 'role': 'system', 'content': SYSTEM_PROMPT },
            { 'role': 'user', 'content': userPrompt }
        ]
    )
    if answer is None:
        return "No response generated"
    
    return answer.message.content
