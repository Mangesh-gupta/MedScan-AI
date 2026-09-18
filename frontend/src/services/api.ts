import axios from 'axios';
import { Study, DashboardMetrics, Finding, Report, AIAnalysisResult } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const radiologyApi = {
  // Simplified Report Generator methods
  validateScan: async (formData: FormData): Promise<{
    is_genuine: boolean;
    modality: string;
    sub_type: string;
    exam_title?: string;
    exam_view?: string;
    confidence?: number;
    bullet_findings?: string[];
    impression?: string;
    advice?: string;
    reason?: string;
    is_mismatch?: boolean;
    disease_name?: string;
    disease_type?: string;
    disease_stage?: string;
  }> => {
    const res = await api.post('/reports/validate-scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  generateReport: async (formData: FormData): Promise<Report> => {
    const res = await api.post('/reports/generate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getReports: async (): Promise<Report[]> => {
    const res = await api.get('/reports');
    return res.data;
  },

  getReport: async (id: string): Promise<Report> => {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },

  updateReport: async (id: string, data: Partial<Report>): Promise<Report> => {
    const res = await api.put(`/reports/${id}`, data);
    return res.data;
  },

  approveReport: async (id: string): Promise<Report> => {
    const res = await api.post(`/reports/${id}/approve`);
    return res.data;
  },

  getReportPdfUrl: (id: string): string => `/api/reports/${id}/pdf`,
  getPdfExportUrl: (id: string): string => `/api/reports/${id}/pdf`,
  getDocxExportUrl: (id: string): string => `/api/export/${id}/docx`,

  // Dashboard & Studies & Findings
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const res = await api.get('/dashboard');
    return res.data;
  },

  getStudies: async (params?: { modality?: string; status?: string; search?: string }): Promise<Study[]> => {
    const res = await api.get('/studies', { params });
    return res.data;
  },

  getStudy: async (id: string): Promise<Study> => {
    const res = await api.get(`/studies/${id}`);
    return res.data;
  },

  updateStudy: async (id: string, data: Partial<Study>): Promise<Study> => {
    const res = await api.patch(`/studies/${id}`, data);
    return res.data;
  },

  uploadStudy: async (formData: FormData): Promise<any> => {
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  analyzeStudy: async (studyId: string): Promise<AIAnalysisResult> => {
    const res = await api.post(`/analyze/${studyId}`);
    return res.data.data;
  },

  getFindings: async (studyId: string): Promise<Finding[]> => {
    const res = await api.get(`/findings/study/${studyId}`);
    return res.data;
  },

  updateFindingStatus: async (findingId: string, status: string, comment?: string): Promise<Finding> => {
    const res = await api.patch(`/findings/${findingId}`, { status, radiologist_comment: comment });
    return res.data;
  },

  signReport: async (reportId: string, radiologistName: string, signaturePin?: string): Promise<Report> => {
    const res = await api.post(`/reports/${reportId}/sign`, {
      radiologist_name: radiologistName,
      signature_pin: signaturePin
    });
    return res.data;
  },

  getStatistics: async (): Promise<any> => {
    const res = await api.get('/statistics');
    return res.data;
  }
};

export default api;
