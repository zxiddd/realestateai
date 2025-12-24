import React, { useState, useEffect } from 'react';

/**
 * ADVOCATE TAB (User Dashboard)
 * Legal query submission and response system
 * Works with localStorage fallback
 */
const Advocate = ({ user }) => {
    const [view, setView] = useState('list');
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [newQuery, setNewQuery] = useState({
        subject: '',
        description: '',
    });

    useEffect(() => {
        loadQueries();
    }, []);

    const loadQueries = () => {
        const saved = localStorage.getItem('bhoomiai_queries');
        if (saved) {
            try {
                setQueries(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load queries');
            }
        }
    };

    const saveQueries = (newQueries) => {
        localStorage.setItem('bhoomiai_queries', JSON.stringify(newQueries));
        setQueries(newQueries);
    };

    const handleSubmitQuery = (e) => {
        e.preventDefault();
        if (!newQuery.subject.trim() || !newQuery.description.trim()) {
            setMessage({ type: 'error', text: 'Please fill all fields' });
            return;
        }

        setSubmitting(true);

        const query = {
            id: 'query_' + Date.now(),
            subject: newQuery.subject,
            description: newQuery.description,
            status: 'pending',
            createdAt: new Date().toISOString(),
            answer: null,
            advocateName: null,
            answeredAt: null,
        };

        const updated = [query, ...queries];
        saveQueries(updated);

        // Simulate advocate response after 5 seconds (for demo)
        setTimeout(() => {
            const mockResponses = [
                "Based on the documents you've described, this appears to be a straightforward case. I recommend getting an EC for the last 30 years to ensure there are no hidden encumbrances.",
                "Thank you for your query. The property documents seem to be in order. However, I suggest verifying the boundary measurements with a licensed surveyor before proceeding.",
                "After reviewing your concern, I advise you to check with the local sub-registrar office for any pending mutations. This is a common issue that can be resolved easily.",
            ];

            setQueries(prev => {
                const withResponse = prev.map(q =>
                    q.id === query.id
                        ? {
                            ...q,
                            status: 'answered',
                            answer: mockResponses[Math.floor(Math.random() * mockResponses.length)],
                            advocateName: 'Adv. Rajesh Kumar',
                            answeredAt: new Date().toISOString(),
                        }
                        : q
                );
                localStorage.setItem('bhoomiai_queries', JSON.stringify(withResponse));
                return withResponse;
            });
        }, 5000);

        setMessage({ type: 'success', text: 'Query submitted! An advocate will respond soon.' });
        setNewQuery({ subject: '', description: '' });
        setView('list');
        setSubmitting(false);

        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleViewQuery = (query) => {
        setSelectedQuery(query);
        setView('detail');
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            answered: 'bg-green-100 text-green-700',
            closed: 'bg-gray-100 text-gray-700',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // New Query Form
    if (view === 'new') {
        return (
            <div>
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                    ← Back to Queries
                </button>

                <div className="bg-white rounded-xl border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Submit Legal Query</h2>
                    <p className="text-gray-600 mb-6">Get expert advice from verified advocates</p>

                    <form onSubmit={handleSubmitQuery} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                            <input
                                type="text"
                                value={newQuery.subject}
                                onChange={(e) => setNewQuery({ ...newQuery, subject: e.target.value })}
                                placeholder="e.g., Property title verification query"
                                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                            <textarea
                                value={newQuery.description}
                                onChange={(e) => setNewQuery({ ...newQuery, description: e.target.value })}
                                placeholder="Describe your legal query in detail..."
                                rows={6}
                                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setView('list')}
                                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Query'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Query Detail View
    if (view === 'detail' && selectedQuery) {
        return (
            <div>
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                    ← Back to Queries
                </button>

                <div className="bg-white rounded-xl border p-6 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{selectedQuery.subject}</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Submitted on {new Date(selectedQuery.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        {getStatusBadge(selectedQuery.status)}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Your Query</h3>
                        <p className="text-gray-700">{selectedQuery.description}</p>
                    </div>

                    {selectedQuery.answer && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">⚖️</span>
                                <h3 className="font-medium text-green-800">Advocate Response</h3>
                            </div>
                            <p className="text-gray-700 mb-3">{selectedQuery.answer}</p>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>By: {selectedQuery.advocateName}</span>
                                <span>{new Date(selectedQuery.answeredAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    )}

                    {selectedQuery.status === 'pending' && (
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <p className="text-yellow-700 flex items-center gap-2">
                                <span className="animate-pulse">⏳</span>
                                Waiting for advocate response. You will be notified when answered.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Query List
    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Legal Consultation</h1>
                    <p className="text-sm text-gray-600">Get expert advice from verified advocates</p>
                </div>
                <button
                    onClick={() => setView('new')}
                    className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 font-medium w-full sm:w-auto"
                >
                    ⚖️ New Query
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl border p-4">
                    <p className="text-2xl font-bold text-yellow-600">{queries.filter(q => q.status === 'pending').length}</p>
                    <p className="text-sm text-gray-500">Pending</p>
                </div>
                <div className="bg-white rounded-xl border p-4">
                    <p className="text-2xl font-bold text-green-600">{queries.filter(q => q.status === 'answered').length}</p>
                    <p className="text-sm text-gray-500">Answered</p>
                </div>
            </div>

            {/* Query List */}
            {queries.length === 0 ? (
                <div className="bg-white rounded-xl border p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">⚖️</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No queries yet</h3>
                    <p className="text-gray-500 mb-6">Submit your first legal query to get expert advice</p>
                    <button
                        onClick={() => setView('new')}
                        className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium"
                    >
                        ⚖️ New Query
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {queries.map((query) => (
                        <div
                            key={query.id}
                            onClick={() => handleViewQuery(query)}
                            className="bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-900">{query.subject}</h3>
                                {getStatusBadge(query.status)}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{query.description}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                                {query.status === 'answered' && <span className="text-green-600">Response available →</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Advocate;
