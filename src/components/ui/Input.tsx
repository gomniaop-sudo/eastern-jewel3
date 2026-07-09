import { forwardRef, type InputHTMLAttributes } from 'react';
import { useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, id: providedId, required, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gold-500 mb-2">
            {label}
            {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={`${error ? errorId : ''} ${hint ? hintId : ''}`.trim() || undefined}
          className={`w-full px-4 py-3 bg-luxury-dark border border-luxury-border text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all duration-300 ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="mt-1 text-sm text-gray-400">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
