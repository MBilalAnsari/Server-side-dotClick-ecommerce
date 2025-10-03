import multer from "multer";
import path from "path";
import cloudinary from "../config/cloudinary.js";

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

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
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Custom middleware to handle both file uploads and form data
export const uploadFields = (fields) => {
  return (req, res, next) => {
    // First, try to parse as multipart form data
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        // If multer fails, try to parse as regular form data
        if (err.code === 'LIMIT_UNEXPECTED_FILE' || !req.files) {
          // No files uploaded, but might have other form fields
          console.log('SERVER - No files uploaded, parsing as regular form data');
          next();
          return;
        }
        return next(err);
      }
      next();
    });
  };
};

export const uploadToCloudinary = async (fileInput) => {
  let uploadedUrl = null;

  try {
    if (!fileInput || !fileInput.path) {
      throw new Error("Invalid file input - no file path provided");
    }

    // Read file from path and convert to base64
    const fs = await import('fs');
    const fileBuffer = fs.readFileSync(fileInput.path);
    const base64Image = fileBuffer.toString("base64");
    const dataUri = `data:${fileInput.mimetype};base64,${base64Image}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "ecommerce-profiles",
      transformation: [
        { width: 500, height: 500, crop: "limit" },
        { quality: "auto" },
      ],
    });

    uploadedUrl = result.secure_url;
    // console.log("Image uploaded to Cloudinary:", uploadedUrl);

    return uploadedUrl;
  } catch (err) {
    console.error("Upload Error:", err.message);
    return null;
  } finally {
    // Always try to delete local file
    try {
      if (fileInput && fileInput.path) {
        const fs = await import('fs');
        if (fs.existsSync(fileInput.path)) {
          fs.unlinkSync(fileInput.path);
          console.log("Local file deleted:", fileInput.path);
        }
      }
    } catch (deleteError) {
      console.error("Error deleting local file:", deleteError.message);
    }
  }
};