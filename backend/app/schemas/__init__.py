"""
Pydantic models for API request/response validation and serialization.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class PromptCreate(BaseModel):
    """
    Request model for creating a new prompt.
    """
    title: str = Field(..., min_length=1, max_length=255, description="Prompt title")
    content: str = Field(..., min_length=1, description="Prompt content/text")
    type: str = Field(..., min_length=1, max_length=100, description="Prompt type/category (e.g., 'reasoner_system')")
    tags: Optional[str] = Field(default="", description="Comma-separated tags")
    is_active: Optional[bool] = Field(default=False, description="Whether this is the active prompt for its type")


class PromptUpdate(BaseModel):
    """
    Request model for updating an existing prompt.
    All fields are optional.
    """
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    type: Optional[str] = Field(None, min_length=1, max_length=100)
    tags: Optional[str] = Field(None)
    is_active: Optional[bool] = None


class PromptResponse(BaseModel):
    """
    Response model for a single prompt.
    Includes all fields plus metadata.
    """
    id: int
    title: str
    content: str
    type: str
    tags: str
    version: int
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True  # Enable conversion from SQLAlchemy ORM to Pydantic


class PromptList(BaseModel):
    """
    Response model for listing prompts with pagination/filtering support.
    """
    total: int = Field(..., description="Total number of prompts")
    prompts: List[PromptResponse] = Field(default_factory=list, description="List of prompts")
    page: int = Field(default=1, description="Current page number")
    page_size: int = Field(default=10, description="Number of items per page")


class PromptActivateResponse(BaseModel):
    """
    Response model for activation endpoints.
    """
    id: int
    title: str
    type: str
    is_active: bool
    message: str = Field(..., description="Status message")
