import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const videoMimeTypes = ['video/mp4', 'video/quicktime', 'video/mov', 'video/webm', 'video/x-matroska'];

const createStorage = (resourceType, folder) => {
  console.log(`[UploadMiddleware] Initializing CloudinaryStorage for ${resourceType} in folder "${folder}"`);
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      resource_type: resourceType,
    },
  });
};

const imageStorage = createStorage('image', process.env.CLOUDINARY_FOLDER_IMAGES || 'music-ecosystem/images');
const videoStorage = createStorage('video', process.env.CLOUDINARY_FOLDER_VIDEOS || 'music-ecosystem/videos');

const createFileFilter = (allowedMimeTypes, typeLabel) => (req, file, cb) => {
  console.log(`[UploadMiddleware] ${typeLabel} upload received. mimetype="${file.mimetype}", originalname="${file.originalname}"`);

  if (!allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error(
      `Invalid ${typeLabel} file type. Supported formats are ${allowedMimeTypes.join(', ')}. Received: ${file.mimetype}`
    );
    console.error('[UploadMiddleware] File type validation error:', error.message);
    return cb(error);
  }

  cb(null, true);
};

export const imageUpload = multer({
  storage: imageStorage,
  fileFilter: createFileFilter(imageMimeTypes, 'image'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const videoUpload = multer({
  storage: videoStorage,
  fileFilter: createFileFilter(videoMimeTypes, 'video'),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});
