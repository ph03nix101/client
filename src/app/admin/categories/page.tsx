'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminCategoriesApi, categoriesApi } from '@/lib/api';
import { Category } from '@/types';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiCheck, FiX, FiSearch } from 'react-icons/fi';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCloneModal, setShowCloneModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Form states
    const [formData, setFormData] = useState({ name: '', slug: '', icon: '' });
    const [cloneData, setCloneData] = useState({ newName: '', newSlug: '' });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoriesApi.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminCategoriesApi.create(formData);
            setShowCreateModal(false);
            setFormData({ name: '', slug: '', icon: '' });
            loadCategories();
        } catch (error) {
            console.error('Failed to create category:', error);
            alert('Failed to create category');
        }
    };

    const handleClone = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;
        try {
            await adminCategoriesApi.clone({
                sourceId: selectedCategory.id,
                newName: cloneData.newName,
                newSlug: cloneData.newSlug,
            });
            setShowCloneModal(false);
            setCloneData({ newName: '', newSlug: '' });
            loadCategories();
        } catch (error) {
            console.error('Failed to clone category:', error);
            alert('Failed to clone category');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category? All attributes will be deleted.')) return;
        try {
            await adminCategoriesApi.delete(id);
            loadCategories();
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Failed to delete category');
        }
    };

    const togglePublish = async (category: Category) => {
        try {
            await adminCategoriesApi.update(category.id, { is_published: !category.is_published });
            // Optimistic update
            setCategories(categories.map(c =>
                c.id === category.id ? { ...c, is_published: !c.is_published } : c
            ));
        } catch (error) {
            console.error('Failed to update publish status:', error);
            loadCategories(); // Revert on error
        }
    };

    const openCloneModal = (category: Category) => {
        setSelectedCategory(category);
        setCloneData({
            newName: `${category.name} (Copy)`,
            newSlug: `${category.slug}-copy`
        });
        setShowCloneModal(true);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Categories</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                        <FiPlus className="w-4 h-4" />
                        Add Category
                    </button>
                </div>

                <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b" style={{ borderColor: 'var(--border)' }}>
                                <tr>
                                    <th className="text-left py-3 px-4 font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Name</th>
                                    <th className="text-left py-3 px-4 font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Slug</th>
                                    <th className="text-left py-3 px-4 font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Status</th>
                                    <th className="text-right py-3 px-4 font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50" style={{ borderColor: 'var(--border)' }}>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                {category.icon && <span className="text-xl">{category.icon}</span>}
                                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{category.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{category.slug}</td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => togglePublish(category)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${category.is_published
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}
                                            >
                                                {category.is_published ? (
                                                    <><FiCheck className="w-3 h-3" /> Published</>
                                                ) : (
                                                    <><FiX className="w-3 h-3" /> Draft</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openCloneModal(category)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                                                    title="Clone"
                                                >
                                                    <FiCopy className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    href={`/admin/categories/${category.id}`}
                                                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
                            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Create New Category</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border bg-transparent"
                                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Slug</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border bg-transparent"
                                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Icon (Emoji)</label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border bg-transparent"
                                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                        placeholder="💻"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                    >
                                        Create Class
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Clone Modal */}
                {showCloneModal && selectedCategory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
                            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Clone Category: {selectedCategory.name}</h2>
                            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>This will copy the category and all its attributes (specs schema).</p>
                            <form onSubmit={handleClone} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>New Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={cloneData.newName}
                                        onChange={e => setCloneData({ ...cloneData, newName: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border bg-transparent"
                                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>New Slug</label>
                                    <input
                                        type="text"
                                        required
                                        value={cloneData.newSlug}
                                        onChange={e => setCloneData({ ...cloneData, newSlug: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border bg-transparent"
                                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCloneModal(false)}
                                        className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                    >
                                        Clone Category
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
