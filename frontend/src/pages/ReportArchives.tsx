import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import { radiologyApi } from '../services/api';
import { Report } from '../types';
import { ReportSheet } from '../components/report/ReportSheet';

export const ReportArchives: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = () => {
    setLoading(true);
    radiologyApi.getReports()
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleQuickApprove = async (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation();
    setApprovingId(reportId);
    try {
      const updated = await radiologyApi.approveReport(reportId);
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      if (selectedReport && selectedReport.id === updated.id) {
        setSelectedReport(updated);
      }
    } catch (err) {
      console.error('Failed to quick-approve report:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleModalUpdate = (updated: Report) => {
    setSelectedReport(updated);
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.patient_name && r.patient_name.toLowerCase().includes(q)) ||
      (r.pid && r.pid.toLowerCase().includes(q)) ||
      (r.exam_title && r.exam_title.toLowerCase().includes(q)) ||
      (r.ref_by && r.ref_by.toLowerCase().includes(q)) ||
      (r.disease_name && r.disease_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Report History & Archives</h1>
          <p className="text-xs text-slate-400">
            Searchable repository of all AI-drafted and radiologist-approved diagnostic reports.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="btn-press flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3 card-hover transition-all duration-200 animate-fade-in-up delay-100">
        <Search className="w-4 h-4 text-slate-400 transition-colors duration-200" />
        <input
          type="text"
          placeholder="Search by patient name, PID (e.g. 555), examination, or doctor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-xs text-slate-200 placeholder-slate-500 w-full focus:outline-none font-medium"
        />
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-fade-in-up delay-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">PID</th>
                <th className="px-5 py-3.5">Patient Details</th>
                <th className="px-5 py-3.5">Examination & Diagnosis</th>
                <th className="px-5 py-3.5">Study & Report Dates</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No diagnostic reports found in archive.
                  </td>
                </tr>
              ) : (
                filtered.map((report, idx) => {
                  const isApproved = report.status === 'APPROVED';
                  const isBeingApproved = approvingId === report.id;
                  const staggerDelay = Math.min(idx * 60, 500);

                  return (
                    <tr 
                      key={report.id} 
                      onClick={() => setSelectedReport(report)}
                      className="hover:bg-slate-800/50 transition-all duration-200 group cursor-pointer animate-row-in"
                      style={{ animationDelay: `${staggerDelay}ms` }}
                    >
                      <td className="px-5 py-4 font-mono font-bold text-cyan-400">
                        {report.pid || '555'}
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors duration-200">
                            {report.patient_name || 'Patient'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {report.patient_age} Y / {report.patient_gender} • Ref: {report.ref_by || 'Dr. Hiren Shah'}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-0.5 max-w-sm">
                          <p className="font-bold text-slate-200">{report.exam_title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{report.disease_name || report.exam_view}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-[11px] font-mono">
                        <div className="space-y-0.5">
                          <p className="text-slate-400">Study: <span className="text-slate-300">{report.registered_on || '10:45 AM 15 Sep, 2026'}</span></p>
                          <p className="text-slate-400">
                            {isApproved ? 'Verified: ' : 'Reported: '}
                            <span className={isApproved ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                              {report.reported_on || '11:15 AM 15 Sep, 2026'}
                            </span>
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`status-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-xs pulse-glow-emerald'
                            : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                        }`}>
                          {isApproved ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              APPROVED & VERIFIED
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              DRAFT • PENDING REVIEW
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {!isApproved && (
                            <button
                              onClick={(e) => handleQuickApprove(e, report.id)}
                              disabled={isBeingApproved}
                              className="btn-press px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              title="Approve report now"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {isBeingApproved ? 'Approving...' : 'Approve'}
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedReport(report)}
                            className="btn-press p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-all duration-200 cursor-pointer"
                            title="Inspect & Edit Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => navigate(`/?reportId=${report.id}`)}
                            className="btn-press p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-all duration-200 cursor-pointer"
                            title="Open in Workspace"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          <a
                            href={radiologyApi.getReportPdfUrl(report.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-press p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 transition-all duration-200 cursor-pointer"
                            title="Download Hospital PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Report Inspection Modal */}
      {selectedReport && (
        <div className="animate-backdrop-in fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="animate-slide-in-modal bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Diagnostic Report Inspection</h3>
                <span className="text-xs text-slate-400 font-mono">PID: {selectedReport.pid}</span>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="btn-press p-1.5 rounded-lg bg-slate-800 hover:bg-red-800/70 text-slate-400 hover:text-white transition-all duration-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ReportSheet
              report={selectedReport}
              onUpdate={handleModalUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

