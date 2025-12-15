'use client';

import { FiCheck } from 'react-icons/fi';

interface VerifiedBadgeProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}

export function VerifiedBadge({ size = 'sm', showText = false, className = '' }: VerifiedBadgeProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const iconSizes = {
        sm: 'w-2.5 h-2.5',
        md: 'w-3 h-3',
        lg: 'w-3.5 h-3.5',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 ${className}`}
            title="Verified Seller"
        >
            <span
                className={`${sizeClasses[size]} rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0`}
            >
                <FiCheck className={`${iconSizes[size]} text-white stroke-[3]`} />
            </span>
            {showText && (
                <span className="text-xs font-medium text-blue-500">Verified</span>
            )}
        </span>
    );
}
