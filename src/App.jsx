import React, { useState } from 'react';
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

/**
 * MAIN APP COMPONENT
 *
 * BhoomiAI Landing Page
 * Government-grade AI platform for real estate verification and risk analysis
 *
 * Structure:
 * 1. Header/Navigation - Sticky navigation with brand and auth options
 * 2. Hero - Main value proposition and trust indicators
 * 3. Problem - Why property fraud happens in India
 * 4. Solution - How BhoomiAI solves the problem (5-step process)
 * 5. Agentic AI - Explanation of multi-agent AI system
 * 6. Sample Report - Mock verification report to build trust
 * 7. Audience - B2C and B2B use cases
 * 8. Trust & Compliance - Security and legal compliance messaging
 * 9. CTA - Final call-to-action
 * 10. Footer - Links and legal disclaimer
 */
function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

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
