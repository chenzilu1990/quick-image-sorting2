import React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // Base styles using Tailwind classes
    const baseStyles =
      'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200';

    // Combine classes - consider clsx/tailwind-merge for better merging
    const combinedClassName = [baseStyles, className].filter(Boolean).join(' ');

    return (
      <input
        type={type}
        className={combinedClassName}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input }; 