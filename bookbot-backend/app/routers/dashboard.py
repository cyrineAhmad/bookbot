from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.book import Book


router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """
    Basic dashboard statistics for the frontend.

    - totalBooks: total number of books
    - available: number of books with at least one available copy
    - borrowed: number of books with no available copies
    - reserved/lost/maintenance: placeholders for future use
    - aiInsights: hard-coded to 3 to match the three AI tips shown
    """
    total_books_result = await db.execute(select(func.count(Book.id)))
    total_books = total_books_result.scalar() or 0

    available_result = await db.execute(
        select(func.count(Book.id)).where(Book.available_copies > 0)
    )
    available = available_result.scalar() or 0

    borrowed_result = await db.execute(
        select(func.count(Book.id)).where(Book.available_copies == 0)
    )
    borrowed = borrowed_result.scalar() or 0

    return {
        "totalBooks": total_books,
        "available": available,
        "borrowed": borrowed,
        "reserved": 0,
        "lost": 0,
        "maintenance": 0,
        "aiInsights": 3,
    }

