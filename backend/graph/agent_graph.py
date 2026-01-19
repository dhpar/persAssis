from app.agents.reasoner import ReasonerAgent
from app.agents.verifier import VerifierAgent
from app.llm.local_llm import Query
from fastapi import APIRouter

app = APIRouter()
MAX_CORRECTION_LOOPS = 1
ISSUES = "Unspecified issues detected"

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
        
        reasonedAnswer = ReasonerAgent(
            f"The previous answer had issues: {feedback}\n\n"
            f"Please correct it.\n\nOriginal question:\n{user_input}"
        )

    return reasonedAnswer
