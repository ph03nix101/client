'use client';

import { Header } from '@/components/Header';
import { LiveAuctions } from '@/components/LiveAuctions';
import { TrendingProducts } from '@/components/TrendingProducts';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import Link from 'next/link';
import { FiSearch, FiArrowRight, FiShield, FiTruck, FiClock, FiDollarSign } from 'react-icons/fi';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const { recentItems, clearRecentlyViewed, removeFromRecentlyViewed } = useRecentlyViewed();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Header />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-orange-500/20"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                />
                <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1
                            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Find Your Perfect{' '}
                            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                                Tech Deal
                            </span>
                        </h1>
                        <p
                            className="text-lg sm:text-xl mb-8"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Discover amazing tech products from verified sellers. Buy, sell, and bid on the latest gadgets.
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
                            <div className="relative">
                                <FiSearch
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for phones, laptops, cameras..."
                                    className="w-full pl-12 pr-32 py-4 rounded-2xl border text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    style={{
                                        backgroundColor: 'var(--card-bg)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Quick Links */}
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                href="/browse"
                                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: 'var(--bg-tertiary)',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                📱 Smartphones
                            </Link>
                            <Link
                                href="/browse"
                                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: 'var(--bg-tertiary)',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                💻 Laptops
                            </Link>
                            <Link
                                href="/browse"
                                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: 'var(--bg-tertiary)',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                📷 Cameras
                            </Link>
                            <Link
                                href="/browse"
                                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: 'var(--bg-tertiary)',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                🎧 Audio
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section
                className="border-y"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-blue-500/10">
                                <FiShield className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    Verified Sellers
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Trusted community
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-green-500/10">
                                <FiTruck className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    Fast Shipping
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Quick delivery
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-orange-500/10">
                                <FiClock className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    Live Auctions
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Bid & save
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-purple-500/10">
                                <FiDollarSign className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    Best Prices
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Great deals
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-12 space-y-16">
                {/* Live Auctions */}
                <LiveAuctions />

                {/* Trending Products */}
                <TrendingProducts maxDisplay={8} />

                {/* Recently Viewed */}
                <RecentlyViewed
                    items={recentItems}
                    onClear={clearRecentlyViewed}
                    onRemove={removeFromRecentlyViewed}
                />

                {/* CTA Section */}
                <section
                    className="rounded-2xl p-8 sm:p-12 text-center"
                    style={{
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary, #9333ea))',
                    }}
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        Ready to Sell Your Tech?
                    </h2>
                    <p className="text-white/80 mb-6 max-w-xl mx-auto">
                        List your gadgets for free and reach thousands of buyers. Start selling today!
                    </p>
                    <Link
                        href="/sell"
                        className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Start Selling
                        <FiArrowRight className="w-5 h-5" />
                    </Link>
                </section>
            </main>
        </div>
    );
}
