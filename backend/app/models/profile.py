import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class DeveloperProfile(Base):
    __tablename__ = "developer_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    overall_score = Column(Float, default=100.0)
    total_analyses_count = Column(Integer, default=0)
    total_issues_logged = Column(Integer, default=0)
    primary_language = Column(String(50), default="python")
    last_updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="profile")
    skill_scores = relationship("SkillScore", back_populates="profile", cascade="all, delete-orphan")

class SkillScore(Base):
    __tablename__ = "skill_scores"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    profile_id = Column(String(36), ForeignKey("developer_profiles.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)  # code_quality, complexity, error_handling, testing, consistency
    score = Column(Float, default=100.0)
    weight = Column(Float, nullable=False)
    calculated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    profile = relationship("DeveloperProfile", back_populates="skill_scores")
