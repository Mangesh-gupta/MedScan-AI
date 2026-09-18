import React from 'react';

interface ModalityBadgeProps {
  modality: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ModalityBadge: React.FC<ModalityBadgeProps> = ({ modality, size = 'md' }) => {
  const mod = modality?.toUpperCase() || 'UNKNOWN';

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let label = mod;

  if (mod === 'MRI') {
    colorClasses = 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60 shadow-sm shadow-indigo-950';
    label = 'MRI • MONAI';
  } else if (mod === 'CT') {
    colorClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-sm shadow-emerald-950';
    label = 'CT • MONAI';
  } else if (mod === 'XRAY' || mod === 'XR') {
    colorClasses = 'bg-sky-950/80 text-sky-300 border-sky-700/60 shadow-sm shadow-sky-950';
    label = 'X-RAY • CheXagent';
  } else if (mod === 'ULTRASOUND' || mod === 'US') {
    colorClasses = 'bg-amber-950/80 text-amber-300 border-amber-700/60 shadow-sm shadow-amber-950';
    label = 'US • TIRADS';
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3.5 py-1.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-semibold rounded-md border tracking-wider uppercase font-mono ${colorClasses} ${sizeClasses}`}>
      {label}
    </span>
  );
};
