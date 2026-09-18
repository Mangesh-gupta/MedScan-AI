import React from 'react';

interface SeverityBadgeProps {
  severity: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const sev = severity?.toUpperCase() || 'MODERATE';

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let pulse = false;

  if (sev === 'CRITICAL') {
    colorClasses = 'bg-red-950/90 text-red-300 border-red-600/80';
    pulse = true;
  } else if (sev === 'SEVERE') {
    colorClasses = 'bg-orange-950/80 text-orange-300 border-orange-600/70';
  } else if (sev === 'MODERATE') {
    colorClasses = 'bg-amber-950/80 text-amber-300 border-amber-600/60';
  } else if (sev === 'MILD') {
    colorClasses = 'bg-teal-950/80 text-teal-300 border-teal-600/60';
  } else if (sev === 'NORMAL') {
    colorClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClasses}`}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />}
      {!pulse && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {sev}
    </span>
  );
};
