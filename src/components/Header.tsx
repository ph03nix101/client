'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthProvider';
import { productsApi, uploadsApi, messagesApi } from '@/lib/api';
import { Product } from '@/types';
import { FiSearch, FiSun, FiMoon, FiUser, FiPlus, FiMenu, FiX, FiLogOut, FiSettings, FiPackage, FiMessageCircle } from 'react-icons/fi';
import { BsLaptop, BsCpu, BsGpuCard } from 'react-icons/bs';

const categories = [
    { name: 'Laptops', slug: 'laptop', icon: BsLaptop, id: 1 },
    { name: 'CPUs', slug: 'cpu', icon: BsCpu, id: 2 },
    { name: 'GPUs', slug: 'gpu', icon: BsGpuCard, id: 3 },
];

const categoryIcons: Record<number, React.ReactNode> = {
    1: <BsLaptop className="w-4 h-4" />,
    2: <BsCpu className="w-4 h-4" />,
    3: <BsGpuCard className="w-4 h-4" />,
};

export function Header() {
    const { theme, toggleTheme } = useTheme();
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [productImages, setProductImages] = useState<Record<string, string>>({});
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Debounced search
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await productsApi.search({ q: searchQuery, limit: 5 });
                setSuggestions(response.products);
                setShowSuggestions(true);

                // Fetch images for suggestions
                const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
                const imagePromises = response.products.map(async (product) => {
                    try {
                        const images = await uploadsApi.getProductImages(product.id);
                        const primary = images.find(img => img.is_primary) || images[0];
                        return { productId: product.id, url: primary?.url ? `${baseUrl}${primary.url}` : null };
                    } catch {
                        return { productId: product.id, url: null };
                    }
                });
                const imageResults = await Promise.all(imagePromises);
                const imageMap: Record<string, string> = {};
                imageResults.forEach(({ productId, url }) => {
                    if (url) imageMap[productId] = url;
                });
                setProductImages(imageMap);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close suggestions on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch unread message count periodically
    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        const fetchUnreadCount = async () => {
            try {
                const count = await messagesApi.getUnreadCount();
                setUnreadCount(count);
            } catch (e) {
                // Silently fail if not authenticated
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [user]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setShowSuggestions(false);
            router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = async () => {
        await logout();
        setUserDropdownOpen(false);
        router.push('/');
    };

    const handleSuggestionClick = (productId: string) => {
        setShowSuggestions(false);
        setSearchQuery('');
        router.push(`/product/${productId}`);
    };

    return (
        <header className="sticky top-0 z-50 border-b" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border)',
        }}>
            {/* Main Header */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">T</span>
                        </div>
                        <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            Tech<span className="text-blue-500">Finder</span>
                        </span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div ref={searchRef} className="flex-1 max-w-2xl hidden md:block relative">
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search for laptops, GPUs, CPUs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                    className="w-full pl-12 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                                {loading && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                                    </div>
                                )}
                            </div>
                        </form>

                        {/* Search Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div
                                className="absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg overflow-hidden z-50"
                                style={{
                                    backgroundColor: 'var(--card-bg)',
                                    borderColor: 'var(--border)'
                                }}
                            >
                                {suggestions.map((product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => handleSuggestionClick(product.id)}
                                        className="w-full px-4 py-3 flex items-center gap-3 border-b last:border-0 transition-colors hover:bg-blue-500/10"
                                        style={{ borderColor: 'var(--border)' }}
                                    >
                                        {/* Product Image */}
                                        <div
                                            className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                                            style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                        >
                                            {productImages[product.id] ? (
                                                <img
                                                    src={productImages[product.id]}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>
                                                    {categoryIcons[product.category_id]}
                                                </span>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                                {product.title}
                                            </div>
                                            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                ${parseFloat(product.price).toLocaleString()} • {product.condition}
                                            </div>
                                        </div>
                                    </button>
                                ))}

                                {/* View All Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSuggestions(false);
                                        router.push(`/browse?q=${encodeURIComponent(searchQuery)}`);
                                    }}
                                    className="w-full px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-500/10 transition-colors"
                                >
                                    View all results for "{searchQuery}"
                                </button>
                            </div>
                        )}

                        {/* No Results */}
                        {showSuggestions && suggestions.length === 0 && searchQuery.length >= 2 && !loading && (
                            <div
                                className="absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg p-4 text-center z-50"
                                style={{
                                    backgroundColor: 'var(--card-bg)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                No results found for "{searchQuery}"
                            </div>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-lg border transition-colors hover:bg-opacity-80"
                            style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                borderColor: 'var(--border)',
                                color: 'var(--text-primary)',
                            }}
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                        </button>

                        <Link
                            href="/sell"
                            className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            <FiPlus className="w-4 h-4" />
                            Sell
                        </Link>

                        {/* Messages Icon with Badge - Only show for logged in users */}
                        {user && (
                            <Link
                                href="/dashboard/messages"
                                className="relative p-2.5 rounded-lg border transition-colors hover:border-blue-500"
                                style={{
                                    backgroundColor: 'var(--bg-tertiary)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                                title="Messages"
                            >
                                <FiMessageCircle className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-xs font-bold bg-red-500 text-white rounded-full">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Auth-aware User Section */}
                        {authLoading ? (
                            <div className="w-10 h-10 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                        ) : user ? (
                            <div ref={userMenuRef} className="relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-lg border transition-colors hover:border-blue-500"
                                    style={{
                                        backgroundColor: 'var(--bg-tertiary)',
                                        borderColor: userDropdownOpen ? 'rgb(59 130 246)' : 'var(--border)',
                                    }}
                                >
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-md object-cover" />
                                    ) : (
                                        <div
                                            className="w-7 h-7 rounded-md flex items-center justify-center font-medium text-sm"
                                            style={{ backgroundColor: 'rgb(59 130 246)', color: 'white' }}
                                        >
                                            {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </button>

                                {/* User Dropdown */}
                                {userDropdownOpen && (
                                    <div
                                        className="absolute right-0 top-full mt-2 w-56 rounded-lg border shadow-lg overflow-hidden z-50"
                                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                                    >
                                        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                                            <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.full_name}</p>
                                            <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                href="/dashboard"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-blue-500/10"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                <FiPackage className="w-4 h-4" />
                                                Dashboard
                                            </Link>
                                            <Link
                                                href="/dashboard/settings"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-blue-500/10"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                <FiSettings className="w-4 h-4" />
                                                Settings
                                            </Link>
                                        </div>
                                        <div className="border-t py-1" style={{ borderColor: 'var(--border)' }}>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-red-500/10"
                                                style={{ color: '#ef4444' }}
                                            >
                                                <FiLogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 rounded-lg border font-medium transition-colors hover:border-blue-500"
                                    style={{
                                        backgroundColor: 'var(--bg-tertiary)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    Register
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2.5 rounded-lg border"
                            style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                borderColor: 'var(--border)',
                                color: 'var(--text-primary)',
                            }}
                        >
                            {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Category Nav - Desktop */}
                <nav className="hidden md:flex items-center gap-1 pb-3">
                    <Link
                        href="/browse"
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-blue-600 hover:text-white"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        All Categories
                    </Link>
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <Link
                                key={cat.slug}
                                href={`/browse?category_id=${cat.id}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-blue-600 hover:text-white"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                <Icon className="w-4 h-4" />
                                {cat.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="p-4">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 rounded-lg border outline-none"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>
                    </form>

                    {/* Mobile Categories */}
                    <nav className="px-4 pb-4 space-y-1">
                        <Link
                            href="/browse"
                            className="block px-3 py-2 rounded-lg font-medium"
                            style={{ color: 'var(--text-secondary)' }}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            All Categories
                        </Link>
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <Link
                                    key={cat.slug}
                                    href={`/browse?category_id=${cat.id}`}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium"
                                    style={{ color: 'var(--text-secondary)' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Icon className="w-4 h-4" />
                                    {cat.name}
                                </Link>
                            );
                        })}
                        <Link
                            href="/sell"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-blue-500"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <FiPlus className="w-4 h-4" />
                            Sell an Item
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
