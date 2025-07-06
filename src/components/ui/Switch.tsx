import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
  description?: string;
  leftLabel?: string;
  rightLabel?: string;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, label, description, leftLabel, rightLabel, ...props }, ref) => (
  <div className="flex flex-col space-y-1.5">
    {label && (
      <div className="flex justify-between items-center">
        <label
          htmlFor={props.id || 'switch'}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        {description && (
          <span className="text-xs text-gray-500">{description}</span>
        )}
      </div>
    )}
    <div className="flex items-center space-x-2">
      {leftLabel && (
        <span className="text-sm text-gray-600">{leftLabel}</span>
      )}
      <SwitchPrimitive.Root
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-gray-200 ${className}`}
        {...props}
        ref={ref}
        id={props.id || 'switch'}
      >
        <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5" />
      </SwitchPrimitive.Root>
      {rightLabel && (
        <span className="text-sm text-gray-600">{rightLabel}</span>
      )}
    </div>
  </div>
));

Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };