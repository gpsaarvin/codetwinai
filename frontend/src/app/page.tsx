import Link from 'next/link';
import { Cpu, ShieldCheck, Activity, LineChart, ArrowRight, Zap, History, Code2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative text-center py-12 md:py-20 space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-semibold text-purple-300">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          Final-Year CSE Project Platform • Python Static Engine Active
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
          Meet Your Personal <br />
          <span className="text-gradient-purple">Developer Digital Twin</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          CodeTwin AI analyzes your Python code over time, tracks recurring mistake patterns, calculates maintainability metrics, and gives personalized feedback based on <strong className="text-slate-200 font-semibold">your own history</strong>.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/analyze"
            className="px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-600 via-brand-accent to-brand-cyan hover:opacity-90 transition-all glow-purple shadow-xl flex items-center gap-2"
          >
            <Code2 className="w-5 h-5" />
            Analyze Python Code Now
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl font-semibold text-slate-300 hover:text-white glass-panel-interactive border border-white/10 flex items-center gap-2"
          >
            <Activity className="w-5 h-5 text-brand-cyan" />
            View Live Dashboard
          </Link>
        </div>
      </section>

      {/* Core Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel-interactive p-6 rounded-2xl space-y-3 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">AST & Radon Static Engine</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Computes cyclomatic complexity, maintainability index, line counts, function length, nesting depth, and bare exception swallows without relying on generic LLM guesses.
          </p>
        </div>

        <div className="glass-panel-interactive p-6 rounded-2xl space-y-3 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Bug Pattern Memory</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Persists every detected issue per developer with a frequency counter. Answers: "Have I made this exact mistake 3 times before?"
          </p>
        </div>

        <div className="glass-panel-interactive p-6 rounded-2xl space-y-3 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <LineChart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Developer Skill Scoring</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Calculates weighted skill scores across code quality, complexity control, error handling, testing, and consistency.
          </p>
        </div>
      </section>
    </div>
  );
}
