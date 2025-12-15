'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { productsApi, categoriesApi, uploadsApi, auctionsApi, shippingApi, ProductShipping } from '@/lib/api';
import { ShippingSelector, SelectedShipping } from '@/components/ShippingSelector';
import { Auction, Product, CategoryAttribute } from '@/types';
import { DynamicFormField } from '@/components/DynamicFormField';
import { ImageUpload } from '@/components/ImageUpload';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FiArrowLeft, FiSave, FiCheck, FiDollarSign, FiClock } from 'react-icons/fi';

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

interface UploadedImage {
    id?: number;
    url: string;
    filename?: string;
    is_primary?: boolean;
    file?: File;
    preview?: string;
}

interface FormData {
    title: string;
    price: string;
    original_price?: string;
    description?: string;
    condition: string;
    specs: Record<string, unknown>;
}

export default function EditListingPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Auction state
    const [listingType, setListingType] = useState<'fixed' | 'auction'>('fixed');
    const [auction, setAuction] = useState<Auction | null>(null);
    const [auctionDuration, setAuctionDuration] = useState(72);
    const [reservePrice, setReservePrice] = useState('');
    const [buyNowPrice, setBuyNowPrice] = useState('');
    const [hasActiveBids, setHasActiveBids] = useState(false);

    // Shipping state
    const [selectedShipping, setSelectedShipping] = useState<SelectedShipping[]>([]);
    const [existingShipping, setExistingShipping] = useState<ProductShipping[]>([]);

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
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        setLoading(true);
        try {
            // Fetch product
            const productData = await productsApi.getById(productId);
            setProduct(productData); // Keep the product data as is for now

            // Fetch auction data if applicable
            if (productData.status === 'Auction') {
                try {
                    const auctionData = await auctionsApi.getByProductId(productId);
                    if (auctionData) {
                        setAuction(auctionData);
                        setListingType('auction');

                        // Populate auction states
                        const start = new Date(auctionData.start_time).getTime();
                        const end = new Date(auctionData.end_time).getTime();
                        const durationHours = Math.round((end - start) / (1000 * 60 * 60));
                        setAuctionDuration(durationHours);

                        setReservePrice(auctionData.reserve_price || '');
                        setBuyNowPrice(auctionData.buy_now_price || '');

                        setHasActiveBids(auctionData.bid_count > 0);
                    }
                } catch (err) {
                    console.error('Failed to load auction data', err);
                }
            } else {
                setListingType('fixed');
            }

            // Fetch category attributes
            const categories = await categoriesApi.getAll();
            const category = categories.find(c => c.id === productData.category_id);
            if (category) {
                const attrs = await categoriesApi.getAttributes(category.slug);
                setAttributes(attrs);
            }

            // Fetch images
            const productImages = await uploadsApi.getProductImages(productId);
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
            setImages(productImages.map(img => ({
                id: img.id,
                url: `${baseUrl}${img.url}`,
                filename: img.filename,
                is_primary: img.is_primary,
            })));

            reset({
                title: productData.title,
                price: productData.price.toString(),
                original_price: productData.original_price?.toString() || '',
                description: productData.description || '',
                condition: productData.condition,
                specs: productData.specs as Record<string, unknown>,
            });

            // Load existing shipping options
            try {
                const productShipping = await shippingApi.getProductShipping(productId);
                setExistingShipping(productShipping);
                // Convert to SelectedShipping format
                setSelectedShipping(productShipping.map(ps => ({
                    shipping_option_id: ps.shipping_option_id || undefined,
                    custom_price: ps.custom_price || undefined,
                    name: ps.name,
                    price: ps.price,
                    is_collection: ps.is_collection,
                })));
            } catch (err) {
                console.error('Failed to load shipping options:', err);
            }
        } catch (error) {
            console.error('Failed to load product:', error);
            alert('Failed to load product');
            router.push('/dashboard/listings');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        setSaving(true);
        try {
            // Handle Auction -> Fixed switch
            if (listingType === 'fixed' && product?.status === 'Auction' && auction) {
                if (hasActiveBids) {
                    alert('Cannot switch to Fixed Price because this auction has active bids.');
                    setSaving(false);
                    return;
                }
                await auctionsApi.cancel(auction.id);
            }

            // Update product (common for all types)
            await productsApi.update(productId, {
                title: data.title,
                price: parseFloat(data.price),
                original_price: data.original_price ? parseFloat(data.original_price) : undefined,
                description: data.description,
                condition: data.condition,
                specs: data.specs,
            });

            // Handle Fixed -> Auction switch
            // Check if we switched to auction OR if we are in auction mode and need to ensure it's set up (though we don't update params yet)
            // But if we are switching FROM fixed TO auction, we create it.
            if (listingType === 'auction' && product?.status !== 'Auction') {
                await auctionsApi.create(
                    productId,
                    parseFloat(data.price),
                    auctionDuration,
                    reservePrice ? parseFloat(reservePrice) : undefined,
                    buyNowPrice ? parseFloat(buyNowPrice) : undefined
                );
            }

            // Upload any new images
            const newImages = images.filter(img => img.file);
            if (newImages.length > 0) {
                const files = newImages.map(img => img.file!);
                await uploadsApi.uploadMultiple(productId, files);
            }

            // Update shipping options
            // First, remove old shipping that's no longer selected
            for (const existing of existingShipping) {
                const stillSelected = selectedShipping.some(
                    s => s.shipping_option_id === existing.shipping_option_id
                );
                if (!stillSelected) {
                    await shippingApi.removeShipping(existing.id);
                }
            }

            // Add new shipping options
            for (const shipping of selectedShipping) {
                const isExisting = existingShipping.some(
                    e => e.shipping_option_id === shipping.shipping_option_id
                );
                if (!isExisting) {
                    await shippingApi.assignShipping(productId, {
                        shipping_option_id: shipping.shipping_option_id,
                        custom_price: shipping.custom_price,
                    });
                }
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard/listings');
            }, 1500);
        } catch (error: any) {
            console.error('Failed to update:', error);
            const msg = error.response?.data?.message || 'Failed to save changes';
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteImage = async (index: number) => {
        const image = images[index];
        if (image.id) {
            try {
                await uploadsApi.deleteImage(image.id);
            } catch (error) {
                console.error('Failed to delete image:', error);
            }
        }
        if (image.preview) {
            URL.revokeObjectURL(image.preview);
        }
        setImages(images.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="animate-pulse space-y-6">
                    <div className="h-8 rounded w-1/3" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                    <div className="h-64 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                    <div className="h-48 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                </div>
            </DashboardLayout>
        );
    }

    if (success) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiCheck className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Changes Saved!</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Redirecting to listings...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Group attributes by section
    const sections: Record<string, CategoryAttribute[]> = {};
    attributes.forEach(attr => {
        const sectionNum = Math.floor(attr.display_order / 100) * 100;
        const sectionNames: Record<number, string> = {
            0: 'Model Selection',
            100: 'Core Specs',
            200: 'Memory',
            300: 'Storage',
            400: 'Display',
            500: 'Physical',
            600: 'Features',
            700: 'Condition',
        };
        const section = sectionNames[sectionNum] || 'Other';
        if (!sections[section]) sections[section] = [];
        sections[section].push(attr);
    });

    return (
        <DashboardLayout>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <FiArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Edit Listing</h1>
                    </div>
                    <Button type="submit" disabled={saving}>
                        <FiSave className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                {/* Images */}
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

                {/* Basic Info */}
                <div
                    className="rounded-xl border p-6"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                    <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Basic Information</h2>
                    <div className="space-y-4">
                        {/* Listing Type Selector */}
                        <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
                            <button
                                type="button"
                                onClick={() => !hasActiveBids && setListingType('fixed')}
                                disabled={hasActiveBids}
                                className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all ${listingType === 'fixed'
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700 disabled:opacity-50'
                                    }`}
                            >
                                <FiDollarSign className="w-4 h-4" />
                                <span className="font-medium">Fixed Price</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setListingType('auction')}
                                className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all ${listingType === 'auction'
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-orange-500'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <FiClock className="w-4 h-4" />
                                <span className="font-medium">Auction</span>
                            </button>
                        </div>

                        <Input
                            label="Title"
                            {...register('title', { required: 'Title is required' })}
                            error={errors.title?.message}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="number"
                                label={listingType === 'auction' ? "Starting Price" : "Price"}
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
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Description
                            </label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                                placeholder="Describe your item..."
                            />
                        </div>

                        {/* Auction Specific Fields */}
                        {listingType === 'auction' && (
                            <div className="pt-4 border-t space-y-4" style={{ borderColor: 'var(--border)' }}>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        Auction Duration
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {AUCTION_DURATIONS.map((dur) => (
                                            <button
                                                key={dur.value}
                                                type="button"
                                                onClick={() => setAuctionDuration(dur.value)}
                                                disabled={!!auction && hasActiveBids} // Locked if active bids
                                                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${auctionDuration === dur.value
                                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                                                    : 'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200 disabled:opacity-50'
                                                    }`}
                                            >
                                                {dur.label}
                                            </button>
                                        ))}
                                    </div>
                                    {!!auction && hasActiveBids && (
                                        <p className="text-xs text-yellow-500 mt-1">Cannot change duration while active bids exist</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input // Using controlled input for these extended fields for simplicity or integrate into react-hook-form
                                        type="number"
                                        label="Reserve Price (Optional)"
                                        value={reservePrice}
                                        onChange={(e) => setReservePrice(e.target.value)}
                                        placeholder="Min. bid to win"
                                        disabled={!!auction && hasActiveBids}
                                    />
                                    <Input
                                        type="number"
                                        label="Buy Now Price (Optional)"
                                        value={buyNowPrice}
                                        onChange={(e) => setBuyNowPrice(e.target.value)}
                                        placeholder="Instant purchase price"
                                        disabled={!!auction && hasActiveBids}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Specs by Section */}
                {Object.entries(sections).map(([sectionName, sectionAttrs]) => (
                    <div
                        key={sectionName}
                        className="rounded-xl border p-6"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{sectionName}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sectionAttrs.map((attr) => (
                                <DynamicFormField
                                    key={attr.id}
                                    attribute={attr}
                                    register={register as any}
                                    errors={errors}
                                    setValue={setValue as any}
                                    watch={watch as any}
                                    productCategory={product?.category_id === 1 ? 'Laptop' : 'Desktop'}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Shipping Options */}
                <div
                    className="rounded-xl border p-6"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                    <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                        Shipping Options
                    </h2>
                    <ShippingSelector
                        productId={productId}
                        onShippingSelected={setSelectedShipping}
                        initialSelection={selectedShipping}
                    />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        <FiSave className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </DashboardLayout>
    );
}
