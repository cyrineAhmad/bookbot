from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True)
    email = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="member")
    avatar_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())