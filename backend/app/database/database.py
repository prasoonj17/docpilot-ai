import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

from app.database.base import Base
from app.models.user import User

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback for local testing if env is missing
if not DATABASE_URL:
    DATABASE_URL = "postgresql://postgres:Prasoon%40123@localhost:5432/ai_workspace"

# Fix legacy dialect prefix if provided by hosting providers
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Ensure sslmode=require for Neon / remote cloud databases
if "neon.tech" in DATABASE_URL and "sslmode" not in DATABASE_URL:
    separator = "&" if "?" in DATABASE_URL else "?"
    DATABASE_URL = f"{DATABASE_URL}{separator}sslmode=require"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Pings connection before query; reconnects automatically if dropped
    pool_recycle=300,    # Recycles connections every 5 minutes to avoid stale idle sockets
    pool_size=5,
    max_overflow=10
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()