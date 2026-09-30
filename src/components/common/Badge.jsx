import React from 'react';

export default function Badge({ status, variant, className = '' }) {
  const norm = (status || variant || '').toString().toLowerCase().trim();

  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (['approved', 'completed', 'active', 'good', 'delivered', 'accepted', 'success'].includes(norm)) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (['pending', 'in progress', 'in-progress', 'draft', 'partially dispatched', 'warning', 'changes requested'].includes(norm)) {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (['rejected', 'critical', 'over target', 'over-target', 'danger', 'cancelled', 'exception'].includes(norm)) {
    style = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (['info', 'cable', 'transformer', 'switchgear', 'meter'].includes(norm)) {
    style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    dotColor = 'bg-indigo-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status || variant || 'N/A'}</span>
    </span>
  );
}
