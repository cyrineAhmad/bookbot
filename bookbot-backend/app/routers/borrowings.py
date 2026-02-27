from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from datetime import datetime, timedelta
from app.database import get_db
from app.models.book import Book
from app.models.borrowing import Borrowing
from app.models.user import Profile
from app.schemas.borrowing import BorrowingCreate, BorrowingResponse
from app.dependencies import get_current_user

router = APIRouter()

@router.get("", response_model=List[BorrowingResponse])
async def get_borrowings(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = await db.execute(select(Borrowing))
    borrowings = result.scalars().all()

    enriched = []
    for b in borrowings:
        profile_result = await db.execute(
            select(Profile).where(Profile.id == b.user_id)
        )
        profile = profile_result.scalar_one_or_none()
        borrower_name = profile.full_name or profile.email if profile else None

        enriched.append(BorrowingResponse(
            id=b.id,
            book_id=b.book_id,
            user_id=b.user_id,
            borrowed_at=b.borrowed_at,
            due_date=b.due_date,
            returned_at=b.returned_at,
            status=b.status,
            borrower_name=borrower_name,
        ))

    return enriched

@router.post("/borrow", response_model=BorrowingResponse)
async def borrow_book(
    data: BorrowingCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = await db.execute(select(Book).where(Book.id == data.book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.available_copies < 1:
        raise HTTPException(status_code=400, detail="No copies available")

    borrowing = Borrowing(
        book_id=data.book_id,
        user_id=data.user_id,
        due_date=datetime.utcnow() + timedelta(days=14)
    )
    book.available_copies -= 1

    db.add(borrowing)
    await db.commit()
    await db.refresh(borrowing)

    # Get borrower name
    profile_result = await db.execute(
        select(Profile).where(Profile.id == data.user_id)
    )
    profile = profile_result.scalar_one_or_none()
    borrower_name = profile.full_name or profile.email if profile else None

    return BorrowingResponse(
        id=borrowing.id,
        book_id=borrowing.book_id,
        user_id=borrowing.user_id,
        borrowed_at=borrowing.borrowed_at,
        due_date=borrowing.due_date,
        returned_at=borrowing.returned_at,
        status=borrowing.status,
        borrower_name=borrower_name,
    )

@router.put("/return/{borrowing_id}", response_model=BorrowingResponse)
async def return_book(
    borrowing_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = await db.execute(select(Borrowing).where(Borrowing.id == borrowing_id))
    borrowing = result.scalar_one_or_none()
    if not borrowing:
        raise HTTPException(status_code=404, detail="Borrowing record not found")
    if borrowing.status == "returned":
        raise HTTPException(status_code=400, detail="Book already returned")

    borrowing.status = "returned"
    borrowing.returned_at = datetime.utcnow()

    result = await db.execute(select(Book).where(Book.id == borrowing.book_id))
    book = result.scalar_one_or_none()
    if book:
        book.available_copies += 1

    await db.commit()
    await db.refresh(borrowing)

    return BorrowingResponse(
        id=borrowing.id,
        book_id=borrowing.book_id,
        user_id=borrowing.user_id,
        borrowed_at=borrowing.borrowed_at,
        due_date=borrowing.due_date,
        returned_at=borrowing.returned_at,
        status=borrowing.status,
        borrower_name=None,
    )