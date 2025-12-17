import React from 'react';
import Button from '../Button';
import { ShieldCheckIcon, DocumentCheckIcon, BankIcon, ScaleIcon } from '../Icons';

/**
 * HERO SECTION
 * Above-the-fold section with main value proposition and CTAs
 */
const Hero = () => {
  return (
    <section className="bg-gradient-to-b from-primary-50 to-white section-padding">
      <div className="container-custom">
        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Verify Before You Buy.
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
            India's first AI-powered platform that verifies land documents, detects legal risk,
            and helps you make safe property decisions.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="primary" size="lg">
              Verify Property Now
            </Button>
            <Button variant="secondary" size="lg">
              View Sample Report
            </Button>
          </div>
        </div>

        {/* Trust Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <TrustPoint
            icon={<ShieldCheckIcon className="w-10 h-10 text-primary-700" />}
            title="AI-based verification"
          />
          <TrustPoint
            icon={<ScaleIcon className="w-10 h-10 text-primary-700" />}
            title="Advocate-assisted validation"
          />
          <TrustPoint
            icon={<BankIcon className="w-10 h-10 text-primary-700" />}
            title="Bank-ready reports"
          />
          <TrustPoint
            icon={<DocumentCheckIcon className="w-10 h-10 text-primary-700" />}
            title="Government-aligned compliance"
          />
        </div>
      </div>
    </section>
  );
};

/**
 * Trust Point Component
 * Small card displaying trust indicators
 */
const TrustPoint = ({ icon, title }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg border border-gray-200">
    <div className="mb-3">{icon}</div>
    <p className="text-sm font-medium text-gray-900">{title}</p>
  </div>
);

export default Hero;
