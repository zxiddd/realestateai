import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/sections/Hero';
import Problem from './components/sections/Problem';
import Solution from './components/sections/Solution';
import AgenticAI from './components/sections/AgenticAI';
import SampleReport from './components/sections/SampleReport';
import Audience from './components/sections/Audience';
import Trust from './components/sections/Trust';
import CTA from './components/sections/CTA';
import Footer from './components/sections/Footer';
import Modal from './components/ui/Modal';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import AdvocateDashboard from './components/advocate/AdvocateDashboard';

/**
 * MAIN APP COMPONENT
 *
 * BhoomiAI Platform
 * - Landing Page for unauthenticated users
 * - Dashboard for authenticated users (role-based routing)
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Check for existing auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (storedUser && accessToken) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (e) {
        // Invalid stored data, clear it
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  }, []);

  const handleOpenLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const handleOpenRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const handleCloseModals = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    handleCloseModals();
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');

    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  // Show appropriate Dashboard for authenticated users based on role
  if (isAuthenticated && user) {
    // Check if user is admin
    if (user.isAdmin) {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    }

    // Check if user is advocate
    if (user.userType === 'advocate') {
      return <AdvocateDashboard user={user} onLogout={handleLogout} />;
    }

    // Default: regular user dashboard
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // Show Landing Page for unauthenticated users
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Header
        onLoginClick={handleOpenLogin}
        onRegisterClick={handleOpenRegister}
      />

      {/* Main Content */}
      <main>
        {/* 1. Hero Section - Above the fold */}
        <Hero />

        {/* 2. Problem Section - Context setting */}
        <Problem />

        {/* 3. Solution Section - Value proposition */}
        <Solution />

        {/* 4. Agentic AI Section - Technology explanation */}
        <AgenticAI />

        {/* 5. Sample Report Section - Trust builder */}
        <SampleReport />

        {/* 6. Audience Section - Use cases */}
        <Audience />

        {/* 7. Trust & Compliance Section - Credibility */}
        <Trust />

        {/* 8. Final CTA Section - Conversion */}
        <CTA />
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modals */}
      <Modal
        isOpen={isLoginOpen}
        onClose={handleCloseModals}
        title="Login to BhoomiAI"
      >
        <LoginForm
          onClose={handleCloseModals}
          onSwitchToRegister={handleOpenRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      </Modal>

      <Modal
        isOpen={isRegisterOpen}
        onClose={handleCloseModals}
        title="Create Account"
      >
        <RegisterForm
          onClose={handleCloseModals}
          onSwitchToLogin={handleOpenLogin}
        />
      </Modal>
    </div>
  );
}

export default App;
