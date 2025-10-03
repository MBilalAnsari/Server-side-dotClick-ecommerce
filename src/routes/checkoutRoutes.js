import express from "express";
import { checkout, confirmPayment, getPaymentStatus } from "../controllers/checkoutController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, checkout); // Create checkout session
router.post("/confirm", protect, confirmPayment); // Confirm payment and process order
router.get("/status/:sessionId", protect, getPaymentStatus); // Get payment status

export default router;