import { useState, useEffect } from 'react';
import { Product, Category, Auction } from '@/types';
import Link from 'next/link';
import { BsLaptop, BsCpu, BsGpuCard } from 'react-icons/bs';
import { FiHeart, FiArrowRight, FiShoppingCart } from 'react-icons/fi';
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

    // Calculate dynamic discount
    const originalPrice = product.original_price ? parseFloat(product.original_price) : 0;
    const discountPercent = (originalPrice > endPrice)
        ? Math.round(((originalPrice - endPrice) / originalPrice) * 100)
        : 0;

    return (
        <Link href={`/product/${product.id}`} className={variant === 'list' ? 'w-full' : ''}>
            <div
                className={`group overflow-hidden transition-all duration-200 cursor-pointer h-full flex rounded-xl border shadow-sm hover:shadow-md dark:shadow-none ${variant === 'list' ? 'flex-row' : 'flex-col'
                    }`}
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border)',
                }}
            >
                {/* Image Container */}
                <div
                    className={`relative flex items-center justify-center overflow-hidden ${variant === 'list'
                        ? 'w-48 h-full aspect-[4/3] shrink-0 border-r'
                        : 'aspect-square border border-gray-200 dark:border-gray-700/30 rounded-lg mx-3 mt-3'
                        }`}
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                    }}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.title}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
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

                    {/* Discount Badge - Top Right Circle */}
                    {discountPercent > 0 && (
                        <div className="absolute top-2 right-2 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-lg">
                            <span className="text-sm leading-none">{discountPercent}%</span>
                            <span className="text-[10px] leading-none">off</span>
                        </div>
                    )}

                    {/* Auction Badge */}
                    {isAuction && (
                        <div className="absolute bottom-2 left-2">
                            <AuctionBadge endTime={auctionData.end_time} size="sm" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    {/* Title */}
                    <h3
                        className="font-medium line-clamp-2 group-hover:text-blue-500 transition-colors mb-2 text-sm"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {product.title}
                    </h3>

                    {/* Seller & Condition Info */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span
                            className="text-xs font-medium px-2 py-0.5 rounded"
                            style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            {category?.name || 'Product'}
                        </span>
                        <span className="text-orange-500 text-lg">●</span>
                        <span
                            className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                            {product.condition || 'New'}
                        </span>
                    </div>

                    {/* Specs (compact) */}
                    {displaySpecs.length > 0 && variant !== 'list' && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {displaySpecs.slice(0, 2).map((spec, i) => (
                                <span
                                    key={i}
                                    className="text-[10px] px-1.5 py-0.5 rounded"
                                    style={{
                                        backgroundColor: 'var(--bg-tertiary)',
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    {spec}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Price Section */}
                    <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                            <span className={`text-lg font-bold ${isAuction ? 'text-orange-500' : ''}`} style={{ color: isAuction ? undefined : 'var(--text-primary)' }}>
                                R{endPrice.toLocaleString()}
                            </span>
                            <span className="text-sm line-through" style={{ color: 'var(--text-muted)' }}>
                                R{Math.round(originalPrice).toLocaleString()}
                            </span>
                        </div>
                        {isAuction && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {auctionData.bid_count} bid{auctionData.bid_count !== 1 ? 's' : ''}
                                </span>
                                <CompactAuctionCountdown endTime={auctionData.end_time} />
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                        {/* Wishlist Button */}
                        <button
                            onClick={handleWishlistClick}
                            disabled={wishlistLoading || !user}
                            className={`p-2 rounded-full border transition-all ${isInWishlist
                                ? 'text-red-500 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-red-300 hover:text-red-500'
                                } disabled:opacity-50`}
                            style={{ color: isInWishlist ? undefined : 'var(--text-muted)' }}
                            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            <FiHeart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                        </button>

                        {/* Contact Supplier Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Contact supplier logic would go here
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Contact Supplier
                            <FiArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

