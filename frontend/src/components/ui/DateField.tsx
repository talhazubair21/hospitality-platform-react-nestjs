import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { inputErrorClass, inputNormalClass, labelClass } from './inputStyles';

export type DateFieldProps = {
  id: string;
  label: string;
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'>;

export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  function DateField({ id, label, error, className = '', ...rest }, ref) {
    const errorId = `${id}-error`;
    const fieldClass = error ? inputErrorClass : inputNormalClass;

    return (
      <div className="w-full">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          type="date"
          className={`min-h-11 ${fieldClass} [color-scheme:light] ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        {error ? (
          <p id={errorId} className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
