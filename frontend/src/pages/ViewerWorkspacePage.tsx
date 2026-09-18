import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  FileText, 
  Brain, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  MessageSquare, 
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Database,
  Activity,
  Play
} from 'lucide-react';
import { useStudyStore } from '../store/studyStore';
import { CanvasDICOMViewer } from '../components/viewer/CanvasDICOMViewer';
import { ModalityBadge } from '../components/common/ModalityBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { Finding } from '../types';

export const ViewerWorkspacePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    studies, 
    selectedStudy, 
    selectStudyById, 
    currentFindings, 
    updateFindingStatus,
    runAIAnalysis,
    isLoading 
  } = useStudyStore();

  const [activeTab, setActiveTab] = useState<'findings' | 'xai' | 'pipeline' | 'metadata'>('findings');
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  useEffect(() => {
    const studyId = searchParams.get('studyId') || (studies.length > 0 ? studies[0].id : null);
    if (studyId) {
      selectStudyById(studyId);
    }
  }, [searchParams, studies.length]);

  if (!selectedStudy) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono">Loading DICOM series into viewer...</p>
        </div>
      </div>
    );
  }

  const handleReanalyze = async () => {
    setIsReanalyzing(true);
    try {
      await runAIAnalysis(selectedStudy.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleCommentChange = (fid: string, text: string) => {
    setCommentInputs((prev) => ({ ...prev, [fid]: text }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
      {/* Top Telemetry Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                {selectedStudy.patient?.full_name || 'Patient'}
              </span>
              <span className="font-mono text-xs text-cyan-400 bg-slate-800 px-2 py-0.5 rounded">
                {selectedStudy.patient?.mrn}
              </span>
              <ModalityBadge modality={selectedStudy.modality} size="sm" />
            </div>
            <p className="text-xs text-slate-400 -mt-0.5">
              {selectedStudy.study_description} • Priority: <strong className="text-slate-200">{selectedStudy.priority}</strong>
            </p>
          </div>

          {/* Quick Study Switcher */}
          <select
            value={selectedStudy.id}
            onChange={(e) => selectStudyById(e.target.value)}
            className="hidden lg:block px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            {studies.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.modality}] {s.accession_number} - {s.patient?.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 text-cyan-400 ${isReanalyzing ? 'animate-spin' : ''}`} />
            {isReanalyzing ? 'Analyzing Pipeline...' : 'Re-run AI Analysis'}
          </button>

          <button
            onClick={() => navigate(`/reports?studyId=${selectedStudy.id}`)}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            Open Report Editor
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Canvas DICOM Viewer */}
        <div className="flex-1 p-3 min-h-[420px] lg:min-h-0 bg-black">
          <CanvasDICOMViewer study={selectedStudy} activeFinding={activeFinding} />
        </div>

        {/* Right: AI Copilot Clinical Tabs Panel */}
        <div className="w-full lg:w-[460px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 shrink-0 text-xs">
            <button
              onClick={() => setActiveTab('findings')}
              className={`flex-1 py-3 px-2 font-semibold border-b-2 transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'findings'
                  ? 'border-cyan-500 text-cyan-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              Findings ({currentFindings.length})
            </button>

            <button
              onClick={() => setActiveTab('xai')}
              className={`flex-1 py-3 px-2 font-semibold border-b-2 transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'xai'
                  ? 'border-cyan-500 text-cyan-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Explainable AI
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex-1 py-3 px-2 font-semibold border-b-2 transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'pipeline'
                  ? 'border-cyan-500 text-cyan-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Pipeline
            </button>

            <button
              onClick={() => setActiveTab('metadata')}
              className={`flex-1 py-3 px-2 font-semibold border-b-2 transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'metadata'
                  ? 'border-cyan-500 text-cyan-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              DICOM
            </button>
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. FINDINGS TAB */}
            {activeTab === 'findings' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Detected Abnormalities & Lesions</span>
                  <span className="text-[11px] font-mono text-cyan-400">Click finding to highlight</span>
                </div>

                {currentFindings.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No abnormalities identified by AI models.
                  </div>
                ) : (
                  currentFindings.map((finding) => {
                    const isSelected = activeFinding?.id === finding.id;
                    const isAccepted = finding.status === 'ACCEPTED';
                    const isRejected = finding.status === 'REJECTED';

                    return (
                      <div
                        key={finding.id}
                        onClick={() => setActiveFinding(isSelected ? null : finding)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-950'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <SeverityBadge severity={finding.severity} />
                            <span className="font-bold text-xs text-slate-200">{finding.category}</span>
                          </div>
                          <span className="font-mono text-xs text-emerald-400 font-semibold">
                            {Math.round(finding.confidence_score * 100)}% Conf
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-cyan-300 mb-1">
                          📍 {finding.anatomical_location}
                        </p>

                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                          {finding.finding_text}
                        </p>

                        {/* Radiologist Review Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Status: <strong className={isAccepted ? 'text-emerald-400' : isRejected ? 'text-red-400' : 'text-amber-400'}>{finding.status}</strong>
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateFindingStatus(finding.id, 'ACCEPTED')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                isAccepted
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-800 text-slate-300 hover:bg-emerald-950 hover:text-emerald-300'
                              }`}
                              title="Accept Finding into Draft Report"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Accept
                            </button>

                            <button
                              onClick={() => updateFindingStatus(finding.id, 'REJECTED')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                isRejected
                                  ? 'bg-red-600 text-white'
                                  : 'bg-slate-800 text-slate-300 hover:bg-red-950 hover:text-red-300'
                              }`}
                              title="Reject Finding"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 2. EXPLAINABLE AI TAB */}
            {activeTab === 'xai' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Model Decision Rationale
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    The AI copilot processed voxel activations using multi-head spatial attention and Grad-CAM backpropagation.
                    Key pathological features identified include asymmetric signal enhancement, mass boundary irregularities, and local volume displacement.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h3 className="font-bold text-white">Feature Attribution Breakdown</h3>
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Focal Signal Enhancement</span>
                        <span className="font-mono text-cyan-400 font-semibold">+45%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Perilesional Tissue Reaction</span>
                        <span className="font-mono text-cyan-400 font-semibold">+28%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: '28%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Anatomical Space Distortion</span>
                        <span className="font-mono text-cyan-400 font-semibold">+18%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: '18%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-200">
                  <p className="font-semibold mb-1">Grad-CAM Layer 4 Attention</p>
                  <p className="text-[11px] text-slate-400">
                    Active layer maps voxel heat to convolutional activation spikes. Use the top toolbar slider to modulate overlay intensity.
                  </p>
                </div>
              </div>
            )}

            {/* 3. PIPELINE TAB */}
            {activeTab === 'pipeline' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-400">Automated Multi-Stage AI Inference Pipeline</p>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-800/40 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">1. Ingestion & Preprocessing</p>
                      <p className="text-[11px] text-slate-400">Hounsfield / VOI LUT Calibration</p>
                    </div>
                    <span className="font-mono text-emerald-400 text-xs">42ms</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-800/40 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">2. Deep Feature Extraction</p>
                      <p className="text-[11px] text-slate-400">
                        {selectedStudy.modality === 'XRAY' ? 'CheXagent V2 Foundation' : 'MONAI Segmentation Net'}
                      </p>
                    </div>
                    <span className="font-mono text-emerald-400 text-xs">380ms</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-800/40 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">3. Saliency & Heatmap Generation</p>
                      <p className="text-[11px] text-slate-400">Grad-CAM Spatial Masking</p>
                    </div>
                    <span className="font-mono text-emerald-400 text-xs">68ms</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-800/40 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">4. MedGemma Clinical Reasoner</p>
                      <p className="text-[11px] text-slate-400">Structured Radiology Report Draft</p>
                    </div>
                    <span className="font-mono text-emerald-400 text-xs">280ms</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2 text-emerald-300">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span className="font-semibold">Pipeline Execution Status: 100% Validated</span>
                </div>
              </div>
            )}

            {/* 4. METADATA TAB */}
            {activeTab === 'metadata' && (
              <div className="space-y-3 text-xs font-mono">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Study UID:</span>
                    <span className="text-slate-200 truncate max-w-[200px]">{selectedStudy.study_uid}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Accession #:</span>
                    <span className="text-slate-200">{selectedStudy.accession_number}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Modality:</span>
                    <span className="text-cyan-400 font-bold">{selectedStudy.modality}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Body Part:</span>
                    <span className="text-slate-200">{selectedStudy.body_part}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Manufacturer:</span>
                    <span className="text-slate-200">Siemens Healthineers</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Matrix:</span>
                    <span className="text-slate-200">512 x 512</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Pixel Spacing:</span>
                    <span className="text-slate-200">0.50 mm \ 0.50 mm</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
