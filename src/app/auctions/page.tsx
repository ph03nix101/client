'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { auctionsApi } from '@/lib/api';
import { Auction } from '@/types';
import { FiClock } from 'react-icons/fi';
import { FaGavel } from 'react-icons/fa';
import Link from 'next/link';

export default function AuctionsPage() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAuctions();
    }, []);

    const fetchAuctions = async () => {
        try {
            setLoading(true);
            const data = await auctionsApi.getActive();
            setAuctions(data);
        } catch (err) {
            console.error('Failed to fetch auctions:', err);
            setError('Failed to load auctions. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <FaGavel className="w-8 h-8 text-orange-500" />
                            Live Auctions
                        </h1>
                        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                            Bid on exclusive tech deals starting from low prices
                        </p>
                    </div>
                    {/* Add filters if needed later */}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="aspect-[3/4] rounded-xl animate-pulse"
                                style={{ backgroundColor: 'var(--bg-secondary)' }}
                            />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={fetchAuctions}
                            className="text-blue-600 hover:underline"
                        >
                            Try Again
                        </button>
                    </div>
                ) : auctions.length === 0 ? (
                    <div className="text-center py-20 rounded-2xl border border-dashed" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                                <FiClock className="w-8 h-8 text-orange-500" />
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            No active auctions
                        </h2>
                        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                            Check back later or browse our fixed-price listings.
                        </p>
                        <Link
                            href="/browse"
                            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Browse All Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {auctions.map((auction) => (
                            auction.product && (
                                <ProductCard
                                    key={auction.id}
                                    product={auction.product}
                                    auction={auction}
                                    imageUrl={
                                        auction.image_url
                                            ? (auction.image_url.startsWith('http')
                                                ? auction.image_url
                                                : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${auction.image_url}`)
                                            : undefined
                                    }
                                />
                            )
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
