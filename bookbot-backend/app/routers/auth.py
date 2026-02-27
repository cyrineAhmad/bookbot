from fastapi import APIRouter, Depends
from app.dependencies import get_current_user, get_current_profile

router = APIRouter()

@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
    }

@router.get("/profile")
async def get_profile(profile=Depends(get_current_profile)):
    return {
        "id": str(profile.id),
        "email": profile.email,
        "full_name": profile.full_name,
        "role": profile.role,
        "avatar_url": profile.avatar_url,
    }

@router.get("/token")
async def get_token(current_user=Depends(get_current_user)):
    return {
        "user_id": str(current_user.id),
        "email": current_user.email,
        "message": "Use this user_id for testing borrowings"
    }