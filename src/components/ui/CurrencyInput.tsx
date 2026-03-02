import * as React from "react";
import { Input } from "@/components/ui/input";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onValueChange: (value: number) => void;
}

// Helper to format a number with Indian commas (e.g., 1,00,000)
const formatNumberWithIndianCommas = (num: number | string): string => {
  if (typeof num === 'undefined' || num === null || num === '' || isNaN(Number(num))) return '0';
  // Using 'en-IN' locale automatically handles the Indian numbering system.
  return Number(num).toLocaleString('en-IN');
};

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    
    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      
      // Clean the input: remove the prefix, commas, and any non-digit characters.
      const numericString = rawValue.replace(/[^0-9]/g, '');
      
      let numberValue = 0;
      if (numericString) {
        // Ensure we don't exceed JavaScript's safe integer limits if the number is too long
        numberValue = parseInt(numericString.slice(0, 15), 10);
      }
      
      // Call the parent's handler with the clean number.
      onValueChange(numberValue);
    };

    // Format the value that is displayed in the input field with a space
    const displayValue = `₹ ${formatNumberWithIndianCommas(value)}`;

    return (
      <Input
        type="text" // Must be 'text' to allow prefixes and commas
        className={className}
        value={displayValue}
        onChange={handleOnChange}
        ref={ref}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };