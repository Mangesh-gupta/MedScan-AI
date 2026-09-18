import { create } from 'zustand';
import { Study, Finding, Report } from '../types';
import { radiologyApi } from '../services/api';

interface StudyState {
  studies: Study[];
  selectedStudy: Study | null;
  currentReport: Report | null;
  currentFindings: Finding[];
  modalityFilter: string;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  setModalityFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  fetchStudies: () => Promise<void>;
  selectStudyById: (studyId: string) => Promise<void>;
  updateFindingStatus: (findingId: string, status: string) => Promise<void>;
  runAIAnalysis: (studyId: string) => Promise<any>;
}

export const useStudyStore = create<StudyState>((set, get) => ({
  studies: [],
  selectedStudy: null,
  currentReport: null,
  currentFindings: [],
  modalityFilter: 'ALL',
  searchQuery: '',
  isLoading: false,
  error: null,

  setModalityFilter: (filter) => {
    set({ modalityFilter: filter });
    get().fetchStudies();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchStudies();
  },

  fetchStudies: async () => {
    set({ isLoading: true, error: null });
    try {
      const { modalityFilter, searchQuery } = get();
      const params: any = {};
      if (modalityFilter !== 'ALL') params.modality = modalityFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await radiologyApi.getStudies(params);
      set({ studies: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load studies', isLoading: false });
    }
  },

  selectStudyById: async (studyId: string) => {
    set({ isLoading: true });
    try {
      const study = await radiologyApi.getStudy(studyId);
      let report: Report | null = null;
      let findings: Finding[] = [];

      try {
        report = await radiologyApi.getReport(studyId);
      } catch (e) {
        // No report yet
      }

      try {
        findings = await radiologyApi.getFindings(studyId);
      } catch (e) {
        // No findings
      }

      set({
        selectedStudy: study,
        currentReport: report,
        currentFindings: findings,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateFindingStatus: async (findingId: string, status: string) => {
    try {
      const updated = await radiologyApi.updateFindingStatus(findingId, status);
      set((state) => ({
        currentFindings: state.currentFindings.map((f) =>
          f.id === findingId ? { ...f, status: updated.status } : f
        ),
      }));
    } catch (err) {
      console.error('Failed to update finding status:', err);
    }
  },

  runAIAnalysis: async (studyId: string) => {
    set({ isLoading: true });
    try {
      const result = await radiologyApi.analyzeStudy(studyId);
      await get().selectStudyById(studyId);
      await get().fetchStudies();
      set({ isLoading: false });
      return result;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
