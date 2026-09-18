import { create } from 'zustand';

export type WindowPreset = 'default' | 'brain' | 'lung' | 'bone' | 'soft_tissue';
export type ViewerTool = 'select' | 'pan' | 'zoom' | 'measure';

export interface Measurement {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  distanceMm: number;
}

interface ViewerState {
  preset: WindowPreset;
  brightness: number; // 0 - 200
  contrast: number;   // 0 - 200
  zoom: number;       // 0.5 - 5.0
  pan: { x: number; y: number };
  activeTool: ViewerTool;
  measurements: Measurement[];
  showHeatmap: boolean;
  heatmapOpacity: number;
  showMask: boolean;
  maskOpacity: number;
  showBoxes: boolean;
  invert: boolean;

  setPreset: (preset: WindowPreset) => void;
  setBrightness: (val: number) => void;
  setContrast: (val: number) => void;
  setZoom: (val: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setActiveTool: (tool: ViewerTool) => void;
  addMeasurement: (m: Measurement) => void;
  clearMeasurements: () => void;
  setShowHeatmap: (val: boolean) => void;
  setHeatmapOpacity: (val: number) => void;
  setShowMask: (val: boolean) => void;
  setMaskOpacity: (val: number) => void;
  setShowBoxes: (val: boolean) => void;
  setInvert: (val: boolean) => void;
  resetView: () => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  preset: 'default',
  brightness: 100,
  contrast: 100,
  zoom: 1.0,
  pan: { x: 0, y: 0 },
  activeTool: 'select',
  measurements: [],
  showHeatmap: true,
  heatmapOpacity: 0.65,
  showMask: true,
  maskOpacity: 0.55,
  showBoxes: true,
  invert: false,

  setPreset: (preset) => {
    let b = 100, c = 100;
    if (preset === 'brain') { b = 105; c = 130; }
    else if (preset === 'lung') { b = 120; c = 150; }
    else if (preset === 'bone') { b = 90; c = 180; }
    else if (preset === 'soft_tissue') { b = 100; c = 120; }
    set({ preset, brightness: b, contrast: c });
  },
  setBrightness: (brightness) => set({ brightness }),
  setContrast: (contrast) => set({ contrast }),
  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),
  setActiveTool: (activeTool) => set({ activeTool }),
  addMeasurement: (m) => set((state) => ({ measurements: [...state.measurements, m] })),
  clearMeasurements: () => set({ measurements: [] }),
  setShowHeatmap: (showHeatmap) => set({ showHeatmap }),
  setHeatmapOpacity: (heatmapOpacity) => set({ heatmapOpacity }),
  setShowMask: (showMask) => set({ showMask }),
  setMaskOpacity: (maskOpacity) => set({ maskOpacity }),
  setShowBoxes: (showBoxes) => set({ showBoxes }),
  setInvert: (invert) => set({ invert }),
  resetView: () => set({
    preset: 'default',
    brightness: 100,
    contrast: 100,
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    activeTool: 'select',
    invert: false,
  }),
}));
