'use client';

import { useState, useEffect } from 'react';
import { Auction, Bid } from '@/types';
import { auctionsApi } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { AuctionCountdown } from '@/components/AuctionCountdown';
import { FiDollarSign, FiUser, FiClock, FiZap } from 'react-icons/fi';

interface BidPanelProps {
    auction: Auction;
    productSellerId: string;
    onBidPlaced?: (auction: Auction) => void;
}

export function BidPanel({ auction, productSellerId, onBidPlaced }: BidPanelProps) {
    const { user } = useAuth();
    const [bidAmount, setBidAmount] = useState('');
    const [bidHistory, setBidHistory] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [currentAuction, setCurrentAuction] = useState(auction);

    const MIN_INCREMENT = 50;
    const currentBid = currentAuction.current_bid
        ? parseFloat(currentAuction.current_bid)
        : parseFloat(currentAuction.starting_price);
    const minBid = currentAuction.current_bid ? currentBid + MIN_INCREMENT : currentBid;

    useEffect(() => {
        // Load bid history
        auctionsApi.getBidHistory(auction.id)
            .then(setBidHistory)
            .catch(console.error);
    }, [auction.id]);

    useEffect(() => {
        // Set initial bid amount
        setBidAmount(minBid.toString());
    }, [minBid]);

    const handlePlaceBid = async () => {
        if (!user) return;

        const amount = parseFloat(bidAmount);
        if (isNaN(amount) || amount < minBid) {
            setError(`Minimum bid is R${minBid.toLocaleString()}`);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const result = await auctionsApi.placeBid(auction.id, amount);
            setCurrentAuction(result.auction);
            setBidHistory(prev => [result.bid, ...prev]);
            setSuccess(true);
            onBidPlaced?.(result.auction);
            setBidAmount((parseFloat(result.auction.current_bid!) + MIN_INCREMENT).toString());
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to place bid');
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = async () => {
        if (!user || !currentAuction.buy_now_price) return;

        setLoading(true);
        setError(null);

        try {
            const result = await auctionsApi.placeBid(auction.id, parseFloat(currentAuction.buy_now_price));
            setCurrentAuction(result.auction);
            onBidPlaced?.(result.auction);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to complete purchase');
        } finally {
            setLoading(false);
        }
    };

    const incrementBid = (amount: number) => {
        const current = parseFloat(bidAmount) || minBid;
        setBidAmount((current + amount).toString());
    };

    const isOwner = user?.id === productSellerId;
    const isEnded = currentAuction.status !== 'active';
    const isWinning = user && currentAuction.highest_bidder_id === user.id;

    return (
        <div className="space-y-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            {/* Auction Status */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FiClock className="w-5 h-5 text-blue-500" />
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {isEnded ? 'Auction Ended' : 'Time Remaining'}
                    </span>
                </div>
                {isWinning && !isEnded && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-medium">
                        You're Winning!
                    </span>
                )}
            </div>

            {!isEnded && (
                <AuctionCountdown endTime={currentAuction.end_time} />
            )}

            {/* Current Bid */}
            <div className="py-3 border-t border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                    {currentAuction.current_bid ? 'Current Bid' : 'Starting Price'}
                </p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-500">
                        R {currentBid.toLocaleString()}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {currentAuction.bid_count} bid{currentAuction.bid_count !== 1 ? 's' : ''}
                    </span>
                </div>
                {currentAuction.reserve_price && currentAuction.current_bid &&
                    parseFloat(currentAuction.current_bid) < parseFloat(currentAuction.reserve_price) && (
                        <p className="text-xs text-orange-400 mt-1">Reserve not met</p>
                    )}
            </div>

            {/* Bid Controls */}
            {!isEnded && !isOwner && user && (
                <div className="space-y-3">
                    <div>
                        <label className="text-sm mb-1 block" style={{ color: 'var(--text-muted)' }}>
                            Your Bid (min: R{minBid.toLocaleString()})
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R</span>
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    min={minBid}
                                    step={MIN_INCREMENT}
                                    className="w-full pl-8 pr-4 py-2.5 rounded-lg border"
                                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <button
                                onClick={() => incrementBid(50)}
                                className="px-3 py-2 rounded-lg border font-medium"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            >
                                +R50
                            </button>
                            <button
                                onClick={() => incrementBid(100)}
                                className="px-3 py-2 rounded-lg border font-medium"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            >
                                +R100
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handlePlaceBid}
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <FiDollarSign className="w-5 h-5" />
                        {loading ? 'Placing Bid...' : 'Place Bid'}
                    </button>

                    {currentAuction.buy_now_price && (
                        <button
                            onClick={handleBuyNow}
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <FiZap className="w-5 h-5" />
                            Buy Now: R {parseFloat(currentAuction.buy_now_price).toLocaleString()}
                        </button>
                    )}

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}
                    {success && (
                        <p className="text-green-500 text-sm text-center">Bid placed successfully!</p>
                    )}
                </div>
            )}

            {/* Not logged in */}
            {!user && !isEnded && (
                <div className="text-center py-3">
                    <p style={{ color: 'var(--text-muted)' }}>
                        <a href="/login" className="text-blue-500 hover:underline">Login</a> to place a bid
                    </p>
                </div>
            )}

            {/* Owner message */}
            {isOwner && !isEnded && (
                <div className="text-center py-3 rounded-lg bg-yellow-500/10">
                    <p className="text-yellow-500 text-sm">This is your auction</p>
                </div>
            )}

            {/* Bid History */}
            {bidHistory.length > 0 && (
                <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Recent Bids
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {bidHistory.slice(0, 5).map((bid) => (
                            <div key={bid.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <FiUser className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ color: 'var(--text-secondary)' }}>{bid.username}</span>
                                </div>
                                <span className="font-medium text-blue-500">
                                    R {parseFloat(bid.amount).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
