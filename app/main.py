from fastapi import FastAPI

from app.database import database   # <-- Ye import add karo
from app.api.auth import router as auth_router
from app.api.user import router as user_router
from app.api.document import router as document_router
from app.api.chat import router as chat_router

app = FastAPI(
    title="AI Workspace",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "AI Workspace Running"
    }

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(document_router)
app.include_router(chat_router)