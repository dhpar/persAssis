from enum import Enum

class Mode(str, Enum):
    LOCAL = "local"
    CLOUD = "cloud"
    HYBRID = "hybrid"


APP_MODE = Mode.LOCAL

LOCAL_MODEL = "qwen2.5:7b-instruct"
VERIFIER_MODEL = "mistral:7b-instruct"

MAX_LOCAL_TOKENS = 2048
CLOUD_TOKEN_BUDGET = 20_000
