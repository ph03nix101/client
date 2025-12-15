'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiChevronDown } from 'react-icons/fi';
import { ratingsApi, SellerRating } from '@/lib/api';

interface ReviewListProps {
    sellerId: string;
    initialLimit?: number;
}

export function ReviewList({ sellerId, initialLimit = 5 }: ReviewListProps) {
    const [reviews, setReviews] = useState<SellerRating[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        if (sellerId) {
            setLoading(true);
            ratingsApi.getSellerRatings(sellerId, initialLimit, 0)
                .then((data) => {
                    setReviews(data);
                    setHasMore(data.length === initialLimit);
                    setOffset(data.length);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [sellerId, initialLimit]);

    const loadMore = async () => {
        if (loadingMore) return;

        setLoadingMore(true);
        try {
            const moreReviews = await ratingsApi.getSellerRatings(sellerId, initialLimit, offset);
            setReviews((prev) => [...prev, ...moreReviews]);
            setHasMore(moreReviews.length === initialLimit);
            setOffset((prev) => prev + moreReviews.length);
        } catch (error) {
            console.error('Failed to load more reviews:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700" />
                            <div className="flex-1">
                                <div className="h-4 w-24 rounded bg-gray-300 dark:bg-gray-700" />
                                <div className="h-3 w-16 rounded bg-gray-300 dark:bg-gray-700 mt-1" />
                            </div>
                        </div>
                        <div className="h-4 w-full rounded bg-gray-300 dark:bg-gray-700" />
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div
                className="text-center py-8 rounded-lg border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
                <FiStar className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-muted)' }}>No reviews yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div
                    key={review.id}
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                {review.reviewer_avatar ? (
                                    <img
                                        src={review.reviewer_avatar}
                                        alt=""
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    review.reviewer_name?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>

                            {/* Reviewer Info */}
                            <div>
                                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {review.reviewer_name || 'Anonymous'}
                                </p>
                                <div className="flex items-center gap-2">
                                    {/* Stars */}
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FiStar
                                                key={star}
                                                className={`w-3 h-3 ${star <= review.rating
                                                    ? 'text-yellow-500 fill-current'
                                                    : 'text-gray-300 dark:text-gray-600'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {new Date(review.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Reference */}
                    {review.product_title && (
                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                            For: <span className="text-blue-500">{review.product_title}</span>
                        </p>
                    )}

                    {/* Review Text */}
                    {review.review && (
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {review.review}
                        </p>
                    )}
                </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
                <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-full py-3 rounded-lg border flex items-center justify-center gap-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                    {loadingMore ? (
                        <span>Loading...</span>
                    ) : (
                        <>
                            <span>Load more reviews</span>
                            <FiChevronDown className="w-4 h-4" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
