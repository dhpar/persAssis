# Local AI Assistant - Monorepo

A full-stack, local-first AI assistant with React frontend and FastAPI backend. Privacy-aware, verifiable, and designed for consumer hardware.

```
User (React UI)
    ↓
Frontend (React + TypeScript)
    ↓
Backend (FastAPI + Ollama)
    ↓
Local LLM (Qwen 2.5 7B / Mistral 7B)
```

## Project Structure

```
persAssis/
├── backend/           # FastAPI backend with agent orchestration
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── agents/
│   │   ├── graph/
│   │   └── llm/
│   ├── pyproject.toml
│   ├── setup.py
│   └── Readme.md
│
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── Readme.md
│
├── .github/           # Shared GitHub config
│   └── copilot-instructions.md (monorepo-level overview)
│
├── .gitignore         # Root gitignore
└── Readme.md          # This file
```

## Quick Start

### Prerequisites
- **Backend**: Python 3.10+, Ollama, 16GB RAM, NVIDIA RTX 4050+ GPU (recommended)
- **Frontend**: Node.js 18+, npm or yarn

### 1. Start Ollama (Local LLM)

```bash
# Pull models (one-time)
ollama pull qwen2.5:7b-instruct
ollama pull mistral:7b-instruct

# Start Ollama server
ollama serve
# Runs on localhost:11434
```

### 2. Start Backend

```bash
cd backend
pip install -e .  # Install dependencies
python -m uvicorn app.main:app --reload
# Runs on http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### 3. Start Frontend

In another terminal:

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

Open http://localhost:3000 in your browser.

## Core Features

### Backend (AI Logic)
- **Local Reasoning**: Qwen 2.5 7B for conversational, coding-aware responses
- **Verification**: Mistral 7B fact-checks all outputs (verifiability > blind generation)
- **Correction Loop**: Up to 1 iteration of self-correction based on feedback
- **FastAPI**: Single `/prompt` endpoint, latency tracking, health checks
- **Planned**: RAG (retrieval-augmented generation), tool routing, hybrid mode

### Frontend (User Interface)
- **React 18 + TypeScript**: Type-safe component architecture
- **Tailwind CSS**: Responsive, modern UI
- **Query History**: Persists queries with responses and metadata
- **Backend Health**: Real-time status indicator
- **Axios API Client**: Strongly typed backend communication

## Development

### Backend Development

```bash
cd backend

# Install in dev mode
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black app/
ruff check app/

# Type check
mypy app/
```

See [backend/Readme.md](backend/Readme.md) for detailed instructions.

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run dev server with hot reload
npm start

# Build for production
npm run build

# Run tests
npm test
```

See [frontend/Readme.md](frontend/Readme.md) for detailed instructions.

## Configuration

### Backend Config
Edit `backend/app/config.py`:
```python
LOCAL_MODEL = "qwen2.5:7b-instruct"  # Reasoning model
VERIFIER_MODEL = "mistral:7b-instruct"  # Verification model
MAX_LOCAL_TOKENS = 2048
APP_MODE = Mode.LOCAL  # or HYBRID (planned)
```

### Frontend Config
Edit `frontend/.env` (optional):
```
REACT_APP_API_URL=http://localhost:8000
```

## API Reference

### POST `/prompt`
Send a query to the AI assistant.

**Request:**
```json
{
  "query": "Write a Python function to merge two sorted lists"
}
```

**Response:**
```json
{
  "answer": "Here's a Python function...",
  "mode": "local",
  "latency_seconds": 2.34
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "mode": "local"
}
```

## Known Constraints

- **Hardware**: Models optimized for RTX 4050 (6GB VRAM). Use smaller models (3B-7B quantized) for 8GB.
- **Sequential Execution**: Agents run one at a time, not in parallel
- **Single Correction Loop**: Verifier feedback triggers max 1 re-reasoning attempt
- **Local LLM Only**: Cloud models planned but not yet implemented

## Future Roadmap

**Planned**:
- RAG (Retrieval-Augmented Generation) over documents
- Tool routing (code search, job discovery, image generation)
- Hybrid routing (local vs. cloud per query type)
- Image generation (Stable Diffusion 1.5)
- Job discovery and ranking

**Out of Scope** (for now):
- Parallel multi-agent execution
- Video generation
- Voice assistant
- Real-time streaming

## Architecture Philosophy

**Verifiability over blind generation** - Every answer is fact-checked by an independent model.

**Modularity over monoliths** - Agents, tools, and models are swappable.

**Local execution by default** - Privacy and latency > cloud dependency.

**Explicit constraints** - Hardware limits and token budgets are non-negotiable design decisions.

## Troubleshooting

### Backend Issues
- **Ollama connection fails**: Ensure `ollama serve` is running on `localhost:11434`
- **Model not found**: Run `ollama pull <model>` first
- **High latency**: Monitor GPU usage; consider smaller models if VRAM is exhausted

### Frontend Issues
- **Backend unreachable**: Verify backend is running on `localhost:8000`
- **Slow responses**: Check network latency and backend GPU utilization
- **TypeScript errors**: Ensure all types are properly imported and defined

## Code Style

- **Backend**: PEP 8, type hints via Pydantic, explicit error handling
- **Frontend**: React.FC<Props> type annotations, Tailwind utilities, TypeScript strict mode

