from fastapi import APIRouter

router = APIRouter()

@router.get("/providers")
def list_providers():
    return {"providers": ["openai", "anthropic", "litellm"]}

@router.get("/usage")
def llm_usage():
    return {"usage": [], "total_cost": 0}

@router.get("/models")
def ml_models():
    return {"models": []}

@router.get("/experiments")
def ml_experiments():
    return {"experiments": []}
