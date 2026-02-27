from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class BorrowingCreate(BaseModel):
    book_id: UUID
    user_id: UUID

class BorrowingResponse(BaseModel):
    id: UUID
    book_id: UUID
    user_id: UUID
    borrowed_at: datetime
    due_date: Optional[datetime] = None
    returned_at: Optional[datetime] = None
    status: str
    borrower_name: Optional[str] = None

    class Config:
        from_attributes = True