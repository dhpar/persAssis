import os
from langchain.chat_models import init_chat_model

os.environ["OPENAI_API_KEY"] = "sk-..."

BaseAgent = init_chat_model("mistral", temperature=0.7)