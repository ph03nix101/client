'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { FiHome, FiUsers, FiCheckCircle, FiSettings, FiArrowLeft, FiFlag } from 'react-icons/fi';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: FiHome },
    { href: '/admin/verification', label: 'Verification', icon: FiCheckCircle },
    { href: '/admin/reports', label: 'Reports', icon: FiFlag },
    { href: '/admin/users', label: 'Users', icon: FiUsers },
];

export function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();

    // Redirect non-admin users
    useEffect(() => {
        if (!loading && (!user || !(user as any).is_admin)) {
            router.push('/');
        }
    }, [user, loading, router]);

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    // Don't render for non-admins
    if (!user || !(user as any).is_admin) {
        return null;
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Header />

            {/* Admin Header */}
            <div
                className="border-b"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border)'
                }}
            >
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-500">
                                ADMIN
                            </div>
                            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                                Admin Panel
                            </h1>
                        </div>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-sm transition-colors hover:text-blue-500"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <aside className="w-64 flex-shrink-0 hidden md:block">
                        <nav
                            className="rounded-xl border overflow-hidden sticky top-24"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border)'
                            }}
                        >
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 transition-colors"
                                        style={{
                                            borderColor: 'var(--border)',
                                            backgroundColor: active ? 'var(--accent)' : 'transparent',
                                            color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        }}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
