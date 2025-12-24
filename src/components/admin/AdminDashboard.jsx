import React, { useState, useEffect } from 'react';

/**
 * ADMIN DASHBOARD
 * Super admin panel for managing users, properties, and queries
 */
const AdminDashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [properties, setProperties] = useState([]);
    const [queries, setQueries] = useState([]);
    const [advocates, setAdvocates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const API_BASE = 'http://localhost:3000/api';

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'properties') fetchProperties();
        if (activeTab === 'queries') fetchQueries();
        if (activeTab === 'advocates') fetchAdvocates();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setStats(data.data);
        } catch (error) {
            console.error('Fetch stats error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setUsers(data.data);
        } catch (error) {
            console.error('Fetch users error:', error);
        }
    };

    const fetchProperties = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/properties`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setProperties(data.data);
        } catch (error) {
            console.error('Fetch properties error:', error);
        }
    };

    const fetchQueries = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/queries`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setQueries(data.data);
        } catch (error) {
            console.error('Fetch queries error:', error);
        }
    };

    const fetchAdvocates = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/advocates`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setAdvocates(data.data);
        } catch (error) {
            console.error('Fetch advocates error:', error);
        }
    };

    const toggleUserStatus = async (userId, isActive) => {
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !isActive })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'User status updated' });
                fetchUsers();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update user' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const toggleAdvocateVerification = async (advocateId, verified) => {
        try {
            const res = await fetch(`${API_BASE}/admin/advocates/${advocateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ verified: !verified })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Advocate status updated' });
                fetchAdvocates();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update advocate' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
        { id: 'properties', label: 'Properties', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { id: 'queries', label: 'Queries', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'advocates', label: 'Advocates', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-gray-900 text-white px-4 sm:px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">
                            <span className="text-red-500">Admin</span> Panel
                        </h1>
                        <p className="text-sm text-gray-400">BhoomiAI Management</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-300 hidden sm:block">{user?.fullName}</span>
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <nav className="flex overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                </svg>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Message Alert */}
            {message.text && (
                <div className={`max-w-7xl mx-auto px-4 sm:px-6 mt-4`}>
                    <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                </div>
            )}

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                        {loading ? (
                            <div className="text-gray-500">Loading stats...</div>
                        ) : stats ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-6 rounded-xl border">
                                    <p className="text-3xl font-bold text-primary-600">{stats.totalUsers}</p>
                                    <p className="text-sm text-gray-500">Total Users</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl border">
                                    <p className="text-3xl font-bold text-blue-600">{stats.totalProperties}</p>
                                    <p className="text-sm text-gray-500">Properties</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl border">
                                    <p className="text-3xl font-bold text-green-600">{stats.activeListings}</p>
                                    <p className="text-sm text-gray-500">Active Listings</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl border">
                                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingQueries}</p>
                                    <p className="text-sm text-gray-500">Pending Queries</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700">
                                Unable to load stats. Make sure the database schema is updated with is_admin column.
                            </div>
                        )}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">User Management</h2>
                        <div className="bg-white rounded-xl border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Name</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Email</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Type</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Status</th>
                                            <th className="text-right px-4 py-3 text-sm font-semibold text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm">{u.full_name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                                                <td className="px-4 py-3 text-sm capitalize">{u.user_type}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {u.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => toggleUserStatus(u.id, u.is_active)}
                                                        className={`text-sm ${u.is_active ? 'text-red-600' : 'text-green-600'}`}
                                                    >
                                                        {u.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Properties Tab */}
                {activeTab === 'properties' && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Property Management</h2>
                        <div className="bg-white rounded-xl border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Survey No</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Location</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Owner</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Status</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Risk</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {properties.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium">{p.survey_no}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{p.village}, {p.district}</td>
                                                <td className="px-4 py-3 text-sm">{p.owner_name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs ${p.status === 'verified' ? 'bg-green-100 text-green-700' :
                                                        p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {p.risk_score ? `${p.risk_score}%` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Queries Tab */}
                {activeTab === 'queries' && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Legal Queries</h2>
                        <div className="space-y-4">
                            {queries.map((q) => (
                                <div key={q.id} className="bg-white rounded-xl border p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900">{q.question?.split('\n')[0]}</p>
                                            <p className="text-sm text-gray-500">By: {q.user_name} ({q.user_email})</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs ${q.status === 'answered' ? 'bg-green-100 text-green-700' :
                                            'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {q.status}
                                        </span>
                                    </div>
                                    {q.advocate_name && (
                                        <p className="text-sm text-gray-600">Answered by: {q.advocate_name}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Advocates Tab */}
                {activeTab === 'advocates' && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Advocate Management</h2>
                        <div className="bg-white rounded-xl border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Name</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Email</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Responses</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Status</th>
                                            <th className="text-right px-4 py-3 text-sm font-semibold text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {advocates.map((a) => (
                                            <tr key={a.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium">{a.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{a.email}</td>
                                                <td className="px-4 py-3 text-sm">{a.response_count || 0}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs ${a.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {a.verified ? 'Verified' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => toggleAdvocateVerification(a.id, a.verified)}
                                                        className={`text-sm ${a.verified ? 'text-yellow-600' : 'text-green-600'}`}
                                                    >
                                                        {a.verified ? 'Unverify' : 'Verify'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
