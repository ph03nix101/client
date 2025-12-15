'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Category, CategoryAttribute, CreateProductPayload } from '@/types';
import { categoriesApi, productsApi, uploadsApi, auctionsApi, shippingApi } from '@/lib/api';
import { ShippingSelector, SelectedShipping } from '@/components/ShippingSelector';
import { useAuth } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { CategorySelector } from '@/components/CategorySelector';
import { DynamicFormField } from '@/components/DynamicFormField';
import { ImageUpload } from '@/components/ImageUpload';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FiArrowLeft, FiCheck, FiClock, FiDollarSign } from 'react-icons/fi';

const CONDITIONS = [
    'New',
    'Open Box',
    'Used - Like New',
    'Used - Good',
    'Used - Fair',
    'For Parts',
];

const AUCTION_DURATIONS = [
    { value: 24, label: '1 Day' },
    { value: 72, label: '3 Days' },
    { value: 168, label: '7 Days' },
    { value: 336, label: '14 Days' },
];

interface FormData {
    title: string;
    price: string;
    original_price?: string;
    description?: string;
    condition: string;
    condition_description?: string;
    specs: Record<string, unknown>;
    cpu_ref_id?: number | null;
    gpu_ref_id?: number | null;
}

interface UploadedImage {
    id?: number;
    url: string;
    filename?: string;
    is_primary?: boolean;
    file?: File;
    preview?: string;
}

