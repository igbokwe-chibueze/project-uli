// src/lib/cloudinary.ts

// import { v2 as cloudinary } from 'cloudinary';
// import type { UploadApiResponse, UploadApiOptions } from 'cloudinary';

// // Configure Cloudinary using environment variables
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key:    process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// /**
//  * Uploads a file buffer to Cloudinary
//  * @param fileBuffer - Buffer of the uploaded file
//  * @param options - Cloudinary upload options
//  * @returns the secure URL of the uploaded image
//  */
// export async function uploadImage(
//   fileBuffer: Buffer,
//   options?: UploadApiOptions
// ): Promise<string> {
//   const result: UploadApiResponse = await cloudinary.uploader.upload_stream(
//     options || { folder: 'organizations/logos' },
//     (error, response) => {
//       if (error) throw error;
//       return response;
//     }
//   ).end(fileBuffer);

//   if (!result.secure_url) throw new Error('Failed to upload image');
//   return result.secure_url;
// }


export const uploadImage = () => {
  
}
