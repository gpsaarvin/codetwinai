export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DetectedIssue {
  id: string;
  file_path: string;
  issue_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  line_number?: number;
  code_snippet?: string;
  message: string;
  tool_name: string;
  historical_occurrence_count: number;
  detected_at: string;
}

export interface CodeAnalysis {
  id: string;
  status: string;
  cyclomatic_complexity_avg: number;
  maintainability_index_avg: number;
  total_loc: number;
  total_issues_count: number;
  raw_metrics?: any;
  analyzed_at: string;
  issues: DetectedIssue[];
}

export interface DashboardSummary {
  total_analyses: number;
  total_issues_found: number;
  avg_cyclomatic_complexity: number;
  avg_maintainability_index: number;
  latest_analysis?: CodeAnalysis;
}
