// src/features/auth/components/socials.tsx

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {signIn} from "next-auth/react";

import { DEFAULT_LOGIN_REDIRECT_URL } from "@/routes";
import { Button } from "@/components/ui/button";


const Socials = () => {
    const searchParams = useSearchParams();

    // Get the callbackUrl parameter from the URL; if not set, the default redirect URL will be used.
    const callbackUrl = searchParams.get("callbackUrl");
    
    const onClick = (provider: "google") => {
        // Call signIn with the chosen provider and set the callback URL.
        signIn(provider, {
            callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT_URL
        });
    }
    
    // Render Google sign-in button.
    return (
        <div className="flex items-center w-full gap-x-2">
            <Button size={"lg"} variant={"outline"} 
                className="flex-1 buttons"
                onClick={() => onClick("google")}
            >
                <div className="relative size-5">
                    <Image
                        src="/icons/google-icon.svg"
                        alt="Google logo"
                        fill
                        sizes="20px"
                    />
                </div>
                <span className="text-muted-foreground font-medium">Continue with Google</span>
            </Button>
        </div>
    )
}

export default Socials;

