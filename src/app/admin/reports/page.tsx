'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { reportsApi, Report } from '@/lib/api';
import Link from 'next/link';
import { FiFlag, FiCheck, FiX, FiExternalLink, FiFilter } from 'react-icons/fi';

const reasonLabels: Record<string, string> = {
    spam: 'Spam / Misleading',
    fraud: 'Fraud / Scam',
    inappropriate: 'Inappropriate Content',
    counterfeit: 'Counterfeit Product',
    other: 'Other',
};

const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'rgba(245, 158, 11, 0.2)', text: 'rgb(245, 158, 11)' },
    reviewed: { bg: 'rgba(59, 130, 246, 0.2)', text: 'rgb(59, 130, 246)' },
    resolved: { bg: 'rgba(34, 197, 94, 0.2)', text: 'rgb(34, 197, 94)' },
    dismissed: { bg: 'rgba(156, 163, 175, 0.2)', text: 'rgb(156, 163, 175)' },
};

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('pending');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await reportsApi.getAll(filter || undefined);
            setReports(data);
        } catch (err) {
            console.error('Failed to fetch reports:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const handleUpdateStatus = async (reportId: string, status: string) => {
        setUpdatingId(reportId);
        try {
            await reportsApi.updateStatus(reportId, status);
            await fetchReports();
        } catch (err) {
            console.error('Failed to update report:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reports</h1>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            Review and manage flagged listings
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <FiFilter className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg border text-sm"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                borderColor: 'var(--border)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="">All Reports</option>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="resolved">Resolved</option>
                            <option value="dismissed">Dismissed</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-32 rounded-xl border animate-pulse"
                                style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
                            />
                        ))}
                    </div>
                ) : reports.length === 0 ? (
                    <div
                        className="rounded-xl border p-12 text-center"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <FiFlag className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            No Reports Found
                        </h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {filter ? `No ${filter} reports to display.` : 'No reports have been submitted yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className="rounded-xl border p-4"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span
                                                className="px-2 py-1 text-xs font-medium rounded"
                                                style={{
                                                    backgroundColor: statusColors[report.status]?.bg,
                                                    color: statusColors[report.status]?.text
                                                }}
                                            >
                                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                            </span>
                                            <span
                                                className="px-2 py-1 text-xs font-medium rounded"
                                                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                                            >
                                                {reasonLabels[report.reason] || report.reason}
                                            </span>
                                        </div>

                                        <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                            {report.product_title}
                                        </h3>

                                        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                                            Reported by: {report.reporter_name} ({report.reporter_email})
                                        </p>

                                        {report.description && (
                                            <p className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                                "{report.description}"
                                            </p>
                                        )}

                                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                                            {new Date(report.created_at).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <Link
                                            href={`/product/${report.product_id}`}
                                            target="_blank"
                                            className="p-2 rounded-lg border hover:border-blue-500 transition-colors"
                                            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                            title="View Listing"
                                        >
                                            <FiExternalLink className="w-4 h-4" />
                                        </Link>

                                        {report.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(report.id, 'resolved')}
                                                    disabled={updatingId === report.id}
                                                    className="p-2 rounded-lg border hover:border-green-500 hover:text-green-500 transition-colors disabled:opacity-50"
                                                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                                    title="Mark as Resolved"
                                                >
                                                    <FiCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                                                    disabled={updatingId === report.id}
                                                    className="p-2 rounded-lg border hover:border-gray-500 hover:text-gray-500 transition-colors disabled:opacity-50"
                                                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                                    title="Dismiss Report"
                                                >
                                                    <FiX className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
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
