import React from 'react';
import { Shield, Activity, Sun, Moon, Bell, Radio } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useStudyStore } from '../../store/studyStore';

export const Navbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { studies } = useStudyStore();

  const criticalCount = studies.reduce((acc, s) => {
    const hasCrit = s.findings?.some((f) => f.severity === 'CRITICAL');
    return hasCrit ? acc + 1 : acc;
  }, 0);

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white font-mono">MEDSCAN <span className="text-cyan-400">AI</span></span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">v1.0 Pro</span>
          </div>
          <p className="text-xs text-slate-400 -mt-0.5">AI-Powered Radiology Copilot</p>
        </div>
      </div>

      {/* Center Clinical Telemetry */}
      <div className="hidden md:flex items-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>PACS LINK: <strong className="text-emerald-400 font-mono">DICOM 3.0 ONLINE</strong></span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 font-mono">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>MODELS: <strong className="text-slate-200">MONAI + CheXagent + MedGemma</strong></span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Critical Alerts */}
        <div className="relative">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 hover:bg-red-950/60 transition-colors text-xs font-semibold">
            <Bell className="w-4 h-4 text-red-400" />
            <span>{criticalCount > 0 ? `${criticalCount} STAT ALERTS` : 'STAT MONITOR'}</span>
          </button>
          {criticalCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title={isDarkMode ? 'Switch to Light Clinical Theme' : 'Switch to Dark Diagnostic Theme'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            SA
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-xs font-bold text-slate-200 leading-none">Dr. Sarah Al-Mansoor</p>
            <p className="text-[11px] text-cyan-400 font-medium">MD, DABR (Lead Radiologist)</p>
          </div>
        </div>
      </div>
    </header>
  );
};