## Copilot Instructions

- Backend: [backend/.github/copilot-instructions.md](backend/.github/copilot-instructions.md)
- Frontend: [frontend/.github/copilot-instructions.md](frontend/.github/copilot-instructions.md)

These documents guide AI coding agents on architecture, patterns, and best practices specific to each layer.

## Contributing

1. Create a feature branch
2. Make changes in `backend/` and/or `frontend/` as needed
3. Test thoroughly (see Development section)
4. Submit a pull request

## License

MIT

## Support

For issues or questions:
1. Check the backend [Readme](backend/Readme.md) or frontend [Readme](frontend/Readme.md)
2. Review copilot instructions for architecture details
3. Check existing GitHub issues

---

**Built with**: React, FastAPI, Ollama, Tailwind CSS, TypeScript

## 3. Architecture Overview
High-Level Flow
```
User Input
   ↓
Intent Classifier
   ↓
Primary Reasoner (Local LLM)
   ↓
Verifier Agent (Independent LLM)
   ↓
Pass → Final Response
Fail → Correction Loop → Reasoner

Tool Routing (Optional)
Reasoner
   ↓
Tool Router
   ├── Job Scraper
   ├── Code Analyzer
   └── Image Generator
```

Key Design Rule

A model that generates an answer must never be the same model that verifies it.

## 4. Repository Structure
```
local-ai-assistant/
│
├── README.md
├── pyproject.toml
├── .env.example
│
├── app/
│   ├── main.py                # FastAPI entrypoint
│   ├── config.py              # Global configuration
│   │
│   ├── agents/
│   │   ├── base.py
│   │   ├── reasoner.py
│   │   ├── verifier.py
│   │   └── tool_router.py
│   │
│   ├── graph/
│   │   ├── agent_graph.py
│   │   └── state.py
│   │
│   ├── llm/
│   │   ├── local_llm.py
│   │   ├── cloud_llm.py
│   │   └── hybrid_router.py
│   │
│   ├── tools/
│   │   ├── jobs.py
│   │   ├── code.py
│   │   └── images.py
│   │
│   ├── memory/
│   │   ├── vector_store.py
│   │   └── embeddings.py
│   │
│   └── ui/
│       └── api.py
│
├── data/
│   ├── documents/             # PDFs, notes, docs
│   ├── vectors/               # Embedding storage
│   └── job_cache/             # Scraped job data
│
└── scripts/
    ├── ingest_docs.py
    └── scrape_jobs.py
```

## 5. Models (Recommended Defaults)
Language Models (Local)
Primary Reasoner
- Qwen2.5 7B Instruct (Q4_K_M)
- DeepSeek-Coder 6.7B (Q4)
- Verifier
- Mistral 7B Instruct
- Phi-3 Medium (CPU-friendly)

Embeddings
- bge-small-en
- e5-small

Image Generation
- Stable Diffusion 1.5
- ComfyUI or AUTOMATIC1111 (external process)

## 6. Environment Setup
6.1 Python Environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -U pip

6.2 Install Dependencies
pip install fastapi uvicorn pydantic python-dotenv
pip install sentence-transformers qdrant-client


(LLM backends such as llama.cpp or ollama are run separately.)

## 7. Configuration
.env.example
APP_MODE=HYBRID

# Cloud (optional)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Token safety limits
CLOUD_TOKEN_BUDGET=20000

config.py (Excerpt)
from enum import Enum

class Mode(str, Enum):
    LOCAL = "local"
    CLOUD = "cloud"
    HYBRID = "hybrid"

APP_MODE = Mode.HYBRID

LOCAL_MODEL = "qwen2.5-7b-instruct-q4"
VERIFIER_MODEL = "mistral-7b-instruct"

MAX_LOCAL_TOKENS = 2048
CLOUD_TOKEN_BUDGET = 20_000

## 8. Running the App (FastAPI)
### 8.1 Start Local LLM Backend

Run your LLM via ollama or llama.cpp before starting the API.

Example (Ollama):

ollama run qwen2.5:7b-instruct

### 8.2 Start FastAPI Server
uvicorn app.main:app --reload


Server will start at:

http://localhost:8000

API Docs (Swagger):
http://localhost:8000/docs

## 9. Example API Usage
POST /ask
{
  "query": "Review this React hook for performance issues"
}

Response Flow

Intent classification

Local reasoning

Verification

Final response (or correction loop)

## 10. Hybrid Local + Cloud Mode
Routing Rules (Default)
Task Type	Execution
Coding	Local
Reasoning	Local
Verification	Local
Large context (>8k tokens)	Cloud
Video	Cloud
Image	Local

Cloud usage:

Is explicit

Is rate-limited

Never triggers silently

## 11. What Not to Build (Yet)

Video generation locally

Voice interfaces

Autonomous agents

Parallel agent execution

These features add complexity without proportional value on limited hardware.

## 12. Scaling the Project Later

The repository is designed so you can:

Add new agents without touching existing ones

Swap LLM backends (local ↔ cloud)

Add new tools (video, voice, search)

Upgrade hardware without architectural changes

## 13. Guiding Principle

Your advantage is architecture and discipline, not model size.

This project is intentionally conservative, debuggable, and extensible.