import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  UploadCloud, 
  Sparkles, 
  FileCheck, 
  User, 
  Calendar, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Zap,
  RotateCcw
} from 'lucide-react';
import { radiologyApi } from '../services/api';
import { Report } from '../types';
import { ReportSheet } from '../components/report/ReportSheet';

export const GeneratorWorkspace: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reportIdParam = searchParams.get('reportId');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>('/static/uploads/chest_xray.jpg');
  const [patientName, setPatientName] = useState('Yashvi M. Patel');
  const [age, setAge] = useState<number>(21);
  const [gender, setGender] = useState('Female');
  const [refBy, setRefBy] = useState('Dr. Hiren Shah');
  const [examTitle, setExamTitle] = useState('X-RAY CHEST');
  const [examView, setExamView] = useState('X-Ray Chest - PA View');
  const [clinicalHistory, setClinicalHistory] = useState('Fever, cough and shortness of breath.');

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // AI Pre-Validation State
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    is_genuine: boolean;
    is_mismatch?: boolean;
    modality?: string;
    sub_type?: string;
    exam_title?: string;
    exam_view?: string;
    confidence?: number;
    disease_name?: string;
    disease_type?: string;
    disease_stage?: string;
    reason?: string;
  } | null>({
    is_genuine: true,
    is_mismatch: false,
    modality: 'XRAY',
    sub_type: 'Chest X-Ray',
    exam_title: 'X-RAY CHEST',
    exam_view: 'X-Ray Chest - PA View',
    confidence: 0.988,
    disease_name: 'Acute Bronchial Inflammation',
    disease_type: 'Infective / Allergic Bronchitis',
    disease_stage: 'Moderate Acute Phase (Peribronchial Cuffing)',
  });

  // Load initial reference report or specified reportIdParam on mount
  useEffect(() => {
    if (reportIdParam) {
      radiologyApi.getReport(reportIdParam)
        .then((rep) => {
          if (rep) {
            setActiveReport(rep);
            if (rep.scan_image_url) setFilePreview(rep.scan_image_url);
            if (rep.patient_name) setPatientName(rep.patient_name);
            if (rep.patient_age) setAge(rep.patient_age);
            if (rep.patient_gender) setGender(rep.patient_gender);
            if (rep.ref_by) setRefBy(rep.ref_by);
            if (rep.exam_title) setExamTitle(rep.exam_title);
            if (rep.exam_view) setExamView(rep.exam_view);
          }
        })
        .catch((err) => console.error(err));
    } else {
      radiologyApi.getReports()
        .then((reports) => {
          if (reports.length > 0) {
            setActiveReport(reports[0]);
            if (reports[0].scan_image_url) {
              setFilePreview(reports[0].scan_image_url);
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }, [reportIdParam]);

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);
    setIsValidating(true);

    const reader = new FileReader();
    reader.onload = (e) => setFilePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('exam_title', examTitle);
      formData.append('expected_exam', examTitle);

      const val = await radiologyApi.validateScan(formData);
      setValidationResult(val);

      if (val.is_genuine) {
        if (val.exam_title) setExamTitle(val.exam_title);
        if (val.exam_view) setExamView(val.exam_view);
      }
    } catch (err: any) {
      console.error('Scan validation error:', err);
      setValidationResult({
        is_genuine: false,
        reason: err.response?.data?.detail || 'AI failed to process image validation.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationResult && !validationResult.is_genuine) {
      setErrorMsg(validationResult.reason || 'Cannot generate report: scan failed AI anatomical validation.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        const response = await fetch(filePreview || '/static/uploads/chest_xray.jpg');
        const blob = await response.blob();
        formData.append('file', blob, 'scan.jpg');
      }

      formData.append('patient_name', patientName);
      formData.append('age', age.toString());
      formData.append('gender', gender);
      formData.append('ref_by', refBy);
      formData.append('exam_title', examTitle);
      formData.append('exam_view', examView);
      formData.append('clinical_history', clinicalHistory);

      const generated = await radiologyApi.generateReport(formData);
      setActiveReport(generated);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Report generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick preset loader (MRI & X-Ray only)
  const loadPreset = (preset: 'chest' | 'brain' | 'lung' | 'knee') => {
    setSelectedFile(null);
    setErrorMsg(null);

    if (preset === 'chest') {
      setPatientName('Yashvi M. Patel');
      setAge(21);
      setGender('Female');
      setRefBy('Dr. Hiren Shah');
      setExamTitle('X-RAY CHEST');
      setExamView('X-Ray Chest - PA View');
      setClinicalHistory('Fever, productive cough and shortness of breath for 4 days.');
      setFilePreview('/static/uploads/chest_xray.jpg');
      setValidationResult({
        is_genuine: true,
        is_mismatch: false,
        modality: 'XRAY',
        sub_type: 'Chest X-Ray',
        exam_title: 'X-RAY CHEST',
        exam_view: 'X-Ray Chest - PA View',
        confidence: 0.988,
        disease_name: 'Acute Bronchial Inflammation',
        disease_type: 'Infective / Allergic Bronchitis',
        disease_stage: 'Moderate Acute Phase (Peribronchial Cuffing)',
      });
    } else if (preset === 'brain') {
      setPatientName('Eleanor Vance');
      setAge(54);
      setGender('Female');
      setRefBy('Dr. Arthur Davies');
      setExamTitle('BRAIN MRI WITH CONTRAST');
      setExamView('Brain MRI - Axial T1ce & FLAIR View');
      setClinicalHistory('Morning headaches, altered mental status, and progressive hemiparesis.');
      setFilePreview('/static/uploads/brain_mri.jpg');
      setValidationResult({
        is_genuine: true,
        is_mismatch: false,
        modality: 'MRI',
        sub_type: 'Brain MRI',
        exam_title: 'BRAIN MRI WITH CONTRAST',
        exam_view: 'Brain MRI - Axial T1ce & FLAIR View',
        confidence: 0.985,
        disease_name: 'Primary Malignant Brain Neoplasm (Brain Tumor)',
        disease_type: 'Glioblastoma Multiforme (GBM) - CNS WHO Grade IV (IDH-wildtype Astrocytoma)',
        disease_stage: 'Advanced Necrotic Phase (WHO Grade IV) with Mass Effect & 4.5mm Midline Shift',
      });
    } else if (preset === 'lung') {
      setPatientName('Arthur Davies');
      setAge(62);
      setGender('Male');
      setRefBy('Dr. Emily Thorne');
      setExamTitle('LUNG MRI (THORACIC MRI)');
      setExamView('Lung MRI - Axial T2 & Diffusion Weighted (DWI) View');
      setClinicalHistory('Chronic hemoptysis, right pleuritic chest pain, and 8 kg weight loss.');
      setFilePreview('/static/uploads/lung_mri.jpg');
      setValidationResult({
        is_genuine: true,
        is_mismatch: false,
        modality: 'MRI',
        sub_type: 'Lung MRI',
        exam_title: 'LUNG MRI (THORACIC MRI)',
        exam_view: 'Lung MRI - Axial T2 & Diffusion Weighted (DWI) View',
        confidence: 0.970,
        disease_name: 'Primary Bronchogenic Malignancy (Lung Tumor)',
        disease_type: 'Non-Small Cell Lung Carcinoma (NSCLC) - High suspicion for Invasive Adenocarcinoma',
        disease_stage: 'Locally Advanced Phase (Clinical Stage T2b N1 M0 - Stage IIB/IIIA)',
      });
    } else if (preset === 'knee') {
      setPatientName('James Wilson');
      setAge(49);
      setGender('Male');
      setRefBy('Dr. Marcus Bell');
      setExamTitle('KNEE RADIOGRAPH (X-RAY)');
      setExamView('Knee X-Ray - Lateral & AP View');
      setClinicalHistory('Chronic right knee stiffness, deep joint line tenderness aggravated by stairs.');
      setFilePreview('/static/uploads/knee_xray.jpg');
      setValidationResult({
        is_genuine: true,
        is_mismatch: false,
        modality: 'XRAY',
        sub_type: 'Knee / Bone X-Ray',
        exam_title: 'KNEE RADIOGRAPH (X-RAY)',
        exam_view: 'Knee X-Ray - Lateral & AP View',
        confidence: 0.960,
        disease_name: 'Degenerative Joint Disease (Knee Osteoarthritis)',
        disease_type: 'Medial Compartment Knee Osteoarthritis (Gonarthrosis)',
        disease_stage: 'Kellgren-Lawrence Grade II (Moderate Phase with Joint Space Narrowing)',
      });
    }
  };

  return (
    <div className="p-6 max-w-[1580px] mx-auto space-y-6 print:p-0 print:m-0 print:max-w-none animate-fade-in-up">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form & Upload (5 Cols) */}
        <div className="xl:col-span-5 space-y-5 print:hidden animate-fade-in-left">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 card-hover">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">Radiology Copilot Ingestion</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload MRI or X-Ray scan with patient details to generate an instant clinical report.
              </p>
            </div>

            {/* Quick Sample Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Demo Cases:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadPreset('chest')}
                  className="preset-btn delay-0 animate-fade-in-up px-2.5 py-1 rounded-lg bg-blue-950/70 border border-blue-800 text-blue-300 text-xs font-medium hover:bg-blue-900 cursor-pointer"
                >
                  Chest X-Ray (Yashvi)
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('brain')}
                  className="preset-btn delay-100 animate-fade-in-up px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-800 text-indigo-300 text-xs font-medium hover:bg-indigo-900 cursor-pointer"
                >
                  Brain MRI (Eleanor)
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('lung')}
                  className="preset-btn delay-200 animate-fade-in-up px-2.5 py-1 rounded-lg bg-teal-950/70 border border-teal-800 text-teal-300 text-xs font-medium hover:bg-teal-900 cursor-pointer"
                >
                  Lung MRI (Arthur)
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('knee')}
                  className="preset-btn delay-300 animate-fade-in-up px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-700 cursor-pointer"
                >
                  Knee X-Ray (James)
                </button>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Upload Medical Scan
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 bg-slate-950 flex flex-col items-center justify-center min-h-[160px] transition-all cursor-pointer text-center relative overflow-hidden group ${
                  isValidating
                    ? 'border-cyan-500 scan-line-container border-dance'
                    : 'border-slate-700 hover:border-cyan-500 hover:bg-slate-950/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.dcm,.dicom"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                />

                {filePreview ? (
                  <div className="flex items-center gap-4 w-full animate-scale-in">
                    <img
                      src={filePreview}
                      alt="Scan Thumbnail"
                      className="w-24 h-24 object-contain rounded-lg bg-black border border-slate-700 shrink-0 transition-all duration-300 group-hover:border-cyan-700/60 group-hover:shadow-md group-hover:shadow-cyan-900/30"
                    />
                    <div className="text-left space-y-1 overflow-hidden">
                      <p className="text-xs font-bold text-cyan-400 truncate">
                        {selectedFile ? selectedFile.name : 'Medical Scan Loaded'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB` : 'Ready for AI processing'}
                      </p>
                      <span className="inline-block text-[10px] text-slate-500 underline">
                        Click to upload another scan
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1" />
                    <p className="text-xs font-bold text-slate-200">Drag & drop scan or click to browse</p>
                    <p className="text-[10px] text-slate-500">MRI or X-Ray (JPG, PNG, DICOM)</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Authenticity Validation Badge Card */}
            {isValidating && (
              <div className="animate-validation-reveal p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/80 text-blue-200 text-xs flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <div>
                  <p className="font-bold text-cyan-300">AI Pre-Validation & Anatomical Verification In Progress...</p>
                  <p className="text-[11px] text-blue-300/80">Checking pixel density, tissue structures & cross-validating with examination title.</p>
                </div>
              </div>
            )}

            {!isValidating && validationResult && (
              validationResult.is_genuine ? (
                <div className="animate-validation-reveal p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/70 text-emerald-200 text-xs space-y-2 shadow-sm pulse-glow-emerald">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Verified Genuine Medical Scan: {validationResult.sub_type}</span>
                    </div>
                    {validationResult.confidence && (
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-600/60">
                        {(validationResult.confidence * 100).toFixed(1)}% AI Match
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-emerald-300/90 pl-6">
                    <span>Modality: <strong>{validationResult.modality}</strong></span>
                    <span>•</span>
                    <span>Region: <strong>{validationResult.sub_type}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">Anatomical Check Passed</span>
                  </div>

                  {validationResult.disease_name && (
                    <div className="mt-1 pt-2 border-t border-emerald-800/60 pl-6 text-[11px] space-y-0.5">
                      <p className="text-emerald-200">
                        <strong className="text-emerald-400">Pathology:</strong> {validationResult.disease_name}
                      </p>
                      <p className="text-emerald-300/90">
                        <strong className="text-emerald-400">Sub-Type:</strong> {validationResult.disease_type}
                      </p>
                      <p className="text-amber-300 font-semibold">
                        <strong>Stage / Phase:</strong> {validationResult.disease_stage}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="animate-validation-reveal p-3.5 rounded-xl bg-red-950/70 border border-red-700/80 text-red-200 text-xs space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>
                      {validationResult.is_mismatch 
                        ? 'Anatomical Mismatch Rejected by AI' 
                        : 'Non-Medical Image Rejected by AI'}
                    </span>
                  </div>
                  <p className="text-[11px] text-red-300/90 pl-6 leading-relaxed">
                    {validationResult.reason || 'Uploaded image does not match the radiological criteria for this study.'}
                  </p>
                  <p className="text-[10px] text-red-400 pl-6 font-semibold">
                    {validationResult.is_mismatch
                      ? `Please upload a scan that matches '${examTitle}' or update your exam selection.`
                      : 'Please upload a genuine diagnostic MRI or X-Ray image.'}
                  </p>
                </div>
              )
            )}

            {/* Patient Form */}
            <form onSubmit={handleGenerate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Yashvi M. Patel"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Age (Years)</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Referring Doctor</label>
                <input
                  type="text"
                  required
                  value={refBy}
                  onChange={(e) => setRefBy(e.target.value)}
                  placeholder="e.g. Dr. Hiren Shah"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Examination Title</label>
                  <input
                    type="text"
                    required
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="e.g. X-RAY CHEST"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">View / Projection</label>
                  <input
                    type="text"
                    required
                    value={examView}
                    onChange={(e) => setExamView(e.target.value)}
                    placeholder="e.g. X-Ray Chest - PA View"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Clinical Indication / Symptoms</label>
                <textarea
                  rows={2}
                  value={clinicalHistory}
                  onChange={(e) => setClinicalHistory(e.target.value)}
                  placeholder="Clinical notes, indication for study..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-medium focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {errorMsg && (
                <div className="animate-scale-in p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating || isValidating || (validationResult !== null && !validationResult.is_genuine)}
                className="btn-press w-full mt-2 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer pulse-glow-cyan"
              >
                <Zap className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating 
                  ? 'Generating AI Radiology Report...' 
                  : (validationResult && !validationResult.is_genuine 
                      ? 'Upload Genuine Scan to Generate' 
                      : 'Generate AI Radiology Report')}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Exact Reference Report Preview (7 Cols) */}
        <div className="xl:col-span-7 print:w-full print:m-0 print:p-0">
          {activeReport ? (
            <div key={activeReport.id} className="animate-report-reveal">
              <ReportSheet
                report={activeReport}
                onUpdate={(updated) => setActiveReport(updated)}
              />
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-4 shadow-xl animate-fade-in-up card-hover">
              <FileText className="w-16 h-16 text-slate-700 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-300">No Report Generated Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Fill in patient details on the left and click "Generate AI Radiology Report" to produce your report.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

