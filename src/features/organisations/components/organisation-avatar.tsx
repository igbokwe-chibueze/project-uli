// src/features/organisations/components/organisation-avatar.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface OrganisationAvatarProps {
  image?: string | null;  // URL to the logo (nullable)
  name: string;           // e.g. "Acme Corp"
  className?: string;     // Any extra Tailwind classes you want to apply
}

/**
 * OrganisationAvatar
 *
 * - If `image` is a non-null string, we render a <div> with a Next.js <Image>
 *   that fills its container (cropped to a rounded box).
 * - If `image` is null or undefined, we render an <Avatar> wrapper + <AvatarFallback>
 *   that shows the first letter of `name` on a colored background.
 *
 * Usage:
 *   <OrganisationAvatar image={org.logo} name={org.name} className="h-6 w-6" />
 */
export const OrganisationAvatar = ({
  image,
  name,
  className,
}: OrganisationAvatarProps) => {
  // If we have a valid `image` URL, render that as a small square with object-cover
  if (image) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-background", // container is a rounded box
          className
        )}
      >
        <Image
          src={image}
          alt={`${name} logo`}
          fill
          sizes="20px" 
          className="object-cover"
        />
      </div>
    );
  }

  // Otherwise, show a fallback avatar with the first letter of `name`
  return (
    <Avatar className={cn("size-8 overflow-hidden rounded-lg")}>
    {/* <Avatar className={cn("size-8 overflow-hidden rounded-lg", className)}> */}
      <AvatarFallback className="flex items-center justify-center bg-sidebar-primary rounded-lg 
        text-lg text-sidebar-primary-foreground font-semibold uppercase"
      >
        {name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};
