'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types';
import { usersApi, productsApi, uploadsApi, User } from '@/lib/api';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { FiUser, FiCalendar, FiMapPin, FiPackage } from 'react-icons/fi';

export default function SellerProfilePage() {
    const params = useParams();
    const [seller, setSeller] = useState<User | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [productImages, setProductImages] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            setLoading(true);
            Promise.all([
                usersApi.getById(params.id as string),
                productsApi.getBySeller(params.id as string),
            ])
                .then(async ([sellerData, productsData]) => {
                    setSeller(sellerData);
                    setProducts(productsData);

                    // Fetch images for products
                    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
                    const imagePromises = productsData.map(async (product) => {
                        try {
                            const images = await uploadsApi.getProductImages(product.id);
                            const primary = images.find(img => img.is_primary) || images[0];
                            if (primary) {
                                return { id: product.id, url: `${baseUrl}${primary.url}` };
                            }
                        } catch (e) {
                            console.error('Failed to fetch image for product:', product.id);
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
                })
                .catch((err) => {
                    console.error('Failed to fetch seller:', err);
                    setError('Seller not found');
                })
                .finally(() => setLoading(false));
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <Header />
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-8">
                        <div className="flex gap-6">
                            <div className="w-24 h-24 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                            <div className="flex-1 space-y-3">
                                <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                                <div className="h-4 w-32 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-[4/3] rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !seller) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <Header />
                <div className="max-w-6xl mx-auto px-4 py-16 text-center">
                    <FiUser className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Seller Not Found
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        The seller you're looking for doesn't exist or has been removed.
                    </p>
                    <Link
                        href="/browse"
                        className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Browse Listings
                    </Link>
                </div>
            </div>
        );
    }

    const activeProducts = products.filter(p => p.status === 'Active');

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Header />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Seller Header */}
                <div
                    className="rounded-xl border overflow-hidden mb-8"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                    {/* Gradient Header */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />

                    <div className="px-6 pb-6">
                        {/* Avatar */}
                        <div className="-mt-12 mb-4 flex items-end gap-4">
                            <div className="w-24 h-24 rounded-full border-4 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold"
                                style={{ borderColor: 'var(--card-bg)' }}
                            >
                                {seller.avatar_url ? (
                                    <img src={seller.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    seller.full_name?.charAt(0).toUpperCase() || seller.username?.charAt(0).toUpperCase() || 'S'
                                )}
                            </div>
                            <div className="pb-2">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {seller.full_name || seller.username}
                                    </h1>
                                    {seller.is_verified_seller && <VerifiedBadge size="md" />}
                                </div>
                                <p style={{ color: 'var(--text-muted)' }}>@{seller.username}</p>
                            </div>
                        </div>

                        {/* Bio */}
                        {seller.bio && (
                            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                                {seller.bio}
                            </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                            <div className="flex items-center gap-1.5">
                                <FiCalendar className="w-4 h-4" />
                                Member since {new Date(seller.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                            {seller.location && (
                                <div className="flex items-center gap-1.5">
                                    <FiMapPin className="w-4 h-4" />
                                    {seller.location}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <FiPackage className="w-4 h-4" />
                                {activeProducts.length} active {activeProducts.length === 1 ? 'listing' : 'listings'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seller's Listings */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                        Listings by {seller.full_name || seller.username}
                    </h2>

                    {activeProducts.length === 0 ? (
                        <div
                            className="rounded-xl border p-12 text-center"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            <FiPackage className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                No Active Listings
                            </h3>
                            <p style={{ color: 'var(--text-muted)' }}>
                                This seller doesn't have any active listings at the moment.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    imageUrl={productImages[product.id]}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
