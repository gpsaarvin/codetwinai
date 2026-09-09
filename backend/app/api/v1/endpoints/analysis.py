from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.analysis import CodeAnalysis
from app.models.issue import DetectedIssue
from app.models.profile import DeveloperProfile
from app.schemas.analysis import CodeAnalysisRequest, CodeAnalysisResponse
from app.services.issue_detector import run_full_code_analysis

router = APIRouter()

@router.post("/upload", response_model=CodeAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_code_submission(
    file: Optional[UploadFile] = File(None),
    code: Optional[str] = Form(None),
    filename: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Determine code content and filename
    source_code = ""
    target_filename = filename or "script.py"

    if file:
        target_filename = file.filename or target_filename
        content_bytes = await file.read()
        source_code = content_bytes.decode("utf-8", errors="ignore")
    elif code:
        source_code = code
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either a file upload or code content string."
        )

    if not source_code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submitted code content cannot be empty."
        )

    # Execute Static Analysis Engine
    analysis_result = await run_full_code_analysis(
        file_path=target_filename,
        code_content=source_code,
        user_id=current_user.id,
        db=db
    )

    # Save Analysis summary record
    new_analysis = CodeAnalysis(
        user_id=current_user.id,
        status="COMPLETED",
        cyclomatic_complexity_avg=analysis_result["cyclomatic_complexity_avg"],
        maintainability_index_avg=analysis_result["maintainability_index_avg"],
        total_loc=analysis_result["total_loc"],
        total_issues_count=analysis_result["total_issues_count"],
        raw_metrics=analysis_result["raw_metrics"]
    )
    db.add(new_analysis)
    await db.flush()

    # Save Detected Issues
    saved_issues = []
    for issue_data in analysis_result["issues"]:
        issue_record = DetectedIssue(
            analysis_id=new_analysis.id,
            user_id=current_user.id,
            file_path=issue_data["file_path"],
            issue_type=issue_data["issue_type"],
            severity=issue_data["severity"],
            line_number=issue_data.get("line_number"),
            code_snippet=issue_data.get("code_snippet"),
            message=issue_data["message"],
            tool_name=issue_data["tool_name"],
            historical_occurrence_count=issue_data["historical_occurrence_count"]
        )
        db.add(issue_record)
        saved_issues.append(issue_record)

    # Update Developer Profile stats
    query_profile = select(DeveloperProfile).where(DeveloperProfile.user_id == current_user.id)
    res_prof = await db.execute(query_profile)
    profile = res_prof.scalar_one_or_none()
    if profile:
        profile.total_analyses_count += 1
        profile.total_issues_logged += len(saved_issues)

    await db.commit()

    # Re-query with loaded issues
    query_complete = (
        select(CodeAnalysis)
        .options(selectinload(CodeAnalysis.issues))
        .where(CodeAnalysis.id == new_analysis.id)
    )
    res_comp = await db.execute(query_complete)
    return res_comp.scalar_one()

@router.get("/{analysis_id}", response_model=CodeAnalysisResponse)
async def get_analysis_by_id(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(CodeAnalysis)
        .options(selectinload(CodeAnalysis.issues))
        .where(
            CodeAnalysis.id == analysis_id,
            CodeAnalysis.user_id == current_user.id
        )
    )
    result = await db.execute(query)
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    return analysis

@router.get("/", response_model=List[CodeAnalysisResponse])
async def list_user_analyses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(CodeAnalysis)
        .options(selectinload(CodeAnalysis.issues))
        .where(CodeAnalysis.user_id == current_user.id)
        .order_by(desc(CodeAnalysis.analyzed_at))
    )
    result = await db.execute(query)
    return result.scalars().all()
