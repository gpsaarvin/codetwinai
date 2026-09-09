'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CodeAnalysis, DetectedIssue } from '@/types';
import { Activity, AlertTriangle, ShieldAlert, CheckCircle, History, FileText, Cpu, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnalysisDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  useEffect(() => {
    if (!id) return;
    api.get(`/analysis/${id}`)
      .then((res) => setAnalysis(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load analysis details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin glow-purple" />
        <p className="text-sm font-semibold text-slate-400">Loading Analysis Metrics & Digital Twin History...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          {error || 'Analysis record not found.'}
        </div>
        <Link href="/dashboard" className="text-xs font-semibold text-brand-accent hover:underline flex items-center justify-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const filteredIssues = selectedSeverity === 'ALL'
    ? analysis.issues
    : analysis.issues.filter(i => i.severity === selectedSeverity);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/dashboard" className="text-xs font-semibold text-brand-accent hover:underline inline-flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Analysis Report
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-surface-card border border-white/10 text-slate-300">
              Run #{analysis.id.substring(0, 8)}
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Analyzed on {new Date(analysis.analyzed_at).toLocaleString()}
          </p>
        </div>

        <Link
          href="/analyze"
          className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 transition-all glow-purple"
        >
          Run Another Analysis
        </Link>
      </div>

      {/* Summary Score Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cyclomatic Complexity</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {analysis.cyclomatic_complexity_avg}
          </div>
          <p className="text-[11px] text-slate-400">
            {analysis.cyclomatic_complexity_avg <= 5 ? '🟢 Excellent modularity' : '⚠️ Elevated complexity'}
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Maintainability Index</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {analysis.maintainability_index_avg}<span className="text-xs text-slate-400 font-normal">/100</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {analysis.maintainability_index_avg >= 70 ? '🟢 Highly maintainable' : '🟠 Refactoring advised'}
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Lines of Code (LOC)</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {analysis.total_loc}
          </div>
          <p className="text-[11px] text-slate-400">Source lines parsed</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Detected Issues</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {analysis.total_issues_count}
          </div>
          <p className="text-[11px] text-slate-400">AST & Radon rule hits</p>
        </div>
      </div>

      {/* Issues Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Detected Code Smells & Violations ({filteredIssues.length})
          </h2>

          {/* Severity Filters */}
          <div className="flex items-center gap-1.5 bg-surface-card p-1 rounded-xl border border-white/10 text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedSeverity === sev
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl text-center space-y-2 border border-white/10">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Issues Found for this Filter!</h3>
            <p className="text-xs text-slate-400">Your Python code clean and passed all AST & Radon static checks.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 relative overflow-hidden group hover:border-white/20 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getSeverityBadge(issue.severity)}`}>
                      {issue.severity}
                    </span>
                    <span className="font-bold text-sm text-white font-mono">
                      {issue.issue_type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Line {issue.line_number || 'N/A'}
                    </span>
                  </div>

                  {/* Bug Pattern Memory repetition count badge */}
                  {issue.historical_occurrence_count > 1 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                      <History className="w-3.5 h-3.5 text-amber-400" />
                      Repeated {issue.historical_occurrence_count}x in your history!
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {issue.message}
                </p>

                {issue.code_snippet && (
                  <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3 font-mono text-xs text-purple-300 overflow-x-auto">
                    <span className="text-slate-600 select-none mr-3">L{issue.line_number}:</span>
                    {issue.code_snippet}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-mono">
                  <span>File: {issue.file_path}</span>
                  <span>Tool: {issue.tool_name.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
