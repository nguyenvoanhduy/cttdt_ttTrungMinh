import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../libs/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mern_uploads", // tên thư mục trên cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp", "gif", "bmp", "svg"],
    resource_type: "auto", // auto-detect resource type
    transformation: [{ quality: "auto" }]
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

export default upload;
