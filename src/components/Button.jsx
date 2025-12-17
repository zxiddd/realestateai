import React from 'react';

/**
 * Reusable Button Component
 * Variants: primary (solid blue), secondary (outlined)
 */
const Button = ({ children, variant = 'primary', size = 'md', onClick, className = '' }) => {
  const baseStyles = 'font-medium rounded-lg transition-colors duration-200 inline-flex items-center justify-center';

  const variants = {
    primary: 'bg-primary-700 text-white hover:bg-primary-800 border-2 border-primary-700',
    secondary: 'bg-white text-primary-700 border-2 border-primary-700 hover:bg-primary-50'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
