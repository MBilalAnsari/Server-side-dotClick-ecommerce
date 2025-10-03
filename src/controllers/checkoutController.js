import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const checkout = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check if all products are still in stock and available
    for (const item of cart.items) {
      if (!item.product.inStock) {
        return res.status(400).json({
          message: `${item.product.name} is currently out of stock`
        });
      }

      if (item.product.totalStock < item.quantity) {
        return res.status(400).json({
          message: `${item.product.name} only has ${item.product.totalStock} items in stock`
        });
      }
    }

    // Create order summary
    const orderSummary = cart.items.map((item) => ({
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      total: item.product.price * item.quantity,
      productId: item.product._id,
      colour: item.colour,
      size: item.size,
    }));

    // Calculate total amount (in cents for Stripe)
    const totalAmount = orderSummary.reduce((acc, cur) => acc + cur.total, 0);
    const totalAmountInCents = Math.round(totalAmount * 100);

    if (totalAmountInCents < 50) { // Minimum Stripe charge is $0.50
      return res.status(400).json({
        message: "Minimum order amount is $0.50"
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: orderSummary.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${item.name}${item.colour ? ` (${item.colour})` : ""}${item.size ? ` - Size: ${item.size}` : ""}`,
            description: `Quantity: ${item.quantity}`,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/cancel`,
      customer_email: req.user.email,
      metadata: {
        userId: userId.toString(),
        cartId: cart._id.toString(),
      },
    });

    res.json({
      message: "Checkout session created successfully",
      sessionId: session.id,
      url: session.url,
      orderSummary,
      totalAmount,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Get cart and user info from session metadata
      const cart = await Cart.findById(session.metadata.cartId).populate("items.product");

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Update product stock and sold count
      for (const item of cart.items) {
        const product = await Product.findById(item.product._id);
        if (product) {
          product.totalStock -= item.quantity;
          product.soldCount += item.quantity;

          // Set out of stock if no more items available
          if (product.totalStock <= 0) {
            product.inStock = false;
            product.totalStock = 0;
          }

          await product.save();
        }
      }

      // Clear the cart after successful payment
      cart.items = [];
      await cart.save();

      res.json({
        message: "Payment confirmed successfully! Order completed.",
        orderId: sessionId,
        amount: session.amount_total / 100, // Convert from cents
        status: "paid",
      });
    } else {
      res.status(400).json({
        message: "Payment not completed",
        status: session.payment_status
      });
    }
  } catch (err) {
    console.error("Payment confirmation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      amount: session.amount_total / 100,
      currency: session.currency,
    });
  } catch (err) {
    console.error("Get payment status error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
