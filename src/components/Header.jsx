import React from 'react';
import Button from './Button';

/**
 * HEADER/NAVIGATION
 * Simple, professional navigation bar with auth options
 */
const Header = ({ onLoginClick, onRegisterClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="container-custom py-4 px-6 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-700">BhoomiAI</h1>
            <span className="ml-3 text-sm text-gray-500 hidden md:inline">
              Land Verification Platform
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-gray-700 hover:text-primary-700 transition-colors">
              How It Works
            </a>
            <a href="#sample-report" className="text-gray-700 hover:text-primary-700 transition-colors">
              Sample Report
            </a>
            <a href="#about" className="text-gray-700 hover:text-primary-700 transition-colors">
              About
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={onLoginClick}>
              Login
            </Button>
            <Button variant="primary" size="sm" onClick={onRegisterClick}>
              Register
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
