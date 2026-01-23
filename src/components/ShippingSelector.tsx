'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiCheck, FiTruck, FiMapPin } from 'react-icons/fi';
import { shippingApi, ShippingOption } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface ShippingSelectorProps {
    productId?: string;
    onShippingSelected?: (options: SelectedShipping[]) => void;
    initialSelection?: SelectedShipping[];
}

export interface SelectedShipping {
    shipping_option_id?: string;
    custom_price?: number;
    custom_estimated_days_min?: number;
    custom_estimated_days_max?: number;
    custom_coverage_area?: string;
    // For display
    name?: string;
    price?: number;
    is_collection?: boolean;
}

export function ShippingSelector({ productId, onShippingSelected, initialSelection = [] }: ShippingSelectorProps) {
    const [templates, setTemplates] = useState<ShippingOption[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<SelectedShipping[]>(initialSelection);
    const [loading, setLoading] = useState(true);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customOption, setCustomOption] = useState<SelectedShipping>({});

    useEffect(() => {
        shippingApi.getMyTemplates()
            .then(setTemplates)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const toggleTemplate = (template: ShippingOption) => {
        const isSelected = selectedOptions.some(opt => opt.shipping_option_id === template.id);

        if (isSelected) {
            const newSelection = selectedOptions.filter(opt => opt.shipping_option_id !== template.id);
            setSelectedOptions(newSelection);
            onShippingSelected?.(newSelection);
        } else {
            const newOption: SelectedShipping = {
                shipping_option_id: template.id,
                name: template.name,
                price: template.price,
                is_collection: template.is_collection,
            };
            const newSelection = [...selectedOptions, newOption];
            setSelectedOptions(newSelection);
            onShippingSelected?.(newSelection);
        }
    };

    const addCustomOption = () => {
        if (!customOption.name || customOption.price === undefined) return;

        const newOption: SelectedShipping = {
            ...customOption,
        };
        const newSelection = [...selectedOptions, newOption];
        setSelectedOptions(newSelection);
        onShippingSelected?.(newSelection);
        setCustomOption({});
        setShowCustomForm(false);
    };

    const removeOption = (index: number) => {
        const newSelection = selectedOptions.filter((_, i) => i !== index);
        setSelectedOptions(newSelection);
        onShippingSelected?.(newSelection);
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-2">
                <div className="h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Template Selection */}
            {templates.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Your Shipping Templates
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {templates.map((template) => {
                            const isSelected = selectedOptions.some(opt => opt.shipping_option_id === template.id);
                            return (
                                <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => toggleTemplate(template)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${isSelected
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected
                                        ? 'bg-blue-500 text-white'
                                        : 'border-2 border-gray-300 dark:border-gray-600'
                                        }`}>
                                        {isSelected && <FiCheck className="w-3 h-3" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {template.is_collection ? (
                                                <FiMapPin className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <FiTruck className="w-4 h-4 text-blue-500" />
                                            )}
                                            <span className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                                {template.name}
                                            </span>
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {template.price === 0 ? 'Free' : `R${template.price.toFixed(2)}`}
                                            {template.coverage_area && ` • ${template.coverage_area}`}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Selected Options Summary */}
            {selectedOptions.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Selected Shipping Options ({selectedOptions.length})
                    </h4>
                    <div className="space-y-1">
                        {selectedOptions.map((opt, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 rounded-lg text-sm"
                                style={{ backgroundColor: 'var(--bg-secondary)' }}
                            >
                                <span style={{ color: 'var(--text-primary)' }}>{opt.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-500">
                                        {opt.price === 0 ? 'Free' : `R${opt.price?.toFixed(2)}`}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        className="text-red-500 hover:text-red-600 text-xs"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Option Form */}
            {showCustomForm ? (
                <div
                    className="p-4 rounded-lg border space-y-3"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                >
                    <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        Add Custom Shipping Option
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Name *</label>
                            <input
                                type="text"
                                value={customOption.name || ''}
                                onChange={(e) => setCustomOption(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Express Delivery"
                                className="w-full px-3 py-2 rounded-lg border text-sm"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Price (R) *</label>
                            <input
                                type="number"
                                value={customOption.custom_price ?? ''}
                                onChange={(e) => setCustomOption(prev => ({
                                    ...prev,
                                    custom_price: parseFloat(e.target.value) || 0,
                                    price: parseFloat(e.target.value) || 0,
                                }))}
                                placeholder="0 for free"
                                className="w-full px-3 py-2 rounded-lg border text-sm"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowCustomForm(false);
                                setCustomOption({});
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={addCustomOption}
                            disabled={!customOption.name || customOption.price === undefined}
                        >
                            Add
                        </Button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setShowCustomForm(true)}
                    className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600"
                >
                    <FiPlus className="w-4 h-4" />
                    Add custom shipping option
                </button>
            )}

            {/* No Templates Message */}
            {templates.length === 0 && selectedOptions.length === 0 && (
                <div
                    className="p-4 rounded-lg border text-center"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                >
                    <FiTruck className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        No shipping templates yet.
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Add custom options above or create templates in your dashboard.
                    </p>
                </div>
            )}
        </div>
    );
}
