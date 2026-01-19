# Copilot Instructions for Local AI Assistant

## Project Overview
A local-first, privacy-aware AI assistant running on consumer hardware (GPU: RTX 4050+, RAM: 16GB+). The system uses sequential agent orchestration with built-in verification rather than parallel multi-agent execution.

**Core Philosophy**: Verifiability over blind generation, modularity over monoliths, local execution by default.

## Architecture Flow

```
User Query (FastAPI /prompt endpoint)
    ↓
ReasonerAgent (Qwen 2.5 7B via Ollama)
    ↓
VerifierAgent (Mistral 7B via Ollama) - fact-checks reasoning
    ↓
Feedback Loop (up to MAX_CORRECTION_LOOPS=1)
    ↓
Response returned with latency tracking
```

**Key Files**:
- [app/main.py](app/main.py) - FastAPI entry point, single `/prompt` endpoint
- [app/graph/agent_graph.py](app/graph/agent_graph.py) - Orchestration logic (ReasonerAgent → VerifierAgent correction loop)
- [app/agents/reasoner.py](app/agents/reasoner.py) - Primary LLM reasoning using LOCAL_MODEL
- [app/agents/verifier.py](app/agents/verifier.py) - Verification agent returning JSON verdict
- [app/llm/local_llm.py](app/llm/local_llm.py) - Generic Ollama wrapper for local LLM calls
- [app/config.py](app/config.py) - Model selection, token budgets, mode configuration

## Critical Patterns

### 1. Agent Design Pattern
All agents follow this structure:
```python
def AgentName(input_text: Query):
    system_prompt = "Define role and guardrails"
    user_prompt = "Task: {input_text} \n Instructions..."
    response = chat(model=MODEL_NAME, messages=[system, user])
    return response.message.content  # or parsed JSON
```

Agents interact via typed message passing using `Query` pydantic models. Always use typed inputs.

### 2. Verifier as Quality Gate
The VerifierAgent differs from reasoner:
- Responds **only in JSON**: `{"ok": bool, "issues": str}`
- Uses stricter verification model (Mistral vs Qwen)
- Triggered automatically after reasoning
- Feedback feeds back into a correction loop (currently 1 iteration max)

When adding new agents, consider if they need verification gates too.

### 3. Local LLM via Ollama
All LLM calls route through Ollama CLI interface (not API yet):
```python
from ollama import chat, ChatResponse
response = chat(model="model-name", messages=[...])
content = response.message.content
```

**No hardcoded API keys** - Ollama runs locally. The `sk-...` placeholder in base.py is a stub.

### 4. Configuration Management
- **APP_MODE**: "local" | "hybrid" (cloud fallback planned, not implemented)
- **Model Boundaries**: 
  - Reasoning: Qwen 2.5 7B (conversational, coding-aware)
  - Verification: Mistral 7B (stricter, JSON-compliant)
  - Max tokens: 2048 per call
- Token budgets in [app/config.py](app/config.py) define hardware constraints

## Development Workflow

### Running the Assistant
```bash
# Start Ollama locally (pulls models on first run)
ollama pull qwen2.5:7b-instruct
ollama pull mistral:7b-instruct
ollama serve  # Runs Ollama on localhost:11434

# In another terminal, start the FastAPI server
cd /home/david/coding/persAssis
python -m uvicorn app.main:app --reload
```

### Testing a Query
```bash
curl -X POST http://localhost:8000/prompt \
  -H "Content-Type: application/json" \
  -d '{"query": "Write a Python function to sort a list"}'
```

Response includes answer, mode, and latency_seconds.

## Planned Infrastructure: RAG & Tool Routing

These features are scoped but not yet implemented. Understand the design before building:

### RAG (Retrieval-Augmented Generation)
- **Entry point**: [../app/agents/tool_router.py](../app/agents/tool_router.py) (currently a stub)
- **Design pattern**: ReasonerAgent receives context from document retrieval before generating answer
- **Integration**: Query → `route_tools()` → retrieve docs → append to system prompt → ReasonerAgent
- **Example use case**: "What's the salary range for senior engineers at my company?" → retrieve job_docs.pdf → inject as context

