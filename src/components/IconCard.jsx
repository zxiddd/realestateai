import React from 'react';

/**
 * Icon Card Component
 * Used for displaying features, trust points, and benefits
 */
const IconCard = ({ icon, title, description, variant = 'default' }) => {
  const variants = {
    default: 'bg-white border-gray-200',
    primary: 'bg-primary-50 border-primary-200',
    success: 'bg-green-50 border-green-200',
  };

  return (
    <div className={`p-6 border-2 rounded-lg ${variants[variant]}`}>
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default IconCard;
