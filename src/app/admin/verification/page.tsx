'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { verificationApi, VerificationRequest } from '@/lib/api';
import { FiCheckCircle, FiXCircle, FiClock, FiUser } from 'react-icons/fi';

interface VerificationRequestWithUser extends VerificationRequest {
    user_email?: string;
    user_name?: string;
}

export default function AdminVerificationPage() {
    const [requests, setRequests] = useState<VerificationRequestWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const data = await verificationApi.getPending();
            setRequests(data as VerificationRequestWithUser[]);
        } catch (err) {
            console.error('Failed to load requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (requestId: string, action: 'approve' | 'reject') => {
        setProcessing(requestId);
        try {
            await verificationApi.review(requestId, action, notes[requestId]);
            // Remove from list
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) {
            console.error('Failed to review request:', err);
            alert('Failed to process request');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Verification Requests
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Review and approve seller verification requests
                    </p>
                </div>

                {requests.length === 0 ? (
                    <div
                        className="rounded-xl border p-12 text-center"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <FiCheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            All caught up!
                        </h3>
                        <p style={{ color: 'var(--text-muted)' }}>No pending verification requests.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="rounded-xl border p-6"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <FiUser className="w-6 h-6 text-blue-500" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                {(request as any).user_name || 'Unknown User'}
                                            </h3>
                                            <span
                                                className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500"
                                            >
                                                Pending
                                            </span>
                                        </div>
                                        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                                            {(request as any).user_email}
                                        </p>

                                        <div
                                            className="rounded-lg p-4 space-y-2 mb-4"
                                            style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                        >
                                            <div>
                                                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                                    Business Name
                                                </span>
                                                <p style={{ color: 'var(--text-primary)' }}>{request.business_name || 'N/A'}</p>
                                            </div>
                                            {request.business_address && (
                                                <div>
                                                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                                        Address
                                                    </span>
                                                    <p style={{ color: 'var(--text-primary)' }}>{request.business_address}</p>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                                    Reason
                                                </span>
                                                <p style={{ color: 'var(--text-primary)' }}>{request.reason || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                                    Submitted
                                                </span>
                                                <p style={{ color: 'var(--text-primary)' }}>
                                                    {new Date(request.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <textarea
                                                placeholder="Admin notes (optional)"
                                                value={notes[request.id] || ''}
                                                onChange={(e) => setNotes(prev => ({ ...prev, [request.id]: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
                                                style={{
                                                    backgroundColor: 'var(--input-bg)',
                                                    borderColor: 'var(--border)',
                                                    color: 'var(--text-primary)'
                                                }}
                                                rows={2}
                                            />

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleReview(request.id, 'approve')}
                                                    disabled={processing === request.id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                                >
                                                    <FiCheckCircle className="w-4 h-4" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReview(request.id, 'reject')}
                                                    disabled={processing === request.id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                                >
                                                    <FiXCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
