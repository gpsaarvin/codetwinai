from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.services.ast_analyzer import analyze_ast
from app.services.radon_analyzer import analyze_radon
from app.models.issue import DetectedIssue

async def run_full_code_analysis(
    file_path: str,
    code_content: str,
    user_id: str,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Run AST and Radon static analysis on source code.
    Lookup historical occurrence counts per user to seed Bug Pattern Memory.
    """
    # 1. AST Analysis
    ast_issues = analyze_ast(file_path, code_content)

    # 2. Radon Complexity Analysis
    radon_data = analyze_radon(file_path, code_content)
    radon_issues = radon_data["issues"]

    # Combine issues
    all_issues_raw = ast_issues + radon_issues

    # 3. Calculate historical occurrence count for each issue type for this user
    enriched_issues: List[Dict[str, Any]] = []

    for issue in all_issues_raw:
        issue_type = issue["issue_type"]

        # Count how many times this developer has committed this issue_type previously
        query = select(func.count(DetectedIssue.id)).where(
            DetectedIssue.user_id == user_id,
            DetectedIssue.issue_type == issue_type
        )
        result = await db.execute(query)
        past_count = result.scalar() or 0

        issue_copy = dict(issue)
        issue_copy["historical_occurrence_count"] = past_count + 1
        enriched_issues.append(issue_copy)

    return {
        "cyclomatic_complexity_avg": radon_data["cyclomatic_complexity_avg"],
        "maintainability_index_avg": radon_data["maintainability_index_avg"],
        "total_loc": radon_data["total_loc"],
        "total_issues_count": len(enriched_issues),
        "raw_metrics": {
            "sloc": radon_data.get("sloc", 0),
            "ast_issues_count": len(ast_issues),
            "radon_issues_count": len(radon_issues)
        },
        "issues": enriched_issues
    }
