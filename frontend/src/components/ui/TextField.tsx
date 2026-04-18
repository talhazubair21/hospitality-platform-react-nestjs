import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { inputErrorClass, inputNormalClass, labelClass } from './inputStyles';

export type TextFieldProps = {
  id: string;
  label: string;
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ id, label, error, className = '', ...rest }, ref) {
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
          className={`${fieldClass} ${className}`}
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
