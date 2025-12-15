'use client';

import { useEffect, useState } from 'react';
import { Category } from '@/types';
import { categoriesApi } from '@/lib/api';
import { FiMonitor } from 'react-icons/fi';
import { BsCpu, BsGpuCard, BsLaptop } from 'react-icons/bs';

interface CategorySelectorProps {
    onSelect: (category: Category) => void;
    selected?: Category | null;
}

const iconMap: Record<string, React.ReactNode> = {
    laptop: <BsLaptop className="w-8 h-8" />,
    cpu: <BsCpu className="w-8 h-8" />,
    gpu: <BsGpuCard className="w-8 h-8" />,
};

export function CategorySelector({ onSelect, selected }: CategorySelectorProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        categoriesApi.getAll()
            .then(setCategories)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => (
                <button
                    key={category.id}
                    type="button"
                    onClick={() => onSelect(category)}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 hover:border-blue-500 hover:bg-blue-50 ${selected?.id === category.id
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 bg-white'
                        }`}
                >
                    <div className={`${selected?.id === category.id ? 'text-blue-600' : 'text-gray-600'}`}>
                        {iconMap[category.slug] || <FiMonitor className="w-8 h-8" />}
                    </div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                </button>
            ))}
        </div>
    );
}
