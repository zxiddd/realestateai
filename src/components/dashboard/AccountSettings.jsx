import React, { useState } from 'react';

/**
 * ACCOUNT SETTINGS TAB
 * User profile and account management
 * Mobile responsive with horizontal tabs on mobile
 */
const AccountSettings = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        userType: user?.userType || 'buyer',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match!' });
            return;
        }
        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters!' });
            return;
        }
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const getUserTypeLabel = (type) => {
        const labels = {
            buyer: 'Land Buyer',
            bank: 'Bank / NBFC',
            advocate: 'Advocate',
            government: 'Government',
        };
        return labels[type] || type;
    };

    const menuItems = [
        { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
        { id: 'notifications', label: 'Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your profile and preferences</p>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="lg:hidden mb-4">
                <div className="flex bg-white rounded-xl border border-gray-200 p-1 overflow-x-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap ${activeSection === item.id
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600'
                                }`}
                        >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Desktop Sidebar - Hidden on mobile */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeSection === item.id
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <hr className="my-4" />

                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    {/* Message Alert */}
                    {message.text && (
                        <div
                            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                            <div className="flex justify-between items-center mb-4 sm:mb-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Profile Information</h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleProfileUpdate}>
                                <div className="space-y-4 sm:space-y-6">
                                    {/* Avatar */}
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                                            {profileData.fullName?.charAt(0) || 'U'}
                                        </div>
                                        {isEditing && (
                                            <button
                                                type="button"
                                                className="text-xs sm:text-sm text-primary-600 hover:text-primary-700"
                                            >
                                                Change Photo
                                            </button>
                                        )}
                                    </div>

                                    {/* Fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Full Name</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={profileData.fullName}
                                                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                                                />
                                            ) : (
                                                <p className="text-sm sm:text-base text-gray-900">{profileData.fullName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email Address</label>
                                            <p className="text-sm sm:text-base text-gray-900">{profileData.email}</p>
                                            <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Phone Number</label>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                                                />
                                            ) : (
                                                <p className="text-sm sm:text-base text-gray-900">{profileData.phone || 'Not provided'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Account Type</label>
                                            <p className="text-sm sm:text-base text-gray-900">{getUserTypeLabel(profileData.userType)}</p>
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Security Section */}
                    {activeSection === 'security' && (
                        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Change Password</h2>

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm sm:text-base"
                                >
                                    Update Password
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Notifications Section */}
                    {activeSection === 'notifications' && (
                        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Notification Preferences</h2>

                            <div className="space-y-3 sm:space-y-4">
                                {[
                                    { id: 'email_verification', label: 'Verification Updates', description: 'When property verification is complete' },
                                    { id: 'email_queries', label: 'Query Responses', description: 'When an advocate responds' },
                                    { id: 'email_marketplace', label: 'Marketplace Alerts', description: 'New properties matching preferences' },
                                    { id: 'email_marketing', label: 'Marketing Emails', description: 'News and promotional offers' },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm sm:text-base font-medium text-gray-900">{item.label}</p>
                                            <p className="text-xs sm:text-sm text-gray-500 truncate">{item.description}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mobile Logout Button */}
                    <div className="lg:hidden mt-4">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-red-200 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
