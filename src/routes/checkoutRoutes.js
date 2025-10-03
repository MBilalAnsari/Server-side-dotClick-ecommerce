import express from "express";
import { getOrderSummary } from "../controllers/checkoutController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, getOrderSummary); // Get order summary only

export default router;