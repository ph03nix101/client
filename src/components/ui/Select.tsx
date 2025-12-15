import { forwardRef, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: string[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className = '', ...props }, ref) => {
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
                <select
                    ref={ref}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none ${error ? 'border-red-500' : ''} ${className}`}
                    style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: error ? undefined : 'var(--border)',
                        color: 'var(--text-primary)',
                    }}
                    {...props}
                >
                    <option value="">Select...</option>
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);
Select.displayName = 'Select';
