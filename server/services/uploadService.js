const fs = require('fs');
const path = require('path');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Upload a file buffer either to Cloudinary (recommended production)
 * or local filesystem storage (development fallback only).
 * 
 * @param {Object} file - Express Multer file object with buffer, originalname, mimetype, size
 * @param {String} folder - Subdirectory or Cloudinary folder ('avatars' or 'documents')
 * @returns {Promise<{ url: string, publicId: string, fileName: string, fileSize: number }>}
 */
const uploadFile = async (file, folder = 'trizen') => {
  if (!file || !file.buffer) {
    throw new Error('No valid file buffer provided for upload.');
  }

  // 1. Cloudinary Production Mode
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `trizen/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error Diagnostic]', {
              message: error.message,
              name: error.name,
              http_code: error.http_code,
              error: error.error,
              folder: `trizen/${folder}`,
              mimetype: file.mimetype,
              size: file.size,
              fileName: file.originalname,
            });
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            fileName: file.originalname,
            fileSize: file.size,
          });
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  // 2. Local Ephemeral Development Fallback
  const ext = path.extname(file.originalname).toLowerCase();
  const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueName = `${folder}_${Date.now()}_${Math.round(Math.random() * 1e6)}_${safeBaseName}${ext}`;
  const filePath = path.join(uploadsDir, uniqueName);

  fs.writeFileSync(filePath, file.buffer);

  return {
    url: `/uploads/${uniqueName}`,
    publicId: uniqueName,
    fileName: file.originalname,
    fileSize: file.size,
  };
};

/**
 * Delete a file either from Cloudinary or local uploads folder.
 * 
 * @param {String} publicId - Cloudinary public_id or local filename
 */
const deleteFile = async (publicId) => {
  if (!publicId) return;

  if (isCloudinaryConfigured) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.warn(`[UploadService] Cloudinary deletion warning: ${err.message}`);
    }
  } else {
    try {
      const filePath = path.join(uploadsDir, publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.warn(`[UploadService] Local file deletion warning: ${err.message}`);
    }
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  isCloudinaryConfigured,
};
