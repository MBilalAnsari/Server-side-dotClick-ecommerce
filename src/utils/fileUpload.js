import multer from "multer";
import path from "path";
import cloudinary from "../config/cloudinary.js";

// Configure multer for Vercel (serverless) environment
const storage = multer.memoryStorage(); // Use memory storage instead of disk

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
});

// Custom middleware to handle both file uploads and form data
export const uploadFields = (fields) => {
  return (req, res, next) => {
    // Use multer with memory storage for Vercel compatibility
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        // Handle multer errors gracefully
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          console.log('No files uploaded, parsing as regular form data');
          next();
          return;
        }
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

export const uploadToCloudinary = async (fileInput) => {
  let uploadedUrl = null;

  try {
    if (!fileInput || !fileInput.buffer) {
      throw new Error("Invalid file input - no file buffer provided");
    }

    // Convert buffer to base64 for Vercel compatibility
    const base64Image = fileInput.buffer.toString("base64");
    const dataUri = `data:${fileInput.mimetype};base64,${base64Image}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: process.env.CLOUDINARY_FOLDER || "ecommerce-products",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto" },
      ],
    });

    uploadedUrl = result.secure_url;
    console.log("Image uploaded to Cloudinary:", uploadedUrl);

    return uploadedUrl;
  } catch (err) {
    console.error("Upload Error:", err.message);
    return null;
  }
};