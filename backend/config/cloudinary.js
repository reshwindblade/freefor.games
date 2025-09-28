const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'freefor-games/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      // Use user ID as public_id for easy management
      return `avatar_${req.user._id}_${Date.now()}`;
    }
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Helper function to delete old avatar from Cloudinary
const deleteOldAvatar = async (avatarUrl) => {
  try {
    if (avatarUrl && avatarUrl.includes('cloudinary.com')) {
      // Extract public_id from URL
      const urlParts = avatarUrl.split('/');
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = `freefor-games/avatars/${publicIdWithExt.split('.')[0]}`;
      
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Error deleting old avatar:', error);
    // Don't throw error, just log it
  }
};

module.exports = {
  upload,
  cloudinary,
  deleteOldAvatar
};