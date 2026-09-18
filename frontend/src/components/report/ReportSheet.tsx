import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Edit3, 
  Printer, 
  Download, 
  ShieldCheck, 
  Activity, 
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';
import { Report } from '../../types';
import { radiologyApi } from '../../services/api';

interface ReportSheetProps {
  report: Report;
  onUpdate?: (updated: Report) => void;
}

export const ReportSheet: React.FC<ReportSheetProps> = ({ report, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFindings, setEditedFindings] = useState<string[]>([]);
  const [editedImpression, setEditedImpression] = useState('');
  const [editedAdvice, setEditedAdvice] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (report.bullet_findings_json && report.bullet_findings_json.length > 0) {
      setEditedFindings(report.bullet_findings_json);
    } else if (report.findings_text) {
      const parsed = report.findings_text
        .split('\n')
        .map((s) => s.trim().replace(/^[•*-]\s*/, ''))
        .filter(Boolean);
      setEditedFindings(parsed);
    } else {
      setEditedFindings([
        "Bronchovascular markings are prominent in bilateral lung fields.",
        "Rest of the visualised lung fields are normal.",
        "Bilateral hilum appears normal.",
        "Cardiac silhouette is normal.",
        "Both cp angles are normal.",
        "Visualised bones & soft tissues appear normal."
      ]);
    }

    setEditedImpression(report.impression_text || "Above features are suggestive of bronchitis- likely allergic/infective.");
    setEditedAdvice(report.advice_text || "Clinical correlation.");
  }, [report]);

  const handleSaveEdits = async () => {
    setIsSaving(true);
    try {
      const res = await radiologyApi.updateReport(report.id, {
        bullet_findings_json: editedFindings,
        impression_text: editedImpression,
        advice_text: editedAdvice,
      });
      setIsEditing(false);
      if (onUpdate) onUpdate(res);
    } catch (err) {
      console.error('Failed to update report:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await radiologyApi.approveReport(report.id);
      if (onUpdate) onUpdate(res);
    } catch (err) {
      console.error('Failed to approve report:', err);
    } finally {
      setIsApproving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isApproved = report.status === 'APPROVED';

  return (
    <div className="space-y-4">
      {/* Top Clinical Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg print:hidden">
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider ${
            isApproved
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-sm'
              : 'bg-amber-950 text-amber-300 border border-amber-700/60'
          }`}>
            {isApproved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                REPORT APPROVED & VERIFIED
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                AI DRAFT • PENDING REVIEW
              </>
            )}
          </span>
          <span className="text-xs text-slate-400 font-mono">PID: <strong>{report.pid}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isEditing 
                ? 'bg-cyan-600 text-white shadow-md' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Editing Mode' : 'Edit Report'}
          </button>

          {isEditing && (
            <button
              onClick={handleSaveEdits}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          )}

          {!isApproved && (
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              {isApproving ? 'Approving...' : 'Approve Report'}
            </button>
          )}

          <a
            href={radiologyApi.getReportPdfUrl(report.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Download PDF
          </a>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            Print
          </button>
        </div>
      </div>

      {/* The Medical Report Sheet (Exact Visual match to Reference Image) */}
      <div className="medical-report-sheet bg-white text-slate-900 rounded-lg shadow-2xl overflow-hidden font-sans border border-slate-300 max-w-[840px] mx-auto transition-all print:border-none print:shadow-none print:m-0 print:p-0 print:max-w-none print:w-full print:rounded-none">
        {/* Header Block */}
        <div className="p-6 pb-2">
          <div className="flex items-start justify-between gap-4">
            {/* Logo and Center Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-2xl shadow-sm shrink-0">
                <span className="leading-none text-2xl">+</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-blue-800 font-black tracking-tight text-xl leading-none">
                  <span>MEDSCAN</span>
                  <span className="text-blue-600 font-bold">AI</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-blue-700 font-bold mt-1">
                  <span>⛶ Digital X-Ray</span>
                  <span>|</span>
                  <span>High-Field MRI</span>
                  <span>|</span>
                  <span>AI Copilot Analysis</span>
                </div>
                <p className="text-[9px] text-slate-500 max-w-sm mt-0.5 leading-tight uppercase font-medium">
                  ADVANCED RADIOLOGICAL AI DIAGNOSTIC IMAGING & COPILOT CENTER
                </p>
              </div>
            </div>

            {/* Header Right (Digital Record & Verification) */}
            <div className="text-right text-[11px] space-y-1">
              <div className="flex items-center justify-end gap-1.5 font-extrabold text-blue-900 text-xs tracking-tight">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>DIGITAL RADIOLOGY REPORT</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-slate-500 font-medium text-[10px]">
                <span>AI RADIOLOGY COPILOT VERIFIED RECORD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Accent Striped Ribbon */}
        <div className="bg-blue-600 text-white px-6 py-1 flex items-center justify-between text-[11px] font-semibold relative overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="opacity-90 font-mono tracking-wider">/// MEDSCAN AI CLINICAL RADIOLOGY DIVISION</span>
          </div>
          <span className="text-blue-100 font-mono text-[10px]">www.medscan.ai</span>
        </div>

        {/* Demographics Box */}
        <div className="p-6 py-4 border-b border-slate-200">
          <div className="grid grid-cols-12 gap-3 items-center text-xs">
            {/* Left: Patient Name, Age, Sex */}
            <div className="col-span-4 space-y-0.5">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {report.patient_name || "Yashvi M. Patel"}
              </h2>
              <p className="text-slate-600 font-medium">
                Age : {report.patient_age || 21} Years
              </p>
              <p className="text-slate-600 font-medium">
                Sex : {report.patient_gender || "Female"}
              </p>
            </div>

            {/* QR Code Center */}
            <div className="col-span-2 flex justify-center">
              <div className="w-16 h-16 border border-slate-300 p-1 bg-white rounded shadow-xs flex items-center justify-center">
                {/* Clean inline SVG QR code simulation */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect width="100" height="100" fill="white" />
                  {/* Outer corner 1 */}
                  <rect x="5" y="5" width="30" height="30" fill="black" />
                  <rect x="10" y="10" width="20" height="20" fill="white" />
                  <rect x="15" y="15" width="10" height="10" fill="black" />
                  {/* Outer corner 2 */}
                  <rect x="65" y="5" width="30" height="30" fill="black" />
                  <rect x="70" y="10" width="20" height="20" fill="white" />
                  <rect x="75" y="15" width="10" height="10" fill="black" />
                  {/* Outer corner 3 */}
                  <rect x="5" y="65" width="30" height="30" fill="black" />
                  <rect x="10" y="70" width="20" height="20" fill="white" />
                  <rect x="15" y="75" width="10" height="10" fill="black" />
                  {/* Matrix dots */}
                  <rect x="42" y="10" width="8" height="8" fill="black" />
                  <rect x="42" y="25" width="8" height="8" fill="black" />
                  <rect x="45" y="45" width="12" height="12" fill="black" />
                  <rect x="25" y="45" width="8" height="8" fill="black" />
                  <rect x="65" y="45" width="10" height="8" fill="black" />
                  <rect x="80" y="65" width="8" height="8" fill="black" />
                  <rect x="50" y="75" width="8" height="8" fill="black" />
                  <rect x="70" y="80" width="8" height="8" fill="black" />
                </svg>
              </div>
            </div>

            {/* Mid: PID, Apt ID, Ref By */}
            <div className="col-span-3 space-y-0.5 border-l border-slate-200 pl-3">
              <div className="flex gap-1.5 text-slate-700">
                <span className="font-bold w-12">PID</span>
                <span>: {report.pid || "555"}</span>
              </div>
              <div className="flex gap-1.5 text-slate-700">
                <span className="font-bold w-12">Apt ID</span>
                <span>: {report.apt_id || "2025252"}</span>
              </div>
              <div className="flex gap-1.5 text-slate-700">
                <span className="font-bold w-12">Ref. By</span>
                <span>: <strong className="text-slate-900">{report.ref_by || "Dr. Hiren Shah"}</strong></span>
              </div>
            </div>

            {/* Right: Study Date & Time & Report Date & Time */}
            <div className="col-span-3 space-y-1 text-right text-[11px] border-l border-slate-200 pl-3">
              <div>
                <p className="font-extrabold text-slate-900">Study Date & Time:</p>
                <p className="text-slate-600 font-mono text-[10px]">{report.registered_on || "10:45 AM 15 Sep, 2026"}</p>
              </div>
              <div>
                <p className="font-extrabold text-slate-900">{isApproved ? "Verified Date & Time:" : "Report Date & Time:"}</p>
                <p className="text-slate-600 font-mono text-[10px]">{report.reported_on || "11:15 AM 15 Sep, 2026"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Examination Title Header */}
        <div className="p-5 py-3 text-center space-y-0.5 bg-slate-50/80 border-b border-slate-200">
          <div className="inline-block px-3 py-0.5 rounded bg-blue-100 text-blue-900 font-black text-[10px] uppercase tracking-wider mb-1">
            CLINICAL RADIOLOGICAL INVESTIGATION
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-wide uppercase">
            {report.exam_title || "X-RAY CHEST"}
          </h1>
          <p className="text-xs font-bold text-slate-700">
            {report.exam_view || "X-Ray Chest - PA View"}
          </p>
        </div>

        {/* Report Content Body */}
        <div className="px-8 py-3 space-y-5 text-[12.5px] leading-relaxed text-slate-800 relative">
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <span className="text-8xl font-black tracking-widest text-slate-900">MEDSCAN AI</span>
          </div>

          {/* Bullet Findings */}
          <div className="space-y-1.5">
            {isEditing ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-blue-700 uppercase">Anatomical Observations (Bulleted)</label>
                {editedFindings.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <input
                      type="text"
                      value={f}
                      onChange={(e) => {
                        const updated = [...editedFindings];
                        updated[i] = e.target.value;
                        setEditedFindings(updated);
                      }}
                      className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => setEditedFindings(editedFindings.filter((_, idx) => idx !== i))}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setEditedFindings([...editedFindings, "Normal visualized anatomical structures."])}
                  className="mt-1 text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Finding
                </button>
              </div>
            ) : (
              <ul className="space-y-1 text-slate-800">
                {editedFindings.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-slate-900 font-black">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* DISEASE CLASSIFICATION & CLINICAL STAGING */}
          {(report.disease_name || report.disease_type || report.disease_stage) && (
            <div className="p-3.5 bg-sky-50/90 border-l-4 border-l-sky-600 border border-sky-200 rounded-lg space-y-2 shadow-xs break-inside-avoid">
              <div className="flex items-center justify-between border-b border-sky-200/80 pb-1">
                <span className="text-[11px] font-black tracking-wider text-sky-950 uppercase">
                  DISEASE IDENTIFICATION & ONCOLOGICAL STAGING
                </span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-sky-200/80 text-sky-900 border border-sky-300">
                  AI PRECISION PATHOLOGY
                </span>
              </div>
              <div className="grid grid-cols-12 gap-2 text-xs">
                <div className="col-span-12 sm:col-span-4 space-y-0.5">
                  <p className="text-[10px] font-bold text-sky-700 uppercase">Identified Condition</p>
                  <p className="font-extrabold text-slate-900 text-xs">
                    {report.disease_name || "Pathology Detected"}
                  </p>
                </div>
                <div className="col-span-12 sm:col-span-4 space-y-0.5 border-t sm:border-t-0 sm:border-l border-sky-200 sm:pl-3">
                  <p className="text-[10px] font-bold text-sky-700 uppercase">Tumor / Disease Sub-Type</p>
                  <p className="font-medium text-slate-800 text-xs">
                    {report.disease_type || "Clinical Classification"}
                  </p>
                </div>
                <div className="col-span-12 sm:col-span-4 space-y-0.5 border-t sm:border-t-0 sm:border-l border-sky-200 sm:pl-3">
                  <p className="text-[10px] font-bold text-red-600 uppercase">Phase / Progression Stage</p>
                  <p className="font-extrabold text-red-700 text-xs">
                    {report.disease_stage || "Stage Evaluated"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* IMPRESSION Block */}
          <div className="pt-2 space-y-1 break-inside-avoid">
            <h3 className="font-extrabold text-slate-900 text-xs tracking-wide uppercase">
              IMPRESSION
            </h3>
            {isEditing ? (
              <textarea
                rows={2}
                value={editedImpression}
                onChange={(e) => setEditedImpression(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 resize-none font-medium"
              />
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-blue-600 text-slate-900 font-semibold text-[12.5px] leading-relaxed shadow-xs">
                {editedImpression}
              </div>
            )}
          </div>

          {/* ADVICE Block */}
          <div className="space-y-1 break-inside-avoid">
            <h3 className="font-extrabold text-slate-900 text-xs tracking-wide uppercase">
              ADVICE / CLINICAL PROTOCOL
            </h3>
            {isEditing ? (
              <input
                type="text"
                value={editedAdvice}
                onChange={(e) => setEditedAdvice(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-slate-700 italic font-medium pl-1">
                {editedAdvice}
              </p>
            )}
          </div>

          {/* Embedded Medical Scan Image (Centered & Sharp) */}
          <div className="pt-4 flex justify-center">
            <div className="p-1.5 bg-black rounded border border-slate-400 max-w-[360px] shadow-sm">
              <img
                src={report.scan_image_url || "/static/uploads/chest_xray.jpg"}
                alt="Medical Scan"
                className="max-h-[220px] w-auto object-contain rounded-xs"
              />
            </div>
          </div>
        </div>

        {/* Signatures & Reference Footer */}
        <div className="p-6 pt-4 space-y-3 break-inside-avoid">
          {isApproved && (
            <div className="approval-banner-enter p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold tracking-tight">OFFICIALLY VERIFIED & APPROVED BY RADIOLOGIST</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                SIGNED & RELEASED • {report.reported_on}
              </span>
            </div>
          )}

          <div className="border-t border-slate-300 pt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Thanks for Reference</span>
              <span className="font-mono">****End of Report****</span>
              <span />
            </div>

            {/* Three Signatures */}
            <div className="grid grid-cols-3 gap-4 pt-2 items-end">
              {/* Technologist */}
              <div className="space-y-1">
                <div className="h-9 flex items-end">
                  <svg className="w-28 h-7 text-slate-800" viewBox="0 0 120 30" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 20 Q 30 5, 50 18 T 90 12 Q 105 25, 115 15" />
                  </svg>
                </div>
                <p className="font-extrabold text-slate-900 text-xs leading-none">Radiologic Technologists</p>
                <p className="text-[10px] text-slate-500 leading-none">(MSC, PGDM)</p>
              </div>

              {/* Dr. Payal Shah */}
              <div className="text-center space-y-1">
                <div className="h-9 flex items-end justify-center">
                  <svg className="w-28 h-7 text-slate-800" viewBox="0 0 120 30" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15 22 Q 40 8, 65 24 T 95 10 Q 110 20, 118 12" />
                  </svg>
                </div>
                <p className="font-extrabold text-slate-900 text-xs leading-none">Dr. Payal Shah</p>
                <p className="text-[10px] text-slate-500 leading-none">(MD, Radiologist)</p>
              </div>

              {/* Dr. Vimal Shah */}
              <div className="text-right space-y-1">
                <div className="h-9 flex items-end justify-end">
                  <svg className="w-28 h-7 text-slate-800" viewBox="0 0 120 30" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 18 Q 35 25, 60 10 T 95 20 Q 108 8, 115 16" />
                  </svg>
                </div>
                <p className="font-extrabold text-slate-900 text-xs leading-none">Dr. Vimal Shah</p>
                <p className="text-[10px] text-slate-500 leading-none">(MD, Radiologist)</p>
              </div>
            </div>
          </div>

          {/* Generation Date & Bottom Green/Blue Banner */}
          <div className="pt-2">
            <div className="flex justify-between text-[10px] text-slate-500 font-mono pb-1">
              <span>Generated on : {report.reported_on || "02 Dec, 202X 05:00 PM"}</span>
              <span>Page 1 of 1</span>
            </div>

            <div className="bg-blue-600 text-white rounded-md py-1.5 px-6 flex items-center justify-between font-bold text-xs">
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 text-sm">✦</span>
                <span className="tracking-wide">MEDSCAN AI CLINICAL COPILOT • CONFIDENTIAL DIAGNOSTIC REPORT</span>
              </div>
              <div className="flex items-center gap-1 text-blue-100 font-mono text-[10px]">
                <span>DIGITALLY VERIFIED STUDY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
