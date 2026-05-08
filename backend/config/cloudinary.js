import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Ensure environment variables are loaded before configuring Cloudinary
dotenv.config();

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

// Log Cloudinary configuration status for debugging (without leaking secrets)
// These logs are safe to keep in development; consider removing or guarding by NODE_ENV for production.
console.log('[Cloudinary] Configuring Cloudinary client with:');
console.log('  CLOUDINARY_CLOUD_NAME:', CLOUDINARY_CLOUD_NAME || '(not set)');
console.log('  CLOUDINARY_API_KEY present:', Boolean(CLOUDINARY_API_KEY));
console.log('  CLOUDINARY_API_SECRET present:', Boolean(CLOUDINARY_API_SECRET));

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('[Cloudinary] ERROR: Missing credentials — uploads will fail. Check your .env file.');
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
