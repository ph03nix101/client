import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    isLoading?: boolean;
    children: ReactNode;
}

export function Button({
    variant = 'primary',
    isLoading = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2';

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
        secondary: 'bg-opacity-20 hover:bg-opacity-30',
        outline: 'border-2 hover:border-blue-500',
    };

    const getOutlineStyle = () => ({
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
        backgroundColor: 'transparent',
    });

    const getSecondaryStyle = () => ({
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-secondary)',
    });

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            style={variant === 'outline' ? getOutlineStyle() : variant === 'secondary' ? getSecondaryStyle() : undefined}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </button>
    );
}
