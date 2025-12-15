import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    unit?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, unit, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label
                        className="block text-sm font-medium mb-1"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none ${error ? 'border-red-500' : ''} ${unit ? 'pr-12' : ''} ${className}`}
                        style={{
                            backgroundColor: 'var(--input-bg)',
                            borderColor: error ? undefined : 'var(--border)',
                            color: 'var(--text-primary)',
                        }}
                        {...props}
                    />
                    {unit && (
                        <span
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {unit}
                        </span>
                    )}
                </div>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';
