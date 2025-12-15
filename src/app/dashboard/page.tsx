'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import { FiList, FiPlus, FiEdit2, FiEye, FiTrendingUp, FiDollarSign, FiPackage } from 'react-icons/fi';

// Test seller ID - will be replaced with auth
const TEST_SELLER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export default function DashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        productsApi.getBySeller(TEST_SELLER_ID)
            .then(setProducts)
            .finally(() => setLoading(false));
    }, []);

    const activeListings = products.filter(p => p.status === 'Active').length;
    const soldListings = products.filter(p => p.status === 'Sold').length;
    const totalValue = products
        .filter(p => p.status === 'Active')
        .reduce((sum, p) => sum + parseFloat(p.price), 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
                    <Link
                        href="/sell"
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                        <FiPlus className="w-4 h-4" />
                        New Listing
                    </Link>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                        className="rounded-xl border p-6"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <FiPackage className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Listings</span>
                        </div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{activeListings}</div>
                    </div>
                    <div
                        className="rounded-xl border p-6"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <FiTrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sold</span>
                        </div>
                        <div className="text-3xl font-bold text-green-500">{soldListings}</div>
                    </div>
                    <div
                        className="rounded-xl border p-6"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <FiDollarSign className="w-5 h-5 text-purple-500" />
                            </div>
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Active Value</span>
                        </div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            ${totalValue.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Recent Listings */}
                <div
                    className="rounded-xl border"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                    <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Listings</h2>
                            <Link
                                href="/dashboard/listings"
                                className="text-sm text-blue-500 hover:text-blue-400 font-medium"
                            >
                                View All →
                            </Link>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-6">
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                                ))}
                            </div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="p-12 text-center">
                            <FiList className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No listings yet</h3>
                            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Create your first listing to get started</p>
                            <Link
                                href="/sell"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                            >
                                <FiPlus className="w-4 h-4" />
                                Create Listing
                            </Link>
                        </div>
                    ) : (
                        <div>
                            {products.slice(0, 5).map((product, index) => (
                                <div
                                    key={product.id}
                                    className="p-4 flex items-center gap-4 border-b last:border-b-0 transition-colors"
                                    style={{ borderColor: 'var(--border)' }}
                                >
                                    <div
                                        className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden"
                                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{product.title}</h3>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            ${parseFloat(product.price).toLocaleString()} •
                                            <span className={product.status === 'Active' ? 'text-green-500' : product.status === 'Sold' ? 'text-blue-500' : ''}>
                                                {' '}{product.status}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/product/${product.id}`}
                                            className="p-2 rounded-lg transition-colors hover:bg-blue-500/20"
                                            style={{ color: 'var(--text-muted)' }}
                                            title="View"
                                        >
                                            <FiEye className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href={`/dashboard/listings/${product.id}`}
                                            className="p-2 rounded-lg transition-colors hover:bg-blue-500/20"
                                            style={{ color: 'var(--text-muted)' }}
                                            title="Edit"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </Link>
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
