import React, { useState, useEffect } from 'react';

/**
 * ADVOCATE DASHBOARD
 * Dashboard for advocates to view and respond to legal queries
 */
const AdvocateDashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('pending');
    const [queries, setQueries] = useState([]);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const API_BASE = 'http://localhost:3000/api';

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        try {
            const res = await fetch(`${API_BASE}/queries`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setQueries(data.data);
        } catch (error) {
            console.error('Fetch queries error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitResponse = async (e) => {
        e.preventDefault();
        if (!response.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/queries/${selectedQuery.id}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ answer: response })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Response submitted successfully!' });
                setSelectedQuery(null);
                setResponse('');
                fetchQueries();
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to submit response' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to submit response' });
        } finally {
            setSubmitting(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const pendingQueries = queries.filter(q => q.status === 'pending');
    const answeredQueries = queries.filter(q => q.status === 'answered');

    const displayQueries = activeTab === 'pending' ? pendingQueries : answeredQueries;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-green-900 text-white px-4 sm:px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">
                            <span className="text-green-400">Advocate</span> Portal
                        </h1>
                        <p className="text-sm text-green-200">BhoomiAI Legal Support</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-green-200 hidden sm:block">{user?.fullName}</span>
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 sm:p-6 rounded-xl border">
                        <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{pendingQueries.length}</p>
                        <p className="text-sm text-gray-500">Pending Queries</p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl border">
                        <p className="text-2xl sm:text-3xl font-bold text-green-600">{answeredQueries.length}</p>
                        <p className="text-sm text-gray-500">Answered</p>
                    </div>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm ${activeTab === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-white text-gray-600'
                            }`}
                    >
                        Pending ({pendingQueries.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('answered')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm ${activeTab === 'answered' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-600'
                            }`}
                    >
                        Answered ({answeredQueries.length})
                    </button>
                </div>

                {/* Query Response Modal */}
                {selectedQuery && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-lg font-bold text-gray-900">{selectedQuery.subject}</h2>
                                    <button onClick={() => setSelectedQuery(null)} className="text-gray-400 hover:text-gray-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">From: {selectedQuery.user_name || 'User'}</p>
                            </div>
                            <div className="p-6">
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <p className="text-gray-700">{selectedQuery.description}</p>
                                </div>

                                {selectedQuery.status === 'pending' ? (
                                    <form onSubmit={handleSubmitResponse}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
                                        <textarea
                                            value={response}
                                            onChange={(e) => setResponse(e.target.value)}
                                            rows={6}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                            placeholder="Provide your legal advice..."
                                            required
                                        />
                                        <div className="flex justify-end gap-3 mt-4">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedQuery(null)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {submitting ? 'Submitting...' : 'Submit Response'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <p className="text-sm font-medium text-green-700 mb-2">Your Response:</p>
                                        <p className="text-gray-700">{selectedQuery.answer}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Queries List */}
                {loading ? (
                    <div className="text-gray-500">Loading queries...</div>
                ) : displayQueries.length === 0 ? (
                    <div className="bg-white rounded-xl border p-8 text-center">
                        <p className="text-gray-500">No {activeTab} queries</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayQueries.map((query) => (
                            <div
                                key={query.id}
                                onClick={() => setSelectedQuery(query)}
                                className="bg-white rounded-xl border p-4 sm:p-6 cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900">{query.subject}</h3>
                                    <span className={`px-2 py-1 rounded text-xs ${query.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {query.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{query.description}</p>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>From: {query.user_name || 'User'}</span>
                                    <span>{new Date(query.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvocateDashboard;
