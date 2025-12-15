'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product, Category } from '@/types';
import { productsApi, categoriesApi, uploadsApi, ProductSearchFilters, ProductsResponse } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { FiSearch, FiPlus, FiChevronDown, FiFilter, FiX, FiGrid, FiList } from 'react-icons/fi';

const SORT_OPTIONS = [
    { value: 'date_desc', label: 'Newest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
];

// Helper to parse URL params into filter state
function parseUrlParams(searchParams: URLSearchParams) {
    const specs: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
        if (key.startsWith('specs.')) {
            specs[key.replace('specs.', '')] = value.split(',');
        }
    });

    return {
        q: searchParams.get('q') || '',
        category_id: searchParams.get('category_id') ? parseInt(searchParams.get('category_id')!) : null,
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        conditions: searchParams.get('condition')?.split(',').filter(Boolean) || [],
        specs,
        sort: searchParams.get('sort') || 'date_desc',
        page: parseInt(searchParams.get('page') || '1'),
    };
}

export default function BrowsePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Parse URL on every render to get current filter values
    const urlFilters = parseUrlParams(searchParams);

    // Data state
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [productImages, setProductImages] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Load categories on mount
    useEffect(() => {
        categoriesApi.getAll().then(setCategories);
    }, []);

    // Build filters object from URL params
    // Use searchParams.toString() as stable dependency
    const searchParamsString = searchParams.toString();

    const buildFilters = useCallback((): ProductSearchFilters => {
        // Parse fresh on each call to avoid stale closures
        const filters = parseUrlParams(searchParams);
        return {
            q: filters.q || undefined,
            category_id: filters.category_id || undefined,
            minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
            maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
            condition: filters.conditions.length > 0 ? filters.conditions : undefined,
            specs: Object.keys(filters.specs).length > 0 ? filters.specs : undefined,
            sort: filters.sort as ProductSearchFilters['sort'],
            page: filters.page,
            limit: 20,
        };
    }, [searchParamsString, searchParams]);

    // Fetch products when URL params change
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const filters = buildFilters();
                const response = await productsApi.search(filters);
                setProducts(response.products);
                setTotal(response.total);
                setTotalPages(response.totalPages);

                // Fetch images
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
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchParamsString]);

    // Helper to update URL with new filter value
    const updateUrl = useCallback((updates: Partial<{
        q: string;
        category_id: number | null;
        minPrice: string;
        maxPrice: string;
        conditions: string[];
        specs: Record<string, string[]>;
        sort: string;
        page: number;
    }>) => {
        const params = new URLSearchParams();

        const newQ = updates.q !== undefined ? updates.q : urlFilters.q;
        const newCategory = updates.category_id !== undefined ? updates.category_id : urlFilters.category_id;
        const newMinPrice = updates.minPrice !== undefined ? updates.minPrice : urlFilters.minPrice;
        const newMaxPrice = updates.maxPrice !== undefined ? updates.maxPrice : urlFilters.maxPrice;
        const newConditions = updates.conditions !== undefined ? updates.conditions : urlFilters.conditions;
        const newSpecs = updates.specs !== undefined ? updates.specs : urlFilters.specs;
        const newSort = updates.sort !== undefined ? updates.sort : urlFilters.sort;
        const newPage = updates.page !== undefined ? updates.page : 1; // Reset page on filter change

        if (newQ) params.set('q', newQ);
        if (newCategory) params.set('category_id', newCategory.toString());
        if (newMinPrice) params.set('minPrice', newMinPrice);
        if (newMaxPrice) params.set('maxPrice', newMaxPrice);
        if (newConditions.length > 0) params.set('condition', newConditions.join(','));
        Object.entries(newSpecs).forEach(([key, values]) => {
            if (values.length > 0) params.set(`specs.${key}`, values.join(','));
        });
        if (newSort !== 'date_desc') params.set('sort', newSort);
        if (newPage > 1) params.set('page', newPage.toString());

        const newUrl = params.toString() ? `/browse?${params.toString()}` : '/browse';
        router.push(newUrl, { scroll: false });
    }, [router, urlFilters]);

    const handleClearAll = () => {
        router.push('/browse', { scroll: false });
    };

    const getCategoryById = (id: number) => categories.find(c => c.id === id);

    const activeFilterCount =
        (urlFilters.category_id ? 1 : 0) +
        (urlFilters.minPrice || urlFilters.maxPrice ? 1 : 0) +
        urlFilters.conditions.length +
        Object.keys(urlFilters.specs).length;

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Filter Sidebar */}
                    <FilterSidebar
                        categories={categories}
                        selectedCategory={urlFilters.category_id}
                        onCategoryChange={(id) => updateUrl({ category_id: id })}
                        minPrice={urlFilters.minPrice}
                        maxPrice={urlFilters.maxPrice}
                        onPriceChange={(min, max) => updateUrl({ minPrice: min, maxPrice: max })}
                        selectedConditions={urlFilters.conditions}
                        onConditionsChange={(conds) => updateUrl({ conditions: conds })}
                        selectedSpecs={urlFilters.specs}
                        onSpecsChange={(specs) => updateUrl({ specs: specs })}
                        onClearAll={handleClearAll}
                    />

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {urlFilters.category_id
                                        ? getCategoryById(urlFilters.category_id)?.name
                                        : urlFilters.q
                                            ? `Results for "${urlFilters.q}"`
                                            : 'All Listings'}
                                </h1>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    {total} {total === 1 ? 'result' : 'results'}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Mobile Filter Button */}
                                <button
                                    onClick={() => setMobileFiltersOpen(true)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border"
                                    style={{
                                        backgroundColor: 'var(--card-bg)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    <FiFilter className="w-4 h-4" />
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>

                                {/* View Mode Toggle */}
                                <div className="hidden sm:flex items-center p-1 rounded-lg border gap-1" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded transition-colors ${viewMode === 'grid'
                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                        title="Grid View"
                                    >
                                        <FiGrid className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded transition-colors ${viewMode === 'list'
                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                        title="List View"
                                    >
                                        <FiList className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Sort Dropdown */}
                                <div className="relative">
                                    <select
                                        value={urlFilters.sort}
                                        onChange={(e) => updateUrl({ sort: e.target.value })}
                                        className="appearance-none rounded-lg px-4 py-2 pr-10 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        style={{
                                            backgroundColor: 'var(--card-bg)',
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-primary)',
                                        }}
                                    >
                                        {SORT_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <FiChevronDown
                                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ color: 'var(--text-muted)' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className={viewMode === 'grid'
                                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                                : "grid grid-cols-1 gap-4"
                            }>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div
                                        key={i}
                                        className="rounded-xl border overflow-hidden"
                                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                                    >
                                        <div
                                            className="aspect-[4/3] animate-pulse"
                                            style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                        />
                                        <div className="p-4 space-y-3">
                                            <div
                                                className="h-4 rounded animate-pulse w-1/3"
                                                style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                            />
                                            <div
                                                className="h-5 rounded animate-pulse"
                                                style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                            />
                                            <div
                                                className="h-6 rounded animate-pulse w-1/4"
                                                style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div
                                className="text-center py-20 rounded-xl border"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                            >
                                <div className="text-6xl mb-4">📦</div>
                                <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    No listings found
                                </h2>
                                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                                    Try adjusting your filters or search terms
                                </p>
                                <button
                                    onClick={handleClearAll}
                                    className="text-blue-500 hover:text-blue-400 font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <>

                                <div className={viewMode === 'grid'
                                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                                    : "grid grid-cols-1 gap-4"
                                }>
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            category={getCategoryById(product.category_id)}
                                            imageUrl={productImages[product.id]}
                                            variant={viewMode}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-8">
                                        <button
                                            onClick={() => updateUrl({ page: Math.max(1, urlFilters.page - 1) })}
                                            disabled={urlFilters.page === 1}
                                            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: 'var(--card-bg)',
                                                borderColor: 'var(--border)',
                                                color: 'var(--text-primary)',
                                            }}
                                        >
                                            Previous
                                        </button>
                                        <span
                                            className="px-4 py-2"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            Page {urlFilters.page} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => updateUrl({ page: Math.min(totalPages, urlFilters.page + 1) })}
                                            disabled={urlFilters.page === totalPages}
                                            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: 'var(--card-bg)',
                                                borderColor: 'var(--border)',
                                                color: 'var(--text-primary)',
                                            }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {
                mobileFiltersOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setMobileFiltersOpen(false)}
                        />
                        <div
                            className="absolute right-0 top-0 bottom-0 w-80 max-w-full overflow-y-auto"
                            style={{ backgroundColor: 'var(--bg-primary)' }}
                        >
                            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                                <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Filters</h2>
                                <button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="p-2 rounded-lg"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>
                            {/* Inline mobile filters would go here - simplified for now */}
                            <div className="p-4">
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Use filters to narrow down your search.
                                </p>
                                <button
                                    onClick={() => { handleClearAll(); setMobileFiltersOpen(false); }}
                                    className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg font-medium"
                                >
                                    Clear All & Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
