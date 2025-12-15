'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { messagesApi, Conversation } from '@/lib/api';
import { FiMessageCircle, FiUser, FiPackage } from 'react-icons/fi';

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        messagesApi.getConversations()
            .then(setConversations)
            .catch(err => console.error('Failed to load conversations:', err))
            .finally(() => setLoading(false));
    }, []);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Messages</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Your conversations with buyers and sellers</p>
                </div>

                {conversations.length === 0 ? (
                    <div
                        className="rounded-xl border p-12 text-center"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <FiMessageCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            No Messages Yet
                        </h3>
                        <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
                            When you contact a seller or receive a message, it will appear here.
                        </p>
                        <Link
                            href="/browse"
                            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse Listings
                        </Link>
                    </div>
                ) : (
                    <div
                        className="rounded-xl border overflow-hidden divide-y"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        {conversations.map((conv) => (
                            <Link
                                key={conv.id}
                                href={`/dashboard/messages/${conv.id}`}
                                className="flex items-center gap-4 p-4 hover:bg-opacity-50 transition-colors"
                                style={{ backgroundColor: conv.unread_count && conv.unread_count > 0 ? 'var(--accent)' : 'transparent' }}
                            >
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {conv.other_user_avatar ? (
                                        <img src={conv.other_user_avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        conv.other_user_name?.charAt(0).toUpperCase() || <FiUser className="w-5 h-5" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span
                                            className={`font-medium truncate ${conv.unread_count && conv.unread_count > 0 ? 'font-semibold' : ''}`}
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {conv.other_user_name || 'User'}
                                        </span>
                                        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                                            {formatTime(conv.last_message_at)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                        <FiPackage className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span className="truncate">{conv.product_title}</span>
                                    </div>
                                    <p
                                        className={`text-sm truncate mt-1 ${conv.unread_count && conv.unread_count > 0 ? 'font-medium' : ''}`}
                                        style={{ color: conv.unread_count && conv.unread_count > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                                    >
                                        {conv.last_message || 'No messages yet'}
                                    </p>
                                </div>

                                {/* Unread Badge */}
                                {conv.unread_count && conv.unread_count > 0 && (
                                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full flex-shrink-0">
                                        {conv.unread_count}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
