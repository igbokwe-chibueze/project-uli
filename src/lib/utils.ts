import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * getPublicIdFromUrl
 * --------------------
 * Extracts the public ID from a Cloudinary URL.
 * The public ID is the part of the URL that comes after the version number
 * and before the file extension.
 *
 * @param url - The full Cloudinary URL of the image.
 * @returns The public ID or null if not found.
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const regex = /\/v\d+\/(.*?)(\.[^./]+)?$/;
    const match = url.match(regex);
    if (match && match[1]) {
      // The public ID is the first captured group.
      // We remove the file extension from the publicId as Cloudinary's destroy method doesn't need it.
      return match[1];
    }
  } catch (error) {
    console.error("Failed to parse Cloudinary URL:", error);
  }
  return null;
};
