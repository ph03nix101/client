'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiUser } from 'react-icons/fi';
import { ratingsApi, SellerStats } from '@/lib/api';

interface SellerRatingProps {
    sellerId: string;
    showCount?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function SellerRating({ sellerId, showCount = true, size = 'md' }: SellerRatingProps) {
    const [stats, setStats] = useState<SellerStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sellerId) {
            ratingsApi.getSellerStats(sellerId)
                .then(setStats)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [sellerId]);

    if (loading) {
        return (
            <div className="flex items-center gap-1 animate-pulse">
                <div className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-700" />
                <div className="w-8 h-3 rounded bg-gray-300 dark:bg-gray-700" />
            </div>
        );
    }

    if (!stats || stats.total_ratings === 0) {
        return (
            <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                <FiStar className="w-4 h-4" />
                <span>No ratings yet</span>
            </div>
        );
    }

    const starSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    const fullStars = Math.floor(stats.average_rating);
    const hasHalfStar = stats.average_rating - fullStars >= 0.5;

    return (
        <div className="flex items-center gap-2">
            {/* Stars */}
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                        key={star}
                        className={`${starSizes[size]} ${star <= fullStars
                            ? 'text-yellow-500 fill-current'
                            : star === fullStars + 1 && hasHalfStar
                                ? 'text-yellow-500'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                    />
                ))}
            </div>

            {/* Rating Number */}
            <span className={`font-medium ${textSizes[size]}`} style={{ color: 'var(--text-primary)' }}>
                {stats.average_rating.toFixed(1)}
            </span>

            {/* Count */}
            {showCount && (
                <span className={textSizes[size]} style={{ color: 'var(--text-muted)' }}>
                    ({stats.total_ratings})
                </span>
            )}

            {/* Positive Percentage */}
            {stats.positive_percentage > 0 && (
                <span className={`${textSizes[size]} text-green-500`}>
                    {stats.positive_percentage}% positive
                </span>
            )}
        </div>
    );
}

// Inline rating display for product cards
export function InlineSellerRating({ sellerId }: { sellerId: string }) {
    const [stats, setStats] = useState<SellerStats | null>(null);

    useEffect(() => {
        if (sellerId) {
            ratingsApi.getSellerStats(sellerId)
                .then(setStats)
                .catch(() => setStats(null));
        }
    }, [sellerId]);

    if (!stats || stats.total_ratings === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-1 text-yellow-500">
            <FiStar className="w-3.5 h-3.5 fill-current" />
            <span className="text-sm font-medium">{stats.total_ratings}</span>
        </div>
    );
}

// Summary card for seller profiles
export function SellerRatingSummary({ sellerId }: { sellerId: string }) {
    const [stats, setStats] = useState<SellerStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sellerId) {
            ratingsApi.getSellerStats(sellerId)
                .then(setStats)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [sellerId]);

    if (loading) {
        return (
            <div className="animate-pulse space-y-3">
                <div className="h-8 w-24 rounded bg-gray-300 dark:bg-gray-700" />
                <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-700" />
            </div>
        );
    }

    if (!stats || stats.total_ratings === 0) {
        return (
            <div
                className="flex items-center gap-3 p-4 rounded-lg border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
                <FiUser className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No ratings yet</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Be the first to rate this seller
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="p-4 rounded-lg border"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
            <div className="flex items-center gap-4 mb-4">
                {/* Average Rating */}
                <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {stats.average_rating.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-0.5 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                                key={star}
                                className={`w-4 h-4 ${star <= Math.round(stats.average_rating)
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300 dark:text-gray-600'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {stats.total_ratings} {stats.total_ratings === 1 ? 'rating' : 'ratings'}
                    </p>
                    <p className="text-sm text-green-500 font-medium">
                        {stats.positive_percentage}% positive
                    </p>
                </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.rating_distribution[rating as keyof typeof stats.rating_distribution];
                    const percentage = stats.total_ratings > 0 ? (count / stats.total_ratings) * 100 : 0;

                    return (
                        <div key={rating} className="flex items-center gap-2 text-sm">
                            <span className="w-3 text-right" style={{ color: 'var(--text-muted)' }}>{rating}</span>
                            <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
                            <div
                                className="flex-1 h-2 rounded-full overflow-hidden"
                                style={{ backgroundColor: 'var(--bg-tertiary)' }}
                            >
                                <div
                                    className="h-full bg-yellow-500 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="w-8 text-right text-xs" style={{ color: 'var(--text-muted)' }}>
                                {count}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
