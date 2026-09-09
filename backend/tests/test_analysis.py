import pytest
from app.services.ast_analyzer import analyze_ast
from app.services.radon_analyzer import analyze_radon

SAMPLE_PYTHON_CODE = """
def calculate_total(items):
    # Long function with bare except and unused var
    unused_var = 100
    total = 0
    try:
        for item in items:
            if item > 0:
                if item > 10:
                    if item > 20:
                        if item > 30:
                            total += item
    except:
        pass
    return total
"""

def test_ast_analyzer_detects_issues():
    issues = analyze_ast("sample.py", SAMPLE_PYTHON_CODE)
    issue_types = [i["issue_type"] for i in issues]
    
    assert "BARE_EXCEPT" in issue_types or "SILENT_EXCEPTION" in issue_types
    assert "HIGH_NESTING_DEPTH" in issue_types
    assert "UNUSED_VARIABLE" in issue_types

def test_radon_analyzer_metrics():
    radon_res = analyze_radon("sample.py", SAMPLE_PYTHON_CODE)
    assert "cyclomatic_complexity_avg" in radon_res
    assert "maintainability_index_avg" in radon_res
    assert radon_res["total_loc"] > 0
