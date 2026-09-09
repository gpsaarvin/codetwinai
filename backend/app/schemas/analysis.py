from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel
from app.schemas.issue import DetectedIssueResponse

class CodeAnalysisRequest(BaseModel):
    filename: Optional[str] = "main.py"
    code: str

class CodeAnalysisResponse(BaseModel):
    id: str
    status: str
    cyclomatic_complexity_avg: float
    maintainability_index_avg: float
    total_loc: int
    total_issues_count: int
    raw_metrics: Optional[Any] = None
    analyzed_at: datetime
    issues: List[DetectedIssueResponse] = []

    class Config:
        from_attributes = True

class DashboardSummaryResponse(BaseModel):
    total_analyses: int
    total_issues_found: int
    avg_cyclomatic_complexity: float
    avg_maintainability_index: float
    latest_analysis: Optional[CodeAnalysisResponse] = None
