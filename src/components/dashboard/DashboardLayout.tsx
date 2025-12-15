'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { FiHome, FiList, FiUser, FiSettings, FiPlus, FiShield, FiMessageCircle, FiHeart } from 'react-icons/fi';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { href: '/dashboard', label: 'Overview', icon: FiHome },
    { href: '/dashboard/listings', label: 'My Listings', icon: FiList },
    { href: '/dashboard/messages', label: 'Messages', icon: FiMessageCircle },
    { href: '/dashboard/wishlist', label: 'Wishlist', icon: FiHeart },
    { href: '/dashboard/verification', label: 'Verification', icon: FiShield },
    { href: '/dashboard/profile', label: 'Profile', icon: FiUser },
    { href: '/dashboard/settings', label: 'Settings', icon: FiSettings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Header />

            {/* Dashboard Header */}
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
                            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                                Seller Dashboard
                            </h1>
                        </div>
                        <Link
                            href="/sell"
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            <FiPlus className="w-4 h-4" />
                            New Listing
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
                                            color: active ? 'white' : 'var(--text-secondary)',
                                        }}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Mobile Nav */}
                    <div className="md:hidden mb-6 w-full">
                        <nav className="flex gap-2 overflow-x-auto pb-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
                                        style={{
                                            backgroundColor: active ? 'var(--accent)' : 'var(--card-bg)',
                                            color: active ? 'white' : 'var(--text-secondary)',
                                            border: active ? 'none' : '1px solid var(--border)',
                                        }}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>

            {/* Footer */}
            <footer
                className="border-t py-8 mt-auto"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
            >
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p style={{ color: 'var(--text-muted)' }}>
                        © {new Date().getFullYear()} TechFinder. Built for tech enthusiasts.
                    </p>
                </div>
            </footer>
        </div>
    );
}
