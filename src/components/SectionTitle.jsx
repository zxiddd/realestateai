import React from 'react';

/**
 * Reusable Section Title Component
 * Used for consistent heading styles across sections
 */
const SectionTitle = ({ children, subtitle, centered = false }) => {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {children}
      </h2>
      {subtitle && (
        <p className="text-lg text-gray-600 max-w-3xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
