from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class DetectedIssueResponse(BaseModel):
    id: str
    file_path: str
    issue_type: str
    severity: str
    line_number: Optional[int] = None
    code_snippet: Optional[str] = None
    message: str
    tool_name: str
    historical_occurrence_count: int = 1
    detected_at: datetime

    class Config:
        from_attributes = True
