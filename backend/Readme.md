# Local AI Assistant - Backend

The backend provides the core AI reasoning, verification, and orchestration logic via FastAPI.

## Quick Start

### Prerequisites
- Python 3.10+
- Ollama (for local LLM inference)
- 16GB RAM, NVIDIA RTX 4050+ GPU (recommended)

### Installation

```bash
cd backend
pip install -e .  # Install in development mode
```

### Setup Local LLM

```bash
# Start Ollama
ollama serve

# In another terminal, pull models
ollama pull qwen2.5:7b-instruct
ollama pull mistral:7b-instruct
```

### Run FastAPI Server

```bash
cd backend
python -m uvicorn app.main:app --reload
```

Server will start at `http://localhost:8000`

API Docs (Swagger): `http://localhost:8000/docs`

## Architecture

The backend uses sequential agent orchestration:

1. **ReasonerAgent** (Qwen 2.5 7B) - Generates initial response
2. **VerifierAgent** (Mistral 7B) - Fact-checks the output
3. **Correction Loop** - Re-reasons if verification fails

For detailed architecture, see [Copilot Instructions](./github/copilot-instructions.md).

## API Endpoints

### POST `/prompt`

Send a query to the AI assistant.

**Request:**
```json
{
  "query": "Write a Python function to sort a list"
}
```

**Response:**
```json
{
  "answer": "Here's a Python function...",
  "mode": "local",
  "latency_seconds": 2.45
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

## Configuration

Edit `app/config.py` to change:
- Local model (default: `qwen2.5:7b-instruct`)
- Verifier model (default: `mistral:7b-instruct`)
- Max tokens per call (default: 2048)
- APP_MODE (local | hybrid)

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black app/
ruff check app/
```

### Type Checking

```bash
mypy app/
```

## Environment Variables

Create a `.env` file (optional):

```bash
# App mode
APP_MODE=local

# Cloud credentials (if using hybrid mode)
OPENAI_API_KEY=your_key_here
```

## Debugging

- **Ollama connection fails**: Ensure `ollama serve` is running on `localhost:11434`
- **Model not found**: Run `ollama pull <model>` first
- **High latency**: Check GPU/VRAM usage and reduce `MAX_LOCAL_TOKENS` if needed

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Configuration
│   ├── agents/
│   │   ├── reasoner.py
│   │   ├── verifier.py
│   │   └── tool_router.py
│   ├── graph/
│   │   └── agent_graph.py   # Orchestration
│   └── llm/
│       └── local_llm.py
├── pyproject.toml           # Project metadata & dependencies
├── setup.py                 # Traditional setup script
└── Readme.md               # This file
```

## See Also

- Root README: [../../Readme.md](../../Readme.md)
- Frontend: [../../frontend/](../../frontend/)
