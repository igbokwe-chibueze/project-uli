// src/actions/deleteImageAction.ts

"use server";

import { v2 as cloudinary } from 'cloudinary';
import { getPublicIdFromUrl } from "@/lib/utils";

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

/**
 * Deletes a file from Cloudinary using its public URL.
 * This is a server action that runs securely on the server.
 *
 * @param imageUrl The full URL of the image to be deleted.
 * @returns A result object indicating success or failure.
 */
export async function deleteImageAction(imageUrl: string) {
  try {
    const publicId = getPublicIdFromUrl(imageUrl);
    
    if (!publicId) {
      console.warn("Could not extract public ID from the URL.");
      return { success: false, message: "Invalid image URL." };
    }

    // Call Cloudinary's destroy method securely on the server
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return { success: true, message: "Image deleted successfully." };
    } else {
      console.error("Cloudinary deletion failed:", result);
      return { success: false, message: "Failed to delete image." };
    }
  } catch (error) {
    console.error("Error in deleteImageAction:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}