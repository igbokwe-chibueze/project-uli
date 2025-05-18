// src/components/navigation/mobile-menu.tsx

import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { NavLinks } from "@/components/navigation/nav-links"

export const MobileMenu = () => {
  
  return (
    <div>
        <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <MenuIcon className="size-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground mb-4">
                    Navigate to different sections of the landing page.
                </SheetDescription>

                <div className="flex flex-col space-y-6 pt-14 px-4">

                    <NavLinks/>

                    <div className="md:hidden flex flex-col mt-4 space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                            Sign In
                        </Button>

                        <Button className="w-full justify-start bg-violet-600 hover:bg-violet-700">Register</Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    </div>
  )
}
