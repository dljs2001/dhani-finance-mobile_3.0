"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { banks } from "@/data/banks";

interface BankComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function BankCombobox({ value, onValueChange, className }: BankComboboxProps) {
  const [open, setOpen] = React.useState(false);

  // Custom filter to match anywhere in the string, ignoring case and symbols
  const filter = (value: string, search: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanSearch = search.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanValue.includes(cleanSearch)) return 1;
    return 0;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-11 bg-primary text-white hover:bg-primary/90 hover:text-white rounded-xl shadow-sm border-none font-medium", className)}
        >
          {value
            ? banks.find((bank) => bank.value === value)?.label
            : "Select bank..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">
        <Command filter={filter}>
          <CommandInput placeholder="Search bank..." />
          <CommandEmpty>No bank found.</CommandEmpty>
          <CommandGroup>
            {banks.map((bank) => (
              <CommandItem
                key={bank.value}
                value={bank.label} // Search against the full label (e.g., with "SBI")
                onSelect={() => {
                  onValueChange(bank.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === bank.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {bank.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}