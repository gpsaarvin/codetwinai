'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { CodeAnalysis, DashboardSummary } from '@/types';
import { Cpu, Activity, AlertTriangle, ShieldCheck, ArrowUpRight, Plus, History, FileText, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [analyses, setAnalyses] = useState<CodeAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    Promise.all([
      api.get('/dashboard/latest').catch(() => null),
      api.get('/analysis').catch(() => null),
    ]).then(([sumRes, listRes]) => {
      if (sumRes) setSummary(sumRes.data);
      if (listRes) setAnalyses(listRes.data);
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-500">
          <Cpu className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
        <p className="text-sm text-slate-400">Please sign in to access your Developer Digital Twin dashboard.</p>
        <div className="pt-2">
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all glow-purple inline-block"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin glow-purple" />
        <p className="text-sm font-semibold text-slate-400">Syncing Digital Twin Profile & Historical Runs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            Developer Digital Twin
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              Active Sync
            </span>
          </h1>
          <p className="text-sm text-slate-400">
            Welcome back, <strong className="text-white">{user.full_name || user.email}</strong>. Here is your code health overview.
          </p>
        </div>

        <Link
          href="/analyze"
          className="px-5 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-brand-accent hover:opacity-90 transition-all glow-purple flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New Code Analysis
        </Link>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Analysis Runs</span>
            <FileText className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {summary?.total_analyses || 0}
          </div>
          <p className="text-[11px] text-slate-400">Recorded code evaluations</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Issues Logged</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {summary?.total_issues_found || 0}
          </div>
          <p className="text-[11px] text-slate-400">Bug patterns tracked in memory</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Complexity</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {summary?.avg_cyclomatic_complexity || 0}
          </div>
          <p className="text-[11px] text-slate-400">Cyclomatic score average</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Maintainability</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {summary?.avg_maintainability_index || 100}<span className="text-xs text-slate-400 font-normal">/100</span>
          </div>
          <p className="text-[11px] text-slate-400">Maintainability index average</p>
        </div>
      </div>

      {/* Historical Analyses List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-brand-cyan" />
            Recent Analysis Runs ({analyses.length})
          </h2>
        </div>

        {analyses.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl text-center space-y-3 border border-white/10">
            <Cpu className="w-10 h-10 text-brand-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Analysis Runs Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Submit your first Python file or paste code to generate complexity scores and track bug patterns!
            </p>
            <div className="pt-2">
              <Link
                href="/analyze"
                className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 transition-all glow-purple inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Start First Analysis
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyses.map((run) => (
              <Link
                key={run.id}
                href={`/analyses/${run.id}`}
                className="glass-panel-interactive p-5 rounded-2xl border border-white/10 space-y-3 block group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-300">
                    Run #{run.id.substring(0, 8)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(run.analyzed_at).toLocaleDateString()} {new Date(run.analyzed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 font-mono text-center">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">LOC</span>
                    <span className="text-sm font-bold text-white">{run.total_loc}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Complexity</span>
                    <span className="text-sm font-bold text-purple-400">{run.cyclomatic_complexity_avg}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Issues</span>
                    <span className="text-sm font-bold text-amber-400">{run.total_issues_count}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-brand-accent group-hover:underline font-semibold pt-1">
                  <span>Inspect Detailed Report</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
