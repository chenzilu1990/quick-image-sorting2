import React from 'react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    // Base styles using Tailwind classes (adapted from Tailwind UI)
    const baseStyles =
      'block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500';

    // Combine classes
    const combinedClassName = [baseStyles, className].filter(Boolean).join(' ');

    return (
      <select
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export { Select }; 