### Tool Routing
- **Current state**: Decisions are hardcoded into system prompts
- **Future state**: Separate "tool decider" agent recommends tools (code search, job lookup, image gen)
- **Implementation path**: Add agent function `ToolDeciderAgent(query) -> List[Tool]` in [../app/agents/](../app/agents/), integrate into agent_graph.py before reasoning
- **Planned tools**: 
  - Code search (search Github/local repos)
  - Job discovery API (query job listings)
  - Image generation (Stable Diffusion 1.5 local or API fallback)

### Hybrid Routing (Local vs Cloud)
- **Current**: APP_MODE = "local" always uses Ollama
- **Future**: Analyze query intent → route to best provider
  - Simple queries → local Qwen (fast, private)
  - Complex reasoning → cloud GPT-4 (smarter, cloud-backed)
  - Image gen → local SD 1.5 if GPU available, else cloud
- **Config**: Extend [../app/config.py](../app/config.py) with cloud provider credentials and thresholds

## Known Constraints & Future Scope

**Implemented**: Local reasoning, verification, correction loops, latency tracking
**Planned**: RAG over documents, job discovery ranking, image generation (SD 1.5), hybrid routing
**Out of Scope** (for now): Parallel agents, video generation, voice, fully autonomous long-running tasks

## Code Style & Conventions

1. **Type Hints**: Use Pydantic models for API contracts (see Query, AskRequest, AskResponse)
2. **Error Handling**: FastAPI HTTPExceptions with descriptive detail messages
3. **Agent Returns**: Strings by default; JSON only when VerifierAgent-like role requires structured output
4. **Imports**: Organize by standard library → third-party (langchain, ollama, pydantic, fastapi) → local (app.*)

### System Prompt Examples

System prompts are explicit, role-based, and include guardrails. Customize by use case:

**For Coding Tasks** (replaces SYSTEM_PROMPT in reasoner.py):
```python
CODING_SYSTEM_PROMPT = """
You are an expert software engineer.
When writing code:
- Use type hints and docstrings
- Follow PEP 8 for Python
- Explain complex logic inline
- Suggest error handling patterns
Do not invent libraries that don't exist.
"""
```

**For Verification Tasks** (current pattern in verifier.py):
```python
VERIFIER_SYSTEM_PROMPT = """
You are a strict fact-checker and reviewer.
Identify:
- Factual errors
- Unsupported claims
- Logical gaps
Respond in JSON only: {"ok": bool, "issues": "short explanation if false"}
"""
```

**For Analysis/Reasoning** (general use, current reasoner.py):
```python
REASONING_SYSTEM_PROMPT = """
You are a senior technical analyst.
Be precise, factual, and explicit about uncertainty.
When unsure:
- Say "I don't know" rather than guess
- Suggest where to find the answer
Do not invent facts or statistics.
"""
```

**For Job Discovery** (planned agent):
```python
JOB_DISCOVERY_SYSTEM_PROMPT = """
You are a career advisor ranking job opportunities.
For each job:
- Summarize role, salary, growth
- Highlight alignment with user's skills
- Flag red flags (e.g., location misalignment)
Be concise; user will review details separately.
"""
```

**Pattern**: System prompt + user task together form the complete context. Keep system prompts under 150 words; add task-specific details in the user message.

## When Adding Features

- **New Agent?** Follow the [../app/agents/reasoner.py](../app/agents/reasoner.py) pattern; register in [../app/graph/agent_graph.py](../app/graph/agent_graph.py)
- **New Tool?** Implement in tool_router.py; integrate via system prompt or explicit tool-calling instruction
- **New LLM Integration?** Extend [../app/llm/local_llm.py](../app/llm/local_llm.py); avoid hardcoding API keys
- **Configuration Change?** Update [../app/config.py](../app/config.py); document hardware assumptions in Readme.md

## Debugging Tips

- **Ollama connection fails**: Verify `ollama serve` is running on localhost:11434
- **Model not found**: Run `ollama pull <model>` first
- **Verifier returns empty JSON**: Check system prompt enforces JSON response format
- **High latency**: Monitor GPU/VRAM usage; reduce MAX_LOCAL_TOKENS if OOM
