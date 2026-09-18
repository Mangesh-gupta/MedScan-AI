import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ScanEye, 
  FileText, 
  Play, 
  RefreshCw, 
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import { useStudyStore } from '../store/studyStore';
import { ModalityBadge } from '../components/common/ModalityBadge';
import { StatusPill } from '../components/common/StatusPill';

export const StudiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    studies, 
    fetchStudies, 
    isLoading, 
    modalityFilter, 
    setModalityFilter, 
    searchQuery, 
    setSearchQuery,
    runAIAnalysis 
  } = useStudyStore();

  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStudies();
  }, []);

  const handleRunAI = async (e: React.MouseEvent, studyId: string) => {
    e.stopPropagation();
    setAnalyzingId(studyId);
    try {
      await runAIAnalysis(studyId);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingId(null);
    }
  };

  const modalities = ['ALL', 'MRI', 'CT', 'XRAY', 'ULTRASOUND'];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Diagnostic Studies Worklist</h1>
          <p className="text-sm text-slate-400">
            Enterprise PACS imaging repository with automated AI copilot pipeline.
          </p>
        </div>

        <button
          onClick={() => fetchStudies()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          Refresh PACS
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Modality Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {modalities.map((mod) => (
            <button
              key={mod}
              onClick={() => setModalityFilter(mod)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                modalityFilter === mod
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, MRN, accession..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Studies Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Patient Details</th>
                <th className="px-5 py-3.5">Modality / Part</th>
                <th className="px-5 py-3.5">Accession #</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">AI Findings</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {studies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <Info className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                    No studies found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                studies.map((study) => {
                  const isStat = study.priority === 'STAT';
                  const isUrgent = study.priority === 'URGENT';
                  const isAnalyzing = analyzingId === study.id;

                  return (
                    <tr
                      key={study.id}
                      onClick={() => navigate(`/viewer?studyId=${study.id}`)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Priority */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                            isStat
                              ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                              : isUrgent
                              ? 'bg-orange-950 text-orange-300 border border-orange-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {study.priority}
                        </span>
                      </td>

                      {/* Patient */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors">
                            {study.patient?.full_name || 'Anonymous'}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            <span>{study.patient?.mrn}</span>
                            <span>•</span>
                            <span>{study.patient?.age} Y / {study.patient?.gender}</span>
                          </div>
                        </div>
                      </td>

                      {/* Modality */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <ModalityBadge modality={study.modality} size="sm" />
                          <p className="text-[11px] text-slate-400">{study.body_part}</p>
                        </div>
                      </td>

                      {/* Accession */}
                      <td className="px-5 py-4 font-mono text-slate-400">
                        {study.accession_number}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusPill status={study.status} />
                      </td>

                      {/* Findings count */}
                      <td className="px-5 py-4">
                        {study.findings && study.findings.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-400" />
                            <span className="font-semibold text-slate-200">
                              {study.findings.length} detected
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">None detected</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/viewer?studyId=${study.id}`)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 transition-all cursor-pointer"
                            title="Open in DICOM Viewer"
                          >
                            <ScanEye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => navigate(`/reports?studyId=${study.id}`)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 transition-all cursor-pointer"
                            title="View Radiology Report"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => handleRunAI(e, study.id)}
                            disabled={isAnalyzing}
                            className={`p-2 rounded-lg transition-all cursor-pointer ${
                              isAnalyzing
                                ? 'bg-cyan-900 text-cyan-300'
                                : 'bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300'
                            }`}
                            title="Re-run AI Analysis Pipeline"
                          >
                            <Play className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                          </button>
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
    </div>
  );
};
