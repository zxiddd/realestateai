import React, { useState } from 'react';

/**
 * PROFESSIONAL PROPERTY VERIFICATION FORM
 * PDF Upload → Backend OCR → JSON Storage → AI Agent Verification
 */
const NewVerificationForm = ({ onSubmit, onCancel }) => {
    const [documents, setDocuments] = useState({
        pattadar_passbook: null,
        ror_adangal: null,
        encumbrance_certificate: null,
        chain_of_title: null,
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ step: 0, message: '' });
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

    const documentFields = [
        {
            key: 'pattadar_passbook',
            title: 'Pattadar Passbook / Title Deed',
            description: 'Primary ownership document containing owner name, survey number, and land details',
            required: true,
            icon: '📜',
        },
        {
            key: 'ror_adangal',
            title: 'Record of Rights (ROR / Adangal / Pahani)',
            description: 'Revenue document confirming ownership history and cultivation details',
            required: true,
            icon: '📋',
        },
        {
            key: 'encumbrance_certificate',
            title: 'Encumbrance Certificate (EC - 30 Years)',
            description: 'Document showing any loans, mortgages, or liens on the property',
            required: true,
            icon: '🔒',
        },
        {
            key: 'chain_of_title',
            title: 'Chain of Title Documents',
            description: 'Previous sale deeds, gift deeds, partition deeds, or inheritance documents',
            required: false,
            icon: '📚',
        },
    ];

    const handleFileChange = (key, file) => {
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Please upload only PDF files');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setError('');
            setDocuments(prev => ({ ...prev, [key]: file }));
        }
    };

    const removeFile = (key) => {
        setDocuments(prev => ({ ...prev, [key]: null }));
    };

    const isValid = documents.pattadar_passbook && documents.ror_adangal && documents.encumbrance_certificate;

    const handleSubmit = async () => {
        if (!isValid) {
            setError('Please upload all required documents');
            return;
        }

        setIsProcessing(true);
        setError('');
        setProgress({ step: 1, message: 'Uploading documents...' });

        try {
            const formData = new FormData();
            const docTypes = [];

            Object.entries(documents).forEach(([key, file]) => {
                if (file) {
                    formData.append('documents', file);
                    docTypes.push(key);
                }
            });

            formData.append('documentTypes', JSON.stringify(docTypes));

            setProgress({ step: 2, message: 'Extracting text from PDFs...' });

            const response = await fetch('http://localhost:3000/api/verifications', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            setProgress({ step: 3, message: 'AI agents analyzing documents...' });

            // Small delay to show the analysis step
            await new Promise(r => setTimeout(r, 1000));

            setProgress({ step: 4, message: 'Verification complete!' });
            setResult(data.data);

            // Call parent callback
            if (onSubmit) {
                onSubmit(data.data);
            }

        } catch (err) {
            console.error('Verification error:', err);
            setError(err.message || 'Failed to process documents. Please try again.');
            setIsProcessing(false);
        }
    };

    // Show result screen
    if (result) {
        const vData = result.verification_data;
        const riskColors = {
            LOW: 'bg-green-100 text-green-800 border-green-200',
            MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            HIGH: 'bg-red-100 text-red-800 border-red-200',
        };

        return (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Success Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-2xl">✓</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Verification Complete</h2>
                            <p className="text-green-100">Property analysis has been generated</p>
                        </div>
                    </div>
                </div>

                {/* Risk Badge */}
                <div className="p-6 border-b">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${riskColors[vData.final_summary?.risk_level] || riskColors.MEDIUM}`}>
                        <span className="text-lg">
                            {vData.final_summary?.risk_level === 'LOW' ? '✅' : vData.final_summary?.risk_level === 'HIGH' ? '🚨' : '⚠️'}
                        </span>
                        <span className="font-semibold">{vData.final_summary?.risk_level || 'MEDIUM'} RISK</span>
                        <span className="text-sm opacity-75">Score: {vData.final_summary?.risk_score || 0}/100</span>
                    </div>
                    <p className="mt-3 text-gray-600">{vData.final_summary?.summary}</p>
                </div>

                {/* Extracted Data */}
                <div className="p-6 border-b">
                    <h3 className="font-semibold text-gray-900 mb-4">📄 Extracted Property Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-gray-500">Survey Number</span>
                            <p className="font-medium">{vData.extracted_data?.land_details?.survey_number || 'Not found'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-gray-500">Owner Name</span>
                            <p className="font-medium">{vData.extracted_data?.owner_details?.owner_name || 'Not found'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-gray-500">Village</span>
                            <p className="font-medium">{vData.extracted_data?.land_details?.village || 'Not found'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-gray-500">Mandal</span>
                            <p className="font-medium">{vData.extracted_data?.land_details?.mandal || 'Not found'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-gray-500">District</span>
                            <p className="font-medium">{vData.extracted_data?.land_details?.district || 'Not found'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-gray-500">Land Extent</span>
                            <p className="font-medium">
                                {vData.extracted_data?.land_details?.extent?.acres || 0} Acres {vData.extracted_data?.land_details?.extent?.guntas || 0} Guntas
                            </p>
                        </div>
                    </div>
                </div>

                {/* Agent Results */}
                <div className="p-6 border-b">
                    <h3 className="font-semibold text-gray-900 mb-4">🤖 AI Agent Analysis</h3>
                    <div className="space-y-3">
                        {Object.entries(vData.agent_results || {}).map(([agent, result]) => (
                            <div key={agent} className={`p-3 rounded-lg border ${result.status === 'passed' ? 'bg-green-50 border-green-200' :
                                    result.status === 'failed' ? 'bg-red-50 border-red-200' :
                                        'bg-yellow-50 border-yellow-200'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <span>{result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️'}</span>
                                    <span className="font-medium capitalize">{agent.replace(/_/g, ' ')}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{result.notes}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Flags */}
                {vData.flags?.length > 0 && (
                    <div className="p-6 border-b bg-red-50">
                        <h3 className="font-semibold text-red-800 mb-2">⚠️ Issues Detected</h3>
                        <ul className="space-y-1">
                            {vData.flags.map((flag, i) => (
                                <li key={i} className="text-sm text-red-700 flex items-center gap-2">
                                    <span>•</span> {flag.replace(/_/g, ' ')}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 bg-gray-50 flex gap-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700"
                    >
                        Download Report
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span>📄</span> Property Verification
                </h2>
                <p className="text-primary-100 mt-1">Upload your property documents for AI-powered verification</p>
            </div>

            {/* Progress */}
            {isProcessing && (
                <div className="p-6 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        <div>
                            <p className="font-medium text-blue-900">{progress.message}</p>
                            <div className="flex gap-1 mt-2">
                                {[1, 2, 3, 4].map(s => (
                                    <div key={s} className={`w-12 h-1 rounded ${s <= progress.step ? 'bg-blue-600' : 'bg-blue-200'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                        <p className="font-medium">Upload Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className="mx-6 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-sm">
                    <strong>📌 Important:</strong> Upload clear, text-based PDFs. Scanned images may not extract properly.
                    All documents are processed securely and not stored after extraction.
                </p>
            </div>

            {/* Document Upload Fields */}
            <div className="p-6 space-y-4">
                {documentFields.map((field) => (
                    <div
                        key={field.key}
                        className={`border-2 rounded-xl p-4 transition-all ${documents[field.key]
                                ? 'border-green-300 bg-green-50'
                                : field.required
                                    ? 'border-gray-200 hover:border-primary-300'
                                    : 'border-dashed border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="text-3xl">{field.icon}</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900">{field.title}</h3>
                                    {field.required ? (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Required</span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">Optional</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mb-3">{field.description}</p>

                                {documents[field.key] ? (
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
                                            <span className="text-green-600">✓</span>
                                            <span className="text-sm text-green-800 font-medium truncate max-w-[200px]">
                                                {documents[field.key].name}
                                            </span>
                                            <span className="text-xs text-green-600">
                                                ({(documents[field.key].size / 1024).toFixed(0)} KB)
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeFile(field.key)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => handleFileChange(field.key, e.target.files[0])}
                                            className="hidden"
                                            disabled={isProcessing}
                                        />
                                        <span>📎</span>
                                        <span className="font-medium">Choose PDF</span>
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 border-t flex gap-4">
                <button
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-white disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!isValid || isProcessing}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            🔍 Verify Documents
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default NewVerificationForm;
