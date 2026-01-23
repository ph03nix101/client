'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ordersApi, Order, SellerOrderStats } from '@/lib/api';
import { FiPackage, FiTruck, FiCheck, FiDollarSign, FiClock, FiX } from 'react-icons/fi';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'paid', label: 'Paid', color: 'purple' },
    { value: 'shipped', label: 'Shipped', color: 'blue' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

export default function SalesPage() {
    const [sales, setSales] = useState<Order[]>([]);
    const [stats, setStats] = useState<SellerOrderStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [salesData, statsData] = await Promise.all([
                ordersApi.getMySales(50, 0),
                ordersApi.getStats(),
            ]);
            setSales(salesData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const updated = await ordersApi.updateStatus(orderId, newStatus);
            setSales(prev => prev.map(s => s.id === orderId ? updated : s));
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update order status');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredSales = filter === 'all'
        ? sales
        : sales.filter(s => s.status === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-500/10 text-green-500';
            case 'shipped': return 'bg-blue-500/10 text-blue-500';
            case 'paid': return 'bg-purple-500/10 text-purple-500';
            case 'cancelled': return 'bg-red-500/10 text-red-500';
            default: return 'bg-yellow-500/10 text-yellow-500';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Sales</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            Manage your orders and track shipments
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div
                            className="rounded-xl border p-4"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <FiDollarSign className="w-4 h-4 text-green-500" />
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Revenue</span>
                            </div>
                            <p className="text-2xl font-bold text-green-500">R{stats.total_revenue.toLocaleString()}</p>
                        </div>
                        <div
                            className="rounded-xl border p-4"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <FiPackage className="w-4 h-4 text-blue-500" />
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Sales</span>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total_sales}</p>
                        </div>
                        <div
                            className="rounded-xl border p-4"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <FiClock className="w-4 h-4 text-yellow-500" />
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Pending Orders</span>
                            </div>
                            <p className="text-2xl font-bold text-yellow-500">{stats.pending_orders}</p>
                        </div>
                        <div
                            className="rounded-xl border p-4"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <FiCheck className="w-4 h-4 text-purple-500" />
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>This Month</span>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                R{stats.this_month_revenue.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        All ({sales.length})
                    </button>
                    {STATUS_OPTIONS.map(opt => {
                        const count = sales.filter(s => s.status === opt.value).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => setFilter(opt.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === opt.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {opt.label} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Sales List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="rounded-xl border p-4 animate-pulse"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                            >
                                <div className="h-6 w-48 rounded bg-gray-300 dark:bg-gray-700 mb-2" />
                                <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-700" />
                            </div>
                        ))}
                    </div>
                ) : filteredSales.length === 0 ? (
                    <div
                        className="rounded-xl border p-12 text-center"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <FiPackage className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            {filter === 'all' ? 'No Sales Yet' : `No ${filter} orders`}
                        </h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {filter === 'all'
                                ? 'When someone purchases your items, they will appear here.'
                                : 'No orders with this status.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredSales.map((sale) => (
                            <div
                                key={sale.id}
                                className="rounded-xl border p-4"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Product Info */}
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div
                                            className="w-16 h-16 rounded-lg flex-shrink-0 bg-cover bg-center"
                                            style={{
                                                backgroundColor: 'var(--bg-tertiary)',
                                                backgroundImage: sale.product_image ? `url(${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${sale.product_image})` : undefined,
                                            }}
                                        />
                                        <div className="min-w-0">
                                            <Link
                                                href={`/product/${sale.product_id}`}
                                                className="font-semibold hover:text-blue-500 truncate block"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                {sale.product_title}
                                            </Link>
                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                Buyer: {sale.buyer_username}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {new Date(sale.created_at).toLocaleDateString()} at {new Date(sale.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price & Status */}
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-green-500">R{sale.total.toLocaleString()}</p>
                                            {sale.shipping_cost > 0 && (
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    incl. R{sale.shipping_cost} shipping
                                                </p>
                                            )}
                                        </div>

                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sale.status)}`}>
                                            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                {sale.status !== 'delivered' && sale.status !== 'cancelled' && (
                                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-2" style={{ borderColor: 'var(--border)' }}>
                                        {sale.status === 'pending' && (
                                            <button
                                                onClick={() => handleStatusUpdate(sale.id, 'paid')}
                                                disabled={updatingId === sale.id}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                Mark as Paid
                                            </button>
                                        )}
                                        {(sale.status === 'pending' || sale.status === 'paid') && (
                                            <button
                                                onClick={() => handleStatusUpdate(sale.id, 'shipped')}
                                                disabled={updatingId === sale.id}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <FiTruck className="w-4 h-4" />
                                                Mark as Shipped
                                            </button>
                                        )}
                                        {sale.status === 'shipped' && (
                                            <button
                                                onClick={() => handleStatusUpdate(sale.id, 'delivered')}
                                                disabled={updatingId === sale.id}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <FiCheck className="w-4 h-4" />
                                                Mark as Delivered
                                            </button>
                                        )}
                                        {sale.status !== 'shipped' && (
                                            <button
                                                onClick={() => handleStatusUpdate(sale.id, 'cancelled')}
                                                disabled={updatingId === sale.id}
                                                className="px-4 py-2 border border-red-500 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/10 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <FiX className="w-4 h-4" />
                                                Cancel Order
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Shipping Address */}
                                {sale.shipping_address && (
                                    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Shipping Address:</p>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{sale.shipping_address}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
