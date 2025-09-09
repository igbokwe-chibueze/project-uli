// src/features/organisations/components/organisation-avatar.tsx
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/getInitials";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define the props expected by the OrgAvatar component
type OrganisationAvatarProps = {
  orgName: string;                        // Organization name (used for alt text + initials fallback)
  logo?: string | null;                   // Optional logo URL (can be null or undefined)
  avatarClassName?: string;              // Optional extra className for <Avatar>
  imageClassName?: string;               // Optional extra className for <AvatarImage>
  fallbackClassName?: string;            // Optional extra className for <AvatarFallback>
};

/**
 * OrganisationAvatar
 *
 *  * A reusable Avatar component that:
 * - Displays an organization's logo if available.
 * - Falls back to initials when no logo exists.
 * - Allows customizing styles of Avatar, Image, and Fallback via props.
 *
 */
export const OrganisationAvatar = ({
  orgName,
  logo,
  avatarClassName,
  imageClassName,
  fallbackClassName,
}: OrganisationAvatarProps) => {

  return (
    <Avatar
      // Merge default styles with any custom styles passed from outside
      className={cn(
        "size-14 rounded-md flex items-center justify-center overflow-hidden",
        avatarClassName
      )}
    >
      <AvatarImage
        // Use organization logo if available, else undefined (prevents broken img)
        src={logo || undefined}
        alt={orgName}
        // Merge default styles with custom image styles
        className={cn(
          "object-contain p-1 bg-transparent rounded-lg",
          imageClassName
        )}
      />
      <AvatarFallback
        // Merge default styles with custom fallback styles
        className={cn("rounded-lg text-lg font-semibold", fallbackClassName)}
      >
        {/* Show initials generated from the organization name */}
        {getInitials(orgName)}
      </AvatarFallback>
    </Avatar>
  );
};
