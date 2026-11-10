import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> { }

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`form-label ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';
