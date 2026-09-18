import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderGit2, 
  UploadCloud, 
  ScanEye, 
  FileText, 
  BarChart3, 
  Cpu, 
  HelpCircle 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, badge: 'Overview' },
    { to: '/studies', label: 'Study Worklist', icon: FolderGit2, badge: 'PACS' },
    { to: '/upload', label: 'Upload Center', icon: UploadCloud, badge: 'DICOM' },
    { to: '/viewer', label: 'DICOM Viewer & AI', icon: ScanEye, badge: 'Live Copilot' },
    { to: '/reports', label: 'Report Workspace', icon: FileText, badge: 'MedGemma' },
    { to: '/analytics', label: 'Analytics & KPIs', icon: BarChart3, badge: 'Metrics' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Radiology Modules</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 text-cyan-400 border border-cyan-800/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 group-hover:border-cyan-800/50">
                    {item.badge}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* AI Copilot Status Widget */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              AI Copilot Layer
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>MONAI ResNet:</span>
              <span className="text-emerald-400">3.0T Ready</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>CheXagent V2:</span>
              <span className="text-emerald-400">140k Voxels</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>MedGemma 27B:</span>
              <span className="text-cyan-400">Reasoner Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>MedScan AI</span>
          <span className="text-cyan-500 font-mono">ISO 13485 Std</span>
        </div>
        <p className="text-[10px] text-slate-600 mt-1">Enterprise Radiology Assistant</p>
      </div>
    </aside>
  );
};
