import React, { forwardRef } from 'react';
import './Input.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  // Size configuration
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  customSize?: string;
  
  // Icon configuration
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  
  // Input variants
  variant?: 'default' | 'outline' | 'filled' | 'underline' | 'liquid-glass';
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  
  // Layout
  fullWidth?: boolean;
  rounded?: boolean;
  
  // State
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  
  // Label and helper text
  label?: string;
  helperText?: string;
  errorText?: string;
  
  // Container styling
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  size = 'medium',
  customSize,
  prefixIcon,
  suffixIcon,
  variant = 'default',
  className = '',
  style = {},
  fullWidth = false,
  rounded = true,
  error = false,
  success = false,
  disabled = false,
  label,
  helperText,
  errorText,
  containerClassName = '',
  containerStyle = {},
  type = 'text',
  ...props
}, ref) => {
  // Generate size class
  const sizeClass = customSize ? 'custom-size' : `size-${size}`;
  
  // Generate variant class
  const variantClass = `variant-${variant}`;
  
  // Generate state classes
  const stateClasses = [
    error ? 'error' : '',
    success ? 'success' : '',
    disabled ? 'disabled' : '',
  ].filter(Boolean).join(' ');
  
  // Generate full className for input
  const inputClassName = `input ${sizeClass} ${variantClass} ${stateClasses} ${className}`.trim();
  
  // Generate container className
  const containerClass = `input-container ${fullWidth ? 'full-width' : ''} ${containerClassName}`.trim();
  
  // Generate inline styles for input
  const inputStyles: React.CSSProperties = {
    ...style,
    ...(customSize && { fontSize: customSize }),
    ...(fullWidth && { width: '100%' }),
    ...(rounded && { borderRadius: '8px' }),
  };

  // Handle icon click for suffix (useful for password toggle, clear button, etc.)
  const handleSuffixClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // You can add custom logic here for suffix icon clicks
  };

  return (
    <div className={containerClass} style={containerStyle}>
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      
      <div className="input-wrapper">
        {prefixIcon && (
          <div className="input-prefix">
            {prefixIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={inputClassName}
          style={inputStyles}
          disabled={disabled}
          {...props}
        />
        
        {suffixIcon && (
          <div 
            className="input-suffix"
            onClick={handleSuffixClick}
          >
            {suffixIcon}
          </div>
        )}
      </div>
      
      {(helperText || errorText) && (
        <div className={`input-helper ${error ? 'error' : ''}`}>
          {error ? errorText : helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
