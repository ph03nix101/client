'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, Category, Auction } from '@/types';
import { productsApi, categoriesApi, uploadsApi, usersApi, messagesApi, wishlistApi, reportsApi, ProductImage, User } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { FiArrowLeft, FiShare2, FiHeart, FiMessageCircle, FiClock, FiMapPin, FiUser, FiX, FiFlag } from 'react-icons/fi';
import { BsLaptop, BsCpu, BsGpuCard } from 'react-icons/bs';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { SimilarProducts } from '@/components/SimilarProducts';
import { BidPanel } from '@/components/BidPanel';
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

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 mb-6 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    <FiArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left: Images */}
                    <div className="lg:col-span-3">
                        <div
                            className="rounded-xl border overflow-hidden"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            {/* Main Image */}
                            <div className="aspect-[4/3] relative" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                {images.length > 0 ? (
                                    <img
                                        src={`${imageBaseUrl}${images[selectedImageIndex].url}`}
                                        alt={product.title}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                                        <div className="transform scale-[4]">
                                            {categoryIcons[product.category_id] || <BsLaptop />}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Strip */}
                            {images.length > 1 && (
                                <div className="flex gap-2 p-4 overflow-x-auto">
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

                        {/* Description */}
                        {product.description && (
                            <div
                                className="rounded-xl border p-6 mt-6"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                            >
                                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Description</h2>
                                <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
                            </div>
                        )}

                        {/* Specifications */}
                        <div
                            className="rounded-xl border p-6 mt-6"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Technical Specifications</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(specs).map(([key, value]) => {
                                    if (value === null || value === undefined || value === '') return null;
                                    const label = specLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                    let displayValue = String(value);

                                    // Format booleans
                                    if (typeof value === 'boolean') {
                                        displayValue = value ? 'Yes' : 'No';
                                    }

                                    return (
                                        <div
                                            key={key}
                                            className="flex justify-between py-2 border-b"
                                            style={{ borderColor: 'var(--border)' }}
                                        >
                                            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{displayValue}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Price & Actions */}
                    <div className="lg:col-span-2">
                        <div
                            className="rounded-xl border p-6 sticky top-24"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            {/* Category Badge */}
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white mb-4 bg-gradient-to-r ${categoryGradients[product.category_id] || 'from-gray-500 to-gray-600'}`}>
                                {categoryIcons[product.category_id]}
                                {category?.name || 'Product'}
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{product.title}</h1>

                            {/* Condition */}
                            <div
                                className="inline-block px-3 py-1 rounded-lg text-sm font-medium mb-4"
                                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                            >
                                {product.condition}
                            </div>

                            {/* Auction Bid Panel or Fixed Price */}
                            {product.status === 'Auction' && auction ? (
                                <div className="mb-6">
                                    <BidPanel
                                        auction={auction}
                                        productSellerId={product.seller_id}
                                        onBidPlaced={(updated) => setAuction(updated)}
                                    />
                                </div>
                            ) : (
                                <div className="text-4xl font-bold text-blue-500 mb-6">
                                    R {parseFloat(product.price).toLocaleString()}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-3">
                                {user && user.id === product.seller_id ? (
                                    <Link
                                        href={`/dashboard/listings/${product.id}`}
                                        className="w-full py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <FiArrowLeft className="w-5 h-5 rotate-180" /> {/* Reusing icon, maybe edit icon better? */}
                                        Edit Listing
                                    </Link>
                                ) : (
                                    <>
                                        <Button
                                            className="w-full py-3 text-lg"
                                            onClick={() => {
                                                if (!user) {
                                                    router.push('/login?redirect=' + encodeURIComponent(`/product/${product.id}`));
                                                    return;
                                                }
                                                setShowMessageModal(true);
                                            }}
                                        >
                                            <FiMessageCircle className="w-5 h-5" />
                                            Contact Seller
                                        </Button>
                                        <button
                                            className="w-full py-3 rounded-lg border font-medium flex items-center justify-center gap-2 transition-colors"
                                            style={{
                                                borderColor: isInWishlist ? 'rgb(239 68 68)' : 'var(--border)',
                                                color: isInWishlist ? 'rgb(239 68 68)' : 'var(--text-primary)',
                                                backgroundColor: isInWishlist ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
                                            }}
                                            disabled={wishlistLoading}
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
                                        >
                                            <FiHeart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                                            {wishlistLoading ? 'Saving...' : (isInWishlist ? 'Saved to Wishlist' : 'Save to Wishlist')}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Meta Info */}
                            <div className="mt-6 pt-6 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
                                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                    <FiClock className="w-4 h-4" />
                                    Listed on {createdDate}
                                </div>
                                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                    <FiMapPin className="w-4 h-4" />
                                    Location not specified
                                </div>
                            </div>

                            {/* Seller Card */}
                            <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                                <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Seller</h3>
                                <Link
                                    href={seller ? `/seller/${seller.id}` : '#'}
                                    className="flex items-center gap-3 group"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {seller?.avatar_url ? (
                                            <img src={seller.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            seller?.full_name?.charAt(0).toUpperCase() || <FiUser className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium group-hover:text-blue-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                                                {seller?.full_name || seller?.username || 'Seller'}
                                            </span>
                                            {seller?.is_verified_seller && <VerifiedBadge size="sm" />}
                                        </div>
                                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {seller?.created_at ? `Member since ${new Date(seller.created_at).getFullYear()}` : 'TechFinder Seller'}
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* Share Actions */}
                            <div className="mt-6 pt-6 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
                                <button
                                    className="flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition-colors"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                >
                                    <FiShare2 className="w-4 h-4" />
                                    Share
                                </button>
                                {user && product && user.id !== product.seller_id && (
                                    <button
                                        onClick={() => setShowReportModal(true)}
                                        className="flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition-colors hover:border-red-500/50 hover:text-red-500"
                                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                    >
                                        <FiFlag className="w-4 h-4" />
                                        Report
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Products Section */}
            {product && (
                <div className="max-w-7xl mx-auto px-4 py-8 mt-8">
                    <SimilarProducts productId={product.id} categoryId={product.category_id} />
                </div>
            )}

            {/* Recently Viewed Section */}
            {recentItems.length > 1 && (
                <div className="max-w-7xl mx-auto px-4 py-8 mt-8">
                    <RecentlyViewed
                        items={recentItems}
                        currentProductId={product?.id}
                        onRemove={removeFromRecentlyViewed}
                        onClear={clearRecentlyViewed}
                        maxDisplay={6}
                    />
                </div>
            )}

            {/* Footer */}
            <footer
                className="border-t py-8 mt-12"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
            >
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p style={{ color: 'var(--text-muted)' }}>
                        © {new Date().getFullYear()} TechFinder. Built for tech enthusiasts.
                    </p>
                </div>
            </footer>

            {/* Message Modal */}
            {showMessageModal && (
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
            )}

            {/* Report Modal */}
            {showReportModal && (
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
            )}
        </div>
    );
}
