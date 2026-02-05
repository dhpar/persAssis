"""
SQLAlchemy database configuration and session management.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

# Database URL - using SQLite for local development
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./prompts.db"
)

# SQLAlchemy engine configuration
# Using check_same_thread=False for SQLite to allow multi-threaded access
# StaticPool keeps connections alive across requests
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    } if "sqlite" in DATABASE_URL else {},
    poolclass=StaticPool if "sqlite" in DATABASE_URL else None,
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Declarative base for ORM models
Base = declarative_base()


def get_db():
    """
    Dependency injection function for FastAPI route handlers.
    Provides a database session and ensures cleanup.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.
    Call this during application startup.
    """
    Base.metadata.create_all(bind=engine)
