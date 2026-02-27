from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List, Optional
from uuid import UUID
from app.database import get_db
from app.models.book import Book
from app.schemas.book import BookCreate, BookUpdate, BookResponse
from app.dependencies import get_current_user, require_role

router = APIRouter()

@router.get("", response_model=List[BookResponse])
async def get_books(
    search: Optional[str] = None,
    genre: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = select(Book)
    if search:
        query = query.where(
            or_(
                Book.title.ilike(f"%{search}%"),
                Book.author.ilike(f"%{search}%"),
                Book.isbn.ilike(f"%{search}%")
            )
        )
    if genre:
        query = query.where(Book.genre.ilike(f"%{genre}%"))

    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{book_id}", response_model=BookResponse)
async def get_book(
    book_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.post("/", response_model=BookResponse)
async def create_book(
    book_data: BookCreate,
    db: AsyncSession = Depends(get_db),
    profile=Depends(require_role("admin", "librarian"))
):
    book = Book(
        **book_data.model_dump(),
        available_copies=book_data.total_copies,
        added_by=profile.id
    )
    db.add(book)
    await db.commit()
    await db.refresh(book)
    return book

@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: UUID,
    book_data: BookUpdate,
    db: AsyncSession = Depends(get_db),
    profile=Depends(require_role("admin", "librarian"))
):
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    for key, value in book_data.model_dump(exclude_unset=True).items():
        setattr(book, key, value)

    await db.commit()
    await db.refresh(book)
    return book

@router.delete("/{book_id}")
async def delete_book(
    book_id: UUID,
    db: AsyncSession = Depends(get_db),
    profile=Depends(require_role("admin"))
):
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    await db.delete(book)
    await db.commit()
    return {"message": "Book deleted successfully"}