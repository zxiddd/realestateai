import React from 'react';
import SectionTitle from '../SectionTitle';
import { AlertIcon } from '../Icons';

/**
 * PROBLEM SECTION
 * Highlights the key problems in property verification in India
 */
const Problem = () => {
  const problems = [
    'Multiple unverified documents across departments',
    'No single source of truth',
    'Buyers depend on brokers or hearsay',
    'Legal risks discovered after purchase',
    'Banks take weeks to verify land history'
  ];

  return (
    <section className="bg-white section-padding">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <SectionTitle centered>
            Why Property Fraud Happens in India
          </SectionTitle>

          {/* Problem List */}
          <div className="space-y-4 mb-12">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-red-50 border-l-4 border-risk-red rounded-r-lg"
              >
                <AlertIcon className="w-6 h-6 text-risk-red flex-shrink-0 mt-1" />
                <p className="text-lg text-gray-800">{problem}</p>
              </div>
            ))}
          </div>

          {/* Closing Statement */}
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900 italic">
              "One mistake can cost a lifetime."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
