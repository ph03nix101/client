'use client';

import { useEffect, useState } from 'react';
import { Product, Category } from '@/types';
import { productsApi, uploadsApi, categoriesApi } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { FiGrid } from 'react-icons/fi';

interface SimilarProductsProps {
    productId: string;
    categoryId?: number;
    maxDisplay?: number;
}

export function SimilarProducts({ productId, categoryId, maxDisplay = 4 }: SimilarProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [images, setImages] = useState<Record<string, string>>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSimilar = async () => {
            setLoading(true);
            try {
                const [similarProducts, cats] = await Promise.all([
                    productsApi.getSimilar(productId, maxDisplay),
                    categoriesApi.getAll(),
                ]);

                setProducts(similarProducts);
                setCategories(cats);

                // Fetch images for similar products
                const imagePromises = similarProducts.map(async (p) => {
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
                console.error('Failed to fetch similar products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSimilar();
    }, [productId, maxDisplay]);

    const getCategoryById = (id: number) => categories.find((c) => c.id === id);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <FiGrid className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Similar Products
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
                <FiGrid className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Similar Products
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
