import { v2 as cloudinary } from 'cloudinary';
import { Image } from '../models/Image.js';
import { env } from '../config/env.js';

// Configure Cloudinary SDK instance
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Persistent Media Storage Service
 * - Production: Strictly requires and uses Cloudinary persistent object storage for images and videos.
 * - Development: Falls back to MongoDB buffer storage for offline local testing only.
 */
export const mediaService = {
  /**
   * Upload image or video buffer to persistent object storage
   */
  uploadMedia: async (file) => {
    if (!file || !file.buffer) {
      return { success: false, status: 400, message: 'No file buffer provided for upload.' };
    }

    const isImage = file.mimetype?.startsWith('image/');
    const isVideo = file.mimetype?.startsWith('video/') || /\.(mp4|webm|mov|ogg)$/i.test(file.originalname || '');

    if (!isImage && !isVideo) {
      return {
        success: false,
        status: 400,
        message: 'Unsupported media format. Please upload an image (JPG, PNG, WebP) or video (MP4, WebM, MOV).'
      };
    }

    const mediaType = isVideo ? 'video' : 'image';
    const hasCloudinaryConfig = Boolean(
      env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
    );

    // 1. Production Mode: Strictly use Cloudinary
    if (hasCloudinaryConfig) {
      try {
        // Ensure configuration is applied
        cloudinary.config({
          cloud_name: env.CLOUDINARY_CLOUD_NAME,
          api_key: env.CLOUDINARY_API_KEY,
          api_secret: env.CLOUDINARY_API_SECRET,
          secure: true
        });

        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: mediaType,
              folder: 'luxury_watch_products',
              overwrite: false
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });

        const uploadResult = await uploadPromise;

        return {
          success: true,
          url: uploadResult.secure_url,
          type: mediaType,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          provider: 'cloudinary'
        };
      } catch (cloudErr) {
        console.error('❌ [Cloudinary Upload Error]:', cloudErr.message);
        if (env.isProduction) {
          return {
            success: false,
            status: 500,
            message: `Cloudinary upload failed: ${cloudErr.message}`
          };
        }
        // In non-production only, drop through to development fallback below
      }
    }

    // 2. Production Protection: Fail if Cloudinary is missing in production
    if (env.isProduction) {
      return {
        success: false,
        status: 500,
        message: 'Cloudinary media storage credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are required in production. Binary filesystem/database fallback is disabled in production.'
      };
    }

    // 3. Development Mode Only: Local MongoDB buffer fallback for offline testing
    try {
      const newImage = new Image({
        data: file.buffer,
        contentType: file.mimetype || (isVideo ? 'video/mp4' : 'image/jpeg')
      });
      await newImage.save();

      return {
        success: true,
        url: `/api/images/${newImage._id}`,
        type: mediaType,
        contentType: file.mimetype,
        provider: 'dev_mongodb_fallback'
      };
    } catch (dbErr) {
      console.error('❌ [Dev Media Storage Error]:', dbErr.message);
      return {
        success: false,
        status: 500,
        message: 'Failed to persist media to development storage.'
      };
    }
  },

  /**
   * Delete media by public ID from Cloudinary
   */
  deleteMedia: async (publicId, resourceType = 'image') => {
    if (!publicId) return { success: false, message: 'Public ID is required.' };
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      return { success: false, message: 'Cloudinary credentials not configured.' };
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      return { success: result.result === 'ok', result };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }
};

export default mediaService;
