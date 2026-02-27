from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.config import settings
from app.dependencies import get_current_user
import json

router = APIRouter()

# Initialize client only if key exists
client = None
if settings.GROQ_API_KEY:
    from groq import Groq
    client = Groq(api_key=settings.GROQ_API_KEY)

MODEL = "llama-3.3-70b-versatile"

class ChatMessage(BaseModel):
    message: str

class BookAutoFill(BaseModel):
    title: str

class SmartSearch(BaseModel):
    query: str

def ai_available():
    if not client:
        raise HTTPException(status_code=503, detail="AI features temporarily disabled")

@router.post("/chat")
async def chat_with_assistant(
    data: ChatMessage,
    current_user=Depends(get_current_user)
):
    ai_available()
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are BookBot, a helpful AI library assistant."},
                {"role": "user", "content": data.message}
            ]
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/autofill")
async def autofill_book(
    data: BookAutoFill,
    current_user=Depends(get_current_user)
):
    ai_available()
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "Return ONLY raw JSON with fields: author, genre, description, published_year, isbn. No markdown."},
                {"role": "user", "content": f"Book title: {data.title}"}
            ]
        )
        text = response.choices[0].message.content.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/smart-search")
async def smart_search(
    data: SmartSearch,
    current_user=Depends(get_current_user)
):
    ai_available()
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "Return ONLY raw JSON with fields: keywords, genre, author, year_from, year_to. No markdown."},
                {"role": "user", "content": data.query}
            ]
        )
        text = response.choices[0].message.content.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights")
async def get_insights(current_user=Depends(get_current_user)):
    ai_available()
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "Give brief, engaging library tips."},
                {"role": "user", "content": "Give me 3 short reading tips for today."}
            ]
        )
        return {"insights": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))