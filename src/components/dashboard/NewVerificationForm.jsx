import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * SIMPLIFIED VERIFICATION FORM
 * Upload PDFs + Basic Property Details → Get Mock Report
 */
const NewVerificationForm = ({ onSubmit, onCancel }) => {
    const [documents, setDocuments] = useState({
        pattadar_passbook: null,
        ror_adangal: null,
        encumbrance_certificate: null,
    });
    const [formData, setFormData] = useState({
        surveyNumber: '',
        village: '',
        mandal: '',
        district: '',
        ownerName: '',
        landType: 'agricultural'
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

    const documentFields = [
        { key: 'pattadar_passbook', title: 'Pattadar Passbook / Title Deed', icon: '📜', required: true },
        { key: 'ror_adangal', title: 'Record of Rights (ROR / Adangal)', icon: '📋', required: true },
        { key: 'encumbrance_certificate', title: 'Encumbrance Certificate (EC)', icon: '🔒', required: true },
    ];

    const handleFileChange = (key, file) => {
        if (file && file.type !== 'application/pdf') {
            setError('Please upload PDF files only');
            return;
        }
        setError('');
        setDocuments(prev => ({ ...prev, [key]: file }));
    };

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const isValid = documents.pattadar_passbook && documents.ror_adangal && documents.encumbrance_certificate;

    const handleSubmit = async () => {
        if (!isValid) {
            setError('Please upload all required documents');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const form = new FormData();
            const docTypes = [];

            Object.entries(documents).forEach(([key, file]) => {
                if (file) {
                    form.append('documents', file);
                    docTypes.push(key);
                }
            });

            form.append('documentTypes', JSON.stringify(docTypes));
            form.append('surveyNumber', formData.surveyNumber);
            form.append('village', formData.village);
            form.append('mandal', formData.mandal);
            form.append('district', formData.district);
            form.append('ownerName', formData.ownerName);
            form.append('landType', formData.landType);

            const response = await fetch(`${API_BASE}/verifications`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Upload failed');

            setResult(data.data);
            if (onSubmit) onSubmit(data.data);

        } catch (err) {
            setError(err.message || 'Failed to upload documents');
        } finally {
            setIsProcessing(false);
        }
    };

    // Result Screen
    if (result) {
        const vData = result.verification_data;
        const riskColors = {
            LOW: 'bg-green-100 text-green-800',
            MEDIUM: 'bg-yellow-100 text-yellow-800',
            HIGH: 'bg-red-100 text-red-800',
        };

        return (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        ✅ Documents Uploaded Successfully
                    </h2>
                    <p className="text-green-100 mt-1">Verification report generated</p>
                </div>

                <div className="p-6 border-b">
                    <span className={`px-4 py-2 rounded-full font-semibold ${riskColors[vData.final_summary?.risk_level] || riskColors.MEDIUM}`}>
                        {vData.final_summary?.risk_level || 'PENDING'} RISK
                    </span>
                    <p className="mt-3 text-gray-600">{vData.final_summary?.summary}</p>
                </div>

                <div className="p-6 border-b">
                    <h3 className="font-semibold mb-4">📄 Uploaded Documents</h3>
                    <div className="space-y-2">
                        {vData.metadata?.documents_uploaded?.map((doc, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-2xl">📎</span>
                                <div>
                                    <p className="font-medium capitalize">{doc.type.replace(/_/g, ' ')}</p>
                                    <p className="text-sm text-gray-500">{doc.filename}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 flex gap-4">
                    <button onClick={onCancel} className="flex-1 py-3 bg-white border rounded-xl font-medium">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                <h2 className="text-xl font-bold">📄 Property Verification</h2>
                <p className="text-primary-100 mt-1">Upload documents & property details</p>
            </div>

            {error && (
                <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    ⚠️ {error}
                </div>
            )}

            {/* Property Details */}
            <div className="p-6 border-b">
                <h3 className="font-semibold mb-4">Property Information (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        name="surveyNumber"
                        placeholder="Survey Number"
                        value={formData.surveyNumber}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg"
                    />
                    <input
                        name="ownerName"
                        placeholder="Owner Name"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg"
                    />
                    <input
                        name="village"
                        placeholder="Village"
                        value={formData.village}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg"
                    />
                    <input
                        name="mandal"
                        placeholder="Mandal"
                        value={formData.mandal}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg"
                    />
                    <input
                        name="district"
                        placeholder="District"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg"
                    />
                    <select
                        name="landType"
                        value={formData.landType}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg"
                    >
                        <option value="agricultural">Agricultural</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                    </select>
                </div>
            </div>

            {/* Document Uploads */}
            <div className="p-6 space-y-4">
                <h3 className="font-semibold">Upload Documents (PDF only)</h3>
                {documentFields.map((field) => (
                    <div
                        key={field.key}
                        className={`border-2 rounded-xl p-4 ${documents[field.key] ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">{field.icon}</span>
                            <div className="flex-1">
                                <h4 className="font-medium">{field.title}</h4>
                                {documents[field.key] ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-green-600">✓ {documents[field.key].name}</span>
                                        <button onClick={() => setDocuments(prev => ({ ...prev, [field.key]: null }))} className="text-red-500 text-sm">
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <label className="inline-block mt-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg cursor-pointer hover:bg-primary-100">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => handleFileChange(field.key, e.target.files[0])}
                                            className="hidden"
                                        />
                                        Choose PDF
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 border-t flex gap-4">
                <button onClick={onCancel} disabled={isProcessing} className="flex-1 py-3 border rounded-xl font-medium">
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!isValid || isProcessing}
                    className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                    {isProcessing ? 'Uploading...' : '🔍 Submit for Verification'}
                </button>
            </div>
        </div>
    );
};

export default NewVerificationForm;
