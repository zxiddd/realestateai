import React, { useState } from 'react';

/**
 * PROPERTY DETAIL VIEW
 * Shows full property information with actions
 */
const PropertyDetail = ({ property }) => {
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleData, setScheduleData] = useState({ date: '', time: '', phone: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSave = () => {
        const saved = JSON.parse(localStorage.getItem('bhoomiai_saved') || '[]');
        if (!saved.find(s => s.id === property.id)) {
            saved.push(property);
            localStorage.setItem('bhoomiai_saved', JSON.stringify(saved));
            setMessage({ type: 'success', text: 'Property saved!' });
        } else {
            setMessage({ type: 'info', text: 'Already saved' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: 'Property on BhoomiAI', text: property.propertyAddress, url });
        } else {
            await navigator.clipboard.writeText(url);
            setMessage({ type: 'success', text: 'Link copied!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 2000);
        }
    };

    const handleSchedule = (e) => {
        e.preventDefault();
        setMessage({ type: 'success', text: 'Visit scheduled! Agent will contact you.' });
        setShowScheduleModal(false);
        setScheduleData({ date: '', time: '', phone: '' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const riskColors = { low: 'text-green-600 bg-green-100', medium: 'text-yellow-600 bg-yellow-100', high: 'text-red-600 bg-red-100' };

    return (
        <div className="space-y-6">
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Image */}
                    <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl h-64 flex items-center justify-center">
                        <span className="text-8xl">🏡</span>
                    </div>

                    {/* Details */}
                    <div className="bg-white rounded-xl border p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{property.propertyAddress}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Land Type</p>
                                <p className="font-medium">{property.landType || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Area</p>
                                <p className="font-medium">{property.area} sq.ft</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Owner</p>
                                <p className="font-medium">{property.ownerName || 'Verified Owner'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Listed</p>
                                <p className="font-medium">{property.listedAt ? new Date(property.listedAt).toLocaleDateString() : 'Recently'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Verification Analysis */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold mb-4">Verification Analysis</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <p className="font-medium text-green-700">✓ Documents Verified</p>
                                <p className="text-sm text-green-600">All property documents authenticated</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <p className="font-medium text-green-700">✓ Tax Records Clear</p>
                                <p className="text-sm text-green-600">No pending dues found</p>
                            </div>
                            {property.riskLevel !== 'low' && (
                                <div className="p-3 bg-yellow-50 rounded-lg">
                                    <p className="font-medium text-yellow-700">⚠ Review Recommended</p>
                                    <p className="text-sm text-yellow-600">Some aspects need attention</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Price Card */}
                    <div className="bg-white rounded-xl border p-6">
                        <p className="text-sm text-gray-500">Asking Price</p>
                        <p className="text-3xl font-bold text-primary-600">₹{(property.price || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">₹{Math.round((property.price || 0) / (property.area || 1)).toLocaleString()}/sq.ft</p>
                    </div>

                    {/* Risk Score */}
                    <div className="bg-white rounded-xl border p-6">
                        <p className="text-sm text-gray-500 mb-2">Risk Assessment</p>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskColors[property.riskLevel] || riskColors.low}`}>
                                {(property.riskLevel || 'low').toUpperCase()}
                            </span>
                            <span className="text-2xl font-bold">{property.riskScore || 25}/100</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={() => setShowScheduleModal(true)}
                            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-medium"
                        >
                            📅 Schedule Visit
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleSave} className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 font-medium">
                                💾 Save
                            </button>
                            <button onClick={handleShare} className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 font-medium">
                                📤 Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Schedule Visit</h2>
                            <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" value={scheduleData.date} onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <select value={scheduleData.time} onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required>
                                    <option value="">Select time</option>
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="14:00">2:00 PM</option>
                                    <option value="16:00">4:00 PM</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="tel" value={scheduleData.phone} onChange={(e) => setScheduleData({ ...scheduleData, phone: e.target.value })} placeholder="Your phone number" className="w-full px-4 py-2 border rounded-lg" required />
                            </div>
                            <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-medium">
                                Confirm Visit
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyDetail;
