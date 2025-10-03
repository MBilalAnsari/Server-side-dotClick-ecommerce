import express from "express";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import cartRoutes from "./cartRoutes.js";
import checkoutRoutes from "./checkoutRoutes.js";

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/products", productRoutes);
router.use("/api/cart", cartRoutes);
router.use("/api/checkout", checkoutRoutes);

export default router;
