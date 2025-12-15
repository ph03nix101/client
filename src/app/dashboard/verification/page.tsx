'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { verificationApi, VerificationRequest } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FiCheckCircle, FiClock, FiXCircle, FiShield, FiAlertCircle } from 'react-icons/fi';

export default function VerificationPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<VerificationRequest | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        business_name: '',
        business_address: '',
        reason: '',
    });

    useEffect(() => {
        const loadStatus = async () => {
            try {
                const response = await verificationApi.getMyStatus();
                setVerificationStatus(response.request);
            } catch (err) {
                console.error('Failed to load verification status:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadStatus();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const result = await verificationApi.apply(formData);
            setVerificationStatus(result);
            setSuccess('Verification request submitted successfully!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit verification request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Already verified
    if (user?.is_verified_seller) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto">
                    <div
                        className="rounded-xl border p-8 text-center"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                            <FiCheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                            You're a Verified Seller!
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Your account has been verified. You have the verified seller badge displayed on your profile and listings.
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
            </DashboardLayout>
        );
    }

    // Has pending or rejected request
    if (verificationStatus) {
        const isPending = verificationStatus.status === 'pending';
        const isRejected = verificationStatus.status === 'rejected';

        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto">
                    <div
                        className="rounded-xl border p-8"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <div className="text-center mb-6">
                            <div
                                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isPending ? 'bg-yellow-500/20' : 'bg-red-500/20'
                                    }`}
                            >
                                {isPending ? (
                                    <FiClock className="w-10 h-10 text-yellow-500" />
                                ) : (
                                    <FiXCircle className="w-10 h-10 text-red-500" />
                                )}
                            </div>
                            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                {isPending ? 'Verification Pending' : 'Verification Rejected'}
                            </h1>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {isPending
                                    ? 'Your verification request is being reviewed. We\'ll notify you once it\'s processed.'
                                    : 'Your verification request was rejected.'}
                            </p>
                        </div>

                        <div
                            className="rounded-lg p-4 space-y-3"
                            style={{ backgroundColor: 'var(--bg-tertiary)' }}
                        >
                            <div>
                                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Business Name</span>
                                <p style={{ color: 'var(--text-primary)' }}>{verificationStatus.business_name || 'Not provided'}</p>
                            </div>
                            <div>
                                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Reason</span>
                                <p style={{ color: 'var(--text-primary)' }}>{verificationStatus.reason || 'Not provided'}</p>
                            </div>
                            <div>
                                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Submitted</span>
                                <p style={{ color: 'var(--text-primary)' }}>
                                    {new Date(verificationStatus.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            {isRejected && verificationStatus.admin_notes && (
                                <div>
                                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Admin Notes</span>
                                    <p style={{ color: '#ef4444' }}>{verificationStatus.admin_notes}</p>
                                </div>
                            )}
                        </div>

                        {isRejected && (
                            <p className="text-sm mt-4 text-center" style={{ color: 'var(--text-muted)' }}>
                                You can submit a new verification request after addressing the issues mentioned above.
                            </p>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Show application form
    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div
                    className="rounded-xl border p-8"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                            <FiShield className="w-8 h-8 text-blue-500" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                            Become a Verified Seller
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Get a verified badge to build trust with buyers
                        </p>
                    </div>

                    <div
                        className="flex items-start gap-3 p-4 rounded-lg mb-6"
                        style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                    >
                        <FiAlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <strong className="text-blue-500">Benefits of verification:</strong>
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                                <li>Verified badge on your profile and listings</li>
                                <li>Increased buyer trust</li>
                                <li>Priority in search results</li>
                            </ul>
                        </div>
                    </div>

                    {error && (
                        <div
                            className="mb-6 p-4 rounded-lg border text-sm"
                            style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                borderColor: 'rgba(239, 68, 68, 0.3)',
                                color: '#ef4444'
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            className="mb-6 p-4 rounded-lg border text-sm"
                            style={{
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                borderColor: 'rgba(34, 197, 94, 0.3)',
                                color: '#22c55e'
                            }}
                        >
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Business / Seller Name *
                            </label>
                            <input
                                name="business_name"
                                type="text"
                                value={formData.business_name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                                placeholder="Your business or seller name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Business Address (Optional)
                            </label>
                            <input
                                name="business_address"
                                type="text"
                                value={formData.business_address}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                                placeholder="City, Country"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Why should you be verified? *
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                                placeholder="Tell us about your selling experience, types of products you sell, etc."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Verification Request'}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
