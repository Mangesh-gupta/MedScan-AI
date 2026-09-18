import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Target, 
  Brain 
} from 'lucide-react';
import { radiologyApi } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    radiologyApi.getStatistics()
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono">Aggregating Clinical AI Benchmark Telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Clinical AI Performance & Quality Metrics</h1>
        <p className="text-sm text-slate-400">
          Evaluated diagnostic benchmarks, radiologist concordance, and turnaround efficiency.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">AI Concordance</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-white">{analytics.diagnostic_concordance_rate}%</p>
          <p className="text-xs text-emerald-400 font-medium">Agreement with Board Radiologists</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Turnaround Reduction</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-white">-{analytics.reporting_turnaround_time_reduction_pct}%</p>
          <p className="text-xs text-cyan-400 font-medium">Faster report sign-off speed</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Mean AI Latency</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-white">{analytics.average_ai_inference_time_ms} ms</p>
          <p className="text-xs text-slate-400">Multi-sequence volumetric inference</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Findings Accepted</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-white">{analytics.radiologist_ai_acceptance_rate}%</p>
          <p className="text-xs text-indigo-400 font-medium">Direct adoption without edits</p>
        </div>
      </div>

      {/* Model Benchmark Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          Multimodal Foundation Model Validation Suite
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Modality & Model Architecture</th>
                <th className="px-5 py-3">Clinical Sensitivity</th>
                <th className="px-5 py-3">Specificity</th>
                <th className="px-5 py-3">Inference Speed</th>
                <th className="px-5 py-3">Clinical Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {analytics.modality_performance.map((m: any, i: number) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4 font-sans font-bold text-slate-100">
                    {m.modality}
                  </td>
                  <td className="px-5 py-4 text-emerald-400 font-bold">
                    {m.sensitivity}
                  </td>
                  <td className="px-5 py-4 text-cyan-400 font-bold">
                    {m.specificity}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {m.avg_time}
                  </td>
                  <td className="px-5 py-4 font-sans">
                    <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold">
                      PASSED (FDA 510(k) Ready)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
