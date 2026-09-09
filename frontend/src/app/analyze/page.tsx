'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Upload, FileCode, Play, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

const STARTER_PYTHON = `def process_account_data(users):
    # Try out CodeTwin AI analysis!
    # Long function with bare except and nested loops
    unused_counter = 0
    total = 0
    try:
        for u in users:
            if u.get('active'):
                if u.get('score') > 50:
                    if u.get('balance') > 1000:
                        total += u.get('balance')
    except:
        pass
    return total
`;

export default function AnalyzePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');
  const [code, setCode] = useState(STARTER_PYTHON);
  const [filename, setFilename] = useState('script.py');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilename(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (activeTab === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('code', code);
        formData.append('filename', filename || 'script.py');
      }

      const res = await api.post('/analysis/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      router.push(`/analyses/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete analysis. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-accent uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Module 2 • AST & Radon Analysis Engine
        </div>
        <h1 className="text-3xl font-bold text-white">Run Code Analysis</h1>
        <p className="text-slate-400 text-sm">
          Submit Python code to inspect cyclomatic complexity, maintainability, nesting depth, and bug pattern memories.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 bg-surface-card p-1.5 rounded-2xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('paste')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'paste'
              ? 'bg-brand-600 text-white shadow-lg glow-purple'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Paste Python Code
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'file'
              ? 'bg-brand-600 text-white shadow-lg glow-purple'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload .py File
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
        {activeTab === 'paste' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                File Identifier Name
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1 text-xs text-brand-cyan font-mono focus:outline-none"
              />
            </div>
            <div className="relative">
              <textarea
                rows={12}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste Python code here..."
                className="w-full bg-slate-950/90 border border-white/10 rounded-2xl p-4 font-mono text-sm text-purple-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all leading-relaxed"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/15 hover:border-brand-500/50 rounded-3xl p-10 text-center transition-all bg-slate-950/40 relative group">
              <input
                type="file"
                accept=".py"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-500 group-hover:scale-110 transition-transform mb-4">
                <Upload className="w-8 h-8" />
              </div>
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Click or drag & drop Python file (.py)</p>
                  <p className="text-xs text-slate-500">Supports single file Python scripts up to 5MB</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-xs text-slate-400 font-mono">AST • Radon CC • MI • Issue Detector</span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 via-brand-accent to-brand-cyan hover:opacity-90 transition-all glow-purple flex items-center gap-2 shadow-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <>Analyzing Code Structure...</>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Analyze Code Run
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
