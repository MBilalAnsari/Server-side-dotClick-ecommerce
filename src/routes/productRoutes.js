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
// Handle both file uploads and form data updates - now handles cases with no files
router.put("/:id", protect, admin, uploadFields([
  { name: "productImages", maxCount: 5 }
]), updateProduct); // Update Product - handles both files and form data
router.delete("/:id", protect, admin, deleteProduct); // Delete Product

export default router;