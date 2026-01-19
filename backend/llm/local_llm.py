from ollama import ChatResponse, chat
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException

app = FastAPI()

class Query(BaseModel):
    prompt: str
    model: str = "llama2"
    system: str = ""

@app.post("/local_llm/")
def LocalLLM(query: Query):
    chatResponse: ChatResponse = chat(
        model= query.model, 
        messages=[
            { 'role': 'system', 'content': query.system },
            { 'role': 'user', 'content': query.prompt }
        ]
    )
    if not chatResponse or not chatResponse.done:
        raise HTTPException(
            status_code = 500, 
            detail = "No response from Ollama"
        )
    
    return chatResponse.message.content