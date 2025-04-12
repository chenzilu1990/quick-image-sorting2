import React from 'react';

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    // Base styles using Tailwind classes
    const baseStyles = 'block text-sm font-medium text-gray-700 mb-1';

    // Combine classes
    const combinedClassName = [baseStyles, className].filter(Boolean).join(' ');

    return (
      <label
        ref={ref}
        className={combinedClassName}
        {...props}
      />
    );
  }
);
Label.displayName = 'Label';

export { Label }; 