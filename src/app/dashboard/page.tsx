'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { productsApi, ordersApi, messagesApi, Order, SellerOrderStats } from '@/lib/api';
import { Product } from '@/types';
import { useAuth } from '@/components/AuthProvider';
import { FiList, FiPlus, FiEdit2, FiEye, FiTrendingUp, FiDollarSign, FiPackage, FiMessageCircle, FiShoppingBag } from 'react-icons/fi';

export default function DashboardPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState<SellerOrderStats | null>(null);
    const [recentSales, setRecentSales] = useState<Order[]>([]);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            try {
                const [productsData, statsData, salesData, messagesData] = await Promise.all([
                    productsApi.getBySeller(user.id),
                    ordersApi.getStats().catch(() => null),
                    ordersApi.getRecentSales(5).catch(() => []),
                    messagesApi.getConversations().catch(() => []),
                ]);

                setProducts(productsData);
                setStats(statsData);
                setRecentSales(salesData);

                // Count unread messages
                const unread = messagesData.filter((c: any) => c.unread_count > 0).length;
                setUnreadMessages(unread);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const activeListings = products.filter(p => p.status === 'Active' || p.status === 'Auction').length;
    const soldListings = products.filter(p => p.status === 'Sold').length;
    const totalActiveValue = products
        .filter(p => p.status === 'Active' || p.status === 'Auction')
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                        className="rounded-xl border p-5"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <FiPackage className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Listings</span>
                        </div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            {loading ? '...' : activeListings}
                        </div>
                    </div>
                    <div
                        className="rounded-xl border p-5"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <FiTrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Sales</span>
                        </div>
                        <div className="text-3xl font-bold text-green-500">
                            {loading ? '...' : (stats?.total_sales || soldListings)}
                        </div>
                    </div>
                    <div
                        className="rounded-xl border p-5"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <FiDollarSign className="w-5 h-5 text-purple-500" />
                            </div>
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Revenue</span>
                        </div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            R{loading ? '...' : (stats?.total_revenue || 0).toLocaleString()}
                        </div>
                    </div>
                    <div
                        className="rounded-xl border p-5"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-orange-500/20">
                                <FiMessageCircle className="w-5 h-5 text-orange-500" />
                            </div>
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Unread Messages</span>
                        </div>
                        <div className="text-3xl font-bold" style={{ color: unreadMessages > 0 ? 'var(--accent)' : 'var(--text-primary)' }}>
                            {loading ? '...' : unreadMessages}
                        </div>
                    </div>
                </div>

                {/* This Month Stats */}
                {stats && (stats.this_month_sales > 0 || stats.this_month_revenue > 0) && (
                    <div
                        className="rounded-xl border p-6"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>This Month</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sales</p>
                                <p className="text-2xl font-bold text-green-500">{stats.this_month_sales}</p>
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Revenue</p>
                                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    R{stats.this_month_revenue.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Sales */}
                {recentSales.length > 0 && (
                    <div
                        className="rounded-xl border"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Sales</h2>
                                <Link
                                    href="/dashboard/sales"
                                    className="text-sm text-blue-500 hover:text-blue-400 font-medium"
                                >
                                    View All →
                                </Link>
                            </div>
                        </div>
                        <div>
                            {recentSales.map((sale) => (
                                <div
                                    key={sale.id}
                                    className="p-4 flex items-center gap-4 border-b last:border-b-0"
                                    style={{ borderColor: 'var(--border)' }}
                                >
                                    <div className="p-2 rounded-lg bg-green-500/10">
                                        <FiShoppingBag className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                            {sale.product_title}
                                        </h3>
                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                            Buyer: {sale.buyer_username} • {new Date(sale.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-500">R{sale.total.toLocaleString()}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${sale.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                                                sale.status === 'shipped' ? 'bg-blue-500/10 text-blue-500' :
                                                    sale.status === 'paid' ? 'bg-purple-500/10 text-purple-500' :
                                                        'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                            {products.slice(0, 5).map((product) => (
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
                                            R{parseFloat(product.price).toLocaleString()} •
                                            <span className={
                                                product.status === 'Active' ? 'text-green-500' :
                                                    product.status === 'Auction' ? 'text-orange-500' :
                                                        product.status === 'Sold' ? 'text-blue-500' : ''
                                            }>
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
