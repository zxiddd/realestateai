import React from 'react';
import SectionTitle from '../SectionTitle';
import IconCard from '../IconCard';
import { ShieldCheckIcon, DocumentCheckIcon, ScaleIcon, SearchIcon, ClipboardCheckIcon } from '../Icons';

/**
 * AGENTIC AI SECTION
 * Explains the multi-agent AI system in simple, non-technical language
 */
const AgenticAI = () => {
  const agents = [
    {
      icon: <ShieldCheckIcon className="w-10 h-10 text-primary-700" />,
      title: 'Ownership Verification Agent',
      description: 'Validates current and historical ownership records across revenue databases'
    },
    {
      icon: <DocumentCheckIcon className="w-10 h-10 text-primary-700" />,
      title: 'Encumbrance Detection Agent',
      description: 'Identifies loans, mortgages, and legal charges on the property'
    },
    {
      icon: <ScaleIcon className="w-10 h-10 text-primary-700" />,
      title: 'Legal Compliance Agent',
      description: 'Checks adherence to land use regulations and zoning laws'
    },
    {
      icon: <SearchIcon className="w-10 h-10 text-primary-700" />,
      title: 'Field Risk Agent',
      description: 'Analyzes ground-level risks including disputes and boundary issues'
    },
    {
      icon: <ClipboardCheckIcon className="w-10 h-10 text-primary-700" />,
      title: 'Final Decision Agent',
      description: 'Synthesizes all findings into a clear risk score and recommendation'
    }
  ];

  return (
    <section className="bg-white section-padding">
      <div className="container-custom">
        <SectionTitle centered>
          How Our AI Works
        </SectionTitle>

        {/* Explanation */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-lg text-gray-700 mb-6">
            Instead of one AI doing everything, BhoomiAI uses multiple specialized AI agents —
            each responsible for a specific verification task.
          </p>
          <div className="bg-primary-50 p-6 rounded-lg border border-primary-200">
            <p className="text-lg font-medium text-gray-900">
              Together, they think like an experienced property expert — but faster and unbiased.
            </p>
          </div>
        </div>

        {/* AI Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {agents.map((agent, index) => (
            <IconCard
              key={index}
              icon={agent.icon}
              title={agent.title}
              description={agent.description}
              variant="default"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgenticAI;
