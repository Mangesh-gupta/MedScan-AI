import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Move, 
  Ruler, 
  Eye, 
  Layers, 
  Flame, 
  Square, 
  SunMedium, 
  Contrast, 
  Maximize2 
} from 'lucide-react';
import { useViewerStore, WindowPreset, ViewerTool, Measurement } from '../../store/viewerStore';
import { Study, Finding } from '../../types';

interface CanvasDICOMViewerProps {
  study: Study;
  activeFinding?: Finding | null;
}

export const CanvasDICOMViewer: React.FC<CanvasDICOMViewerProps> = ({ study, activeFinding }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    preset,
    setPreset,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    zoom,
    setZoom,
    pan,
    setPan,
    activeTool,
    setActiveTool,
    measurements,
    addMeasurement,
    clearMeasurements,
    showHeatmap,
    setShowHeatmap,
    heatmapOpacity,
    setHeatmapOpacity,
    showMask,
    setShowMask,
    maskOpacity,
    setMaskOpacity,
    showBoxes,
    setShowBoxes,
    invert,
    setInvert,
    resetView,
  } = useViewerStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [measuringStart, setMeasuringStart] = useState<{ x: number; y: number } | null>(null);
  const [tempEnd, setTempEnd] = useState<{ x: number; y: number } | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [heatmapImage, setHeatmapImage] = useState<HTMLImageElement | null>(null);
  const [maskImage, setMaskImage] = useState<HTMLImageElement | null>(null);

  // Load images
  const currentImage = study.images?.[0];
  const imageUrl = currentImage?.image_url || '/static/uploads/brain_mri.jpg';

  const heatmapUrl = study.findings?.[0]?.heatmap_url || null;
  const maskUrl = study.findings?.[0]?.segmentation_mask_url || null;

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => setBaseImage(img);

    if (heatmapUrl) {
      const hImg = new Image();
      hImg.crossOrigin = 'anonymous';
      hImg.src = heatmapUrl;
      hImg.onload = () => setHeatmapImage(hImg);
    } else {
      setHeatmapImage(null);
    }

    if (maskUrl) {
      const mImg = new Image();
      mImg.crossOrigin = 'anonymous';
      mImg.src = maskUrl;
      mImg.onload = () => setMaskImage(mImg);
    } else {
      setMaskImage(null);
    }
  }, [imageUrl, heatmapUrl, maskUrl]);

  // Redraw Canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Translate to center and apply pan & zoom
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, zoom);

    // Apply brightness, contrast, inversion
    const invVal = invert ? 'invert(100%)' : '';
    const brightVal = `brightness(${brightness}%)`;
    const contVal = `contrast(${contrast}%)`;
    ctx.filter = `${brightVal} ${contVal} ${invVal}`.trim();

    // Draw base image centered
    const imgW = baseImage.width || 512;
    const imgH = baseImage.height || 512;
    const drawX = -imgW / 2;
    const drawY = -imgH / 2;

    ctx.drawImage(baseImage, drawX, drawY, imgW, imgH);
    ctx.filter = 'none'; // reset filter for overlays

    // Draw Heatmap Overlay
    if (showHeatmap && heatmapImage) {
      ctx.save();
      ctx.globalAlpha = heatmapOpacity;
      ctx.drawImage(heatmapImage, drawX, drawY, imgW, imgH);
      ctx.restore();
    }

    // Draw Segmentation Mask Overlay
    if (showMask && maskImage) {
      ctx.save();
      ctx.globalAlpha = maskOpacity;
      ctx.drawImage(maskImage, drawX, drawY, imgW, imgH);
      ctx.restore();
    }

    // Draw Bounding Boxes
    if (showBoxes && study.findings) {
      study.findings.forEach((f) => {
        if (f.bounding_box_json) {
          const box = f.bounding_box_json;
          // Box coords are either percentage (0-100) or pixel
          const bx = drawX + (box.x / 100) * imgW;
          const by = drawY + (box.y / 100) * imgH;
          const bw = (box.width / 100) * imgW;
          const bh = (box.height / 100) * imgH;

          ctx.save();
          const isSelected = activeFinding && activeFinding.id === f.id;
          ctx.strokeStyle = isSelected ? '#38bdf8' : (box.color || '#ef4444');
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(bx, by, bw, bh);

          // Box Label
          ctx.setLineDash([]);
          ctx.fillStyle = isSelected ? '#0284c7' : (box.color || '#ef4444');
          ctx.font = 'bold 11px monospace';
          const textPadding = 4;
          const labelText = box.label || `${f.category} (${Math.round(f.confidence_score * 100)}%)`;
          const textW = ctx.measureText(labelText).width;

          ctx.fillRect(bx, by - 18, textW + textPadding * 2, 18);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(labelText, bx + textPadding, by - 5);
          ctx.restore();
        }
      });
    }

    // Draw Measurements
    measurements.forEach((m) => {
      ctx.save();
      ctx.strokeStyle = '#facc15'; // yellow ruler
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.startX, m.startY);
      ctx.lineTo(m.endX, m.endY);
      ctx.stroke();

      // End ticks
      const drawTick = (x: number, y: number) => {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#facc15';
        ctx.fill();
      };
      drawTick(m.startX, m.startY);
      drawTick(m.endX, m.endY);

      // Label text
      const midX = (m.startX + m.endX) / 2;
      const midY = (m.startY + m.endY) / 2;
      ctx.fillStyle = '#000000';
      ctx.fillRect(midX - 25, midY - 14, 50, 16);
      ctx.strokeStyle = '#facc15';
      ctx.strokeRect(midX - 25, midY - 14, 50, 16);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${m.distanceMm.toFixed(1)} mm`, midX, midY - 2);
      ctx.restore();
    });

    // Draw active drawing measurement
    if (measuringStart && tempEnd) {
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(measuringStart.x, measuringStart.y);
      ctx.lineTo(tempEnd.x, tempEnd.y);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }, [
    baseImage,
    heatmapImage,
    maskImage,
    zoom,
    pan,
    brightness,
    contrast,
    invert,
    showHeatmap,
    heatmapOpacity,
    showMask,
    maskOpacity,
    showBoxes,
    study.findings,
    activeFinding,
    measurements,
    measuringStart,
    tempEnd,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Canvas Resize observer
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        draw();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (activeTool === 'pan' || (activeTool === 'select' && e.button === 0)) {
      setIsDragging(true);
      setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
    } else if (activeTool === 'measure') {
      // transform client to image space
      const canvas = canvasRef.current!;
      const cx = (clientX - (canvas.width / 2 + pan.x)) / zoom;
      const cy = (clientY - (canvas.height / 2 + pan.y)) / zoom;
      setMeasuringStart({ x: cx, y: cy });
      setTempEnd({ x: cx, y: cy });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (isDragging) {
      setPan({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });
    } else if (measuringStart) {
      const canvas = canvasRef.current!;
      const cx = (clientX - (canvas.width / 2 + pan.x)) / zoom;
      const cy = (clientY - (canvas.height / 2 + pan.y)) / zoom;
      setTempEnd({ x: cx, y: cy });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
    if (measuringStart && tempEnd) {
      const dx = tempEnd.x - measuringStart.x;
      const dy = tempEnd.y - measuringStart.y;
      const distPx = Math.sqrt(dx * dx + dy * dy);
      // assume 0.5 mm / pixel scale
      const distMm = distPx * 0.5;

      if (distMm > 1.0) {
        addMeasurement({
          id: Math.random().toString(),
          startX: measuringStart.x,
          startY: measuringStart.y,
          endX: tempEnd.x,
          endY: tempEnd.y,
          distanceMm: distMm,
        });
      }
      setMeasuringStart(null);
      setTempEnd(null);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const nextZoom = Math.min(Math.max(zoom * factor, 0.5), 5.0);
    setZoom(nextZoom);
  };

  const presets: { id: WindowPreset; label: string }[] = [
    { id: 'default', label: 'Default' },
    { id: 'brain', label: 'Brain (T1/T2)' },
    { id: 'lung', label: 'Lung (Parenchyma)' },
    { id: 'bone', label: 'Bone Window' },
    { id: 'soft_tissue', label: 'Soft Tissue' },
  ];

  return (
    <div className="flex flex-col h-full bg-black rounded-xl border border-slate-800 overflow-hidden select-none">
      {/* Top Toolbar */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Preset Window/Level buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1">Window:</span>
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                preset === p.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTool('select')}
            className={`p-1.5 rounded ${activeTool === 'select' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Pan / Select Tool"
          >
            <Move className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool('measure')}
            className={`p-1.5 rounded ${activeTool === 'measure' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Calibrated Measurement Ruler (mm)"
          >
            <Ruler className="w-4 h-4" />
          </button>
          {measurements.length > 0 && (
            <button
              onClick={clearMeasurements}
              className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-red-400 rounded text-[11px]"
            >
              Clear ({measurements.length})
            </button>
          )}

          <div className="h-4 w-[1px] bg-slate-700 mx-1" />

          {/* Zoom controls */}
          <button
            onClick={() => setZoom(Math.min(zoom * 1.15, 5.0))}
            className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom * 0.85, 0.5))}
            className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setInvert(!invert)}
            className={`p-1.5 rounded ${invert ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Invert Grayscale"
          >
            <Contrast className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
            title="Reset Viewport"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* AI Overlays Controls */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1 rounded-lg border border-slate-800">
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showBoxes}
              onChange={(e) => setShowBoxes(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <Square className="w-3.5 h-3.5 text-red-400" />
            Boxes
          </label>

          <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Grad-CAM Heatmap
          </label>
          {showHeatmap && (
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={heatmapOpacity}
              onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
              className="w-16 accent-amber-500 cursor-pointer"
              title="Heatmap Opacity"
            />
          )}

          <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showMask}
              onChange={(e) => setShowMask(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            MONAI Mask
          </label>
          {showMask && (
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={maskOpacity}
              onChange={(e) => setMaskOpacity(parseFloat(e.target.value))}
              className="w-16 accent-cyan-500 cursor-pointer"
              title="Mask Opacity"
            />
          )}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div ref={containerRef} className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className={`w-full h-full block ${activeTool === 'measure' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
        />

        {/* HUD Medical Information Overlay (Siemens / GE Style) */}
        {/* Top-Left */}
        <div className="absolute top-3 left-4 pointer-events-none font-mono text-[11px] text-cyan-400 leading-tight drop-shadow-md bg-slate-950/40 p-2 rounded border border-slate-800/40">
          <p className="font-bold text-white text-xs">{study.patient?.full_name || 'ANONYMOUS'}</p>
          <p>MRN: {study.patient?.mrn || 'N/A'}</p>
          <p>{study.patient?.age} Y / {study.patient?.gender}</p>
        </div>

        {/* Top-Right */}
        <div className="absolute top-3 right-4 pointer-events-none font-mono text-[11px] text-cyan-400 text-right leading-tight drop-shadow-md bg-slate-950/40 p-2 rounded border border-slate-800/40">
          <p className="font-bold text-slate-200">MEDSCAN AI CLINICAL PACS</p>
          <p>{study.modality} - {study.body_part}</p>
          <p>ACC: {study.accession_number}</p>
        </div>

        {/* Bottom-Left */}
        <div className="absolute bottom-3 left-4 pointer-events-none font-mono text-[11px] text-slate-400 leading-tight drop-shadow-md bg-slate-950/40 p-2 rounded border border-slate-800/40">
          <p>ZOOM: {(zoom * 100).toFixed(0)}%</p>
          <p>BRIGHTNESS: {brightness}% | CONTRAST: {contrast}%</p>
          <p>WINDOW PRESET: <span className="text-cyan-400 uppercase font-bold">{preset}</span></p>
        </div>

        {/* Bottom-Right */}
        <div className="absolute bottom-3 right-4 pointer-events-none font-mono text-[11px] text-slate-400 text-right leading-tight drop-shadow-md bg-slate-950/40 p-2 rounded border border-slate-800/40">
          <p>MATRIX: 512 x 512</p>
          <p>SPACING: 0.5 mm x 0.5 mm</p>
          <p className="text-emerald-400">AI CONFIDENCE: 94.2%</p>
        </div>
      </div>
    </div>
  );
};
