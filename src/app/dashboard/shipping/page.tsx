'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { shippingApi, ShippingOption, CreateShippingTemplateData } from '@/lib/api';
import { FiTruck, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiStar } from 'react-icons/fi';

export default function ShippingPage() {
    const [templates, setTemplates] = useState<ShippingOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateShippingTemplateData>({
        name: '',
        price: 0,
        estimated_days_min: undefined,
        estimated_days_max: undefined,
        coverage_area: '',
        is_collection: false,
        collection_address: '',
        is_default: false,
    });

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await shippingApi.getMyTemplates();
            setTemplates(data);
        } catch (err) {
            console.error('Failed to load shipping templates:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            if (editingId) {
                await shippingApi.updateTemplate(editingId, formData);
            } else {
                await shippingApi.createTemplate(formData);
            }
            await loadTemplates();
            resetForm();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save shipping option');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (template: ShippingOption) => {
        setFormData({
            name: template.name,
            price: template.price,
            estimated_days_min: template.estimated_days_min || undefined,
            estimated_days_max: template.estimated_days_max || undefined,
            coverage_area: template.coverage_area || '',
            is_collection: template.is_collection,
            collection_address: template.collection_address || '',
            is_default: template.is_default,
        });
        setEditingId(template.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this shipping option?')) return;

        try {
            await shippingApi.deleteTemplate(id);
            await loadTemplates();
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: 0,
            estimated_days_min: undefined,
            estimated_days_max: undefined,
            coverage_area: '',
            is_collection: false,
            collection_address: '',
            is_default: false,
        });
        setEditingId(null);
        setShowForm(false);
        setError(null);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            Shipping Options
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            Manage your shipping templates for product listings
                        </p>
                    </div>
                    {!showForm && (
                        <Button onClick={() => setShowForm(true)}>
                            <FiPlus className="w-4 h-4 mr-2" />
                            Add Shipping Option
                        </Button>
                    )}
                </div>

                {/* Create/Edit Form */}
                {showForm && (
                    <div
                        className="rounded-xl border p-6"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                            {editingId ? 'Edit Shipping Option' : 'Create Shipping Option'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Standard Courier"
                                        required
                                        className="w-full px-4 py-2.5 rounded-lg border"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-primary)',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        Price (R) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                        min="0"
                                        step="0.01"
                                        placeholder="0 for free"
                                        required
                                        className="w-full px-4 py-2.5 rounded-lg border"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-primary)',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        Estimated Days (Min)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.estimated_days_min || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, estimated_days_min: parseInt(e.target.value) || undefined }))}
                                        min="1"
                                        placeholder="e.g., 3"
                                        className="w-full px-4 py-2.5 rounded-lg border"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-primary)',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        Estimated Days (Max)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.estimated_days_max || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, estimated_days_max: parseInt(e.target.value) || undefined }))}
                                        min="1"
                                        placeholder="e.g., 5"
                                        className="w-full px-4 py-2.5 rounded-lg border"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-primary)',
                                        }}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        Coverage Area
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.coverage_area}
                                        onChange={(e) => setFormData(prev => ({ ...prev, coverage_area: e.target.value }))}
                                        placeholder="e.g., Nationwide, Gauteng Only, Cape Town"
                                        className="w-full px-4 py-2.5 rounded-lg border"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-primary)',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Collection Option */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, is_collection: !prev.is_collection }))}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${formData.is_collection ? 'bg-blue-600' : 'bg-gray-600'}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_collection ? 'left-6' : 'left-1'}`} />
                                </button>
                                <div>
                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Collection/Pickup Option</span>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Allow buyers to collect the item</p>
                                </div>
                            </div>

                            {formData.is_collection && (
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        Collection Address
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.collection_address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, collection_address: e.target.value }))}
                                        placeholder="e.g., Sandton, Johannesburg"
                                        className="w-full px-4 py-2.5 rounded-lg border"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-primary)',
                                        }}
                                    />
                                </div>
                            )}

                            {/* Default Option */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, is_default: !prev.is_default }))}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${formData.is_default ? 'bg-blue-600' : 'bg-gray-600'}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_default ? 'left-6' : 'left-1'}`} />
                                </button>
                                <div>
                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Set as Default</span>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Auto-select for new listings</p>
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving || !formData.name}>
                                    {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Templates List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="rounded-xl border p-4 animate-pulse"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                            >
                                <div className="h-5 w-40 rounded bg-gray-300 dark:bg-gray-700 mb-2" />
                                <div className="h-4 w-24 rounded bg-gray-300 dark:bg-gray-700" />
                            </div>
                        ))}
                    </div>
                ) : templates.length === 0 ? (
                    <div
                        className="rounded-xl border p-12 text-center"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <FiTruck className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            No Shipping Options Yet
                        </h3>
                        <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
                            Create reusable shipping templates to quickly add to your listings.
                        </p>
                        <Button onClick={() => setShowForm(true)}>
                            <FiPlus className="w-4 h-4 mr-2" />
                            Create Your First Template
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className="rounded-xl border p-4 flex items-center justify-between"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${template.is_collection ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                                        {template.is_collection ? (
                                            <FiMapPin className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <FiTruck className="w-5 h-5 text-blue-500" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                {template.name}
                                            </h3>
                                            {template.is_default && (
                                                <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">
                                                    <FiStar className="w-3 h-3" />
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                                            <span className={template.price === 0 ? 'text-green-500 font-medium' : 'text-blue-500 font-medium'}>
                                                {template.price === 0 ? 'Free' : `R${template.price.toFixed(2)}`}
                                            </span>
                                            {template.estimated_days_min && template.estimated_days_max && (
                                                <span>• {template.estimated_days_min}-{template.estimated_days_max} days</span>
                                            )}
                                            {template.coverage_area && (
                                                <span>• {template.coverage_area}</span>
                                            )}
                                        </div>
                                        {template.is_collection && template.collection_address && (
                                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                                Pickup: {template.collection_address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(template)}
                                        className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors"
                                        title="Edit"
                                    >
                                        <FiEdit2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                        title="Delete"
                                    >
                                        <FiTrash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
