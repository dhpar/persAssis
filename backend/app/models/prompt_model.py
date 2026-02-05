"""
ORM models for database persistence.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from backend.app.database import Base


class Prompt(Base):
    """
    SQLAlchemy ORM model for storing prompts in the database.
    
    Attributes:
        id: Primary key (auto-incremented)
        title: Human-readable name for the prompt
        content: The actual prompt text/template
        type: Category of prompt (e.g., 'reasoner_system', 'verifier_system', 'correction_feedback')
        tags: Comma-separated tags for filtering and organization
        version: Version number for tracking prompt iterations
        created_at: Timestamp of creation
        updated_at: Timestamp of last modification
        is_active: Boolean flag to mark the active prompt for a given type (only one per type should be active)
    """
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    type = Column(String(100), nullable=False, index=True)
    tags = Column(String(500), default="")
    # versions = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=False, index=True)

    def __repr__(self):
        return f"<Prompt(id={self.id}, title='{self.title}', type='{self.type}', is_active={self.is_active})>"
