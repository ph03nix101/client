'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, Category, Auction } from '@/types';
import { productsApi, categoriesApi, uploadsApi, usersApi, messagesApi, wishlistApi, reportsApi, ratingsApi, ProductImage, User, SellerStats, SellerRating } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { RatingModal } from '@/components/RatingModal';
import { FiArrowLeft, FiShare2, FiHeart, FiMessageCircle, FiClock, FiMapPin, FiUser, FiX, FiFlag, FiStar, FiEdit2 } from 'react-icons/fi';
import { BsLaptop, BsCpu, BsGpuCard } from 'react-icons/bs';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { SimilarProducts } from '@/components/SimilarProducts';
import { BidPanel } from '@/components/BidPanel';
import { ShippingDisplay } from '@/components/ShippingDisplay';
import { auctionsApi } from '@/lib/api';

const categoryIcons: Record<number, React.ReactNode> = {
    1: <BsLaptop className="w-5 h-5" />,
    2: <BsCpu className="w-5 h-5" />,
    3: <BsGpuCard className="w-5 h-5" />,
};

const categoryGradients: Record<number, string> = {
    1: 'from-purple-500 to-indigo-600',
    2: 'from-blue-500 to-cyan-600',
    3: 'from-green-500 to-emerald-600',
};

// Spec labels for display
const specLabels: Record<string, string> = {
    brand: 'Brand',
    cpu_model: 'Processor',
    gpu_model: 'Graphics Card',
    ram_size: 'RAM',
    ram_type: 'RAM Type',
    storage_type: 'Storage Type',
    storage_cap: 'Storage Capacity',
    screen_size: 'Screen Size',
    refresh_rate: 'Refresh Rate',
    battery_wh: 'Battery',
    kb_backlight: 'Keyboard Backlight',
    card_brand: 'Card Manufacturer',
    card_length: 'Card Length',
    includes_cooler: 'Includes Cooler',
    original_box: 'Original Box',
};

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [category, setCategory] = useState<Category | null>(null);
    const [seller, setSeller] = useState<User | null>(null);
    const [images, setImages] = useState<ProductImage[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);
    const [auction, setAuction] = useState<Auction | null>(null);
    const [sellerStats, setSellerStats] = useState<SellerStats | null>(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [existingRating, setExistingRating] = useState<SellerRating | null>(null);

    useEffect(() => {
        if (params.id) {
            setLoading(true);
            Promise.all([
                productsApi.getById(params.id as string),
                uploadsApi.getProductImages(params.id as string),
                categoriesApi.getAll(),
            ])
                .then(async ([productData, imagesData, categories]) => {
                    setProduct(productData);
                    setImages(imagesData);
                    const cat = categories.find(c => c.id === productData.category_id);
                    setCategory(cat || null);

                    // Fetch seller info
                    if (productData.seller_id) {
                        try {
                            const sellerData = await usersApi.getById(productData.seller_id);
                            setSeller(sellerData);
                        } catch (e) {
                            console.error('Failed to fetch seller:', e);
                        }
                    }
                })
                .catch((err) => {
                    console.error('Failed to fetch product:', err);
                    setError('Product not found');
                })
                .finally(() => setLoading(false));
        }
    }, [params.id]);

    // Check if product is in user's wishlist
    useEffect(() => {
        if (user && product) {
            wishlistApi.checkWishlist(product.id)
                .then(setIsInWishlist)
                .catch(() => setIsInWishlist(false));
        }
    }, [user, product]);

    // Fetch auction data for this product
    useEffect(() => {
        if (product && product.status === 'Auction') {
            auctionsApi.getByProductId(product.id)
                .then(setAuction)
                .catch(console.error);
        }
    }, [product]);

    // Fetch seller rating stats
    useEffect(() => {
        if (seller) {
            ratingsApi.getSellerStats(seller.id)
                .then(setSellerStats)
                .catch(console.error);
        }
    }, [seller]);

    // Check if user has already rated this seller
    useEffect(() => {
        if (user && seller && product) {
            ratingsApi.getMyRating(seller.id, product.id)
                .then(setExistingRating)
                .catch(() => setExistingRating(null));
        }
    }, [user, seller, product]);

    // Recently viewed tracking
    const { recentItems, addToRecentlyViewed, removeFromRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

    // Track product view
    useEffect(() => {
        if (product && images.length > 0) {
            const primaryImage = images.find(img => img.is_primary) || images[0];
            const imageUrl = primaryImage ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${primaryImage.url}` : undefined;
            addToRecentlyViewed(product, imageUrl);
        }
    }, [product?.id, images.length, addToRecentlyViewed]);

    if (loading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <Header />
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 w-32 rounded mb-6" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="aspect-square rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                            <div className="space-y-4">
                                <div className="h-8 rounded w-3/4" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                                <div className="h-12 rounded w-1/3" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                                <div className="h-24 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <Header />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="text-6xl mb-4">😕</div>
                        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Product Not Found</h1>
                        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>The listing you&apos;re looking for doesn&apos;t exist.</p>
                        <Link
                            href="/browse"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                        >
                            <FiArrowLeft /> Back to Browse
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const specs = product.specs as Record<string, unknown>;
    const createdDate = new Date(product.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Base URL for images (remove /api from API URL)
    const imageBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                    <Link href="/browse" className="hover:text-blue-500 transition-colors">All categories</Link>
                    <span>›</span>
                    {category && (
                        <>
                            <Link href={`/browse?category_id=${category.id}`} className="hover:text-blue-500 transition-colors">
                                {category.name}
                            </Link>
                            <span>›</span>
                        </>
                    )}
                    <span style={{ color: 'var(--text-primary)' }}>{product.title}</span>
                </nav>

                {/* Main Product Card */}
                <div
                    className="rounded-lg border p-6 mb-8"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Product Image */}
                        <div className="relative">
                            <div
                                className="aspect-square rounded-lg overflow-hidden"
                                style={{ backgroundColor: 'var(--bg-tertiary)' }}
                            >
                                {images.length > 0 ? (
                                    <img
                                        src={`${imageBaseUrl}${images[selectedImageIndex].url}`}
                                        alt={product.title}
                                        className="w-full h-full object-contain p-4"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                                        <div className="transform scale-[4]">
                                            {categoryIcons[product.category_id] || <BsLaptop />}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Drop & Shop Badge */}
                            <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                TechFinder
                            </div>

                            {/* Thumbnail Strip */}
                            {images.length > 1 && (
                                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                    {images.map((img, index) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === selectedImageIndex
                                                ? 'border-blue-500 ring-2 ring-blue-500/30'
                                                : ''
                                                }`}
                                            style={{ borderColor: index === selectedImageIndex ? undefined : 'var(--border)' }}
                                        >
                                            <img
                                                src={`${imageBaseUrl}${img.url}`}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-5">
                            {/* Title */}
                            <div>
                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {product.title}
                                    </h1>
                                    {user && user.id === product.seller_id && (
                                        <Link
                                            href={`/dashboard/listings/${product.id}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm flex-shrink-0"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                            Edit
                                        </Link>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span
                                        className="text-xs font-medium px-2.5 py-1 rounded border"
                                        style={{
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        {product.condition || 'New'}
                                    </span>
                                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                        {product.status === 'Active' ? 'Available' : product.status}
                                    </span>
                                </div>
                            </div>

                            {/* Indicative Price */}
                            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Indicative market price:{' '}
                                <span className="line-through">
                                    R{Math.round(parseFloat(product.price) * 1.2).toLocaleString()}
                                </span>
                            </div>

                            {/* Price Section */}
                            {product.status === 'Auction' && auction ? (
                                <div className="mb-4">
                                    <BidPanel
                                        auction={auction}
                                        productSellerId={product.seller_id}
                                        onBidPlaced={(updated) => setAuction(updated)}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                        R{parseFloat(product.price).toLocaleString()}
                                    </span>
                                    <span className="text-lg font-semibold text-green-500">
                                        17% off
                                    </span>
                                </div>
                            )}

                            {/* Contact Supplier */}
                            {product.status !== 'Auction' && (
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            router.push('/login?redirect=' + encodeURIComponent(`/product/${product.id}`));
                                            return;
                                        }
                                        setShowMessageModal(true);
                                    }}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    <FiMessageCircle className="w-5 h-5" />
                                    Contact Supplier
                                </button>
                            )}

                            {/* Share & Watchlist */}
                            <div
                                className="flex items-center justify-between pb-4 border-b"
                                style={{ borderColor: 'var(--border)' }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Share</span>
                                    <div className="flex items-center gap-1.5">
                                        {['X', 'f', 'P', 'in', 'W', '✉', '📋'].map((icon, i) => (
                                            <button
                                                key={i}
                                                className="w-7 h-7 rounded-full border flex items-center justify-center text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!user) {
                                            router.push('/login?redirect=' + encodeURIComponent(`/product/${product?.id}`));
                                            return;
                                        }
                                        if (!product) return;
                                        setWishlistLoading(true);
                                        try {
                                            const result = await wishlistApi.toggleWishlist(product.id);
                                            setIsInWishlist(result.added);
                                        } catch (err) {
                                            console.error('Failed to toggle wishlist:', err);
                                        } finally {
                                            setWishlistLoading(false);
                                        }
                                    }}
                                    disabled={wishlistLoading}
                                    className={`flex items-center gap-2 text-sm transition-colors ${isInWishlist ? 'text-red-500' : ''}`}
                                    style={{ color: isInWishlist ? undefined : 'var(--text-muted)' }}
                                >
                                    <FiHeart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                                    {isInWishlist ? 'Added to watchlist' : 'Add to watchlist'}
                                </button>
                            </div>

                            {/* Shipping Info */}
                            <div className="space-y-3">
                                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Shipping</h3>
                                <ShippingDisplay productId={product.id} />
                            </div>

                            {/* Seller Info */}
                            <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Seller</h3>
                                <Link
                                    href={seller ? `/seller/${seller.id}` : '#'}
                                    className="flex items-center gap-3 group"
                                >
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                        {seller?.avatar_url ? (
                                            <img src={seller.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                                                {seller?.full_name?.charAt(0).toUpperCase() || 'S'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-blue-500 group-hover:underline">
                                                {seller?.full_name || seller?.username || 'Seller'}
                                            </span>
                                            {seller?.is_verified_seller && <VerifiedBadge size="sm" />}
                                            {sellerStats && sellerStats.total_ratings > 0 && (
                                                <div className="flex items-center gap-1 text-yellow-500">
                                                    <span>★</span>
                                                    <span className="text-sm">{sellerStats.total_ratings}</span>
                                                </div>
                                            )}
                                        </div>
                                        {sellerStats && sellerStats.total_ratings > 0 ? (
                                            <span className="text-sm text-green-500">
                                                {sellerStats.positive_percentage}% Positive ratings
                                            </span>
                                        ) : (
                                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                No ratings yet
                                            </span>
                                        )}
                                    </div>
                                </Link>
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            router.push('/login?redirect=' + encodeURIComponent(`/product/${product.id}`));
                                            return;
                                        }
                                        setShowMessageModal(true);
                                    }}
                                    className="flex items-center gap-2 mt-3 text-sm transition-colors hover:text-blue-500"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <FiMessageCircle className="w-4 h-4" />
                                    Ask the seller a question
                                </button>

                                {/* Rate Seller Button */}
                                {user && seller && user.id !== seller.id && (
                                    <button
                                        onClick={() => setShowRatingModal(true)}
                                        className="flex items-center gap-2 mt-2 text-sm transition-colors hover:text-yellow-500"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        <FiStar className={`w-4 h-4 ${existingRating ? 'fill-current text-yellow-500' : ''}`} />
                                        {existingRating ? 'Update your rating' : 'Rate this seller'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Section */}
                <div
                    className="rounded-lg border p-6 mb-8"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                    <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Product details</h2>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Condition</span>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{product.condition || 'New'}</p>
                        </div>
                        <div>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Location</span>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>South Africa</p>
                        </div>
                        <div>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Product code</span>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{product.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>TechFinder ID</span>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>66260{product.id.slice(-4)}87</p>
                        </div>
                    </div>

                    {/* Description & Features */}
                    <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
                        {product.description && (
                            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
                        )}

                        {Object.keys(specs).length > 0 && (
                            <>
                                <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Key Features:</h3>
                                <ul className="space-y-2">
                                    {Object.entries(specs).map(([key, value]) => {
                                        if (value === null || value === undefined || value === '') return null;
                                        const label = specLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                        let displayValue = String(value);
                                        if (typeof value === 'boolean') {
                                            displayValue = value ? 'Yes' : 'No';
                                        }
                                        return (
                                            <li key={key} className="flex items-start gap-2">
                                                <span className="text-blue-500 font-bold">•</span>
                                                <span style={{ color: 'var(--text-secondary)' }}>
                                                    <strong style={{ color: 'var(--text-primary)' }}>{label}:</strong> {displayValue}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                    </div>

                    {/* Report Link */}
                    <div className="mt-6 text-right">
                        {user && product && user.id !== product.seller_id && (
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                Report a problem
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Similar Products Section */}
            {
                product && (
                    <div className="max-w-7xl mx-auto px-4 py-8 mt-8">
                        <SimilarProducts productId={product.id} categoryId={product.category_id} />
                    </div>
                )
            }

            {/* Recently Viewed Section */}
            {
                recentItems.length > 1 && (
                    <div className="max-w-7xl mx-auto px-4 py-8 mt-8">
                        <RecentlyViewed
                            items={recentItems}
                            currentProductId={product?.id}
                            onRemove={removeFromRecentlyViewed}
                            onClear={clearRecentlyViewed}
                            maxDisplay={6}
                        />
                    </div>
                )
            }

            {/* Message Modal */}
            {
                showMessageModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div
                            className="rounded-xl border max-w-md w-full"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    Contact Seller
                                </h3>
                                <button
                                    onClick={() => setShowMessageModal(false)}
                                    className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                >
                                    <FiX className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                                </button>
                            </div>

                            <div className="p-4">
                                <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                                    About: <strong style={{ color: 'var(--text-primary)' }}>{product?.title}</strong>
                                </p>
                                <textarea
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder={`Hi, I'm interested in your ${product?.title}. Is it still available?`}
                                    className="w-full px-4 py-3 rounded-lg border resize-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--text-primary)'
                                    }}
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-3 p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                <button
                                    onClick={() => setShowMessageModal(false)}
                                    className="flex-1 py-2.5 rounded-lg border font-medium transition-colors"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!messageText.trim() || !product) return;
                                        setSendingMessage(true);
                                        try {
                                            const conv = await messagesApi.startConversation(product.id, messageText.trim());
                                            router.push(`/dashboard/messages/${conv.id}`);
                                        } catch (err) {
                                            console.error('Failed to send message:', err);
                                            alert('Failed to send message. Please try again.');
                                        } finally {
                                            setSendingMessage(false);
                                        }
                                    }}
                                    disabled={!messageText.trim() || sendingMessage}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {sendingMessage ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Report Modal */}
            {
                showReportModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div
                            className="rounded-xl border max-w-md w-full"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Report Listing</h3>
                                <button
                                    onClick={() => {
                                        setShowReportModal(false);
                                        setReportReason('');
                                        setReportDescription('');
                                        setReportError(null);
                                        setReportSuccess(false);
                                    }}
                                    className="p-2 rounded-lg hover:bg-gray-500/20 transition-colors"
                                >
                                    <FiX className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                </button>
                            </div>

                            {reportSuccess ? (
                                <div className="p-6 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <FiFlag className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Report Submitted</h4>
                                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                                        Thank you for your report. Our team will review this listing.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setShowReportModal(false);
                                            setReportSuccess(false);
                                        }}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4">
                                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                                        Help us understand what's wrong with this listing.
                                    </p>

                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        Reason for reporting *
                                    </label>
                                    <select
                                        value={reportReason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg border mb-4"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="">Select a reason</option>
                                        <option value="spam">Spam or misleading</option>
                                        <option value="fraud">Suspected fraud or scam</option>
                                        <option value="inappropriate">Inappropriate content</option>
                                        <option value="counterfeit">Counterfeit product</option>
                                        <option value="other">Other</option>
                                    </select>

                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        Additional details (optional)
                                    </label>
                                    <textarea
                                        value={reportDescription}
                                        onChange={(e) => setReportDescription(e.target.value)}
                                        placeholder="Provide more details about the issue..."
                                        rows={3}
                                        className="w-full px-3 py-2.5 rounded-lg border resize-none"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />

                                    {reportError && (
                                        <p className="text-red-500 text-sm mt-2">{reportError}</p>
                                    )}

                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => {
                                                setShowReportModal(false);
                                                setReportReason('');
                                                setReportDescription('');
                                                setReportError(null);
                                            }}
                                            className="flex-1 py-2.5 rounded-lg border font-medium"
                                            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!reportReason) {
                                                    setReportError('Please select a reason');
                                                    return;
                                                }
                                                setReportSubmitting(true);
                                                setReportError(null);
                                                try {
                                                    await reportsApi.create(product!.id, reportReason, reportDescription || undefined);
                                                    setReportSuccess(true);
                                                    setReportReason('');
                                                    setReportDescription('');
                                                } catch (err: any) {
                                                    setReportError(err.response?.data?.message || 'Failed to submit report');
                                                } finally {
                                                    setReportSubmitting(false);
                                                }
                                            }}
                                            disabled={!reportReason || reportSubmitting}
                                            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Rating Modal */}
            {
                showRatingModal && seller && product && (
                    <RatingModal
                        sellerId={seller.id}
                        sellerName={seller.full_name || seller.username || 'Seller'}
                        productId={product.id}
                        productTitle={product.title}
                        existingRating={existingRating}
                        onClose={() => setShowRatingModal(false)}
                        onSuccess={(newRating) => {
                            setExistingRating(newRating);
                            // Refresh seller stats
                            ratingsApi.getSellerStats(seller.id)
                                .then(setSellerStats)
                                .catch(console.error);
                        }}
                    />
                )
            }
        </div >
    );
}
