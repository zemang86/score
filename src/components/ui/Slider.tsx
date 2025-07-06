import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  valueDisplay?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, label, valueDisplay, min = 0, max = 100, step = 1, disabled = false, ...props }, ref) => (
  <div className="space-y-2">
    {(label || valueDisplay) && (
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        {valueDisplay && (
          <span className="text-sm text-gray-500">{valueDisplay}</span>
        )}
      </div>
    )}
    <SliderPrimitive.Root
      ref={ref}
      className={`relative flex w-full touch-none select-none items-center ${className}`}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
        <SliderPrimitive.Range className={`absolute h-full ${disabled ? 'bg-gray-400' : 'bg-indigo-600'}`} />
      </SliderPrimitive.Track>
      {props.value?.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className={`block h-5 w-5 rounded-full border-2 ${disabled ? 'border-gray-400' : 'border-indigo-600'} bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`}
        />
      ))}
    </SliderPrimitive.Root>
  </div>
));

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };