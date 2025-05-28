// src/lib/uploadToCloudinary.ts
/**
 * uploadToCloudinary
 * ------------------
 * Uploads any File object to Cloudinary via an unsigned preset.
 * Reusable for organisation logos, project pictures, user avatars, etc.
 *
 * @param file        - The File object selected in the browser.
 * @param presetName  - (Optional) The name of your unsigned upload preset.
 *                       Defaults to "org_logos_unsigned".
 * @param folderPath  - (Optional) A target folder in your Cloudinary account 
 *                       (e.g. "organisations/logos" or "projects/images").
 * @returns           - The secure URL of the uploaded asset.
 */
export async function uploadToCloudinary(
    file: File,
    presetName: string,
    folderPath?: string
): Promise<string> {

    // Build the multipart form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", presetName);
    if (folderPath) {
        formData.append("folder", folderPath);
    }

    // Send to Cloudinary's unsigned upload endpoint
    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: "POST", body: formData }
    );

    if (!response.ok) {
        throw new Error(`Cloudinary upload failed (${response.status})`);
    }

    const data = await response.json();
    // secure_url is the HTTPS link to the uploaded file
    return data.secure_url as string;
}
