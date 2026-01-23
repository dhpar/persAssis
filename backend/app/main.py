import time
from fastapi.applications import FastAPI
from pydantic.main import BaseModel
from starlette.exceptions import HTTPException
from starlette.middleware.cors import CORSMiddleware
from backend.app.config import APP_MODE
from backend.app.graph.agent_graph import run_reasone_dagent_graph
from backend.app.agents import ReasonerAgent, VerifierAgent, BaseAgent

app = FastAPI(
    title="Local AI Assistant",
    description="Local-first, hybrid AI assistant with verification and tool routing",
    version="0.1.0",
)

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],

    allow_headers=["*"],
)

# -----------------------------
# Request / Response Schemas
# -----------------------------
class AskRequest(BaseModel):
    query: str


class AskResponse(BaseModel):
    answer: str
    mode: str
    latency_seconds: float

# -----------------------------
# Health Check
# ----------------------------- 
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "mode": APP_MODE,
    }

# -----------------------------
# Main Ask Endpoint
# -----------------------------
@app.post("/prompt", response_model=AskResponse) 
def prompt(request: AskRequest):
    start_time = time.time()

    if not request.query or not request.query.strip():
        raise HTTPException(
            status_code=400, 
            detail="Query cannot be empty"
        )

    try:
        result = run_reasone_dagent_graph(request.query)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Agent execution failed: {str(e)}"
        )

    if result is None:
        raise HTTPException(
            status_code=500,
            detail="Agent returned no result"
        )

    latency = round(time.time() - start_time, 2)

    return AskResponse(
        answer=result,
        mode=APP_MODE,
        latency_seconds=latency,
    )
