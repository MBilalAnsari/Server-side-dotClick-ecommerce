import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const getOrderSummary = async (req, res) => {
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

    // Calculate total amount
    const totalAmount = orderSummary.reduce((acc, cur) => acc + cur.total, 0);

    res.json({
      message: "Order summary generated successfully",
      orderSummary,
      totalAmount,
      totalItems: cart.items.length,
    });

  } catch (err) {
    console.error("Order summary error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};