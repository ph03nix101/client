'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { usersApi, User } from '@/lib/api';
import { FiUser, FiCheckCircle, FiShield, FiSearch } from 'react-icons/fi';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await usersApi.getAll();
            setUsers(data);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
        setProcessing(userId);
        try {
            const updated = await usersApi.setAdmin(userId, !currentStatus);
            setUsers(prev => prev.map(u => u.id === userId ? updated : u));
        } catch (err) {
            console.error('Failed to update admin status:', err);
        } finally {
            setProcessing(null);
        }
    };

    const handleToggleVerified = async (userId: string, currentStatus: boolean) => {
        setProcessing(userId);
        try {
            const updated = await usersApi.setVerified(userId, !currentStatus);
            setUsers(prev => prev.map(u => u.id === userId ? updated : u));
        } catch (err) {
            console.error('Failed to update verified status:', err);
        } finally {
            setProcessing(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            User Management
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {users.length} total users
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search users by name, email, or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
                        style={{
                            backgroundColor: 'var(--input-bg)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>

                {/* Users Table */}
                <div
                    className="rounded-xl border overflow-hidden"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>User</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Email</th>
                                    <th className="text-center px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Verified</th>
                                    <th className="text-center px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Admin</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-t"
                                        style={{ borderColor: 'var(--border)' }}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <FiUser className="w-5 h-5 text-blue-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                                        {user.full_name || 'No name'}
                                                    </p>
                                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                        @{user.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleToggleVerified(user.id, user.is_verified_seller)}
                                                disabled={processing === user.id}
                                                className={`p-2 rounded-lg transition-colors ${user.is_verified_seller
                                                    ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                                                    : 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30'
                                                    }`}
                                                title={user.is_verified_seller ? 'Remove verification' : 'Verify seller'}
                                            >
                                                <FiCheckCircle className="w-5 h-5" />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleToggleAdmin(user.id, user.is_admin || false)}
                                                disabled={processing === user.id}
                                                className={`p-2 rounded-lg transition-colors ${user.is_admin
                                                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                                                    : 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30'
                                                    }`}
                                                title={user.is_admin ? 'Remove admin' : 'Make admin'}
                                            >
                                                <FiShield className="w-5 h-5" />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                            No users found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
