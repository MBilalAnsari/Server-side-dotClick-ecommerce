import express from "express";
import { addToCart, getCart, removeFromCart, updateCartItem, clearCart } from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addToCart); // Add product to cart
router.get("/", protect, getCart); // Get user cart
router.put("/:itemId", protect, updateCartItem); // Update cart item quantity
router.delete("/:itemId", protect, removeFromCart); // Remove item from cart
router.delete("/", protect, clearCart); // Clear entire cart

export default router; 