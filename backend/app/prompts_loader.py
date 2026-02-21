"""
Utility functions for loading and managing prompts from the database.
"""
from typing import Optional
from app.database import SessionLocal
from app.models.prompt_model import Prompt


def get_active_prompt(prompt_type: str) -> Optional[str]:
    """
    Retrieve the active prompt content for a given type from the database.
    Returns the prompt content if found and active, otherwise returns None.
    
    Args:
        prompt_type: The type of prompt to retrieve (e.g., 'reasoner_system', 'verifier_system')
    
    Returns:
        The prompt content string if found and active, None otherwise
    """
    db = SessionLocal()
    try:
        prompt = db.query(Prompt).filter(
            Prompt.type == prompt_type,
            Prompt.is_active == True
        ).first()
        return str(prompt.content) if prompt else None
    except Exception as e:
        print(f"Error retrieving prompt {prompt_type}: {e}")
        return None
    finally:
        db.close()


def get_prompt_by_id(prompt_id: int) -> Optional[str]:
    """
    Retrieve a prompt's content by its ID.
    
    Args:
        prompt_id: The ID of the prompt
    
    Returns:
        The prompt content string if found, None otherwise
    """
    db = SessionLocal()
    try:
        prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        return str(prompt.content) if prompt else None
    except Exception as e:
        print(f"Error retrieving prompt {prompt_id}: {e}")
        return None
    finally:
        db.close()


def get_prompt_metadata(prompt_type: str) -> Optional[dict]:
    """
    Retrieve full metadata for the active prompt of a given type.
    
    Args:
        prompt_type: The type of prompt to retrieve
    
    Returns:
        A dictionary with prompt metadata (id, title, content, etc.) if found, None otherwise
    """
    db = SessionLocal()
    try:
        prompt = db.query(Prompt).filter(
            Prompt.type == prompt_type,
            Prompt.is_active == True
        ).first()
        if prompt:
            return {
                "id": prompt.id,
                "title": prompt.title,
                "content": prompt.content,
                "type": prompt.type,
                "tags": prompt.tags,
                "version": prompt.version,
                "is_active": prompt.is_active,
            }
        return None
    except Exception as e:
        print(f"Error retrieving prompt metadata for {prompt_type}: {e}")
        return None
    finally:
        db.close()
