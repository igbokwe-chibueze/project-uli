// src/features/organisations/components/search-form.tsx

import { SearchIcon } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { SidebarInput } from "@/components/ui/sidebar"

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      {/* Search Bar */}
      <div className="flex-1 min-w-0 max-w-md mx-2 md:mx-4 hidden sm:block">
        <div className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Type to search..."
            className="h-8 pl-7"
          />
          <SearchIcon className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
        </div>
      </div>

      {/* Mobile Search Button - shows when search bar is hidden */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 hover:bg-accent hover:text-accent-foreground sm:hidden"
        aria-label="Search"
      >
        <SearchIcon className="size-5" />
      </Button>
    </form>
  )
}
