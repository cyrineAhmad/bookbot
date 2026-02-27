from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ProfileResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    role: str
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True