export default function CreateListingPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [step, setStep] = useState<'category' | 'details'>('category');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
    const [loadingAttrs, setLoadingAttrs] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [images, setImages] = useState<UploadedImage[]>([]);

    // Auction-specific state
    const [listingType, setListingType] = useState<'fixed' | 'auction'>('fixed');
    const [auctionDuration, setAuctionDuration] = useState(72); // Default 3 days
    const [reservePrice, setReservePrice] = useState('');
    const [buyNowPrice, setBuyNowPrice] = useState('');
    const [selectedShipping, setSelectedShipping] = useState<SelectedShipping[]>([]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/sell');
        }
    }, [user, authLoading, router]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        defaultValues: {
            specs: {},
        },
    });

    useEffect(() => {
        if (selectedCategory) {
            setLoadingAttrs(true);
            categoriesApi.getAttributes(selectedCategory.slug)
                .then(setAttributes)
                .finally(() => setLoadingAttrs(false));
        }
    }, [selectedCategory]);

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        reset();
        setImages([]);
        setStep('details');
    };

    const onSubmit = async (data: FormData) => {
        if (!selectedCategory || !user) return;

        setSubmitting(true);
        try {
            const payload: CreateProductPayload = {
                seller_id: user.id,
                category_id: selectedCategory.id,
                title: data.title,
                price: parseFloat(data.price),
                original_price: data.original_price ? parseFloat(data.original_price) : undefined,
                description: data.description,
                condition: data.condition,
                condition_description: data.condition !== 'New' ? data.condition_description : undefined,
                specs: data.specs || {},
                cpu_ref_id: data.cpu_ref_id || undefined,
                gpu_ref_id: data.gpu_ref_id || undefined,
            };

            const product = await productsApi.create(payload);

            // Upload images after product is created
            const filesToUpload = images.filter(img => img.file).map(img => img.file!);
            if (filesToUpload.length > 0) {
                await uploadsApi.uploadMultiple(product.id, filesToUpload);
            }

            // If auction listing, create auction
            if (listingType === 'auction') {
                await auctionsApi.create(
                    product.id,
                    parseFloat(data.price), // Starting price
                    auctionDuration,
                    reservePrice ? parseFloat(reservePrice) : undefined,
                    buyNowPrice ? parseFloat(buyNowPrice) : undefined
                );
            }

            // Assign shipping options
            for (const shipping of selectedShipping) {
                await shippingApi.assignShipping(product.id, {
                    shipping_option_id: shipping.shipping_option_id,
                    custom_price: shipping.custom_price,
                });
            }

            setSuccess(true);

            setTimeout(() => {
                router.push(`/product/${product.id}`);
            }, 2000);
        } catch (error) {
            console.error('Failed to create listing:', error);
            alert('Failed to create listing. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const productCategory = selectedCategory?.slug === 'laptop' ? 'Laptop' : 'Desktop';

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheck className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Listing Created!</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Redirecting to your listing...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Header />

            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    {step === 'details' && (
                        <button
                            onClick={() => setStep('category')}
                            className="flex items-center gap-2 mb-4 transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <FiArrowLeft /> Back to categories
                        </button>
                    )}
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {step === 'category' ? 'What are you selling?' : `List a ${selectedCategory?.name}`}
                    </h1>
                    <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                        {step === 'category'
                            ? 'Select a category to get started'
                            : 'Fill in the details about your item'}
                    </p>
                </div>

                {/* Step 1: Category Selection */}
                {step === 'category' && (
                    <CategorySelector
                        onSelect={handleCategorySelect}
                        selected={selectedCategory}
                    />
                )}

                {/* Step 2: Dynamic Form */}
                {step === 'details' && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Image Upload Card */}
                        <div
                            className="rounded-xl border p-6"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            <ImageUpload
                                images={images}
                                onChange={setImages}
                                maxImages={6}
                            />
                        </div>

                        {/* Basic Info Card */}
                        <div
                            className="rounded-xl border p-6"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Basic Information</h2>
                            <div className="space-y-4">
                                <Input
                                    label="Title"
                                    placeholder="e.g., Dell XPS 15 - i7, RTX 3060, 32GB RAM"
                                    {...register('title', { required: 'Title is required' })}
                                    error={errors.title?.message}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label="Price"
                                        placeholder="0.00"
                                        step="0.01"
                                        {...register('price', { required: 'Price is required' })}
                                        error={errors.price?.message}
                                        required
                                    />
                                    <Input
                                        type="number"
                                        label="Original Price (Optional)"
                                        placeholder="0.00"
                                        step="0.01"
                                        {...register('original_price')}
                                        error={errors.original_price?.message}
                                    />
                                    <Select
                                        label="Condition"
                                        options={CONDITIONS}
                                        {...register('condition', { required: 'Condition is required' })}
                                        error={errors.condition?.message}
                                        required
                                    />
                                </div>
                                {watch('condition') && watch('condition') !== 'New' && (
                                    <div className="mt-4 animate-fade-in">
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                            Condition Description (Optional)
                                        </label>
                                        <textarea
                                            {...register('condition_description')}
                                            rows={2}
                                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            style={{
                                                backgroundColor: 'var(--input-bg)',
                                                borderColor: 'var(--border)',
                                                color: 'var(--text-primary)',
                                            }}
                                            placeholder="e.g., Minor scratches on the screen, includes generic charger..."
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        Description
                                    </label>
                                    <textarea
                                        {...register('description')}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-primary)',
                                        }}
                                        placeholder="Describe your item..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Listing Type Selector */}
                        <div
                            className="rounded-xl border p-6"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Listing Type</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setListingType('fixed')}
                                    className={`p-4 rounded-xl border-2 transition-all ${listingType === 'fixed'
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <FiDollarSign className={`w-6 h-6 ${listingType === 'fixed' ? 'text-blue-500' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${listingType === 'fixed' ? 'text-blue-500' : ''}`} style={{ color: listingType === 'fixed' ? undefined : 'var(--text-primary)' }}>
                                            Fixed Price
                                        </span>
                                    </div>
                                    <p className="text-sm text-left" style={{ color: 'var(--text-muted)' }}>
                                        Set a fixed price for immediate purchase
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setListingType('auction')}
                                    className={`p-4 rounded-xl border-2 transition-all ${listingType === 'auction'
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <FiClock className={`w-6 h-6 ${listingType === 'auction' ? 'text-orange-500' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${listingType === 'auction' ? 'text-orange-500' : ''}`} style={{ color: listingType === 'auction' ? undefined : 'var(--text-primary)' }}>
                                            Auction
                                        </span>
                                    </div>
                                    <p className="text-sm text-left" style={{ color: 'var(--text-muted)' }}>
                                        Let buyers bid for your item
                                    </p>
                                </button>
                            </div>

                            {/* Auction-specific fields */}
                            {listingType === 'auction' && (
                                <div className="mt-6 pt-6 border-t space-y-4" style={{ borderColor: 'var(--border)' }}>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                        The price above will be used as the starting bid price.
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                                Auction Duration
                                            </label>
                                            <select
                                                value={auctionDuration}
                                                onChange={(e) => setAuctionDuration(parseInt(e.target.value))}
                                                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                                style={{
                                                    backgroundColor: 'var(--input-bg)',
                                                    borderColor: 'var(--border)',
                                                    color: 'var(--text-primary)',
                                                }}
                                            >
                                                {AUCTION_DURATIONS.map((d) => (
                                                    <option key={d.value} value={d.value}>{d.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                                Reserve Price (Optional)
                                            </label>
                                            <input
                                                type="number"
                                                value={reservePrice}
                                                onChange={(e) => setReservePrice(e.target.value)}
                                                placeholder="Minimum selling price"
                                                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                                style={{
                                                    backgroundColor: 'var(--input-bg)',
                                                    borderColor: 'var(--border)',
                                                    color: 'var(--text-primary)',
                                                }}
                                            />
                                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                                Item won't sell if bids don't reach this price
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                            Buy Now Price (Optional)
                                        </label>
                                        <input
                                            type="number"
                                            value={buyNowPrice}
                                            onChange={(e) => setBuyNowPrice(e.target.value)}
                                            placeholder="Instant purchase price"
                                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                            style={{
                                                backgroundColor: 'var(--input-bg)',
                                                borderColor: 'var(--border)',
                                                color: 'var(--text-primary)',
                                            }}
                                        />
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                            Buyers can skip bidding and purchase immediately at this price
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tech Specs - Grouped by Sections */}
                        {loadingAttrs ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="h-24 rounded-lg animate-pulse"
                                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <>
                                {/* Group attributes by section (based on display_order ranges) */}
                                {(() => {
                                    const sections = [
                                        { name: 'General', min: 100, max: 199 },
                                        { name: 'Processor (CPU)', min: 200, max: 299 },
                                        { name: 'Display', min: 300, max: 399 },
                                        { name: 'Graphics (GPU)', min: 400, max: 499 },
                                        { name: 'Memory (RAM)', min: 500, max: 599 },
                                        { name: 'Storage', min: 600, max: 699 },
                                        { name: 'Ports & Connectivity', min: 700, max: 799 },
                                        { name: 'Communications', min: 800, max: 899 },
                                        { name: 'Audio', min: 900, max: 999 },
                                        { name: 'Input Devices', min: 1000, max: 1099 },
                                        { name: 'Power', min: 1100, max: 1199 },
                                        { name: 'Operating System', min: 1200, max: 1299 },
                                        { name: 'Physical Specifications', min: 1300, max: 1399 },
                                    ];

                                    return sections.map((section) => {
                                        const sectionAttrs = attributes.filter(
                                            (attr) => attr.display_order >= section.min && attr.display_order <= section.max
                                        );
                                        if (sectionAttrs.length === 0) return null;

                                        return (
                                            <div
                                                key={section.name}
                                                className="rounded-xl border p-6"
                                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                                            >
                                                <h2
                                                    className="text-lg font-semibold mb-4 pb-2 border-b"
                                                    style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                                                >
                                                    {section.name}
                                                </h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {sectionAttrs.map((attr) => (
                                                        <DynamicFormField
                                                            key={attr.id}
                                                            attribute={attr}
                                                            register={register as never}
                                                            errors={errors}
                                                            setValue={setValue as never}
                                                            productCategory={productCategory}
                                                            watch={watch as never}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </>
                        )}

                        {/* Shipping Options */}
                        <div
                            className="rounded-xl border p-6"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                        >
                            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                                Shipping Options
                            </h3>
                            <ShippingSelector
                                onShippingSelected={setSelectedShipping}
                                initialSelection={selectedShipping}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep('category')}
                            >
                                Back
                            </Button>
                            <Button type="submit" isLoading={submitting}>
                                Create Listing
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
