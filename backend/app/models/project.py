import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    primary_language = Column(String(50), default="python")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="projects")
    files = relationship("CodeFile", back_populates="project", cascade="all, delete-orphan")
    analyses = relationship("CodeAnalysis", back_populates="project", cascade="all, delete-orphan")

class CodeFile(Base):
    __tablename__ = "code_files"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(512), nullable=False)
    filename = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    line_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    project = relationship("Project", back_populates="files")
    issues = relationship("DetectedIssue", back_populates="file", cascade="all, delete-orphan")
