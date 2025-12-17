import React from 'react';
import SectionTitle from '../SectionTitle';
import Button from '../Button';
import { CheckCircleIcon, XCircleIcon, AlertIcon } from '../Icons';

/**
 * SAMPLE REPORT SECTION
 * Shows a mock report to build trust and demonstrate value
 */
const SampleReport = () => {
  return (
    <section className="bg-gray-50 section-padding">
      <div className="container-custom">
        <SectionTitle centered>
          Sample Verification Report
        </SectionTitle>

        <div className="max-w-4xl mx-auto">
          {/* Report Card */}
          <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-primary-700 text-white p-6">
              <h3 className="text-2xl font-bold mb-2">Property Verification Report</h3>
              <p className="text-primary-100">Survey No: 123/45, Bangalore North Taluk</p>
            </div>

            {/* Report Body */}
            <div className="p-6 space-y-6">
              {/* Property Overview */}
              <ReportSection title="Property Overview">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Owner Name" value="Rajesh Kumar" />
                  <InfoRow label="Property Type" value="Agricultural Land" />
                  <InfoRow label="Area" value="2.5 Acres" />
                  <InfoRow label="District" value="Bangalore Urban" />
                </div>
              </ReportSection>

              {/* Ownership History */}
              <ReportSection title="Ownership History">
                <StatusItem
                  status="verified"
                  text="Clear ownership chain traced back 30 years"
                />
                <StatusItem
                  status="verified"
                  text="All succession certificates in order"
                />
              </ReportSection>

              {/* Legal Risks */}
              <ReportSection title="Legal Risks">
                <StatusItem
                  status="verified"
                  text="No ongoing litigation detected"
                />
                <StatusItem
                  status="verified"
                  text="No land acquisition notices found"
                />
              </ReportSection>

              {/* Encumbrances */}
              <ReportSection title="Encumbrances">
                <StatusItem
                  status="warning"
                  text="Active bank loan of ₹15,00,000 detected (2021)"
                />
                <StatusItem
                  status="verified"
                  text="No other charges or liens found"
                />
              </ReportSection>

              {/* Land Classification */}
              <ReportSection title="Land Classification">
                <StatusItem
                  status="verified"
                  text="Current use matches revenue records (Agricultural)"
                />
                <StatusItem
                  status="risk"
                  text="Conversion to residential requires DC approval"
                />
              </ReportSection>

              {/* Final Risk Score */}
              <div className="pt-6 border-t-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-gray-900">Final Risk Score</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-warning-yellow">MEDIUM</span>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-warning-yellow rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Recommendation:</strong> Property is suitable for purchase after clearing
                    the existing bank loan. Advocate review recommended for conversion process.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="bg-gray-50 p-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic">
                Reports are advisory and can be reviewed by certified advocates.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <Button variant="primary" size="lg">
              Get Your Property Verified
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Report Section Component
 */
const ReportSection = ({ title, children }) => (
  <div>
    <h4 className="font-semibold text-gray-900 mb-3 text-lg">{title}</h4>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

/**
 * Info Row Component
 */
const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-xs mb-1">{label}</p>
    <p className="text-gray-900 font-medium">{value}</p>
  </div>
);

/**
 * Status Item Component
 */
const StatusItem = ({ status, text }) => {
  const statusConfig = {
    verified: {
      icon: <CheckCircleIcon className="w-5 h-5 text-trust-green" />,
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    warning: {
      icon: <AlertIcon className="w-5 h-5 text-warning-yellow" />,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200'
    },
    risk: {
      icon: <XCircleIcon className="w-5 h-5 text-risk-red" />,
      bg: 'bg-red-50',
      border: 'border-red-200'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-start gap-3 p-3 ${config.bg} border ${config.border} rounded`}>
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
};

export default SampleReport;
