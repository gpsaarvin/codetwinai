from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.analysis import CodeAnalysis
from app.schemas.analysis import DashboardSummaryResponse

router = APIRouter()

@router.get("/latest", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Total analysis count
    total_query = select(func.count(CodeAnalysis.id)).where(CodeAnalysis.user_id == current_user.id)
    total_analyses = (await db.execute(total_query)).scalar() or 0

    # Total issues found
    issues_query = select(func.sum(CodeAnalysis.total_issues_count)).where(CodeAnalysis.user_id == current_user.id)
    total_issues = (await db.execute(issues_query)).scalar() or 0

    # Averages
    avg_complexity_q = select(func.avg(CodeAnalysis.cyclomatic_complexity_avg)).where(CodeAnalysis.user_id == current_user.id)
    avg_complexity = (await db.execute(avg_complexity_q)).scalar() or 0.0

    avg_maintainability_q = select(func.avg(CodeAnalysis.maintainability_index_avg)).where(CodeAnalysis.user_id == current_user.id)
    avg_maintainability = (await db.execute(avg_maintainability_q)).scalar() or 100.0

    # Latest analysis run
    latest_q = (
        select(CodeAnalysis)
        .options(selectinload(CodeAnalysis.issues))
        .where(CodeAnalysis.user_id == current_user.id)
        .order_by(desc(CodeAnalysis.analyzed_at))
        .limit(1)
    )
    latest_analysis = (await db.execute(latest_q)).scalar_one_or_none()

    return {
        "total_analyses": total_analyses,
        "total_issues_found": total_issues,
        "avg_cyclomatic_complexity": round(float(avg_complexity), 2),
        "avg_maintainability_index": round(float(avg_maintainability), 2),
        "latest_analysis": latest_analysis
    }
