import React from 'react';
import SectionTitle from '../SectionTitle';
import { UploadIcon, SearchIcon, ScaleIcon, ClipboardCheckIcon, CheckCircleIcon } from '../Icons';

/**
 * SOLUTION SECTION
 * Explains how BhoomiAI solves the verification problem
 */
const Solution = () => {
  const steps = [
    {
      number: '1',
      icon: <UploadIcon className="w-10 h-10 text-primary-700" />,
      title: 'Upload Documents',
      description: 'Submit your land documents securely through our platform'
    },
    {
      number: '2',
      icon: <SearchIcon className="w-10 h-10 text-primary-700" />,
      title: 'AI Verification',
      description: 'Our AI cross-verifies across multiple government databases'
    },
    {
      number: '3',
      icon: <ScaleIcon className="w-10 h-10 text-primary-700" />,
      title: 'Legal Review',
      description: 'Certified advocates review flagged issues'
    },
    {
      number: '4',
      icon: <ClipboardCheckIcon className="w-10 h-10 text-primary-700" />,
      title: 'Risk Score',
      description: 'Receive a comprehensive risk assessment report'
    },
    {
      number: '5',
      icon: <CheckCircleIcon className="w-10 h-10 text-trust-green" />,
      title: 'Go / No-Go Decision',
      description: 'Make an informed purchase decision with confidence'
    }
  ];

  const verificationAreas = [
    'Revenue records',
    'Encumbrance history',
    'Ownership chain',
    'Land classification'
  ];

  return (
    <section className="bg-gray-50 section-padding">
      <div className="container-custom">
        <SectionTitle centered>
          One Platform. Complete Verification.
        </SectionTitle>

        {/* Explanation */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-lg text-gray-700 mb-6">
            BhoomiAI streamlines the entire verification process by combining AI-powered analysis
            with expert legal review.
          </p>

          {/* Verification Areas */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="font-semibold text-gray-900 mb-4">AI cross-verifies across:</p>
            <div className="grid grid-cols-2 gap-3">
              {verificationAreas.map((area, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-trust-green" />
                  <span className="text-gray-700">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-semibold text-center text-gray-900 mb-12">
            How It Works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <StepCard {...step} />
                {index < steps.length - 1 && (
                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-full h-0.5 bg-primary-300"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Step Card Component
 */
const StepCard = ({ number, icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-primary-300 transition-colors">
    <div className="w-12 h-12 bg-primary-700 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
      {number}
    </div>
    <div className="mb-3">{icon}</div>
    <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default Solution;
