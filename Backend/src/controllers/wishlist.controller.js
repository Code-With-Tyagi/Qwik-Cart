import wishlistModel from "../models/wishlist.model.js";
import cartModel from "../models/Cart.model.js"
import productModel from "../models/product.model.js"

export const addToWishlist = async function (req, res) {
    try {
        let { item } = req.body;

        if (!item) {
            return res.status(400).json({
                message: "Product is required to add to the wishlist."
            })
        }

        const productId = item.map((item) => {
            return item.product
        })

        let isWhishListExists = await wishlistModel.findOne({ user: req.user._id });

        if (isWhishListExists) {

            let isProductInWishlist = isWhishListExists.items.some((item) => {
                return item.product.toString() === productId[0]
            })

            if (isProductInWishlist) {
                return res.status(200).json({
                    message: "Product already in wishlist"
                })
            }

            isWhishListExists.items.push({ product: productId[0] })
            await isWhishListExists.save();
            return res.status(200).json({
                message: "Product added to the existing wishlist successfully.",
                wishlist: isWhishListExists
            });
        }


        else {
            const wishlist = await wishlistModel.create({
                user: req.user._id,
                items: [
                    {
                        product: productId[0]
                    }
                ]

            })

            return res.status(201).json({
                message: "Wishlist created successfully.",
                wishlist: wishlist
            })
        }
    } catch (err) {
        return res.status(500).json({
            "message": "Something went wrong",
            error: err.message
        })
    }

}

export const getWishlist = async function (req, res) {
    try {
        let userWishlist = await wishlistModel.findOne({ user: req.user._id }).populate("items.product");

        if (!userWishlist) {
            return res.status(404).json({
                message: "Wishlist not found."
            });
        }

        if (userWishlist.items.length === 0) {
            return res.status(200).json({
                message: "Wishlist is empty."
            });
        }

        return res.status(200).json({
            message: "Wishlist fetched successfully",
            wishlist: userWishlist
        })
    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message
        })
    }


}

export const removeFromWishlist = async function (req, res) {
    try {
        let { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                message: "Product Id is required"
            })
        }

        let userWishlist = await wishlistModel.findOne({ user: req.user._id });

        if (!userWishlist) {
            return res.status(404).json({
                message: "Wishlist not found."
            });
        }

        if (userWishlist.items.length === 0) {
            return res.status(200).json({
                message: "Wishlist is empty."
            });
        }

        let isProductInWishlist = userWishlist.items.some((item) => {
            return item.product.toString() === productId
        })

        if (!isProductInWishlist) {
            return res.status(200).json({
                message: "Product not found in the wishlist."
            })
        }

        else {
            await userWishlist.updateOne(
                {
                    $pull: {
                        items: {
                            product: productId
                        }
                    }
                }
            );

            return res.status(200).json({
                message: "Product removed from wishlist successfully."
            });
        }

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message
        })
    }
}

export const clearWishlist = async function (req, res) {
    try {

        let userWishlist = await wishlistModel.findOne({ user: req.user._id });

        if (!userWishlist) {
            return res.status(404).json({
                message: "Wishlist not found."
            });
        }

        if (userWishlist.items.length === 0) {
            return res.status(200).json({
                message: "Wishlist is empty."
            });
        }

        userWishlist.items = [];
        await userWishlist.save();

        return res.status(200).json({
            message: "Wishlist cleared successfully."
        });

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message
        })
    }
}

