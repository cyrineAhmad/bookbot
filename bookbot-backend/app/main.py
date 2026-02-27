from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import books, borrowings, auth, ai, dashboard

app = FastAPI(title="BookBot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(books.router, prefix="/api/books", tags=["books"])
app.include_router(borrowings.router, prefix="/api/borrowings", tags=["borrowings"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])

@app.get("/")
async def root():
    return {"message": "BookBot API is running 🚀"}