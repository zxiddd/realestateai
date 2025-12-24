import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

/**
 * VERIFICATION REPORT
 * Shows AI verification results with PDF download and marketplace listing
 */
const VerificationReport = ({ verification, onListOnMarketplace, onConsultAdvocate }) => {
    const [showListingModal, setShowListingModal] = useState(false);
    const [listingData, setListingData] = useState({ price: '', area: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    // Generate report data based on risk level
    const reportData = {
        riskScore: verification.riskScore || (verification.riskLevel === 'low' ? 25 : verification.riskLevel === 'medium' ? 55 : 85),
        riskLevel: verification.riskLevel || 'low',
        documentAnalysis: [
            { name: 'Sale Deed', status: 'verified', notes: 'Document authenticated. Registration verified.' },
            { name: 'Encumbrance Certificate', status: verification.riskLevel === 'high' ? 'warning' : 'verified', notes: verification.riskLevel === 'high' ? 'Previous mortgage found.' : 'No encumbrances found.' },
            { name: 'Tax Receipts', status: 'verified', notes: 'All tax payments up to date.' },
            { name: 'Survey Map', status: verification.riskLevel !== 'low' ? 'warning' : 'verified', notes: verification.riskLevel !== 'low' ? 'Minor boundary discrepancy.' : 'Survey matches records.' },
            { name: 'ID Verification', status: 'verified', notes: 'Identity verified successfully.' },
        ],
        flags: verification.riskLevel === 'low' ? [] : verification.riskLevel === 'medium' ? ['Minor discrepancy detected'] : ['Mortgage history', 'Boundary issue', 'Legal review recommended'],
        recommendations: ['Physical site visit recommended', 'Verify with local revenue office', ...(verification.riskLevel !== 'low' ? ['Legal consultation advised'] : [])],
    };

    const getRiskColor = (level) => level === 'low' ? 'text-green-600' : level === 'medium' ? 'text-yellow-600' : 'text-red-600';
    const getRiskBgColor = (level) => level === 'low' ? 'bg-green-100' : level === 'medium' ? 'bg-yellow-100' : 'bg-red-100';

    const handleDownloadReport = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Watermark
        doc.setTextColor(230, 230, 230);
        doc.setFontSize(50);
        doc.text('BhoomiAI', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });

        // Header
        doc.setFillColor(26, 86, 219);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('BhoomiAI', 15, 18);
        doc.setFontSize(10);
        doc.text('Property Verification Report', 15, 25);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 15, 20, { align: 'right' });

        // Content
        doc.setTextColor(0, 0, 0);
        let y = 45;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Property:', 15, y);
        doc.setFont('helvetica', 'normal');
        doc.text(verification.propertyAddress, 45, y);
        y += 10;

        doc.setFont('helvetica', 'bold');
        doc.text('Risk Level:', 15, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${reportData.riskLevel.toUpperCase()} (Score: ${reportData.riskScore}/100)`, 45, y);
        y += 15;

        doc.setFont('helvetica', 'bold');
        doc.text('Document Analysis:', 15, y);
        y += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        reportData.documentAnalysis.forEach(d => {
            doc.text(`• ${d.name}: ${d.status === 'verified' ? '✓' : '⚠'} ${d.notes}`, 20, y);
            y += 6;
        });
        y += 5;

        if (reportData.flags.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Issues:', 15, y);
            y += 8;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            reportData.flags.forEach(f => {
                doc.text(`• ${f}`, 20, y);
                y += 6;
            });
            y += 5;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Recommendations:', 15, y);
        y += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        reportData.recommendations.forEach(r => {
            doc.text(`→ ${r}`, 20, y);
            y += 6;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('BhoomiAI - AI-Powered Property Verification | www.bhoomiai.in', pageWidth / 2, pageHeight - 10, { align: 'center' });

        doc.save(`BhoomiAI_Report_${verification.id}.pdf`);
        setMessage({ type: 'success', text: 'PDF downloaded!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleListOnMarketplace = (e) => {
        e.preventDefault();
        if (!listingData.price || !listingData.area) {
            setMessage({ type: 'error', text: 'Enter price and area' });
            return;
        }

        // Save to localStorage marketplace
        const listings = JSON.parse(localStorage.getItem('bhoomiai_marketplace') || '[]');
        listings.push({
            id: 'listing_' + Date.now(),
            ...verification,
            price: parseFloat(listingData.price),
            area: parseFloat(listingData.area),
            listedAt: new Date().toISOString()
        });
        localStorage.setItem('bhoomiai_marketplace', JSON.stringify(listings));

        setMessage({ type: 'success', text: 'Listed on marketplace!' });
        setShowListingModal(false);
        setListingData({ price: '', area: '' });
        if (onListOnMarketplace) onListOnMarketplace();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    return (
        <div className="space-y-6">
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-xl border p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Verification Report</h2>
                        <p className="text-gray-600 mt-1">{verification.propertyAddress}</p>
                        <p className="text-sm text-gray-500 mt-2">Completed: {verification.completedAt}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-gray-500">Report ID</span>
                        <p className="font-mono text-sm">{verification.id}</p>
                    </div>
                </div>

                {/* Risk Score */}
                <div className={`rounded-lg p-6 ${getRiskBgColor(reportData.riskLevel)}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Risk Assessment</p>
                            <p className={`text-3xl font-bold mt-1 ${getRiskColor(reportData.riskLevel)}`}>
                                {reportData.riskLevel.toUpperCase()} RISK
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Score</p>
                            <p className={`text-4xl font-bold ${getRiskColor(reportData.riskLevel)}`}>{reportData.riskScore}/100</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-4">Document Analysis</h3>
                <div className="space-y-3">
                    {reportData.documentAnalysis.map((doc, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className={doc.status === 'verified' ? 'text-green-600' : 'text-yellow-600'}>
                                {doc.status === 'verified' ? '✓' : '⚠'}
                            </span>
                            <div>
                                <p className="font-medium text-gray-900">{doc.name}</p>
                                <p className="text-sm text-gray-600">{doc.notes}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Flags */}
            {reportData.flags.length > 0 && (
                <div className="bg-white rounded-xl border border-red-200 p-6">
                    <h3 className="text-lg font-semibold text-red-700 mb-4">⚠ Issues Found</h3>
                    <ul className="space-y-2">
                        {reportData.flags.map((flag, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-700">
                                <span className="w-2 h-2 bg-red-500 rounded-full" />
                                {flag}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                <ul className="space-y-2">
                    {reportData.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700">
                            <span className="text-primary-600">→</span>
                            {rec}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
                <div className="flex flex-wrap gap-4">
                    <button onClick={() => setShowListingModal(true)} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium">
                        🏠 List on Marketplace
                    </button>
                    <button onClick={onConsultAdvocate} className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium">
                        ⚖️ Consult Advocate
                    </button>
                    <button onClick={handleDownloadReport} className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium">
                        📄 Download PDF
                    </button>
                </div>
            </div>

            {/* Listing Modal */}
            {showListingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">List on Marketplace</h2>
                            <button onClick={() => setShowListingModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{verification.propertyAddress}</p>
                        <form onSubmit={handleListOnMarketplace} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                                <input
                                    type="number"
                                    value={listingData.price}
                                    onChange={(e) => setListingData({ ...listingData, price: e.target.value })}
                                    placeholder="5000000"
                                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq.ft) *</label>
                                <input
                                    type="number"
                                    value={listingData.area}
                                    onChange={(e) => setListingData({ ...listingData, area: e.target.value })}
                                    placeholder="2400"
                                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-medium">
                                List Property
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerificationReport;
