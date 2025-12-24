import React, { useState } from 'react';
import Sidebar from './Sidebar';
import PropertyVerification from './PropertyVerification';
import Marketplace from './Marketplace';
import Advocate from './Advocate';
import Agent from './Agent';
import AccountSettings from './AccountSettings';

/**
 * DASHBOARD COMPONENT
 * Main dashboard layout with sidebar and content area
 * Mobile responsive with hamburger menu
 */
const Dashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('verification');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false); // Close mobile menu on tab change
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'verification':
                return <PropertyVerification user={user} onNavigateToAdvocate={() => setActiveTab('advocate')} />;
            case 'marketplace':
                return <Marketplace user={user} />;
            case 'advocate':
                return <Advocate user={user} />;
            case 'agent':
                return <Agent />;
            case 'account':
                return <AccountSettings user={user} onLogout={onLogout} />;
            default:
                return <PropertyVerification user={user} onNavigateToAdvocate={() => setActiveTab('advocate')} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 px-4 py-3 flex items-center justify-between">
                <h1 className="text-lg font-bold text-white">
                    <span className="text-primary-400">Bhoomi</span>AI
                </h1>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg text-gray-300 hover:bg-gray-800"
                >
                    {isMobileMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-30 bg-black/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Hidden on mobile, shown in overlay when menu is open */}
            <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        transform lg:transform-none transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    onLogout={onLogout}
                    user={user}
                    onCloseMobile={() => setIsMobileMenuOpen(false)}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto pt-14 lg:pt-0">
                <div className="p-4 sm:p-6 lg:p-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
