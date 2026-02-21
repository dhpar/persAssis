from app.llm.local_llm import Query
from fastapi.routing import APIRouter
from app.agents import ReasonerAgent, VerifierAgent, BaseAgent
from app.prompts_loader import get_active_prompt

app = APIRouter()
MAX_CORRECTION_LOOPS = 1
ISSUES = "Unspecified issues detected"

# Default correction feedback prompt (fallback if none in database)
DEFAULT_CORRECTION_PROMPT = (
    "The previous answer had issues: {feedback}\n\n"
    "Please correct it.\n\nOriginal question:\n{user_input}"
)


@app.post("/reasoned")
def run_reasone_dagent_graph(user_input: str):
    reasonedAnswer = ReasonerAgent(user_input)

    if reasonedAnswer is None:
        return "No response generated"
    
    for _ in range(MAX_CORRECTION_LOOPS):
        if reasonedAnswer is None:
            break
        
        query = Query(prompt=reasonedAnswer)
        verdict = VerifierAgent(query)
        feedback = verdict.get("issues", ISSUES) if isinstance(verdict, dict) else ISSUES
        
        # Try to load correction prompt from database, fall back to default
        correction_template = get_active_prompt("correction_feedback") or DEFAULT_CORRECTION_PROMPT
        correction_message = correction_template.format(feedback=feedback, user_input=user_input)
        
        reasonedAnswer = ReasonerAgent(correction_message)

    return reasonedAnswer
