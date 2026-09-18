import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Save, 
  Printer, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Clock, 
  UserCheck, 
  ExternalLink 
} from 'lucide-react';
import { radiologyApi } from '../services/api';
import { useStudyStore } from '../store/studyStore';
import { ModalityBadge } from '../components/common/ModalityBadge';
import { Report } from '../types';

export const ReportEditorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { studies, selectedStudy, selectStudyById, currentReport, currentFindings } = useStudyStore();

  const [report, setReport] = useState<Report | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [radiologistName, setRadiologistName] = useState('Dr. Sarah Al-Mansoor, MD, DABR');
  const [signaturePin, setSignaturePin] = useState('8842');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const studyId = searchParams.get('studyId') || (studies.length > 0 ? studies[0].id : null);
    if (studyId) {
      selectStudyById(studyId);
      radiologyApi.getReport(studyId)
        .then((r) => setReport(r))
        .catch(() => {
          // If no report, attempt analysis or blank report
        });
    }
  }, [searchParams, studies.length]);

  useEffect(() => {
    if (currentReport) {
      setReport(currentReport);
    }
  }, [currentReport]);

  if (!selectedStudy || !report) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono">Synthesizing MedGemma structured report...</p>
        </div>
      </div>
    );
  }

  const handleFieldChange = (field: keyof Report, value: string) => {
    setReport((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const updated = await radiologyApi.updateReport(report.id, {
        findings_text: report.findings_text,
        impression_text: report.impression_text,
        recommendations_text: report.recommendations_text,
        clinical_notes_text: report.clinical_notes_text,
        radiologist_name: radiologistName,
        bi_rads_rads_score: report.bi_rads_rads_score,
      });
      setReport(updated);
      setSaveMessage('Report changes saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOff = async () => {
    setIsSigning(true);
    try {
      const signed = await radiologyApi.signReport(report.id, radiologistName, signaturePin);
      setReport(signed);
      setShowSignModal(false);
      setSaveMessage('Report electronically signed and finalized!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigning(false);
    }
  };

  const isFinal = report.status === 'SIGNED';

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Structured Diagnostic Report</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${
              isFinal ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
            }`}>
              {isFinal ? 'FINAL / SIGNED' : 'DRAFT IN REVIEW'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            MedGemma Clinical Reasoner synthesis with radiologist verification workflow.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving || isFinal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>

          {!isFinal && (
            <button
              onClick={() => setShowSignModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              Sign & Finalize
            </button>
          )}

          {/* Export PDF */}
          <a
            href={radiologyApi.getPdfExportUrl(report.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </a>

          {/* Export DOCX */}
          <a
            href={radiologyApi.getDocxExportUrl(report.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            DOCX
          </a>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Key Image & Demographics */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Demographics</h2>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Name:</span>
                <strong className="text-white">{selectedStudy.patient?.full_name}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">MRN:</span>
                <span className="font-mono text-cyan-400">{selectedStudy.patient?.mrn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Age / Gender:</span>
                <span className="text-slate-200">{selectedStudy.patient?.age} Y / {selectedStudy.patient?.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Accession:</span>
                <span className="font-mono text-slate-200">{selectedStudy.accession_number}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Modality:</span>
                <ModalityBadge modality={selectedStudy.modality} size="sm" />
              </div>
            </div>
          </div>

          {/* Key Medical Image Preview */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Diagnostic Scan</h2>
              <button
                onClick={() => navigate(`/viewer?studyId=${selectedStudy.id}`)}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Inspect
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-black rounded-xl overflow-hidden border border-slate-800 aspect-square flex items-center justify-center relative group">
              <img
                src={selectedStudy.images?.[0]?.image_url || '/static/uploads/brain_mri.jpg'}
                alt="Key Scan"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-[11px] font-mono text-slate-300">
                  {selectedStudy.modality} • Slice 1/1 • AI Verified
                </span>
              </div>
            </div>
          </div>

          {/* Verified Findings Checklist */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Findings Incorporated ({currentFindings.length})
            </h2>
            <div className="space-y-2">
              {currentFindings.map((f) => (
                <div key={f.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{f.category}</span>
                    <span className="text-[10px] font-mono text-emerald-400">{Math.round(f.confidence_score * 100)}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{f.finding_text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Editable Structured Report */}
        <div className="lg:col-span-2 space-y-5">
          {/* Clinical Indication */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
              Clinical Indication & History
            </label>
            <textarea
              rows={2}
              value={report.clinical_history || ''}
              onChange={(e) => handleFieldChange('clinical_history', e.target.value)}
              disabled={isFinal}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none disabled:opacity-75 leading-relaxed"
            />
          </div>

          {/* Technique */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
              Examination Technique
            </label>
            <textarea
              rows={2}
              value={report.technique || ''}
              onChange={(e) => handleFieldChange('technique', e.target.value)}
              disabled={isFinal}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none disabled:opacity-75 leading-relaxed"
            />
          </div>

          {/* Detailed Narrative Findings */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
              Detailed Narrative Findings
            </label>
            <textarea
              rows={6}
              value={report.findings_text || ''}
              onChange={(e) => handleFieldChange('findings_text', e.target.value)}
              disabled={isFinal}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none disabled:opacity-75 font-mono leading-relaxed"
            />
          </div>

          {/* Impression (Highlighted) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Impression (MedGemma AI Synthesis)
              </label>
              {report.bi_rads_rads_score && (
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                  {report.bi_rads_rads_score}
                </span>
              )}
            </div>
            <textarea
              rows={5}
              value={report.impression_text || ''}
              onChange={(e) => handleFieldChange('impression_text', e.target.value)}
              disabled={isFinal}
              className="w-full p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-semibold text-slate-100 focus:outline-none focus:border-cyan-500 resize-none disabled:opacity-85 leading-relaxed"
            />
          </div>

          {/* Recommendations */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
              Recommendations & Clinical Next Steps
            </label>
            <textarea
              rows={3}
              value={report.recommendations_text || ''}
              onChange={(e) => handleFieldChange('recommendations_text', e.target.value)}
              disabled={isFinal}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none disabled:opacity-75 leading-relaxed"
            />
          </div>

          {/* Clinical AI Notes */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Clinical Copilot Notes & Explainability Rationale
            </label>
            <textarea
              rows={2}
              value={report.clinical_notes_text || ''}
              onChange={(e) => handleFieldChange('clinical_notes_text', e.target.value)}
              disabled={isFinal}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 focus:outline-none focus:border-cyan-500 resize-none disabled:opacity-75 leading-relaxed italic"
            />
          </div>

          {/* Electronic Signature Box */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{report.radiologist_name}</p>
                <p className="text-[11px] text-slate-400">
                  {isFinal ? `Signed off: ${report.signed_at || 'Verified'}` : 'Pending Radiologist Electronic Signature'}
                </p>
              </div>
            </div>

            <span className="font-mono text-xs text-cyan-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              AUDIT: VG360-{selectedStudy.accession_number}
            </span>
          </div>
        </div>
      </div>

      {/* Sign Off Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-600 flex items-center justify-center text-cyan-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Electronic Report Sign-Off</h3>
                <p className="text-xs text-slate-400">Verify diagnostic findings and lock report</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Attending Radiologist</label>
                <input
                  type="text"
                  value={radiologistName}
                  onChange={(e) => setRadiologistName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Clinical Authorization PIN</label>
                <input
                  type="password"
                  value={signaturePin}
                  onChange={(e) => setSignaturePin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono tracking-widest text-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                By clicking "Authorize & Finalize", you certify that you have reviewed the medical imagery, accepted or rejected AI detections, and assume clinical accountability for this diagnostic record.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSignModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOff}
                disabled={isSigning}
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                {isSigning ? 'Authorizing...' : 'Authorize & Finalize Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
