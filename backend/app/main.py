from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import database
from app.api.auth import router as auth_router
from app.api.user import router as user_router
from app.api.document import router as document_router
from app.api.chat import router as chat_router
from app.api.chat_session import router as chat_session_router

app = FastAPI(
    title="AI Workspace",
    version="1.0.0"
)

# 1. Add CORS middleware immediately after app initialization
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "AI Workspace Running"
    }

# 2. Attach routers with standard prefixes
app.include_router(auth_router, prefix="/api", tags=["Auth"])
app.include_router(user_router, prefix="/api", tags=["Users"])
app.include_router(document_router, prefix="/api", tags=["Documents"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(chat_session_router, prefix="/api", tags=["Chat Sessions"])