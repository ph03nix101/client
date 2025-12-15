'use client';

import { useEffect, useState } from 'react';
import { Product, Category } from '@/types';
import { productsApi, uploadsApi, categoriesApi, auctionsApi, Auction } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { FiClock } from 'react-icons/fi';
import Link from 'next/link';

export function LiveAuctions() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [images, setImages] = useState<Record<string, string>>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuctions = async () => {
            setLoading(true);
            try {
                const [activeAuctions, cats] = await Promise.all([
                    auctionsApi.getActive(4),
                    categoriesApi.getAll(),
                ]);

                setAuctions(activeAuctions);
                setCategories(cats);

                // Fetch images for auction products
                const imagePromises = activeAuctions.map(async (auction) => {
                    if (!auction.product_id) return { id: auction.id, url: undefined };

                    try {
                        const imgs = await uploadsApi.getProductImages(auction.product_id);
                        const primary = imgs.find((img) => img.is_primary) || imgs[0];
                        return {
                            id: auction.product_id,
                            url: primary ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${primary.url}` : undefined,
                        };
                    } catch {
                        return { id: auction.product_id, url: undefined };
                    }
                });

                const imageResults = await Promise.all(imagePromises);
                const imageMap: Record<string, string> = {};
                imageResults.forEach((result) => {
                    if (result.url && result.id) {
                        imageMap[result.id] = result.url;
                    }
                });
                setImages(imageMap);
            } catch (err) {
                console.error('Failed to fetch live auctions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAuctions();
    }, []);

    const getCategoryById = (id: number) => categories.find((c) => c.id === id);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <FiClock className="w-5 h-5 text-orange-500" />
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Live Auctions
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="rounded-xl border overflow-hidden"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            <div className="aspect-[4/3] animate-pulse" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                            <div className="p-4 space-y-3">
                                <div className="h-4 rounded animate-pulse w-1/3" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                                <div className="h-5 rounded animate-pulse" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                                <div className="h-6 rounded animate-pulse w-1/4" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (auctions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FiClock className="w-5 h-5 text-orange-500" />
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Live Auctions
                    </h2>
                    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                        LIVE
                    </span>
                </div>
                <Link
                    href="/auctions"
                    className="text-sm font-medium hover:underline text-orange-500"
                >
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {auctions.map((auction) => (
                    auction.product && (
                        <ProductCard
                            key={auction.id}
                            product={auction.product}
                            category={getCategoryById(auction.product.category_id)}
                            imageUrl={images[auction.product.id]}
                            auction={auction}
                        />
                    )
                ))}
            </div>
        </div>
    );
}
