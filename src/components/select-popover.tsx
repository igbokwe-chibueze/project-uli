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
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectPopoverProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: string[];
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export const SelectPopover = <T extends FieldValues>({
  control, name, label, options, placeholder, icon, required = false
}: SelectPopoverProps<T>) => {
  const { field, fieldState: { error } } = useController({ name, control });
  const [open, setOpen] = useState(false);

  return (
    <FormItem>
      <FormLabel>
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </FormLabel>
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
                {field.value || placeholder || `Select ${label.toLowerCase()}`}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
              <CommandList>
                <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                <CommandGroup>
                  {options.map((opt) => (
                    <CommandItem
                      key={opt}
                      value={opt}
                      onSelect={(value: string) => {
                        field.onChange(
                          value === field.value ? undefined : value
                        );
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          field.value === opt ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {opt}
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
