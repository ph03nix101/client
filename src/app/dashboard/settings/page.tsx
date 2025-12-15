'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { usersApi, authApi } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { FiMail, FiBell, FiShield, FiTrash2, FiAlertTriangle, FiCheck, FiLock, FiX, FiEye, FiEyeOff } from 'react-icons/fi';

export default function SettingsPage() {
    const router = useRouter();
    const { logout } = useAuth();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    // Change password state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordChanging, setPasswordChanging] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setSaving(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setDeleteError('Please enter your password');
            return;
        }

        setDeleting(true);
        setDeleteError(null);

        try {
            await usersApi.deleteAccount(deletePassword);
            await logout();
            router.push('/');
        } catch (err: any) {
            setDeleteError(err.response?.data?.message || 'Failed to delete account. Please check your password.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
                    {success && (
                        <span className="flex items-center gap-2 text-green-500 text-sm">
                            <FiCheck className="w-4 h-4" />
                            Settings saved!
                        </span>
                    )}
                </div>

                {/* Notifications */}
                <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                    <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <FiBell className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h2>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage how you receive notifications</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Email Notifications</h3>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Receive notifications about messages and offers</p>
                            </div>
                            <button
                                onClick={() => setEmailNotifications(!emailNotifications)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${emailNotifications ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${emailNotifications ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Marketing Emails</h3>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Receive tips and promotional content</p>
                            </div>
                            <button
                                onClick={() => setMarketingEmails(!marketingEmails)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${marketingEmails ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${marketingEmails ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                    <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <FiShield className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Privacy & Security</h2>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage your security preferences</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Change Password</h3>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Update your account password</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setShowPasswordModal(true)}
                            >
                                Change Password
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-xl border border-red-500/30 overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <div className="p-6 border-b border-red-500/30 bg-red-500/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <FiAlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
                                <p className="text-sm text-red-400/70">Irreversible account actions</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Delete Account</h3>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Permanently delete your account and all data</p>
                            </div>
                            <Button
                                variant="outline"
                                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <FiTrash2 className="w-4 h-4" />
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="rounded-xl border max-w-md w-full" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Change Password</h3>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                    setPasswordError(null);
                                    setPasswordSuccess(false);
                                }}
                                className="p-2 rounded-lg hover:bg-gray-500/20 transition-colors"
                            >
                                <FiX className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            </button>
                        </div>

                        {passwordSuccess ? (
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <FiCheck className="w-8 h-8 text-green-500" />
                                </div>
                                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Password Changed</h4>
                                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                                    Your password has been updated successfully.
                                </p>
                                <button
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordSuccess(false);
                                    }}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                            className="w-full pl-10 pr-10 py-2.5 rounded-lg border"
                                            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            {showCurrentPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="w-full pl-10 pr-10 py-2.5 rounded-lg border"
                                            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Minimum 8 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border"
                                            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                </div>

                                {passwordError && (
                                    <p className="text-red-500 text-sm">{passwordError}</p>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowPasswordModal(false);
                                            setCurrentPassword('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                            setPasswordError(null);
                                        }}
                                        className="flex-1 py-2.5 rounded-lg border font-medium"
                                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setPasswordError(null);
                                            if (!currentPassword || !newPassword || !confirmPassword) {
                                                setPasswordError('Please fill in all fields');
                                                return;
                                            }
                                            if (newPassword.length < 8) {
                                                setPasswordError('New password must be at least 8 characters');
                                                return;
                                            }
                                            if (newPassword !== confirmPassword) {
                                                setPasswordError('Passwords do not match');
                                                return;
                                            }
                                            setPasswordChanging(true);
                                            try {
                                                await authApi.changePassword(currentPassword, newPassword);
                                                setPasswordSuccess(true);
                                                setCurrentPassword('');
                                                setNewPassword('');
                                                setConfirmPassword('');
                                            } catch (err: any) {
                                                setPasswordError(err.response?.data?.message || 'Failed to change password');
                                            } finally {
                                                setPasswordChanging(false);
                                            }
                                        }}
                                        disabled={passwordChanging || !currentPassword || !newPassword || !confirmPassword}
                                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {passwordChanging ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="rounded-xl border max-w-md w-full" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between p-4 border-b border-red-500/30 bg-red-500/10">
                            <h3 className="text-lg font-semibold text-red-400">Delete Account</h3>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletePassword('');
                                    setDeleteError(null);
                                }}
                                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                                <FiX className="w-5 h-5 text-red-400" />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-4">
                                <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-400">
                                    This action is <strong>permanent</strong>. All your data, listings, and messages will be deleted.
                                </p>
                            </div>

                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Enter your password to confirm
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Your password"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            {deleteError && (
                                <p className="text-red-500 text-sm mt-2">{deleteError}</p>
                            )}
                        </div>

                        <div className="flex gap-3 p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletePassword('');
                                    setDeleteError(null);
                                }}
                                className="flex-1 py-2.5 rounded-lg border font-medium"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleting || !deletePassword}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete My Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
