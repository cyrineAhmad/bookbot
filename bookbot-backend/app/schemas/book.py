from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class BookBase(BaseModel):
    title: str
    author: str
    isbn: Optional[str] = None
    genre: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    published_year: Optional[int] = None
    total_copies: Optional[int] = 1

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    genre: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    published_year: Optional[int] = None
    total_copies: Optional[int] = None

class BookResponse(BookBase):
    id: UUID
    available_copies: int
    created_at: datetime

    class Config:
        from_attributes = True