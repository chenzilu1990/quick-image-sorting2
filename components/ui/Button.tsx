import React from 'react';
import { LucideIcon } from 'lucide-react'; // Assuming you might use icons

// Define Button props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'success' | 'ghost' | 'link'; // Added ghost/link for flexibility
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  // Add any other specific props needed, e.g., isLoading
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'default',
      children,
      className, // Allow passing additional classes
      icon: Icon,
      iconPosition = 'left',
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles - common to all buttons
    const baseStyles =
      'inline-flex items-center justify-center rounded font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none';

    // Variant styles
    const variantStyles = {
      primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300',
      secondary: 'bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300',
      warning: 'bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300 font-bold', // apply-button style initially
      danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300',
      success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-200', // test-button style
      ghost: 'hover:bg-accent hover:text-accent-foreground', // Example
      link: 'text-primary underline-offset-4 hover:underline', // Example
    };

    // Size styles
    const sizeStyles = {
      default: 'h-10 px-6 py-3 text-base', // Matches original base button
      sm: 'h-9 rounded px-4 py-2 text-sm', // Matches clear-selection-btn size roughly
      lg: 'h-11 rounded px-8 text-lg', // Example large size
      icon: 'h-10 w-10', // Example icon-only button
    };

    // Special hover effects (can be conditional based on variant/props)
    const hoverEffects = {
      warning: 'hover:-translate-y-0.5 hover:shadow-md', // apply-button hover
      danger: 'hover:-translate-y-px hover:shadow-sm', // clear-selection hover
      success: 'hover:-translate-y-0.5 hover:shadow-md', // test-button hover
    }

    // Combine classes - using a simple join for now, clsx/tailwind-merge could be better
    const combinedClassName = [
      baseStyles,
      variantStyles[variant as keyof typeof variantStyles], // Use type assertion
      sizeStyles[size as keyof typeof sizeStyles], // Use type assertion
      (hoverEffects[variant as keyof typeof hoverEffects] && !disabled) ? hoverEffects[variant as keyof typeof hoverEffects] : '',
      className, // Allow overriding/extending
    ]
      .filter(Boolean) // Remove empty strings
      .join(' ');

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled}
        {...props}
      >
        {Icon && iconPosition === 'left' && <Icon className={`mr-2 h-4 w-4 ${size === 'sm' ? 'h-3.5 w-3.5' : ''}`} />}
        {children}
        {Icon && iconPosition === 'right' && <Icon className={`ml-2 h-4 w-4 ${size === 'sm' ? 'h-3.5 w-3.5' : ''}`} />}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button }; 