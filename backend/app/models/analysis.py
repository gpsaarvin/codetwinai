import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Float, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class CodeAnalysis(Base):
    __tablename__ = "code_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    status = Column(String(50), default="COMPLETED")  # PENDING, PROCESSING, COMPLETED, FAILED
    cyclomatic_complexity_avg = Column(Float, default=0.0)
    maintainability_index_avg = Column(Float, default=0.0)
    total_loc = Column(Integer, default=0)
    total_issues_count = Column(Integer, default=0)
    raw_metrics = Column(JSON, nullable=True)
    analyzed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="analyses")
    project = relationship("Project", back_populates="analyses")
    issues = relationship("DetectedIssue", back_populates="analysis", cascade="all, delete-orphan")
