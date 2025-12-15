'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { messagesApi, Conversation, Message } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { FiArrowLeft, FiSend, FiUser, FiExternalLink } from 'react-icons/fi';

export default function ConversationPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (params.id) {
            loadConversation();
        }
    }, [params.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadConversation = async () => {
        try {
            const data = await messagesApi.getConversation(params.id as string);
            setConversation(data.conversation);
            setMessages(data.messages);
            // Mark as read
            await messagesApi.markAsRead(params.id as string);
        } catch (err) {
            console.error('Failed to load conversation:', err);
            router.push('/dashboard/messages');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const message = await messagesApi.sendMessage(params.id as string, newMessage.trim());
            setMessages(prev => [...prev, { ...message, sender_name: user?.full_name }]);
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = new Date(message.created_at).toDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(message);
        return groups;
    }, {} as Record<string, Message[]>);

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
            <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
                {/* Header */}
                <div
                    className="flex items-center gap-4 p-4 border-b rounded-t-xl"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                    <button
                        onClick={() => router.push('/dashboard/messages')}
                        className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    >
                        <FiArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                    </button>

                    <Link
                        href={conversation?.other_user_id ? `/seller/${conversation.other_user_id}` : '#'}
                        className="flex items-center gap-3 flex-1 min-w-0 group"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {conversation?.other_user_avatar ? (
                                <img src={conversation.other_user_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                conversation?.other_user_name?.charAt(0).toUpperCase() || <FiUser className="w-4 h-4" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-semibold truncate group-hover:text-blue-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                                {conversation?.other_user_name || 'User'}
                            </h2>
                            <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                                {conversation?.product_title}
                            </p>
                        </div>
                    </Link>

                    <Link
                        href={`/product/${conversation?.product_id}`}
                        className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                        title="View Product"
                    >
                        <FiExternalLink className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                    </Link>
                </div>

                {/* Messages */}
                <div
                    className="flex-1 overflow-y-auto p-4 space-y-6"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                    {Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="flex justify-center mb-4">
                                <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-muted)' }}>
                                    {formatDate(msgs[0].created_at)}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {msgs.map((msg) => {
                                    const isOwn = msg.sender_id === user?.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn
                                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                                    : 'rounded-bl-sm'
                                                    }`}
                                                style={!isOwn ? { backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' } : {}}
                                            >
                                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : ''}`} style={!isOwn ? { color: 'var(--text-muted)' } : {}}>
                                                    {formatTime(msg.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form
                    onSubmit={handleSend}
                    className="p-4 border-t rounded-b-xl"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                borderColor: 'var(--border)',
                                color: 'var(--text-primary)'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiSend className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
