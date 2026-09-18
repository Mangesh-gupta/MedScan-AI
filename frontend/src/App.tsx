import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Sparkles, FileText, Activity, Shield } from 'lucide-react';
import { GeneratorWorkspace } from './pages/GeneratorWorkspace';
import { ReportArchives } from './pages/ReportArchives';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Top Clinical Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40 shadow-md print:hidden">
          {/* Brand */}
          <div className="header-brand flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-md shadow-cyan-600/20 transition-transform duration-300 hover:scale-105">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white font-mono tracking-tight">
                  MEDSCAN <span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 transition-all duration-300 hover:bg-cyan-900/80 hover:border-cyan-600">
                  Radiology Copilot
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">
                AI Diagnostic Assistant & Hospital Report Automation
              </p>
            </div>
          </div>

          {/* Simple Navigation Tabs */}
          <nav className="header-nav flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:shadow-sm'
                }`
              }
            >
              <Sparkles className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
              Scan & Report Generator
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:shadow-sm'
                }`
              }
            >
              <FileText className="w-4 h-4" />
              Report History
            </NavLink>
          </nav>

          {/* AI Status Badge */}
          <div className="header-status hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs transition-all duration-300 hover:border-emerald-700/50 hover:bg-emerald-950/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">AI Models:</span>
            <span className="font-mono font-bold text-emerald-400">MONAI + CheXagent</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950 print:bg-white print:overflow-visible print:p-0 print:m-0">
          <Routes>
            <Route path="/" element={<GeneratorWorkspace />} />
            <Route path="/history" element={<ReportArchives />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
