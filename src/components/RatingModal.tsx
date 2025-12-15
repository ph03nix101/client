'use client';

import { useState } from 'react';
import { FiStar, FiX } from 'react-icons/fi';
import { ratingsApi, SellerRating } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface RatingModalProps {
    sellerId: string;
    sellerName: string;
    productId?: string;
    productTitle?: string;
    existingRating?: SellerRating | null;
    onClose: () => void;
    onSuccess: (rating: SellerRating) => void;
}

export function RatingModal({
    sellerId,
    sellerName,
    productId,
    productTitle,
    existingRating,
    onClose,
    onSuccess,
}: RatingModalProps) {
    const [rating, setRating] = useState(existingRating?.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [review, setReview] = useState(existingRating?.review || '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            let result: SellerRating;
            if (existingRating) {
                result = await ratingsApi.update(existingRating.id, rating, review || undefined);
            } else {
                result = await ratingsApi.create(sellerId, rating, review || undefined, productId);
            }
            onSuccess(result);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit rating. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const displayRating = hoveredRating || rating;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                className="rounded-xl border max-w-md w-full"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {existingRating ? 'Update Rating' : 'Rate Seller'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <FiX className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Seller Info */}
                    <div className="text-center">
                        <p style={{ color: 'var(--text-muted)' }}>
                            How was your experience with
                        </p>
                        <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                            {sellerName}
                        </p>
                        {productTitle && (
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                for "{productTitle}"
                            </p>
                        )}
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setRating(star)}
                                className="p-1 transition-transform hover:scale-110"
                            >
                                <FiStar
                                    className={`w-8 h-8 transition-colors ${star <= displayRating
                                        ? 'text-yellow-500 fill-current'
                                        : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Rating Label */}
                    <div className="text-center text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {displayRating === 0 && 'Click to rate'}
                        {displayRating === 1 && 'Poor'}
                        {displayRating === 2 && 'Fair'}
                        {displayRating === 3 && 'Good'}
                        {displayRating === 4 && 'Very Good'}
                        {displayRating === 5 && 'Excellent'}
                    </div>

                    {/* Review Text */}
                    <div>
                        <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Review (optional)
                        </label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            rows={3}
                            placeholder="Share your experience with this seller..."
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                borderColor: 'var(--border)',
                                color: 'var(--text-primary)',
                            }}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} isLoading={submitting} className="flex-1">
                        {existingRating ? 'Update' : 'Submit'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