export const moveOneToCart = async function (req, res) {
    try {
        let { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                message: "Product Id is required"
            });
        }

        let productDetails = await productModel.findOne({ _id: productId });
        if (!productDetails) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // --- STOCK CHECK 1: Is the product completely out of stock? ---
        if (productDetails.stock < 1) {
            return res.status(400).json({
                message: "This product is currently out of stock."
            });
        }

        let userWishlist = await wishlistModel.findOne({ user: req.user._id });

        if (!userWishlist || userWishlist.items.length === 0) {
            return res.status(404).json({
                message: "Wishlist is empty or not found."
            });
        }

        let isProductInWishlist = userWishlist.items.some((item) => {
            return item.product.toString() === productId;
        });

        if (!isProductInWishlist) {
            return res.status(400).json({
                message: "Product not found in the wishlist."
            });
        }

        let userCart = await cartModel.findOne({ user: req.user._id });

        if (!userCart) {
            await cartModel.create({
                user: req.user._id,
                items: [
                    {
                        product: productId,
                        quantity: 1,
                        price: productDetails.price
                    }
                ]
            });

            await userWishlist.updateOne({
                $pull: { items: { product: productId } }
            });

            return res.status(200).json({
                message: "Cart created successfully and product moved to cart."
            });
        }

        if (userCart) {
            let cartItem = userCart.items.find((item) => {
                return item.product.toString() === productId;
            });

            if (!cartItem) {
                userCart.items.push({
                    product: productId,
                    quantity: 1,
                    price: productDetails.price
                });
            } else {
                // --- STOCK CHECK 2: Does adding 1 exceed available stock? ---
                if (cartItem.quantity + 1 > productDetails.stock) {
                    return res.status(400).json({
                        message: `Cannot add more. Only ${productDetails.stock} unit(s) available in stock.`
                    });
                }
                
                cartItem.quantity += 1;
            }

            await userCart.save();
            await userWishlist.updateOne({
                $pull: { items: { product: productId } }
            });

            return res.status(200).json({
                message: "Product moved from wishlist to cart successfully."
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message
        });
    }
}


export const moveAllToCart = async function (req, res) {
    try {
        let userWishlist = await wishlistModel.findOne({ user: req.user._id }).populate("items.product");

        if (!userWishlist) {
            return res.status(404).json({
                message: "Wishlist not found."
            });
        }

        if (userWishlist.items.length === 0) {
            return res.status(200).json({
                message: "Wishlist is empty."
            });
        }

        let userCart = await cartModel.findOne({ user: req.user._id }).populate("items.product");

        // Initialize a cart document in memory if it doesn't exist yet
        if (!userCart) {
            userCart = new cartModel({
                user: req.user._id,
                items: []
            });
        }

        let movedCount = 0;
        let outOfStockCount = 0;
        let remainingWishlistItems = [];

        // Loop through wishlist items to check stock for each one
        for (const wishlistElem of userWishlist.items) {
            const productDetails = wishlistElem.product; 

            // Find if the product is already in the cart
            const cartItem = userCart.items.find((cItem) => {
                const cartProductId = cItem.product._id ? cItem.product._id : cItem.product;
                return cartProductId.toString() === productDetails._id.toString();
            });

            const currentCartQty = cartItem ? cartItem.quantity : 0;
            const targetQty = currentCartQty + 1;

            // --- STOCK CHECK ---
            if (productDetails.stock >= targetQty) {
                if (cartItem) {
                    cartItem.quantity += 1;
                } else {
                    userCart.items.push({
                        product: productDetails._id,
                        quantity: 1,
                        price: productDetails.price
                    });
                }
                movedCount++;
            } else {
                // If out of stock, keep it in the wishlist array
                remainingWishlistItems.push(wishlistElem);
                outOfStockCount++;
            }
        }

        // Only save cart if at least one item was moved
        if (movedCount > 0) {
            await userCart.save();
            userWishlist.items = remainingWishlistItems;
            await userWishlist.save();
        }

        // Return appropriate frontend responses based on how many succeeded
        if (outOfStockCount === 0) {
            return res.status(200).json({
                message: "All wishlist items moved to the cart successfully."
            });
        } else if (movedCount > 0) {
            return res.status(200).json({
                message: `Successfully moved ${movedCount} item(s) to cart. ${outOfStockCount} item(s) remained in wishlist due to insufficient stock.`
            });
        } else {
            return res.status(400).json({
                message: "Could not move any items to the cart due to insufficient stock."
            });
        }

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message
        });
    }
}

