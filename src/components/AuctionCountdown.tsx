'use client';

import { useEffect, useState } from 'react';

interface AuctionCountdownProps {
    endTime: string;
    onEnd?: () => void;
}

export function AuctionCountdown({ endTime, onEnd }: AuctionCountdownProps) {
    const [timeRemaining, setTimeRemaining] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);
    const [ended, setEnded] = useState(false);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = Date.now();
            const end = new Date(endTime).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setEnded(true);
                setTimeRemaining(null);
                onEnd?.();
                return;
            }

            setTimeRemaining({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [endTime, onEnd]);

    if (ended) {
        return (
            <div className="text-center py-2 px-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <span className="text-red-400 font-medium">Auction Ended</span>
            </div>
        );
    }

    if (!timeRemaining) {
        return (
            <div className="animate-pulse h-10 bg-gray-500/20 rounded-lg" />
        );
    }

    const isUrgent = timeRemaining.days === 0 && timeRemaining.hours < 1;

    return (
        <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg border ${isUrgent
                ? 'bg-orange-500/10 border-orange-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
            }`}>
            {timeRemaining.days > 0 && (
                <TimeUnit value={timeRemaining.days} label="d" isUrgent={isUrgent} />
            )}
            <TimeUnit value={timeRemaining.hours} label="h" isUrgent={isUrgent} />
            <span className={isUrgent ? 'text-orange-400' : 'text-blue-400'}>:</span>
            <TimeUnit value={timeRemaining.minutes} label="m" isUrgent={isUrgent} />
            <span className={isUrgent ? 'text-orange-400' : 'text-blue-400'}>:</span>
            <TimeUnit value={timeRemaining.seconds} label="s" isUrgent={isUrgent} />
        </div>
    );
}

function TimeUnit({ value, label, isUrgent }: { value: number; label: string; isUrgent: boolean }) {
    return (
        <div className="text-center">
            <span className={`text-xl font-bold tabular-nums ${isUrgent ? 'text-orange-400' : 'text-blue-400'}`}>
                {value.toString().padStart(2, '0')}
            </span>
            <span className={`text-xs ml-0.5 ${isUrgent ? 'text-orange-400/70' : 'text-blue-400/70'}`}>
                {label}
            </span>
        </div>
    );
}
