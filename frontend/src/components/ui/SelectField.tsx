import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { inputErrorClass, inputNormalClass, labelClass } from './inputStyles';

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectFieldProps = {
  id: string;
  label: string;
  error?: string;
  options: SelectOption[];
  /** Tighter label + control for toolbars and filters */
  compact?: boolean;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'>;

const labelClassCompact =
  'mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500';

const fieldClassCompact =
  'min-h-8 cursor-pointer rounded-lg border border-slate-200/90 bg-white/95 px-2.5 py-1.5 text-xs text-slate-900 shadow-sm ring-1 ring-slate-200/40 transition outline-none hover:border-slate-300/90 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20';

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    { id, label, error, options, compact, className = '', ...rest },
    ref,
  ) {
    const errorId = `${id}-error`;
    const fieldClass = error
      ? inputErrorClass
      : compact
        ? fieldClassCompact
        : inputNormalClass;
    const labelStyles = compact ? labelClassCompact : labelClass;

    return (
      <div className="w-full">
        <label htmlFor={id} className={labelStyles}>
          {label}
        </label>
        <select
          ref={ref}
          id={id}
          className={`${compact ? '' : 'min-h-11'} cursor-pointer ${fieldClass} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        >
          {options.map((opt) => (
            <option key={`${opt.value}-${opt.label}`} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p id={errorId} className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
