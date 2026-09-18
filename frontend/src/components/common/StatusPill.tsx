import React from 'react';

interface StatusPillProps {
  status: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const st = status?.toUpperCase() || 'PENDING';

  let color = 'bg-slate-800 text-slate-400 border-slate-700';
  let dotColor = 'bg-slate-400';
  let text = st;

  if (st === 'SIGNED_OFF') {
    color = 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50';
    dotColor = 'bg-emerald-400';
    text = 'Signed Off';
  } else if (st === 'ANALYZED') {
    color = 'bg-cyan-950/60 text-cyan-300 border-cyan-700/50';
    dotColor = 'bg-cyan-400';
    text = 'AI Analyzed';
  } else if (st === 'PROCESSING') {
    color = 'bg-blue-950/60 text-blue-300 border-blue-700/50';
    dotColor = 'bg-blue-400 animate-pulse';
    text = 'Analyzing...';
  } else if (st === 'REVIEWED') {
    color = 'bg-purple-950/60 text-purple-300 border-purple-700/50';
    dotColor = 'bg-purple-400';
    text = 'Under Review';
  } else {
    color = 'bg-amber-950/60 text-amber-300 border-amber-700/50';
    dotColor = 'bg-amber-400';
    text = 'Pending Review';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {text}
    </span>
  );
};
