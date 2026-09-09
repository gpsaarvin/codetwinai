from typing import Dict, Any, List
import radon.complexity as cc
import radon.metrics as mi
import radon.raw as raw

def analyze_radon(file_path: str, code_content: str) -> Dict[str, Any]:
    """
    Compute Cyclomatic Complexity and Maintainability Index using Radon.
    Returns summary metrics and complexity issues.
    """
    issues: List[Dict[str, Any]] = []
    lines = code_content.splitlines()

    def get_snippet(lineno: int) -> str:
        if 1 <= lineno <= len(lines):
            return lines[lineno - 1].strip()
        return ""

    # 1. Calculate Raw LOC metrics
    try:
        raw_stats = raw.analyze(code_content)
        loc = raw_stats.loc
        sloc = raw_stats.sloc
    except Exception:
        loc = len(lines)
        sloc = len([l for l in lines if l.strip() and not l.strip().startswith("#")])

    # 2. Calculate Maintainability Index (MI)
    try:
        maintainability_score = mi.mi_visit(code_content, multi=True)
    except Exception:
        maintainability_score = 100.0

    if maintainability_score < 50.0:
        issues.append({
            "file_path": file_path,
            "issue_type": "LOW_MAINTAINABILITY_INDEX",
            "severity": "HIGH",
            "line_number": 1,
            "code_snippet": "",
            "message": f"Maintainability Index is dangerously low ({maintainability_score:.2f}/100). Refactoring recommended.",
            "tool_name": "radon"
        })

    # 3. Calculate Cyclomatic Complexity (CC) per block/function
    total_complexity = 0.0
    blocks_count = 0

    try:
        cc_results = cc.cc_visit(code_content)
        for block in cc_results:
            total_complexity += block.complexity
            blocks_count += 1

            if block.complexity > 10:
                severity = "HIGH" if block.complexity > 15 else "MEDIUM"
                issues.append({
                    "file_path": file_path,
                    "issue_type": "HIGH_CYCLOMATIC_COMPLEXITY",
                    "severity": severity,
                    "line_number": block.lineno,
                    "code_snippet": get_snippet(block.lineno),
                    "message": f"Function or class '{block.name}' has high cyclomatic complexity ({block.complexity}). Rank: {block.rank}.",
                    "tool_name": "radon"
                })
    except Exception:
        pass

    avg_complexity = (total_complexity / blocks_count) if blocks_count > 0 else 1.0

    return {
        "cyclomatic_complexity_avg": round(avg_complexity, 2),
        "maintainability_index_avg": round(maintainability_score, 2),
        "total_loc": loc,
        "sloc": sloc,
        "issues": issues
    }
