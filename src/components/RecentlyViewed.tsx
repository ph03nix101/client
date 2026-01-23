'use client';

import Link from 'next/link';
import { RecentlyViewedItem } from '@/hooks/useRecentlyViewed';
import { ProductCard } from '@/components/ProductCard';
import { FiClock, FiTrash2 } from 'react-icons/fi';

interface RecentlyViewedProps {
    items: RecentlyViewedItem[];
    onRemove?: (productId: string) => void;
    onClear?: () => void;
    currentProductId?: string; // Exclude currently viewing product
    maxDisplay?: number;
}

export function RecentlyViewed({
    items,
    onRemove,
    onClear,
    currentProductId,
    maxDisplay = 4,
}: RecentlyViewedProps) {
    // Filter out current product and limit display
    const displayItems = items
        .filter(item => item.id !== currentProductId)
        .slice(0, maxDisplay);

    if (displayItems.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FiClock className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Recently Viewed
                    </h2>
                </div>
                {onClear && displayItems.length > 0 && (
                    <button
                        onClick={onClear}
                        className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-500/10 transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <FiTrash2 className="w-4 h-4" />
                        Clear All
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayItems.map((item) => (
                    <ProductCard
                        key={item.id}
                        product={{
                            id: item.id,
                            title: item.title,
                            price: item.price,
                            condition: item.condition,
                            status: 'Active',
                            category_id: 0,
                            seller_id: '',
                            specs: {},
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        }}
                        imageUrl={item.image_url}
                    />
                ))}
            </div>
        </div>
    );
}
