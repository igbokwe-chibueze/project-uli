import { useState } from "react";
import { useController, Control, Path, FieldValues } from "react-hook-form";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ChevronsUpDown, Check, PencilLineIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Each option in the dropdown should have:
 *  - value: the actual string (e.g. country.id)
 *  - label: the human-readable text (e.g. "Nigeria (NG)")
 */
export interface OptionPair {
  value: string;
  label: string;
}

interface SelectPopoverProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: OptionPair[];
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  isDirty?: boolean;
}

export const SelectPopover = <T extends FieldValues>({
  control, name, label, options, placeholder, icon, required = false,  isDirty = false,
}: SelectPopoverProps<T>) => {
  const { field, fieldState: { error } } = useController({ name, control });
  const [open, setOpen] = useState(false);

  // Helper: find the label for the currently selected value (ID)
  const selectedLabel = options.find((opt) => opt.value === field.value)?.label;

  return (
    <FormItem>
      <div className="flex items-center gap-2">
        <FormLabel>
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </FormLabel>

        {isDirty && (
          <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
        )}
      </div>
      
      <FormControl>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between",
                error && "border-red-500"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="size-4 text-muted-foreground">
                  {icon}
                </div>
                {/* Show the selected label, or placeholder/default text */}
                {selectedLabel ?? placeholder ?? `Select ${label.toLowerCase()}`}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full bg-red-500 z-50 p-0 pointer-events-auto">
            <Command>
              <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
              <CommandList>
                <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                <CommandGroup>
                  {options.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      // Set `value` to `opt.label` so filtering matches against the human‐readable text
                      value={opt.label}
                      onSelect={() => {
                        // When an option is clicked, write the ID (opt.value) into the form
                        field.onChange(opt.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          field.value === opt.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {opt.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FormControl>
      {error && <FormMessage>{error.message}</FormMessage>}
    </FormItem>
  );
};
