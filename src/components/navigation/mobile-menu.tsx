// src/components/navigation/mobile-menu.tsx

import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { NavLinks } from "@/components/navigation/nav-links"
import LoginButton from "@/features/auth/components/login-button"
import Link from "next/link"

export const MobileMenu = () => {
  
  return (
    <div>
        <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="lg:hidden">
                <MenuIcon className="size-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">
                    Navigate to different sections of the landing page.
                </SheetDescription>

                <div className="flex flex-col space-y-6 pt-14 px-4">

                    <NavLinks/>

                    <div className="md:hidden flex flex-col mt-4 space-y-2">
                        <LoginButton asChild>
                            <Button variant={"outline"} size={"lg"} className="buttons w-full justify-start">
                                Sign In
                            </Button>
                        </LoginButton>
            
                        <Button asChild size={"lg"} className="buttons justify-start">
                            <Link href={"/registration"}>
                                Register
                            </Link>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    </div>
  )
}
