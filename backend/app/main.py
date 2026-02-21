import time
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.applications import FastAPI
from pydantic import ValidationError
from pydantic.main import BaseModel
from starlette.exceptions import HTTPException
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from app.database import init_db
from app.graph.agent_graph import run_reasone_dagent_graph
from app.models.prompt_model import Prompt
from app.config import APP_MODE, VERIFIER_MODEL
from app.llm.local_llm import LocalLLM, Query
from app.schemas.prompt_schema import (
    PromptCreate, 
    PromptType, 
    PromptUpdate, 
    PromptResponse, 
    PromptList, 
    PromptActivateResponse
)

class UnicornException(Exception):
    def __init__(self, details: str, status_code: int = 500):
        self.details = details
        self.status_code = status_code

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    init_db()
    yield
    # Shutdown: No cleanup needed for SQLite


app = FastAPI(
    title="Local AI Assistant",
    description="Local-first, hybrid AI assistant with verification and tool routing",
    version="0.1.0",
    lifespan=lifespan,
)

origins = [
    "http://localhost",
    "http://localhost:5173/",
    "http://localhost:8000/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["DELETE,GET,POST,PUT"],
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
@app.exception_handler(UnicornException)
async def unicorn_exception_handler(request: Request, exc: UnicornException):
    return JSONResponse(
        status_code=exc.status_code if hasattr(exc, 'status_code') else 500,
        content={"message": f"Oops! something happened. {exc.details}"},
    )

@app.post("/prompt", response_model=AskResponse) 
def prompt(request: AskRequest):
    start_time = time.time()

    if not request.query or not request.query.strip():
        raise UnicornException(details="Query cannot be empty")

    try:
        result = run_reasone_dagent_graph(request.query)
    except Exception as e:
        raise UnicornException(status_code=500, details=f"Agent execution failed: {str(e)}")
        
    if result is None:
        raise UnicornException(details=f"Agent execution failed: Agent returned no result")

    latency = round(time.time() - start_time, 2)

    return AskResponse(
        answer=result,
        mode=APP_MODE,
        latency_seconds=latency,
    )

@app.post("/reason")
def reason(request: AskRequest):
    start_time = time.time()

    if not request.query or not request.query.strip():
        raise UnicornException(details="Query cannot be empty")

    try:
        reasonedAnswer = run_reasone_dagent_graph(request.query)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Agent execution failed: {str(e)}"
        )
    
    if reasonedAnswer is None:
        raise HTTPException(
            status_code=500,
            detail="Agent returned no result"
        )

    latency = round(time.time() - start_time, 2)

    return AskResponse(
        answer=reasonedAnswer,
        mode=APP_MODE,
        latency_seconds=latency,
    )

@app.post("verify")
def verify(request: AskRequest):
    start_time = time.time()

    prompt = f"""
        Review the following answer:
        \"\"\"
        {request.query}
        \"\"\"
        Respond with JSON:
        {{s
        "ok": true | false,
        "issues": "short explanation if false"
        }}
    """
    query = Query(
        prompt=prompt,
        model=VERIFIER_MODEL,
        system = """
            You are a strict fact-checker and reviewer.
            Your job is to identify:
            - Factual errors
            - Unsupported claims
            - Logical gaps
            Respond in JSON only.
        """
    )

    latency = round(time.time() - start_time, 2)

    if not request.query or not request.query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty"
        )
    try:
        reasonedAnswer = LocalLLM(query)
    except Exception as e:
        raise HTTPException( 
            status_code=500, 
            detail=f"Agent execution failed: {str(e)}"
        ) 
    else: 
        reasonedAnswer = run_reasone_dagent_graph(request.query)

    if reasonedAnswer is None:
        raise HTTPException(
            status_code=500,
            detail="Agent returned no result"
        )

    return AskResponse(
        answer=reasonedAnswer,
        mode=APP_MODE,
        latency_seconds=latency,
    )


# =============================
# PROMPT MANAGEMENT ENDPOINTS
# =============================

