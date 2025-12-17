import React from 'react';
import SectionTitle from '../SectionTitle';
import { ShieldCheckIcon, LockClosedIcon, DocumentCheckIcon, CheckCircleIcon } from '../Icons';

/**
 * TRUST & COMPLIANCE SECTION
 * Builds credibility through compliance and security messaging
 */
const Trust = () => {
  const trustPoints = [
    {
      icon: <ScaleIcon className="w-10 h-10 text-primary-700" />,
      title: 'Advocate-assisted verification',
      description: 'All reports can be reviewed by certified legal professionals'
    },
    {
      icon: <LockClosedIcon className="w-10 h-10 text-primary-700" />,
      title: 'Data privacy first',
      description: 'Your documents are encrypted and never shared without consent'
    },
    {
      icon: <DocumentCheckIcon className="w-10 h-10 text-primary-700" />,
      title: 'Read-only access',
      description: 'We only read public records—no modifications to official databases'
    },
    {
      icon: <CheckCircleIcon className="w-10 h-10 text-primary-700" />,
      title: 'Compliant with Indian land laws',
      description: 'Built in accordance with state and central property regulations'
    },
    {
      icon: <ShieldCheckIcon className="w-10 h-10 text-primary-700" />,
      title: 'Built for scalability',
      description: 'Designed to work across multiple states with different land systems'
    }
  ];

  return (
    <section className="bg-gray-50 section-padding">
      <div className="container-custom">
        <SectionTitle centered>
          Trust & Compliance
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {trustPoints.map((point, index) => (
            <div
              key={index}
              className="p-6 bg-white border-2 border-gray-200 rounded-lg"
            >
              <div className="mb-4">{point.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {point.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Trust Message */}
        <div className="max-w-3xl mx-auto mt-12 text-center">
          <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              BhoomiAI operates with complete transparency. We do not claim government approval
              or affiliation. Our platform provides advisory insights to help you make informed
              decisions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Import ScaleIcon from Icons
const ScaleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
    />
  </svg>
);

export default Trust;
