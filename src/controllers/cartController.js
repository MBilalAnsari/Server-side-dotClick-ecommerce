import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const addToCart = async (req, res) => {
    try {
        console.log('Add to cart request received:', req.body)
        console.log('User ID:', req.user?._id)
        console.log('User:', req.user)

        const { productId, quantity = 1, colour, size } = req.body
        const userId = req.user._id

        // Validate required fields
        if (!productId) {
            console.log('Product ID missing')
            return res.status(400).json({ message: "Product ID is required" })
        }

        // Validate quantity
        if (quantity < 1) {
            console.log('Invalid quantity:', quantity)
            return res.status(400).json({ message: "Quantity must be at least 1" })
        }

        console.log('Finding product with ID:', productId)
        const product = await Product.findById(productId)
        if (!product) {
            console.log('Product not found:', productId)
            return res.status(404).json({ message: "Product not found" })
        }

        console.log('Product found:', product.name, 'Stock:', product.totalStock)

        // Check if product is in stock
        if (!product.inStock) {
            console.log('Product out of stock')
            return res.status(400).json({ message: "Product is out of stock" })
        }

        // Check if requested quantity is available
        if (product.totalStock < quantity) {
            console.log('Insufficient stock. Available:', product.totalStock, 'Requested:', quantity)
            return res.status(400).json({ message: `Only ${product.totalStock} items available in stock` })
        }

        console.log('Finding or creating cart for user:', userId)
        let cart = await Cart.findOne({ user: userId })

        if (!cart) {
            console.log('Creating new cart for user')
            cart = new Cart({ user: userId, items: [] })
        }

        console.log('Current cart items:', cart.items.length)

        const existingItemIndex = cart.items.findIndex(
            (item) =>
                item.product.toString() === productId &&
                item.colour === colour &&
                item.size === size
        )

        console.log('Existing item index:', existingItemIndex)

        if (existingItemIndex > -1) {
            // Update existing item quantity
            const newQuantity = cart.items[existingItemIndex].quantity + quantity

            // Check if new total quantity is available
            if (product.totalStock < newQuantity) {
                console.log('Insufficient stock for updated quantity')
                return res.status(400).json({ message: `Only ${product.totalStock} items available in stock. Current quantity in cart: ${cart.items[existingItemIndex].quantity}` })
            }

            cart.items[existingItemIndex].quantity = newQuantity
            console.log('Updated existing item quantity to:', newQuantity)
        } else {
            // Add new item to cart
            cart.items.push({
                product: productId,
                quantity,
                colour,
                size
            })
            console.log('Added new item to cart')
        }

        console.log('Saving cart...')
        await cart.save()
        console.log('Cart saved successfully')

        console.log('Populating cart items...')
        await cart.populate("items.product")
        console.log('Cart populated successfully')

        console.log('Sending response...')
        res.json({
            message: "Product added to cart successfully",
            cart
        })
    } catch (err) {
        console.error("Add to cart error:", err)
        console.error("Error stack:", err.stack)
        res.status(500).json({ message: "Internal server error", error: err.message })
    }
}

export const getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId }).populate(
            "items.product"
        );

        if (!cart) {
            return res.json({ items: [], totalItems: 0, totalAmount: 0 });
        }

        // Calculate totals
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        res.json({
            ...cart.toObject(),
            totalItems,
            totalAmount
        });
    } catch (err) {
        console.error("Get cart error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const userId = req.user._id;

        // Validate quantity
        if (quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        const product = await Product.findById(cart.items[itemIndex].product);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if requested quantity is available
        if (product.totalStock < quantity) {
            return res.status(400).json({ message: `Only ${product.totalStock} items available in stock` });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        await cart.populate("items.product");

        res.json({
            message: "Cart item updated successfully",
            cart
        });
    } catch (err) {
        console.error("Update cart item error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user._id;
        console.log("whole" , itemId);
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

        if (cart.items.length === initialLength) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        await cart.save();
        await cart.populate("items.product");

        res.json({
            message: "Item removed from cart successfully",
            cart
        });
    } catch (err) {
        console.error("Remove from cart error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = [];
        await cart.save();

        res.json({
            message: "Cart cleared successfully",
            cart
        });
    } catch (err) {
        console.error("Clear cart error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
