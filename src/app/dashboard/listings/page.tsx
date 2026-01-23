'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { productsApi, uploadsApi } from '@/lib/api';
import { Product } from '@/types';
import { FiPlus, FiEdit2, FiEye, FiTrash2, FiCheck, FiPause, FiPlay } from 'react-icons/fi';
import { useAuth } from '@/components/AuthProvider';

const statusColors: Record<string, { bg: string; text: string }> = {
    Active: { bg: 'bg-green-500/20', text: 'text-green-500' },
    Sold: { bg: 'bg-blue-500/20', text: 'text-blue-500' },
    Paused: { bg: 'bg-yellow-500/20', text: 'text-yellow-500' },
    Draft: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
};

export default function ListingsPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [productImages, setProductImages] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadProducts();
        }
    }, [user]);

    const loadProducts = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const productsData = await productsApi.getBySeller(user.id);
            setProducts(productsData);

            // Fetch primary images
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
            const imagePromises = productsData.map(async (product) => {
                try {
                    const images = await uploadsApi.getProductImages(product.id);
                    const primary = images.find(img => img.is_primary) || images[0];
                    return { productId: product.id, url: primary?.url ? `${baseUrl}${primary.url}` : null };
                } catch {
                    return { productId: product.id, url: null };
                }
            });
            const imageResults = await Promise.all(imagePromises);
            const imageMap: Record<string, string> = {};
            imageResults.forEach(({ productId, url }) => {
                if (url) imageMap[productId] = url;
            });
            setProductImages(imageMap);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (productId: string, newStatus: Product['status']) => {
        try {
            await productsApi.updateStatus(productId, newStatus);
            setProducts(products.map(p =>
                p.id === productId ? { ...p, status: newStatus } : p
            ));
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;

        setDeleting(productId);
        try {
            await productsApi.delete(productId);
            setProducts(products.filter(p => p.id !== productId));
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('Failed to delete listing');
        } finally {
            setDeleting(null);
        }
    };

    const filteredProducts = statusFilter
        ? products.filter(p => p.status === statusFilter)
        : products;

    const statusCounts = {
        All: products.length,
        Active: products.filter(p => p.status === 'Active').length,
        Sold: products.filter(p => p.status === 'Sold').length,
        Paused: products.filter(p => p.status === 'Paused').length,
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Listings</h1>
                    <Link
                        href="/sell"
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                        <FiPlus className="w-4 h-4" />
                        New Listing
                    </Link>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status === 'All' ? null : status)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${(status === 'All' && !statusFilter) || statusFilter === status
                                ? 'bg-blue-600 text-white'
                                : ''
                                }`}
                            style={
                                (status === 'All' && !statusFilter) || statusFilter === status
                                    ? {}
                                    : {
                                        backgroundColor: 'var(--card-bg)',
                                        color: 'var(--text-secondary)',
                                        border: '1px solid var(--border)',
                                    }
                            }
                        >
                            {status} ({count})
                        </button>
                    ))}
                </div>

                {/* Listings Table */}
                <div
                    className="rounded-xl border overflow-hidden"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                    {loading ? (
                        <div className="p-6">
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-20 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                                ))}
                            </div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-12 text-center">
                            <p style={{ color: 'var(--text-muted)' }}>No listings found</p>
                        </div>
                    ) : (
                        <div>
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="p-4 flex items-center gap-4 border-b last:border-b-0"
                                    style={{ borderColor: 'var(--border)' }}
                                >
                                    {/* Image */}
                                    <div
                                        className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden"
                                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                    >
                                        {productImages[product.id] ? (
                                            <img
                                                src={productImages[product.id]}
                                                alt={product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: 'var(--text-muted)' }}>
                                                No image
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{product.title}</h3>
                                        <p className="text-lg font-semibold text-blue-500">
                                            ${parseFloat(product.price).toLocaleString()}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[product.status]?.bg || ''} ${statusColors[product.status]?.text || ''}`}>
                                                {product.status}
                                            </span>
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {new Date(product.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        {/* Status Actions */}
                                        {product.status === 'Active' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(product.id, 'Sold')}
                                                    className="p-2 rounded-lg transition-colors hover:bg-green-500/20"
                                                    style={{ color: 'var(--text-muted)' }}
                                                    title="Mark as Sold"
                                                >
                                                    <FiCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(product.id, 'Paused')}
                                                    className="p-2 rounded-lg transition-colors hover:bg-yellow-500/20"
                                                    style={{ color: 'var(--text-muted)' }}
                                                    title="Pause Listing"
                                                >
                                                    <FiPause className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        {product.status === 'Paused' && (
                                            <button
                                                onClick={() => handleStatusChange(product.id, 'Active')}
                                                className="p-2 rounded-lg transition-colors hover:bg-green-500/20"
                                                style={{ color: 'var(--text-muted)' }}
                                                title="Reactivate"
                                            >
                                                <FiPlay className="w-4 h-4" />
                                            </button>
                                        )}
                                        {product.status === 'Sold' && (
                                            <button
                                                onClick={() => handleStatusChange(product.id, 'Active')}
                                                className="p-2 rounded-lg transition-colors hover:bg-blue-500/20"
                                                style={{ color: 'var(--text-muted)' }}
                                                title="Relist"
                                            >
                                                <FiPlay className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* View */}
                                        <Link
                                            href={`/product/${product.id}`}
                                            className="p-2 rounded-lg transition-colors hover:bg-blue-500/20"
                                            style={{ color: 'var(--text-muted)' }}
                                            title="View"
                                        >
                                            <FiEye className="w-4 h-4" />
                                        </Link>

                                        {/* Edit */}
                                        <Link
                                            href={`/dashboard/listings/${product.id}`}
                                            className="p-2 rounded-lg transition-colors hover:bg-blue-500/20"
                                            style={{ color: 'var(--text-muted)' }}
                                            title="Edit"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </Link>

                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            disabled={deleting === product.id}
                                            className="p-2 rounded-lg transition-colors hover:bg-red-500/20 disabled:opacity-50"
                                            style={{ color: 'var(--text-muted)' }}
                                            title="Delete"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
