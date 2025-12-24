import React, { useState, useEffect } from 'react';
import NewVerificationForm from './NewVerificationForm';
import VerificationReport from './VerificationReport';

/**
 * PROPERTY VERIFICATION TAB
 * Lists all verifications and allows new submissions
 */
const PropertyVerification = ({ user, onNavigateToAdvocate }) => {
    const [view, setView] = useState('list');
    const [verifications, setVerifications] = useState([]);
    const [selectedVerification, setSelectedVerification] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        fetchVerifications();
    }, []);

    const fetchVerifications = async () => {
        try {
            const res = await fetch(`${API_BASE}/verifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setVerifications(data.data);
            }
        } catch (error) {
            console.error('Fetch verifications error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewVerification = async (result) => {
        // Refresh list after new verification
        await fetchVerifications();
        setView('list');
    };

    const handleViewReport = (verification) => {
        setSelectedVerification(verification);
        setView('report');
    };

    const getRiskBadge = (riskLevel) => {
        const colors = {
            LOW: 'bg-green-100 text-green-800',
            MEDIUM: 'bg-yellow-100 text-yellow-800',
            HIGH: 'bg-red-100 text-red-800',
        };
        const icons = { LOW: '✅', MEDIUM: '⚠️', HIGH: '🚨' };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${colors[riskLevel] || colors.MEDIUM}`}>
                <span>{icons[riskLevel] || '⚠️'}</span>
                {riskLevel || 'PENDING'}
            </span>
        );
    };

    if (view === 'new') {
        return (
            <div>
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                    ← Back to Verifications
                </button>
                <NewVerificationForm onSubmit={handleNewVerification} onCancel={() => setView('list')} />
            </div>
        );
    }

    if (view === 'report' && selectedVerification) {
        const vData = selectedVerification.verification_data;
        return (
            <div>
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                    ← Back to Verifications
                </button>
                <VerificationReport
                    verification={{
                        id: selectedVerification.id,
                        propertyAddress: `${vData.extracted_data?.land_details?.survey_number || 'N/A'}, ${vData.extracted_data?.land_details?.village || ''}, ${vData.extracted_data?.land_details?.mandal || ''}, ${vData.extracted_data?.land_details?.district || ''}`,
                        ownerName: vData.extracted_data?.owner_details?.owner_name || 'Not extracted',
                        riskLevel: vData.final_summary?.risk_level?.toLowerCase() || 'medium',
                        riskScore: vData.final_summary?.risk_score || 50,
                        completedAt: new Date(selectedVerification.created_at).toLocaleDateString(),
                        verificationData: vData,
                    }}
                    onListOnMarketplace={() => setView('list')}
                    onConsultAdvocate={onNavigateToAdvocate}
                />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Property Verification</h1>
                    <p className="text-gray-600 mt-1">AI-powered document analysis and risk assessment</p>
                </div>
                <button
                    onClick={() => setView('new')}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 font-medium shadow-lg shadow-primary-500/25"
                >
                    <span className="text-xl">+</span>
                    New Verification
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border p-4">
                    <p className="text-3xl font-bold text-gray-900">{verifications.length}</p>
                    <p className="text-sm text-gray-500">Total Verifications</p>
                </div>
                <div className="bg-white rounded-xl border p-4">
                    <p className="text-3xl font-bold text-green-600">
                        {verifications.filter(v => v.verification_data?.final_summary?.risk_level === 'LOW').length}
                    </p>
                    <p className="text-sm text-gray-500">Low Risk</p>
                </div>
                <div className="bg-white rounded-xl border p-4">
                    <p className="text-3xl font-bold text-red-600">
                        {verifications.filter(v => v.verification_data?.final_summary?.risk_level === 'HIGH').length}
                    </p>
                    <p className="text-sm text-gray-500">High Risk</p>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="bg-white rounded-xl border p-12 text-center">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading verifications...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && verifications.length === 0 && (
                <div className="bg-white rounded-xl border p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-4xl">📄</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No verifications yet</h3>
                    <p className="text-gray-500 mb-6">Upload your property documents to get AI-powered verification</p>
                    <button
                        onClick={() => setView('new')}
                        className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 font-medium"
                    >
                        <span>+</span> Start Verification
                    </button>
                </div>
            )}

            {/* Verification List */}
            {!loading && verifications.length > 0 && (
                <div className="space-y-4">
                    {verifications.map((v) => {
                        const vData = v.verification_data;
                        const landDetails = vData.extracted_data?.land_details || {};

                        return (
                            <div
                                key={v.id}
                                className="bg-white rounded-xl border p-5 hover:shadow-lg transition-all cursor-pointer"
                                onClick={() => handleViewReport(v)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {landDetails.survey_number ? `Survey ${landDetails.survey_number}` : 'Property Verification'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {[landDetails.village, landDetails.mandal, landDetails.district].filter(Boolean).join(', ') || 'Location not extracted'}
                                        </p>
                                    </div>
                                    {getRiskBadge(vData.final_summary?.risk_level)}
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex gap-4 text-gray-500">
                                        <span>👤 {vData.extracted_data?.owner_details?.owner_name || 'Owner not extracted'}</span>
                                        <span>📅 {new Date(v.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <span className="text-primary-600 font-medium">View Report →</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PropertyVerification;
