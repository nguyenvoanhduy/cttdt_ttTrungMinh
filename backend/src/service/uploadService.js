import cloudinary from '../libs/cloudinary.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

/**
 * Upload service for handling all file uploads to Cloudinary
 */

// Create different storage configurations based on file type
const createStorage = (folder, resourceType = 'auto') => {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `mern_uploads/${folder}`,
      resource_type: resourceType,
      allowed_formats: resourceType === 'video' || resourceType === 'raw' 
        ? ['mp3', 'wav', 'mp4', 'pdf', 'doc', 'docx'] 
        : ['jpg', 'png', 'jpeg', 'webp', 'gif', 'bmp', 'svg'],
      transformation: resourceType === 'image' ? [{ quality: 'auto' }] : undefined
    },
  });
};

// Image upload (for covers, banners, etc)
export const imageUpload = multer({
  storage: createStorage('images', 'image'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Audio upload (for songs)
export const audioUpload = multer({
  storage: createStorage('audio', 'raw'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
});

// Video upload
export const videoUpload = multer({
  storage: createStorage('videos', 'video'),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// Document upload (for PDFs, books)
export const documentUpload = multer({
  storage: createStorage('documents', 'raw'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed!'), false);
    }
  }
});

// Generic upload for any file type
export const genericUpload = multer({
  storage: createStorage('misc', 'auto'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/**
 * Helper function to handle upload response
 */
export const handleUploadResponse = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  return res.json({
    success: true,
    url: req.file.path,
    publicId: req.file.filename,
    filename: req.file.originalname
  });
};

/**
 * Helper to delete file from Cloudinary
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return { success: true };
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return { success: false, error: error.message };
  }
};
