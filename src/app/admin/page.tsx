'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { verificationApi, usersApi } from '@/lib/api';
import { FiUsers, FiCheckCircle, FiClock, FiPackage } from 'react-icons/fi';
import Link from 'next/link';

interface Stats {
    totalUsers: number;
    pendingVerifications: number;
    totalProducts: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ totalUsers: 0, pendingVerifications: 0, totalProducts: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Get pending verifications count
                const pending = await verificationApi.getPending();
                setStats(prev => ({ ...prev, pendingVerifications: pending.length }));
            } catch (err) {
                console.error('Failed to load stats:', err);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    const statCards = [
        {
            label: 'Pending Verifications',
            value: stats.pendingVerifications,
            icon: FiClock,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/20',
            href: '/admin/verification'
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome to the admin panel</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Link
                                key={stat.label}
                                href={stat.href}
                                className="rounded-xl border p-6 transition-all hover:border-blue-500"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                        <Icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                                        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                            {loading ? '...' : stat.value}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div
                    className="rounded-xl border p-6"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                        Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/admin/verification"
                            className="px-4 py-2 rounded-lg border transition-colors hover:border-blue-500 flex items-center gap-2"
                            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        >
                            <FiCheckCircle className="w-4 h-4" />
                            Review Verifications
                        </Link>
                        <Link
                            href="/admin/users"
                            className="px-4 py-2 rounded-lg border transition-colors hover:border-blue-500 flex items-center gap-2"
                            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        >
                            <FiUsers className="w-4 h-4" />
                            Manage Users
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
