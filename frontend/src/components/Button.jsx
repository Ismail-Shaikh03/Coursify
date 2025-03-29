import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  onClick,
  className = '',
  ...props 
}) => {
  // Define button style classes
  const baseClasses = 'rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-[#F7374F] text-white hover:bg-[#d52b41] focus:ring-[#F7374F]',
    secondary: 'bg-[#88304E] text-white hover:bg-[#6e2740] focus:ring-[#88304E]',
    tertiary: 'bg-[#522546] text-white hover:bg-[#3f1c35] focus:ring-[#522546]',
    outline: 'bg-transparent text-[#F7374F] border border-[#F7374F] hover:bg-[#F7374F] hover:text-white focus:ring-[#F7374F]',
    ghost: 'bg-transparent text-[#F7374F] hover:bg-[#F7374F10] focus:ring-[#F7374F]',
  };
  
  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };
  
  // Combine all classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button 
      className={buttonClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;