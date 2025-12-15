'use client';

import { useState, useEffect, useRef } from 'react';
import { ReferenceComponent } from '@/types';
import { componentsApi } from '@/lib/api';
import { FiSearch, FiCheck } from 'react-icons/fi';
import { BsCpu, BsGpuCard } from 'react-icons/bs';

interface ReferenceSearchProps {
    label: string;
    componentType: 'CPU' | 'GPU';
    productCategory: 'Laptop' | 'Desktop';
    value?: ReferenceComponent | null;
    onChange: (component: ReferenceComponent | null, modelName: string) => void;
    required?: boolean;
    error?: string;
}

export function ReferenceSearch({
    label,
    componentType,
    productCategory,
    value,
    onChange,
    required,
    error,
}: ReferenceSearchProps) {
    const [query, setQuery] = useState(value?.model_name || '');
    const [results, setResults] = useState<ReferenceComponent[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState<ReferenceComponent | null>(value || null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await componentsApi.search(query, componentType, productCategory);
                setResults(data);
                setIsOpen(true);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, componentType, productCategory]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (component: ReferenceComponent) => {
        setQuery(component.model_name);
        setSelectedComponent(component);
        onChange(component, component.model_name);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setSelectedComponent(null);
        onChange(null, e.target.value);
    };

    const Icon = componentType === 'CPU' ? BsCpu : BsGpuCard;

    return (
        <div className="w-full relative" ref={dropdownRef}>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="relative">
                <FiSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: 'var(--text-muted)' }}
                />
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    placeholder={`Search ${componentType}...`}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    style={{
                        backgroundColor: selectedComponent ? 'rgba(34, 197, 94, 0.1)' : 'var(--input-bg)',
                        borderColor: error ? '#ef4444' : selectedComponent ? '#22c55e' : 'var(--border)',
                        color: 'var(--text-primary)',
                    }}
                />
                {selectedComponent && (
                    <FiCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div
                    className="absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-64 overflow-auto"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border)'
                    }}
                >
                    {results.map((component) => (
                        <button
                            key={component.id}
                            type="button"
                            onClick={() => handleSelect(component)}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 border-b last:border-0 transition-colors hover:bg-blue-500/10"
                            style={{ borderColor: 'var(--border)' }}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                            <div>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {component.manufacturer} {component.model_name}
                                </div>
                                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                    {component.cores && `${component.cores} Cores`}
                                    {component.socket && ` • ${component.socket}`}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {loading && (
                <div className="absolute right-10 top-9 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
            )}

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}
