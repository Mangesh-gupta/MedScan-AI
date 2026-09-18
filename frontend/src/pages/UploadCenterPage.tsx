import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileCheck, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ScanEye 
} from 'lucide-react';
import { radiologyApi } from '../services/api';
import { useStudyStore } from '../store/studyStore';

export const UploadCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchStudies } = useStudyStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [mrn, setMrn] = useState('');
  const [modality, setModality] = useState('MRI');
  const [bodyPart, setBodyPart] = useState('BRAIN');
  const [priority, setPriority] = useState('ROUTINE');
  const [description, setDescription] = useState('');
  const [autoAnalyze, setAutoAnalyze] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);

    // Set preview if image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // Infer modality from name
    const fn = file.name.toLowerCase();
    if (fn.includes('brain') || fn.includes('mri')) {
      setModality('MRI');
      setBodyPart('BRAIN');
    } else if (fn.includes('chest') || fn.includes('lung') || fn.includes('xray')) {
      setModality('XRAY');
      setBodyPart('CHEST');
    } else if (fn.includes('ct') || fn.includes('abdomen')) {
      setModality('CT');
      setBodyPart('ABDOMEN');
    } else if (fn.includes('us') || fn.includes('thyroid') || fn.includes('ultrasound')) {
      setModality('ULTRASOUND');
      setBodyPart('THYROID');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a medical image or DICOM file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (patientName) formData.append('patient_name', patientName);
    if (mrn) formData.append('mrn', mrn);
    if (modality) formData.append('modality', modality);
    if (bodyPart) formData.append('body_part', bodyPart);
    if (priority) formData.append('priority', priority);
    if (description) formData.append('study_description', description);

    try {
      setUploadProgress(60);
      const res = await radiologyApi.uploadStudy(formData);
      setUploadProgress(85);

      if (autoAnalyze && res.study_id) {
        await radiologyApi.analyzeStudy(res.study_id);
      }

      setUploadProgress(100);
      setUploadSuccess(res);
      await fetchStudies();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Medical Imaging Upload Center</h1>
        <p className="text-sm text-slate-400">
          Accepts DICOM (.dcm), JPG, PNG formats with automated modality recognition & PACS indexing.
        </p>
      </div>

      {uploadSuccess ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-emerald-800/50 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Study Ingestion & Analysis Completed!</h2>
            <p className="text-sm text-slate-300">
              Accession: <strong className="font-mono text-cyan-400">{uploadSuccess.accession_number}</strong> | Patient: <strong>{uploadSuccess.patient_name}</strong>
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate(`/viewer?studyId=${uploadSuccess.study_id}`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-cyan-600/20 cursor-pointer"
            >
              <ScanEye className="w-4 h-4" />
              Open in DICOM Viewer
            </button>
            <button
              onClick={() => {
                setUploadSuccess(null);
                setSelectedFile(null);
                setFilePreview(null);
              }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm rounded-xl border border-slate-700 cursor-pointer"
            >
              Upload Another Scan
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dropzone on left 2 cols */}
          <div className="md:col-span-2 space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-8 bg-slate-900/60 hover:bg-slate-900 flex flex-col items-center justify-center min-h-[320px] transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".dcm,.dicom,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="hidden"
              />

              {filePreview ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={filePreview}
                    alt="Scan Preview"
                    className="max-h-56 rounded-lg shadow-md border border-slate-700 object-contain"
                  />
                  <span className="text-xs font-mono text-cyan-400 font-semibold">{selectedFile?.name}</span>
                  <span className="text-[11px] text-slate-500">Click or drop to replace image</span>
                </div>
              ) : selectedFile ? (
                <div className="flex flex-col items-center gap-2 text-center">
                  <FileCheck className="w-12 h-12 text-cyan-400" />
                  <p className="text-sm font-bold text-slate-200">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-950/60 transition-all">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Drag and drop imaging study here</p>
                    <p className="text-xs text-slate-400 mt-1">Supports DICOM (.dcm), JPG, PNG files</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-400 border border-slate-700">
                    Browse Files
                  </span>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Metadata Form on right col */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Study Metadata</h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Patient Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">MRN / Patient ID</label>
                <input
                  type="text"
                  placeholder="e.g. MRN-99821"
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Modality</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="MRI">MRI</option>
                    <option value="CT">CT Scan</option>
                    <option value="XRAY">X-Ray</option>
                    <option value="ULTRASOUND">Ultrasound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-semibold"
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="URGENT">Urgent</option>
                    <option value="STAT">STAT (Critical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Anatomical Region</label>
                <input
                  type="text"
                  placeholder="e.g. Brain, Chest, Abdomen"
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Clinical Indication / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Reason for exam, relevant symptoms..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAnalyze}
                    onChange={(e) => setAutoAnalyze(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <span className="text-slate-300 font-medium">Trigger AI Copilot analysis immediately</span>
                </label>
              </div>

              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] text-cyan-400 font-mono">
                    <span>Uploading & Analyzing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                {isUploading ? 'Processing Study...' : 'Ingest Study into PACS'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
