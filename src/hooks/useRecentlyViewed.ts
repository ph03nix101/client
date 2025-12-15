import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';

const STORAGE_KEY = 'techfinder_recently_viewed';
const MAX_ITEMS = 12; // Maximum number of recently viewed items to store

export interface RecentlyViewedItem {
    id: string;
    title: string;
    price: string;
    condition: string;
    image_url?: string;
    viewedAt: number; // timestamp
}

export function useRecentlyViewed() {
    const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);

    // Load recently viewed items from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const items = JSON.parse(stored) as RecentlyViewedItem[];
                    setRecentItems(items);
                } catch (e) {
                    console.error('Failed to parse recently viewed items:', e);
                    localStorage.removeItem(STORAGE_KEY);
                }
            }
        }
    }, []);

    // Add a product to recently viewed
    const addToRecentlyViewed = useCallback((product: Product, imageUrl?: string) => {
        if (typeof window === 'undefined') return;

        const newItem: RecentlyViewedItem = {
            id: product.id,
            title: product.title,
            price: product.price,
            condition: product.condition || 'Used',
            image_url: imageUrl,
            viewedAt: Date.now(),
        };

        setRecentItems((prevItems) => {
            // Remove if already exists
            const filtered = prevItems.filter(item => item.id !== product.id);
            // Add to beginning
            const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Clear all recently viewed items
    const clearRecentlyViewed = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
            setRecentItems([]);
        }
    }, []);

    // Remove a specific item
    const removeFromRecentlyViewed = useCallback((productId: string) => {
        setRecentItems((prevItems) => {
            const updated = prevItems.filter(item => item.id !== productId);
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            }
            return updated;
        });
    }, []);

    return {
        recentItems,
        addToRecentlyViewed,
        clearRecentlyViewed,
        removeFromRecentlyViewed,
    };
}
