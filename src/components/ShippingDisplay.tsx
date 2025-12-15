'use client';

import { useState, useEffect } from 'react';
import { FiTruck, FiMapPin, FiCheck, FiPackage } from 'react-icons/fi';
import { shippingApi, ProductShipping } from '@/lib/api';

interface ShippingDisplayProps {
    productId: string;
}

export function ShippingDisplay({ productId }: ShippingDisplayProps) {
    const [shipping, setShipping] = useState<ProductShipping[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (productId) {
            shippingApi.getProductShipping(productId)
                .then(setShipping)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [productId]);

    if (loading) {
        return (
            <div className="animate-pulse space-y-2">
                <div className="h-5 w-32 rounded bg-gray-300 dark:bg-gray-700" />
                <div className="h-4 w-48 rounded bg-gray-300 dark:bg-gray-700" />
                <div className="h-4 w-40 rounded bg-gray-300 dark:bg-gray-700" />
            </div>
        );
    }

    if (shipping.length === 0) {
        return (
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                <FiPackage className="inline w-4 h-4 mr-2" />
                Contact seller for shipping options
            </div>
        );
    }

    const formatDeliveryTime = (min: number | null | undefined, max: number | null | undefined) => {
        if (min && max) {
            return min === max ? `${min} days` : `${min}-${max} days`;
        }
        if (min) return `${min}+ days`;
        if (max) return `Up to ${max} days`;
        return null;
    };

    return (
        <div className="space-y-3">
            {shipping.map((option) => (
                <div
                    key={option.id}
                    className="flex items-start gap-3"
                >
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FiCheck className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            {option.is_collection ? (
                                <FiMapPin className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            ) : (
                                <FiTruck className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            )}
                            <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                {option.name}
                            </span>
                            {option.price === 0 ? (
                                <span className="text-green-500 font-medium text-sm">FREE</span>
                            ) : (
                                <span className="text-blue-500 font-medium text-sm">
                                    R{option.price?.toFixed(2)}
                                </span>
                            )}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {option.is_collection && option.collection_address ? (
                                <span>Collect from: {option.collection_address}</span>
                            ) : (
                                <>
                                    {formatDeliveryTime(option.estimated_days_min, option.estimated_days_max) && (
                                        <span>
                                            Est. delivery: {formatDeliveryTime(option.estimated_days_min, option.estimated_days_max)}
                                        </span>
                                    )}
                                    {option.coverage_area && (
                                        <span className="ml-2">• {option.coverage_area}</span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
