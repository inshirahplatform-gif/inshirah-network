/**
 * Cloudinary v2 server-side helper.
 * Never import this in client components — it exposes the API secret.
 */
import { v2 as cloudinary } from "cloudinary";

function configure() {
  const cloudName  = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey     = process.env.CLOUDINARY_API_KEY;
  const apiSecret  = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set."
    );
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  return cloudinary;
}

/** Upload a base64 data URI to Cloudinary and return the result. */
export async function uploadToCloudinary(
  base64DataUri: string,
  folder = "inshirah_products"
) {
  const cld = configure();
  const result = await cld.uploader.upload(base64DataUri, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return { secureUrl: result.secure_url, publicId: result.public_id };
}

/** Delete an image from Cloudinary by its public_id. Safe to call even if id is falsy. */
export async function deleteFromCloudinary(publicId: string | undefined | null) {
  if (!publicId) return;
  const cld = configure();
  await cld.uploader.destroy(publicId, { resource_type: "image" });
}
