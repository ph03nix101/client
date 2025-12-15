'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { usersApi, User } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { FiSave, FiCheck, FiUser, FiMail } from 'react-icons/fi';
import { useAuth } from '@/components/AuthProvider';

interface FormData {
    full_name: string;
    phone: string;
    location: string;
    bio: string;
}

export default function ProfilePage() {
    const { user: authUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>();

    useEffect(() => {
        if (authUser?.id) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [authUser?.id]);

    const loadUser = async () => {
        if (!authUser?.id) return;
        setLoading(true);
        try {
            const userData = await usersApi.getById(authUser.id);
            setUser(userData);
            reset({
                full_name: userData.full_name || '',
                phone: userData.phone || '',
                location: userData.location || '',
                bio: userData.bio || '',
            });
        } catch (error) {
            console.error('Failed to load user:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        if (!authUser?.id) return;
        setSaving(true);
        try {
            const updatedUser = await usersApi.update(authUser.id, data);
            setUser(updatedUser);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="animate-pulse space-y-6">
                    <div className="h-8 rounded w-1/3" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                    <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                        <div className="space-y-4">
                            <div className="h-10 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                            <div className="h-10 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                            <div className="h-10 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile</h1>
                    <div className="flex items-center gap-3">
                        {success && (
                            <span className="flex items-center gap-2 text-green-500 text-sm">
                                <FiCheck className="w-4 h-4" />
                                Saved!
                            </span>
                        )}
                        <Button type="submit" disabled={saving}>
                            <FiSave className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                {/* Profile Card */}
                <div
                    className="rounded-xl border overflow-hidden"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                    {/* Header with avatar */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {user?.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {user?.full_name || user?.username || 'User'}
                                </h2>
                                <p className="text-blue-100">
                                    @{user?.username || 'username'}
                                </p>
                                {user?.is_verified_seller && (
                                    <span className="inline-flex items-center gap-1.5 mt-1 bg-white/20 text-white text-xs px-2.5 py-1 rounded-full">
                                        <VerifiedBadge size="sm" />
                                        Verified Seller
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="p-6 space-y-4">
                        {/* Read-only fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                    <span className="flex items-center gap-2">
                                        <FiUser className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                        Username
                                    </span>
                                </label>
                                <div
                                    className="px-4 py-2 border rounded-lg"
                                    style={{
                                        backgroundColor: 'var(--bg-tertiary)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--text-secondary)'
                                    }}
                                >
                                    {user?.username || '-'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                    <span className="flex items-center gap-2">
                                        <FiMail className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                        Email
                                    </span>
                                </label>
                                <div
                                    className="px-4 py-2 border rounded-lg"
                                    style={{
                                        backgroundColor: 'var(--bg-tertiary)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--text-secondary)'
                                    }}
                                >
                                    {user?.email || '-'}
                                </div>
                            </div>
                        </div>

                        {/* Editable fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <Input
                                label="Full Name"
                                placeholder="Your full name"
                                {...register('full_name')}
                                error={errors.full_name?.message}
                            />
                            <Input
                                label="Phone"
                                placeholder="Your phone number"
                                {...register('phone')}
                                error={errors.phone?.message}
                            />
                        </div>

                        <Input
                            label="Location"
                            placeholder="City, Country"
                            {...register('location')}
                            error={errors.location?.message}
                        />

                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Bio
                            </label>
                            <textarea
                                {...register('bio')}
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                                placeholder="Tell buyers about yourself..."
                            />
                        </div>
                    </div>
                </div>

                {/* Account Info */}
                <div
                    className="rounded-xl border p-6"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>Member Since</span>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                {user?.created_at
                                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : '-'
                                }
                            </p>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>Seller Status</span>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                {user?.is_verified_seller ? 'Verified' : 'Standard'}
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
