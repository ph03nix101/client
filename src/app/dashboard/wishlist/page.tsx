'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { wishlistApi, WishlistItem, uploadsApi, ProductImage } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { FiHeart, FiTrash2 } from 'react-icons/fi';

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [productImages, setProductImages] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            const items = await wishlistApi.getWishlist();
            setWishlist(items);

            // Fetch images for products
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
            const imagePromises = items.map(async (item) => {
                try {
                    const images = await uploadsApi.getProductImages(item.product_id);
                    const primary = images.find(img => img.is_primary) || images[0];
                    if (primary) {
                        return { id: item.product_id, url: `${baseUrl}${primary.url}` };
                    }
                } catch (e) {
                    console.error('Failed to fetch image:', e);
                }
                return null;
            });

            const imageResults = await Promise.all(imagePromises);
            const imageMap: Record<string, string> = {};
            imageResults.forEach(result => {
                if (result) {
                    imageMap[result.id] = result.url;
                }
            });
            setProductImages(imageMap);
        } catch (err) {
            console.error('Failed to load wishlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId: string) => {
        setRemoving(productId);
        try {
            await wishlistApi.removeFromWishlist(productId);
            setWishlist(prev => prev.filter(item => item.product_id !== productId));
        } catch (err) {
            console.error('Failed to remove from wishlist:', err);
        } finally {
            setRemoving(null);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
            </DashboardLayout>
        );
    }

    // Filter to only show active products
    const activeItems = wishlist.filter(item => item.product_status === 'Active');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Wishlist</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {activeItems.length} {activeItems.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>

                {activeItems.length === 0 ? (
                    <div
                        className="rounded-xl border p-12 text-center"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <FiHeart className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            Your Wishlist is Empty
                        </h3>
                        <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
                            Save items you're interested in to find them easily later.
                        </p>
                        <Link
                            href="/browse"
                            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse Listings
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeItems.map((item) => (
                            <div key={item.id} className="relative group">
                                <Link href={`/product/${item.product_id}`}>
                                    <div
                                        className="rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-200"
                                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                                    >
                                        {/* Image */}
                                        <div
                                            className="aspect-[4/3] flex items-center justify-center overflow-hidden"
                                            style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                        >
                                            {productImages[item.product_id] ? (
                                                <img
                                                    src={productImages[item.product_id]}
                                                    alt={item.product_title || ''}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <FiHeart className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3
                                                className="font-semibold line-clamp-2 mb-2 group-hover:text-blue-500 transition-colors"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                {item.product_title}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-bold text-blue-500">
                                                    ${parseFloat(item.product_price || '0').toLocaleString()}
                                                </span>
                                                <span
                                                    className="text-xs px-2 py-1 rounded"
                                                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                                                >
                                                    {item.product_condition}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                {/* Remove Button */}
                                <button
                                    onClick={() => handleRemove(item.product_id)}
                                    disabled={removing === item.product_id}
                                    className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                                    title="Remove from wishlist"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
