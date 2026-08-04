import cartModel from "../models/Cart.model.js";
import productModel from "../models/product.model.js";

export const addProduct = async (req, res) => {
    try {
        const { product, quantity } = req.body;

        if (!product) {
            return res.status(400).json({
                success: false,
                message: "Product is required.",
            });
        }

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than zero.",
            });
        }

        // Check product exists
        const dbProduct = await productModel.findById(product);

        if (!dbProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        // Check product stock
        if (dbProduct.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: "Product is out of stock.",
            });
        }

        let cart = await cartModel.findOne({
            user: req.user._id,
        });

        // Create cart if it doesn't exist
        if (!cart) {
            if (quantity > dbProduct.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${dbProduct.stock} item available.`,
                });
            }

            cart = await cartModel.create({
                user: req.user._id,
                items: [
                    {
                        product,
                        quantity,
                        price: dbProduct.price,
                    },
                ],
            });

            return res.status(201).json({
                success: true,
                message: "Product successfully added to cart.",
                cart,
            });
        }

        // Check if product already exists in cart
        const existingItem = cart.items.find(
            (item) => item.product.toString() === product
        );

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            if (newQuantity > dbProduct.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${dbProduct.stock} item available.`,
                });
            }

            existingItem.quantity = newQuantity;

            // Optional: keep latest product price
            existingItem.price = dbProduct.price;
        } else {
            if (quantity > dbProduct.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${dbProduct.stock} item(s) available.`,
                });
            }

            cart.items.push({
                product,
                quantity,
                price: dbProduct.price,
            });
        }

        await cart.save();

        await cart.populate("items.product");

        return res.status(200).json({
            success: true,
            message: "Product successfully added to cart.",
            cart,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getCartProducts = async function (req, res) {
    try {
        const cart = await cartModel.findOne({
            user: req.user._id,
        }).populate("items.product");

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found."
            });
        }

        return res.status(200).json({
            message: "Cart products fetched successfully.",
            cartProducts: cart.items,
        });

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong.",
            error: err.message
        });
    }
};

export const updateCartProduct = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than zero.",
            });
        }

        // Find Cart
        const cart = await cartModel.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found.",
            });
        }

        // Find Product
        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        // Find Item in Cart
        const item = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart.",
            });
        }

        // Stock Validation
        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock.`,
            });
        }

        // Update Quantity
        item.quantity = quantity;

        // Update latest price
        item.price = product.price;

        await cart.save();
        await cart.populate("items.product");

        return res.status(200).json({
            success: true,
            message: "Product quantity updated successfully.",
            cart,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteCartProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        // Find User Cart
        const cart = await cartModel.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found.",
            });
        }

        // Check Product Exists in Cart
        const itemExists = cart.items.some(
            (item) => item.product.toString() === productId
        );

        if (!itemExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart.",
            });
        }

        // Remove Product
        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        await cart.save();
        await cart.populate("items.product");

        return res.status(200).json({
            success: true,
            message: "Product removed from cart successfully.",
            cart,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


