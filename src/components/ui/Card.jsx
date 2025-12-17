import React from 'react';

/**
 * Reusable Card Component
 * Clean, minimal card with optional hover effect
 */
const Card = ({ children, className = '', hover = false }) => {
  const hoverEffect = hover ? 'hover:shadow-lg transition-shadow duration-300' : '';

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${hoverEffect} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
