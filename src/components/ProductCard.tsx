import { useState, useEffect } from 'react';
import { Product, Category, Auction } from '@/types';
import Link from 'next/link';
import { BsLaptop, BsCpu, BsGpuCard } from 'react-icons/bs';
import { FiHeart } from 'react-icons/fi';
import { wishlistApi } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { AuctionBadge } from '@/components/AuctionBadge';
import { CompactAuctionCountdown } from '@/components/CompactAuctionCountdown';

interface ProductCardProps {
    product: Product;
    category?: Category;
    imageUrl?: string;
    auction?: Auction;
    variant?: 'grid' | 'list';
}

const categoryIcons: Record<number, React.ReactNode> = {
    1: <BsLaptop className="w-4 h-4" />,
    2: <BsCpu className="w-4 h-4" />,
    3: <BsGpuCard className="w-4 h-4" />,
};

const categoryGradients: Record<number, string> = {
    1: 'from-purple-500 to-indigo-600',
    2: 'from-blue-500 to-cyan-600',
    3: 'from-green-500 to-emerald-600',
};

export function ProductCard({ product, category, imageUrl, auction, variant = 'grid' }: ProductCardProps) {
    const { user } = useAuth();
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const specs = product.specs as Record<string, string>;

    // Check if product is in wishlist on mount
    useEffect(() => {
        if (user && product.id) {
            wishlistApi.checkWishlist(product.id)
                .then(setIsInWishlist)
                .catch(() => setIsInWishlist(false));
        }
    }, [user, product.id]);

    const handleWishlistClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) return;

        setWishlistLoading(true);
        try {
            const result = await wishlistApi.toggleWishlist(product.id);
            setIsInWishlist(result.added);
        } catch (err) {
            console.error('Failed to toggle wishlist:', err);
        } finally {
            setWishlistLoading(false);
        }
    };

    // Get display specs based on category
    const getDisplaySpecs = () => {
        if (product.category_id === 1) { // Laptop
            return [
                specs?.cpu_model,
                specs?.ram_size,
                specs?.gpu_model,
            ].filter(Boolean).slice(0, 3);
        } else if (product.category_id === 2) { // CPU
            return [specs?.cpu_model].filter(Boolean);
        } else if (product.category_id === 3) { // GPU
            return [specs?.gpu_model, specs?.card_brand].filter(Boolean);
        }
        return [];
    };

    const displaySpecs = getDisplaySpecs();
    // Prioritize passed auction prop, fallback to product.auction
    const auctionData = auction || product.auction;
    const isAuction = product.status === 'Auction' && auctionData;
    const endPrice = isAuction
        ? (auctionData?.current_bid ? parseFloat(auctionData.current_bid) : parseFloat(auctionData?.starting_price || '0'))
        : parseFloat(product.price);

    return (
        <Link href={`/product/${product.id}`} className={variant === 'list' ? 'w-full' : ''}>
            <div
                className={`group rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex ${variant === 'list' ? 'flex-row' : 'flex-col'
                    }`}
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border)',
                }}
            >
                {/* Image */}
                <div
                    className={`relative flex items-center justify-center overflow-hidden ${variant === 'list' ? 'w-48 h-full aspect-[4/3] shrink-0 border-r py-2 pl-2' : 'aspect-[4/3] w-full'
                        }`}
                    style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: 'var(--border)'
                    }}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div style={{ color: 'var(--text-muted)' }}>
                            {categoryIcons[product.category_id] ? (
                                <div className="transform scale-[3]">
                                    {categoryIcons[product.category_id]}
                                </div>
                            ) : (
                                <BsLaptop className="w-12 h-12" />
                            )}
                        </div>
                    )}

                    {/* Condition Badge */}
                    <span
                        className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        {product.condition}
                    </span>

                    {/* Auction Badge */}
                    {isAuction && (
                        <div className="absolute bottom-2 left-2">
                            <AuctionBadge endTime={auctionData.end_time} size="sm" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    {/* Category badge */}
                    <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white mb-2 self-start bg-gradient-to-r ${categoryGradients[product.category_id] || 'from-gray-500 to-gray-600'}`}
                    >
                        {categoryIcons[product.category_id]}
                        {category?.name || 'Product'}
                    </div>

                    {/* Title */}
                    <h3
                        className="font-semibold line-clamp-2 group-hover:text-blue-500 transition-colors mb-2"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {product.title}
                    </h3>

                    {/* Specs */}
                    {displaySpecs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {displaySpecs.map((spec, i) => (
                                <span
                                    key={i}
                                    className="text-xs px-2 py-0.5 rounded"
                                    style={{
                                        backgroundColor: 'var(--bg-tertiary)',
                                        color: 'var(--text-secondary)',
                                    }}
                                >
                                    {spec}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Price & Wishlist */}
                    <div
                        className="flex items-center justify-between mt-auto pt-2 border-t"
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <div className="flex flex-col">
                            <span className={`text-xl font-bold ${isAuction ? 'text-orange-500' : 'text-blue-500'}`}>
                                R {endPrice.toLocaleString()}
                            </span>
                            {isAuction && (
                                <div className="flex flex-col gap-0.5 mt-0.5">
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {auctionData.bid_count} bid{auctionData.bid_count !== 1 ? 's' : ''}
                                    </span>
                                    <CompactAuctionCountdown endTime={auctionData.end_time} />
                                </div>
                            )}
                        </div>
                        {user && (
                            <button
                                onClick={handleWishlistClick}
                                disabled={wishlistLoading}
                                className={`p-2 rounded-full transition-all ${isInWishlist
                                    ? 'text-red-500 bg-red-500/10'
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
                                    } disabled:opacity-50`}
                                title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                                <FiHeart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
