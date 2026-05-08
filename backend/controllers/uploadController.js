import { errorResponse } from '../utils/apiResponse.js';

const normalizeUploadResult = (file) => {
  const uploadedUrl = file?.secure_url || file?.path || file?.url || null;
  const publicId = file?.public_id || file?.filename || null;
  const format = file?.format || (file?.mimetype ? file.mimetype.split('/')[1] : null);
  const resourceType = file?.resource_type || (file?.mimetype ? file.mimetype.split('/')[0] : null);
  const folder = publicId && publicId.includes('/') ? publicId.substring(0, publicId.lastIndexOf('/')) : null;

  return {
    uploadedUrl,
    publicId,
    format,
    resourceType,
    folder,
  };
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No image file provided', 400);
    }

    console.log('[UploadController] Raw image upload file object:', req.file);
    const normalized = normalizeUploadResult(req.file);
    const imageUrl = normalized.uploadedUrl;

    if (!imageUrl) {
      console.error('[UploadController] Could not resolve uploaded image URL from file object:', req.file);
      return errorResponse(res, 'Upload completed but no image URL was returned by Cloudinary', 500);
    }

    // Return both a top-level imageUrl and a data payload for flexibility
    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl,
      data: {
        url: imageUrl,
        imageUrl,
        publicId: normalized.publicId,
        format: normalized.format,
        resourceType: normalized.resourceType,
        folder: normalized.folder,
      },
    });
  } catch (error) {
    console.error('[UploadController] Error during image upload:', error);
    return errorResponse(res, error.message || 'Failed to upload image', 500);
  }
};

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No video file provided', 400);
    }

    console.log('[UploadController] Raw video upload file object:', req.file);
    const normalized = normalizeUploadResult(req.file);
    const videoUrl = normalized.uploadedUrl;

    if (!videoUrl) {
      console.error('[UploadController] Could not resolve uploaded video URL from file object:', req.file);
      return errorResponse(res, 'Upload completed but no video URL was returned by Cloudinary', 500);
    }

    return res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      videoUrl,
      data: {
        url: videoUrl,
        videoUrl,
        publicId: normalized.publicId,
        format: normalized.format,
        resourceType: normalized.resourceType,
        folder: normalized.folder,
      },
    });
  } catch (error) {
    console.error('[UploadController] Error during video upload:', error);
    return errorResponse(res, error.message || 'Failed to upload video', 500);
  }
};
