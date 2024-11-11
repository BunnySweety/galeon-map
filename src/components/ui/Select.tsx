import { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  children,
  error,
  label,
  helperText,
  disabled,
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          className={cn(
            "block w-full rounded-lg border bg-white dark:bg-gray-800 shadow-sm appearance-none pr-10",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-red-300 text-red-900"
              : "border-gray-300 dark:border-gray-600",
            disabled && "bg-gray-50 dark:bg-gray-900",
            className
          )}
          disabled={disabled}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </div>
      </div>

      {(error || helperText) && (
        <p className={cn(
          "text-sm",
          error 
            ? "text-red-600 dark:text-red-400" 
            : "text-gray-500 dark:text-gray-400"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;