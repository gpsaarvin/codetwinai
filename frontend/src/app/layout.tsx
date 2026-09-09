import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'CodeTwin AI — Developer Digital Twin Platform',
  description: 'AI-powered Developer Digital Twin analyzing Python code, tracking historical mistake patterns, scoring developer skills, and generating targeted growth feedback.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
            {children}
          </main>
          <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
            CodeTwin AI &copy; 2026. Built with FastAPI, Next.js, AST & Radon Engines.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