@app.get("/prompts", response_model=PromptList)
def list_prompts(
    prompt_type: Optional[PromptType] = PromptType.all,
    tags: Optional[str] = None, 
    page: int = 1,
    page_size: int = 10,
):
    """
    List all prompts with optional filtering by type and tags.
    Supports pagination.
    """
    # Use SessionLocal to get a database session
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        query = db.query(Prompt)
        
        if prompt_type is not None:
            query = query.filter(Prompt.type == prompt_type)
        
        if tags:
            # Simple substring search in tags
            query = query.filter(Prompt.tags.ilike(f"%{tags}%"))
        
        prompts = query.offset((page - 1) * page_size).limit(page_size).all()

        try:
            prompts = [PromptResponse.model_validate(prompt) for prompt in prompts]
        except ValidationError as exc:
            prompts = repr(exc.errors()[0]['msg'])
            
        return PromptList(
            total=query.count(),
            prompts=prompts,
            page=page,
            page_size=page_size,
        )
    finally:
        db.close()


@app.get("/prompts/{prompt_id}", response_model=PromptResponse)
def get_prompt(prompt_id: int):
    """
    Get a single prompt by ID.
    """
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        if not prompt:
            raise HTTPException(
                status_code=404,
                detail=f"Prompt with ID {prompt_id} not found"
            )
        return PromptResponse.model_validate(prompt)
    finally:
        db.close()


@app.post("/prompts", response_model=PromptResponse)
def create_prompt(request: PromptCreate):
    """
    Create a new prompt.
    If is_active=True and type already has an active prompt, 
    the old one will be deactivated.
    """
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        # If this prompt should be active, deactivate others of the same type
        if request.is_active:
            db.query(Prompt).filter(
                Prompt.type == request.type,
                Prompt.is_active == True
            ).update({"is_active": False})
        
        prompt = Prompt(
            title=request.title,
            content=request.content,
            type=request.type,
            version=1,
            tags=request.tags or "",
            is_active=request.is_active,
        )
        db.add(prompt)
        db.commit()
        db.refresh(prompt)
        return PromptResponse.model_validate(prompt)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create prompt: {str(e)}"
        )
    finally:
        db.close()


@app.put("/prompts/{prompt_id}", response_model=PromptResponse)
def update_prompt(prompt_id: int, request: PromptUpdate):
    """
    Update an existing prompt.
    """
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        if not prompt:
            raise HTTPException(
                status_code=404,
                detail=f"Prompt with ID {prompt_id} not found"
            )
        
        # Handle activation: if setting is_active=True, deactivate others
        if request.is_active is True:
            db.query(Prompt).filter(
                Prompt.type == (request.type or prompt.type),
                Prompt.id != prompt_id,
                Prompt.is_active == True
            ).update({"is_active": False})
        
        # Update fields
        update_data = request.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(prompt, field, value)
        
        # Increment version on content change
        # if "content" in update_data:
        #     prompt.version = (prompt.version or 1) + 1
        
        db.commit()
        db.refresh(prompt)
        return PromptResponse.model_validate(prompt)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update prompt: {str(e)}"
        )
    finally:
        db.close()


@app.delete("/prompts/{prompt_id}")
def delete_prompt(prompt_id: int):
    """
    Delete a prompt by ID.
    """
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        if not prompt:
            raise HTTPException(
                status_code=404,
                detail=f"Prompt with ID {prompt_id} not found"
            )
        
        db.delete(prompt)
        db.commit()
        return {"message": f"Prompt {prompt_id} deleted successfully"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to delete prompt: {str(e)}"
        )
    finally:
        db.close()


@app.patch("/prompts/{prompt_id}/activate", response_model=PromptActivateResponse)
def activate_prompt(prompt_id: int):
    """
    Activate a prompt and deactivate all other prompts of the same type.
    """
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        if not prompt:
            raise HTTPException(
                status_code=404,
                detail=f"Prompt with ID {prompt_id} not found"
            )

        # Deactivate all other prompts of the same type
        db.query(Prompt).filter(
            Prompt.type == prompt.type,
            Prompt.id != prompt_id,
            Prompt.is_active == True
        ).update({"is_active": False})
        
        # Activate this prompt
        db.query(Prompt).filter(Prompt.id == prompt_id).update({"is_active": True})
        db.commit()
        db.refresh(prompt)
        return PromptActivateResponse(
            id = prompt.id,
            title = prompt.title,
            type = prompt.type,
            is_active = prompt.is_active,
            message = f"Prompt '{prompt.title}' activated for type '{prompt.type}'"
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to activate prompt: {str(e)}"
        )
    finally:
        db.close()
