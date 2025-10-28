import React from 'react';
import './Button.css';

export interface ButtonProps {
  // Size configuration
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  customSize?: string;
  
  // Prefix and suffix configuration
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  
  // Content
  children: React.ReactNode;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  
  // Button variants
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  
  // Button styles
  fullWidth?: boolean;
  rounded?: boolean;
  
  // Element type
  element?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'button';
  
  // Additional props
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  size = 'medium',
  customSize,
  prefix,
  suffix,
  children,
  className = '',
  style = {},
  variant = 'primary',
  fullWidth = false,
  rounded = true,
  element = 'button',
  onClick,
  disabled = false,
  type = 'button',
  ...props
}) => {
  // Generate size class
  const sizeClass = customSize ? 'custom-size' : `size-${size}`;
  
  // Generate variant class
  const variantClass = `variant-${variant}`;
  
  // Generate full className
  const fullClassName = `button ${sizeClass} ${variantClass} ${className}`.trim();
  
  // Generate inline styles
  const inlineStyles: React.CSSProperties = {
    ...style,
    ...(customSize && { fontSize: customSize }),
    ...(fullWidth && { width: '100%' }),
    ...(rounded && { borderRadius: '12px' }),
  };

  // Create the element with prefix and suffix
  const content = (
    <>
      {prefix && <span className="prefix">{prefix}</span>}
      <span className="content">{children}</span>
      {suffix && <span className="suffix">{suffix}</span>}
    </>
  );

  // Render the appropriate element type
  const Element = element as keyof React.JSX.IntrinsicElements;
  
  return React.createElement(
    Element,
    {
      className: fullClassName,
      style: inlineStyles,
      onClick: disabled ? undefined : onClick,
      disabled: disabled,
      type: element === 'button' ? type : undefined,
      ...props,
    },
    content
  );
};

export default Button;
