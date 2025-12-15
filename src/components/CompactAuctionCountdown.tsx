'use client';

import { useEffect, useState } from 'react';
import { FiClock } from 'react-icons/fi';

interface CompactAuctionCountdownProps {
    endTime: string;
}

export function CompactAuctionCountdown({ endTime }: CompactAuctionCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const calculateTime = () => {
            const now = Date.now();
            const end = new Date(endTime).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('Ended');
                setIsUrgent(false);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h`);
                setIsUrgent(days < 1);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m`);
                setIsUrgent(true);
            } else {
                setTimeLeft(`${minutes}m`);
                setIsUrgent(true);
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 60000); // Update every minute is enough for card view

        return () => clearInterval(interval);
    }, [endTime]);

    if (!timeLeft) return null;

    return (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${isUrgent ? 'text-orange-500' : 'text-blue-500'
            }`}>
            <FiClock className="w-3.5 h-3.5" />
            <span>{timeLeft === 'Ended' ? 'Ended' : `Ends in ${timeLeft}`}</span>
        </div>
    );
}
