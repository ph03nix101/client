'use client';

import { useState } from 'react';
import { Category } from '@/types';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const CONDITIONS = [
    'New',
    'Open Box',
    'Used - Like New',
    'Used - Good',
    'Used - Fair',
    'For Parts',
];

// Spec filter definitions by category
const SPEC_FILTERS: Record<number, { key: string; label: string; options: string[] }[]> = {
    1: [ // Laptop
        { key: 'ram_size', label: 'RAM', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
        { key: 'storage_type', label: 'Storage Type', options: ['SSD', 'HDD', 'SSD + HDD'] },
        { key: 'gpu_type', label: 'GPU Type', options: ['Integrated', 'Dedicated'] },
    ],
    2: [ // CPU
        { key: 'cpu_manufacturer', label: 'Brand', options: ['Intel', 'AMD'] },
    ],
    3: [ // GPU
        { key: 'gpu_manufacturer', label: 'Brand', options: ['NVIDIA', 'AMD', 'Intel'] },
    ],
};

interface FilterSidebarProps {
    categories: Category[];
    selectedCategory: number | null;
    onCategoryChange: (id: number | null) => void;
    minPrice: string;
    maxPrice: string;
    onPriceChange: (min: string, max: string) => void;
    selectedConditions: string[];
    onConditionsChange: (conditions: string[]) => void;
    selectedSpecs: Record<string, string[]>;
    onSpecsChange: (specs: Record<string, string[]>) => void;
    onClearAll: () => void;
}

export function FilterSidebar({
    categories,
    selectedCategory,
    onCategoryChange,
    minPrice,
    maxPrice,
    onPriceChange,
    selectedConditions,
    onConditionsChange,
    selectedSpecs,
    onSpecsChange,
    onClearAll,
}: FilterSidebarProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        category: true,
        price: true,
        condition: true,
        specs: true,
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleCondition = (condition: string) => {
        if (selectedConditions.includes(condition)) {
            onConditionsChange(selectedConditions.filter(c => c !== condition));
        } else {
            onConditionsChange([...selectedConditions, condition]);
        }
    };

    const toggleSpec = (key: string, value: string) => {
        const current = selectedSpecs[key] || [];
        if (current.includes(value)) {
            const newSpecs = { ...selectedSpecs, [key]: current.filter(v => v !== value) };
            if (newSpecs[key].length === 0) delete newSpecs[key];
            onSpecsChange(newSpecs);
        } else {
            onSpecsChange({ ...selectedSpecs, [key]: [...current, value] });
        }
    };

    const hasActiveFilters =
        selectedCategory !== null ||
        minPrice !== '' ||
        maxPrice !== '' ||
        selectedConditions.length > 0 ||
        Object.keys(selectedSpecs).length > 0;

    const specFilters = selectedCategory ? SPEC_FILTERS[selectedCategory] : [];

    return (
        <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div
                className="rounded-xl border overflow-hidden sticky top-24"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border)',
                }}
            >
                {/* Header */}
                <div
                    className="p-4 border-b flex items-center justify-between"
                    style={{ borderColor: 'var(--border)' }}
                >
                    <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Filters</h2>
                    {hasActiveFilters && (
                        <button
                            onClick={onClearAll}
                            className="text-sm text-blue-500 hover:text-blue-400 font-medium"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {/* Category */}
                <div className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <button
                        onClick={() => toggleSection('category')}
                        className="w-full p-4 flex items-center justify-between text-left"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <span className="font-medium">Category</span>
                        {expandedSections.category ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {expandedSections.category && (
                        <div className="px-4 pb-4 space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={selectedCategory === null}
                                    onChange={() => onCategoryChange(null)}
                                    className="text-blue-600"
                                />
                                <span style={{ color: 'var(--text-secondary)' }}>All Categories</span>
                            </label>
                            {categories.map(cat => (
                                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={selectedCategory === cat.id}
                                        onChange={() => onCategoryChange(cat.id)}
                                        className="text-blue-600"
                                    />
                                    <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price Range */}
                <div className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <button
                        onClick={() => toggleSection('price')}
                        className="w-full p-4 flex items-center justify-between text-left"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <span className="font-medium">Price Range</span>
                        {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {expandedSections.price && (
                        <div className="px-4 pb-4">
                            <div className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => onPriceChange(e.target.value, maxPrice)}
                                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                                <span style={{ color: 'var(--text-muted)' }}>—</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => onPriceChange(minPrice, e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Condition */}
                <div className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <button
                        onClick={() => toggleSection('condition')}
                        className="w-full p-4 flex items-center justify-between text-left"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <span className="font-medium">Condition</span>
                        {expandedSections.condition ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {expandedSections.condition && (
                        <div className="px-4 pb-4 space-y-2">
                            {CONDITIONS.map(cond => (
                                <label key={cond} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedConditions.includes(cond)}
                                        onChange={() => toggleCondition(cond)}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{cond}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Spec Filters (based on category) */}
                {specFilters.length > 0 && (
                    <div className="border-b" style={{ borderColor: 'var(--border)' }}>
                        <button
                            onClick={() => toggleSection('specs')}
                            className="w-full p-4 flex items-center justify-between text-left"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <span className="font-medium">Specifications</span>
                            {expandedSections.specs ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        {expandedSections.specs && (
                            <div className="px-4 pb-4 space-y-4">
                                {specFilters.map(spec => (
                                    <div key={spec.key}>
                                        <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                            {spec.label}
                                        </div>
                                        <div className="space-y-1">
                                            {spec.options.map(opt => (
                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={(selectedSpecs[spec.key] || []).includes(opt)}
                                                        onChange={() => toggleSpec(spec.key, opt)}
                                                        className="rounded text-blue-600"
                                                    />
                                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}
