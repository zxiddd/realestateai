import React from 'react';
import SectionTitle from '../SectionTitle';
import IconCard from '../IconCard';
import { UserGroupIcon, BankIcon, ScaleIcon, ShieldCheckIcon } from '../Icons';

/**
 * AUDIENCE SECTION (Who is this for?)
 * Shows different user segments and benefits
 */
const Audience = () => {
  const audiences = [
    {
      icon: <UserGroupIcon className="w-10 h-10 text-primary-700" />,
      title: 'For Buyers',
      benefits: [
        'Avoid fraud',
        'Save time',
        'Peace of mind'
      ]
    },
    {
      icon: <BankIcon className="w-10 h-10 text-primary-700" />,
      title: 'For Banks',
      benefits: [
        'Faster loan approvals',
        'Reduced NPAs',
        'Standardized verification'
      ]
    },
    {
      icon: <ScaleIcon className="w-10 h-10 text-primary-700" />,
      title: 'For Advocates',
      benefits: [
        'Structured case analysis',
        'Less manual effort',
        'Better client service'
      ]
    },
    {
      icon: <ShieldCheckIcon className="w-10 h-10 text-primary-700" />,
      title: 'For Government',
      benefits: [
        'Transparency',
        'Digital verification',
        'Reduced disputes'
      ]
    }
  ];

  return (
    <section className="bg-white section-padding">
      <div className="container-custom">
        <SectionTitle centered>
          Who Is This For?
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
            >
              <div className="mb-4">{audience.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {audience.title}
              </h3>
              <ul className="space-y-2">
                {audience.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-primary-700 mt-1">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Audience;
