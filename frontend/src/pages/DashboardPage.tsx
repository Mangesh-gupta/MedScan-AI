import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderGit2, 
  Brain, 
  Activity, 
  Layers, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { radiologyApi } from '../services/api';
import { DashboardMetrics } from '../types';
import { ModalityBadge } from '../components/common/ModalityBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    radiologyApi.getDashboardMetrics()
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-cyan-400">Loading Clinical Diagnostic Metrics...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Studies',
      value: metrics.total_studies,
      subtitle: 'Active imaging queue',
      icon: FolderGit2,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/40 border-cyan-800/40',
    },
    {
      title: 'AI Analyzed',
      value: metrics.analyzed_count,
      subtitle: 'Automated deep learning',
      icon: Brain,
      color: 'text-indigo-400',
      bg: 'bg-indigo-950/40 border-indigo-800/40',
    },
    {
      title: 'Critical Findings',
      value: metrics.critical_findings_count,
      subtitle: 'Immediate triage required',
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-950/40 border-red-800/40',
    },
    {
      title: 'Turnaround Time',
      value: `${metrics.average_turnaround_mins}m`,
      subtitle: '58% faster than benchmark',
      icon: Clock,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-800/40',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Executive Radiology Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono font-semibold border border-cyan-800/60">
              Live Copilot
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Real-time AI diagnostic assistance across MRI, CT, X-Ray, and Ultrasound modalities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            Upload Study
          </button>
          <button
            onClick={() => navigate('/studies')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            Open Worklist
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`p-5 rounded-2xl border ${kpi.bg} shadow-md backdrop-blur-sm transition-transform hover:scale-[1.02]`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{kpi.title}</span>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold font-mono tracking-tight text-white">{kpi.value}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{kpi.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Modality Breakdown & Model Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modality Distribution */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Imaging Modality Distribution
            </h2>
            <span className="text-xs text-slate-400">Total: {metrics.total_studies} Studies</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-indigo-900/40">
              <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold mb-2">
                <span>Brain MRI</span>
                <span>MONAI</span>
              </div>
              <p className="text-2xl font-bold font-mono text-white">{metrics.modality_breakdown.mri}</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-900/40">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold mb-2">
                <span>CT Scan</span>
                <span>MONAI</span>
              </div>
              <p className="text-2xl font-bold font-mono text-white">{metrics.modality_breakdown.ct}</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '70%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-sky-900/40">
              <div className="flex items-center justify-between text-xs text-sky-300 font-semibold mb-2">
                <span>Chest X-Ray</span>
                <span>CheXagent</span>
              </div>
              <p className="text-2xl font-bold font-mono text-white">{metrics.modality_breakdown.xray}</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-900/40">
              <div className="flex items-center justify-between text-xs text-amber-300 font-semibold mb-2">
                <span>Ultrasound</span>
                <span>TI-RADS</span>
              </div>
              <p className="text-2xl font-bold font-mono text-white">{metrics.modality_breakdown.ultrasound}</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>

          {/* Turnaround trend */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-400 mb-2">Weekly Processing Volume & Critical Detection Trend</p>
            <div className="h-24 flex items-end justify-between gap-2 pt-4 px-2">
              {metrics.processing_trends.map((pt, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="w-full flex items-end justify-center gap-1 h-16">
                    <div 
                      className="w-full max-w-[18px] bg-cyan-600/80 rounded-t group-hover:bg-cyan-400 transition-colors"
                      style={{ height: `${(pt.total_studies / 45) * 100}%` }}
                      title={`${pt.date}: ${pt.total_studies} Studies`}
                    />
                    <div 
                      className="w-full max-w-[18px] bg-red-600/80 rounded-t group-hover:bg-red-400 transition-colors"
                      style={{ height: `${(pt.critical_detected / 10) * 100}%` }}
                      title={`${pt.date}: ${pt.critical_detected} Critical Alerts`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{pt.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Health & Architecture */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              AI Model Ecosystem
            </h2>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-3">
            {Object.entries(metrics.ai_model_health).map(([model, status], idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">{model}</p>
                  <p className="text-[10px] font-mono text-emerald-400">{status}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200">
            <p className="font-semibold flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Active Copilot Mode
            </p>
            <p className="text-[11px] text-slate-400">
              All findings require radiologist verification before clinical sign-off.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Findings Triage Feed */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-bold text-white">Critical & Severe Findings Priority Feed</h2>
          </div>
          <span className="text-xs font-mono text-red-400 bg-red-950/60 px-2.5 py-1 rounded-full border border-red-800/50">
            {metrics.critical_alerts.length} STAT ALERTS
          </span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {metrics.critical_alerts.map((alert, idx) => (
            <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-800/30 px-2 rounded-lg transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <SeverityBadge severity={alert.severity} />
                  <ModalityBadge modality={alert.modality} size="sm" />
                  <span className="font-bold text-sm text-slate-100">{alert.patient_name}</span>
                  <span className="text-xs font-mono text-slate-400">({alert.mrn})</span>
                  <span className="text-xs text-slate-500 font-mono">• {alert.detected_time}</span>
                </div>
                <p className="text-xs text-slate-300 max-w-4xl line-clamp-1">
                  {alert.finding_text}
                </p>
              </div>

              <button
                onClick={() => navigate(`/viewer?studyId=${alert.study_id}`)}
                className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 border border-slate-700 cursor-pointer"
              >
                Inspect Scan
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
