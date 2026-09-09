import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class DetectedIssue(Base):
    __tablename__ = "detected_issues"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    analysis_id = Column(String(36), ForeignKey("code_analyses.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_id = Column(String(36), ForeignKey("code_files.id", ondelete="SET NULL"), nullable=True)
    file_path = Column(String(512), nullable=False)
    issue_type = Column(String(100), nullable=False, index=True)  # e.g., HIGH_CYCLOMATIC_COMPLEXITY, UNUSED_VARIABLE
    severity = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    line_number = Column(Integer, nullable=True)
    code_snippet = Column(Text, nullable=True)
    message = Column(Text, nullable=False)
    tool_name = Column(String(50), default="ast")  # ast, radon, ruff, bandit
    historical_occurrence_count = Column(Integer, default=1)
    detected_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    analysis = relationship("CodeAnalysis", back_populates="issues")
    user = relationship("User", back_populates="detected_issues")
    file = relationship("CodeFile", back_populates="issues")
