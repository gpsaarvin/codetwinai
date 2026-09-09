import ast
from typing import List, Dict, Any

class CodeASTAnalyzer(ast.NodeVisitor):
    def __init__(self, file_path: str, code_content: str):
        self.file_path = file_path
        self.lines = code_content.splitlines()
        self.issues: List[Dict[str, Any]] = []
        self.current_nesting = 0

    def analyze(self, tree: ast.AST):
        self.visit(tree)
        return self.issues

    def _get_snippet(self, lineno: int) -> str:
        if 1 <= lineno <= len(self.lines):
            return self.lines[lineno - 1].strip()
        return ""

    def visit_FunctionDef(self, node: ast.FunctionDef):
        # 1. Long function check (> 30 lines)
        func_length = (node.end_lineno - node.lineno + 1) if hasattr(node, 'end_lineno') and node.end_lineno else len(node.body)
        if func_length > 30:
            self.issues.append({
                "file_path": self.file_path,
                "issue_type": "LONG_FUNCTION",
                "severity": "MEDIUM",
                "line_number": node.lineno,
                "code_snippet": self._get_snippet(node.lineno),
                "message": f"Function '{node.name}' is too long ({func_length} lines). Consider splitting into smaller functions.",
                "tool_name": "ast"
            })

        # 2. High parameter count check (> 5 params)
        param_count = len(node.args.args)
        if param_count > 5:
            self.issues.append({
                "file_path": self.file_path,
                "issue_type": "EXCESSIVE_PARAMETERS",
                "severity": "LOW",
                "line_number": node.lineno,
                "code_snippet": self._get_snippet(node.lineno),
                "message": f"Function '{node.name}' has {param_count} parameters. Consider grouping parameters into a data structure.",
                "tool_name": "ast"
            })

        # 3. Missing docstring check
        if not ast.get_docstring(node) and not node.name.startswith("_"):
            self.issues.append({
                "file_path": self.file_path,
                "issue_type": "MISSING_DOCSTRING",
                "severity": "LOW",
                "line_number": node.lineno,
                "code_snippet": self._get_snippet(node.lineno),
                "message": f"Public function '{node.name}' is missing a docstring.",
                "tool_name": "ast"
            })

        # Track scope for unused variables
        assigned_vars: Dict[str, int] = {}
        used_vars: set = set()

        for body_node in ast.walk(node):
            if isinstance(body_node, ast.Name):
                if isinstance(body_node.ctx, ast.Store):
                    if body_node.id not in assigned_vars and not body_node.id.startswith("_"):
                        assigned_vars[body_node.id] = body_node.lineno
                elif isinstance(body_node.ctx, ast.Load):
                    used_vars.add(body_node.id)

        for var_name, lineno in assigned_vars.items():
            if var_name not in used_vars:
                self.issues.append({
                    "file_path": self.file_path,
                    "issue_type": "UNUSED_VARIABLE",
                    "severity": "LOW",
                    "line_number": lineno,
                    "code_snippet": self._get_snippet(lineno),
                    "message": f"Variable '{var_name}' is assigned but never read in function '{node.name}'.",
                    "tool_name": "ast"
                })

        self.generic_visit(node)

    def visit_ExceptHandler(self, node: ast.ExceptHandler):
        # Bare except handler or silent pass exception handling
        if node.type is None:
            self.issues.append({
                "file_path": self.file_path,
                "issue_type": "BARE_EXCEPT",
                "severity": "HIGH",
                "line_number": node.lineno,
                "code_snippet": self._get_snippet(node.lineno),
                "message": "Bare 'except:' clause catches all exceptions including SystemExit and KeyboardInterrupt. Specify explicit exception type.",
                "tool_name": "ast"
            })

        # Empty pass inside exception block
        if len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
            self.issues.append({
                "file_path": self.file_path,
                "issue_type": "SILENT_EXCEPTION",
                "severity": "HIGH",
                "line_number": node.lineno,
                "code_snippet": self._get_snippet(node.lineno),
                "message": "Exception block silently swallowed with 'pass'. Handle or log the exception explicitly.",
                "tool_name": "ast"
            })

        self.generic_visit(node)

    def visit_If(self, node: ast.If):
        self.current_nesting += 1
        if self.current_nesting > 3:
            self.issues.append({
                "file_path": self.file_path,
                "issue_type": "HIGH_NESTING_DEPTH",
                "severity": "MEDIUM",
                "line_number": node.lineno,
                "code_snippet": self._get_snippet(node.lineno),
                "message": f"Deeply nested block (level {self.current_nesting}). Refactor with guard clauses or helper functions.",
                "tool_name": "ast"
            })
        self.generic_visit(node)
        self.current_nesting -= 1

def analyze_ast(file_path: str, code_content: str) -> List[Dict[str, Any]]:
    """Parse Python source code and return AST-based detected issues."""
    try:
        tree = ast.parse(code_content, filename=file_path)
        analyzer = CodeASTAnalyzer(file_path, code_content)
        return analyzer.analyze(tree)
    except SyntaxError as se:
        return [{
            "file_path": file_path,
            "issue_type": "SYNTAX_ERROR",
            "severity": "CRITICAL",
            "line_number": se.lineno or 1,
            "code_snippet": str(se.text or "").strip(),
            "message": f"Syntax error in source code: {se.msg}",
            "tool_name": "ast"
        }]
    except Exception as e:
        return [{
            "file_path": file_path,
            "issue_type": "PARSE_ERROR",
            "severity": "HIGH",
            "line_number": 1,
            "code_snippet": "",
            "message": f"Failed to parse source file: {str(e)}",
            "tool_name": "ast"
        }]
