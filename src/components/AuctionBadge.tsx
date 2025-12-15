'use client';

import { FiClock } from 'react-icons/fi';

interface AuctionBadgeProps {
    endTime: string;
    size?: 'sm' | 'md';
}

export function AuctionBadge({ endTime, size = 'sm' }: AuctionBadgeProps) {
    const getTimeRemaining = () => {
        const now = Date.now();
        const end = new Date(endTime).getTime();
        const diff = end - now;

        if (diff <= 0) return 'Ended';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d left`;
        if (hours > 0) return `${hours}h left`;

        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}m left`;
    };

    return (
        <div className={`inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-full ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
            }`}>
            <FiClock className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
            <span>{getTimeRemaining()}</span>
        </div>
    );
}
