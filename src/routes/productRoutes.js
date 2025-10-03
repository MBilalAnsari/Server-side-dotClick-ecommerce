import express from "express";
import { createProduct, getProducts, getProductBySlug, updateProduct, deleteProduct, getProductById, } from "../controllers/productController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
import { upload, uploadFields } from "../utils/fileUpload.js";

const router = express.Router();

// Multiple files upload for product images (up to 5 images)
router.post("/", protect, admin, upload.array("productImages", 5), createProduct); // Create Product with images
router.get("/", getProducts); // Get All Products (filters, sort, pagination)
router.get("/:slug", getProductBySlug); // Get Product by Slug
router.get("/id/:id", protect, admin, getProductById);

// Update Product - handle both files and form data properly
router.put("/:id", protect, admin, (req, res, next) => {
  // Check if files are being uploaded
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    // Use upload middleware for file uploads
    return uploadFields([
      { name: "productImages", maxCount: 5 }
    ])(req, res, next);
  } else {
    // Skip upload middleware for regular form data
    next();
  }
}, updateProduct);

router.delete("/:id", protect, admin, deleteProduct); // Delete Product

export default router;