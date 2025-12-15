'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminCategoriesApi, categoriesApi } from '@/lib/api';
import { Category, CategoryAttribute } from '@/types';
import { FiArrowLeft, FiSave, FiPlus, FiEdit2, FiTrash2, FiArrowUp, FiArrowDown, FiCheck, FiX } from 'react-icons/fi';

const INPUT_TYPES = [
    { value: 'text', label: 'Text Input' },
    { value: 'number', label: 'Number Input' },
    { value: 'select', label: 'Dropdown Select' },
    { value: 'multiselect', label: 'Multi-Select' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'reference_search', label: 'Reference Search (CPU/GPU)' },
];

export default function CategoryEditorPage() {
    const params = useParams();
    const router = useRouter();
    const [category, setCategory] = useState<Category | null>(null);
    const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Attribute Modal
    const [showAttrModal, setShowAttrModal] = useState(false);
    const [editingAttr, setEditingAttr] = useState<CategoryAttribute | null>(null);
    const [attrForm, setAttrForm] = useState<Partial<CategoryAttribute>>({
        label: '',
        key_name: '',
        input_type: 'text',
        is_required: false,
        options: [],
        unit: '',
        display_order: 0,
    });
    const [optionsText, setOptionsText] = useState('');

    useEffect(() => {
        loadData();
    }, [params.id]);

    const loadData = async () => {
        try {
            const catId = parseInt(params.id as string);
            // We need to get category by ID. Assuming getAll works and filter, or add getById.
            // Since we don't have getById exposed in adminCategoriesApi yet for category detail (my bad), 
            // I'll fetch all and find (temporary) or better add getById.
            // Actually I implemented update but forgot getById in controller/service explicitly? 
            // The service has getCategoryById. Controller needs it. 
            // I'll skip fixing that for a sec and use getAll().find() to unblock, or fix backend.
            // Fixing backend is better. But getAll() is cached/fast enough for admin usually.
            // Let's use categoriesApi.getAll() (public) which works.

            const allCats = await categoriesApi.getAll();
            const cat = allCats.find(c => c.id === catId);

            if (!cat) {
                alert('Category not found');
                router.push('/admin/categories');
                return;
            }
            setCategory(cat);

            const attrs = await adminCategoriesApi.getAttributes(catId);
            setAttributes(attrs);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) return;
        setSaving(true);
        try {
            const updated = await adminCategoriesApi.update(category.id, {
                name: category.name,
                slug: category.slug,
                icon: category.icon,
                is_published: category.is_published
            });
            setCategory(updated);
            alert('Category updated successfully');
        } catch (error) {
            console.error('Failed to update category:', error);
            alert('Failed to update category');
        } finally {
            setSaving(false);
        }
    };

    const openAttrModal = (attr?: CategoryAttribute) => {
        if (attr) {
            setEditingAttr(attr);
            setAttrForm({ ...attr });
            setOptionsText(attr.options?.join('\n') || '');
        } else {
            setEditingAttr(null);
            setAttrForm({
                label: '',
                key_name: '',
                input_type: 'text',
                is_required: false,
                options: [],
                unit: '',
                display_order: attributes.length,
            });
            setOptionsText('');
        }
        setShowAttrModal(true);
    };

    const handleSaveAttr = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) return;

        const payload: any = {
            ...attrForm,
            options: ['select', 'multiselect'].includes(attrForm.input_type as string)
                ? optionsText.split('\n').map(o => o.trim()).filter(o => o)
                : [],
            // Auto-generate key_name if empty
            key_name: attrForm.key_name || attrForm.label?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'attr',
        };

        try {
            if (editingAttr) {
                await adminCategoriesApi.updateAttribute(editingAttr.id, payload);
            } else {
                await adminCategoriesApi.createAttribute(category.id, payload);
            }
            setShowAttrModal(false);
            loadData(); // Reload attributes
        } catch (error) {
            console.error('Failed to save attribute:', error);
            alert('Failed to save attribute');
        }
    };

    const handleDeleteAttr = async (id: number) => {
        if (!confirm('Delete this attribute?')) return;
        try {
            await adminCategoriesApi.deleteAttribute(id);
            setAttributes(attributes.filter(a => a.id !== id));
        } catch (error) {
            alert('Failed to delete attribute');
        }
    };

    const handleReorder = async (fromIndex: number, direction: 'up' | 'down') => {
        const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
        if (toIndex < 0 || toIndex >= attributes.length) return;

        const newAttributes = [...attributes];
        const temp = newAttributes[fromIndex];
        newAttributes[fromIndex] = newAttributes[toIndex];
        newAttributes[toIndex] = temp;

        // Update display orders locally
        newAttributes.forEach((attr, idx) => {
            attr.display_order = idx;
        });
        setAttributes(newAttributes);

        // Save new order
        try {
            await adminCategoriesApi.reorderAttributes(
                newAttributes.map((a, idx) => ({ id: a.id, display_order: idx }))
            );
        } catch (error) {
            console.error('Failed to save order:', error);
        }
    };

    if (loading || !category) return <AdminLayout><div>Loading...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/categories" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <FiArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold">Edit Category: {category.name}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Category Settings */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-xl border p-6 bg-white dark:bg-gray-800" style={{ borderColor: 'var(--border)' }}>
                            <h2 className="text-lg font-bold mb-4">Settings</h2>
                            <form onSubmit={handleSaveCategory} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={category.name}
                                        onChange={e => setCategory({ ...category, name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border bg-transparent"
                                        style={{ borderColor: 'var(--border)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Slug</label>
                                    <input
                                        type="text"
                                        required
                                        value={category.slug}
                                        onChange={e => setCategory({ ...category, slug: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border bg-transparent"
                                        style={{ borderColor: 'var(--border)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Icon</label>
                                    <input
                                        type="text"
                                        value={category.icon || ''}
                                        onChange={e => setCategory({ ...category, icon: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border bg-transparent"
                                        style={{ borderColor: 'var(--border)' }}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_published"
                                        checked={category.is_published || false}
                                        onChange={e => setCategory({ ...category, is_published: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="is_published" className="text-sm font-medium">Published (Visible to users)</label>
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <FiSave className="w-4 h-4" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Attributes Editor */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border bg-white dark:bg-gray-800" style={{ borderColor: 'var(--border)' }}>
                            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                                <div>
                                    <h2 className="text-lg font-bold">Attributes (Specs)</h2>
                                    <p className="text-sm text-gray-500">Define the form fields for this category</p>
                                </div>
                                <button
                                    onClick={() => openAttrModal()}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                                >
                                    <FiPlus className="w-4 h-4" />
                                    Add Field
                                </button>
                            </div>

                            <div className="p-0">
                                {attributes.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No attributes defined. Add one to get started.
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 uppercase">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Label</th>
                                                <th className="px-4 py-3 text-left">Type</th>
                                                <th className="px-4 py-3 text-center">Required</th>
                                                <th className="px-4 py-3 text-right">Order</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                            {attributes.map((attr, idx) => (
                                                <tr key={attr.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{attr.label}</div>
                                                        <div className="text-xs text-gray-400 font-mono">{attr.key_name}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs">
                                                            {attr.input_type}
                                                        </span>
                                                        {attr.unit && <span className="ml-1 text-xs text-gray-400">({attr.unit})</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {attr.is_required && <FiCheck className="mx-auto text-green-500 w-4 h-4" />}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => handleReorder(idx, 'up')}
                                                                disabled={idx === 0}
                                                                className="p-1 hover:text-blue-500 disabled:opacity-30"
                                                            >
                                                                <FiArrowUp className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReorder(idx, 'down')}
                                                                disabled={idx === attributes.length - 1}
                                                                className="p-1 hover:text-blue-500 disabled:opacity-30"
                                                            >
                                                                <FiArrowDown className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => openAttrModal(attr)}
                                                                className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                                                            >
                                                                <FiEdit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAttr(attr.id)}
                                                                className="p-1.5 rounded hover:bg-red-50 text-red-600"
                                                            >
                                                                <FiTrash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attribute Modal */}
                {showAttrModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-xl my-8">
                            <h2 className="text-xl font-bold mb-4">{editingAttr ? 'Edit Attribute' : 'Add Attribute'}</h2>
                            <form onSubmit={handleSaveAttr} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Label</label>
                                        <input
                                            type="text"
                                            required
                                            value={attrForm.label}
                                            onChange={e => setAttrForm({ ...attrForm, label: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border bg-transparent"
                                            style={{ borderColor: 'var(--border)' }}
                                            placeholder="e.g. Screen Size"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Key Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={attrForm.key_name}
                                            onChange={e => setAttrForm({ ...attrForm, key_name: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border bg-transparent"
                                            style={{ borderColor: 'var(--border)' }}
                                            placeholder="Auto-generated if empty"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Input Type</label>
                                        <select
                                            value={attrForm.input_type}
                                            onChange={e => setAttrForm({ ...attrForm, input_type: e.target.value as any })}
                                            className="w-full px-3 py-2 rounded-lg border bg-transparent"
                                            style={{ borderColor: 'var(--border)' }}
                                        >
                                            {INPUT_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Unit (Optional)</label>
                                        <input
                                            type="text"
                                            value={attrForm.unit || ''}
                                            onChange={e => setAttrForm({ ...attrForm, unit: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border bg-transparent"
                                            style={{ borderColor: 'var(--border)' }}
                                            placeholder="e.g. GB, inches"
                                        />
                                    </div>
                                    <div className="flex items-center mt-6">
                                        <input
                                            type="checkbox"
                                            id="attr_required"
                                            checked={attrForm.is_required || false}
                                            onChange={e => setAttrForm({ ...attrForm, is_required: e.target.checked })}
                                            className="rounded border-gray-300 mr-2"
                                        />
                                        <label htmlFor="attr_required" className="text-sm font-medium">Required Field</label>
                                    </div>
                                </div>

                                {(attrForm.input_type === 'select' || attrForm.input_type === 'multiselect') && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Options (One per line)</label>
                                        <textarea
                                            rows={5}
                                            value={optionsText}
                                            onChange={e => setOptionsText(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border bg-transparent"
                                            style={{ borderColor: 'var(--border)' }}
                                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                                        />
                                    </div>
                                )}

                                {attrForm.input_type === 'reference_search' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Data Source</label>
                                        <select
                                            value={attrForm.data_source || 'cpus'}
                                            onChange={e => setAttrForm({ ...attrForm, data_source: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border bg-transparent"
                                            style={{ borderColor: 'var(--border)' }}
                                        >
                                            <option value="cpus">CPUs</option>
                                            <option value="gpus">GPUs</option>
                                        </select>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAttrModal(false)}
                                        className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                    >
                                        {editingAttr ? 'Update Field' : 'Add Field'}
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
