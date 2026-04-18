/** Shared Tailwind classes for form controls */
export const inputBaseClass =
  'w-full rounded-xl border bg-white/95 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ring-1 transition outline-none placeholder:text-slate-400 hover:border-slate-300/90 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20';

export const inputNormalClass = `${inputBaseClass} border-slate-200/90 ring-slate-200/40`;

export const inputErrorClass = `${inputBaseClass} border-red-300 ring-red-200/60`;

export const labelClass =
  'mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500';
