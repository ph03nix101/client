'use client';

import { useEffect, useState } from 'react';
import { Product, Category } from '@/types';
import { productsApi, uploadsApi, categoriesApi } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { RecentlyViewedItem } from '@/hooks/useRecentlyViewed';
import { FiStar } from 'react-icons/fi';

interface YouMayAlsoLikeProps {
    recentlyViewed: RecentlyViewedItem[];
    maxDisplay?: number;
}

export function YouMayAlsoLike({ recentlyViewed, maxDisplay = 4 }: YouMayAlsoLikeProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [images, setImages] = useState<Record<string, string>>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            try {
                // Get the most viewed category from recently viewed items
                const viewedIds = recentlyViewed.map(item => item.id);

                // Get all products and filter
                const [productsResponse, cats] = await Promise.all([
                    productsApi.search({ limit: 20, sort: 'date_desc' }),
                    categoriesApi.getAll(),
                ]);

                setCategories(cats);

                // Filter out products the user has already viewed
                const filteredProducts = productsResponse.products
                    .filter(p => !viewedIds.includes(p.id))
                    .slice(0, maxDisplay);

                setProducts(filteredProducts);

                // Fetch images for products
                const imagePromises = filteredProducts.map(async (p) => {
                    try {
                        const imgs = await uploadsApi.getProductImages(p.id);
                        const primary = imgs.find((img) => img.is_primary) || imgs[0];
                        return {
                            id: p.id,
                            url: primary ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${primary.url}` : undefined,
                        };
                    } catch {
                        return { id: p.id, url: undefined };
                    }
                });

                const imageResults = await Promise.all(imagePromises);
                const imageMap: Record<string, string> = {};
                imageResults.forEach((result) => {
                    if (result.url) {
                        imageMap[result.id] = result.url;
                    }
                });
                setImages(imageMap);
            } catch (err) {
                console.error('Failed to fetch recommendations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [recentlyViewed, maxDisplay]);

    const getCategoryById = (id: number) => categories.find((c) => c.id === id);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <FiStar className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        You May Also Like
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

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <FiStar className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    You May Also Like
                </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        category={getCategoryById(product.category_id)}
                        imageUrl={images[product.id]}
                    />
                ))}
            </div>
        </div>
    );
}
