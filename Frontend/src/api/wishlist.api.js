import axios from "axios";

const wishlistApi = axios.create({
    baseURL: "/api/user/wishlist",
    withCredentials: true,
});

// Add To Wishlist
export const addToWishlistApi = async (payload) => {
    const response = await wishlistApi.post("/", payload);
    return response.data;
};

// Get Wishlist
export const getWishlistApi = async () => {
    const response = await wishlistApi.get("/");
    return response.data;
};

// Remove Product
export const removeFromWishlistApi = async (productId) => {
    const response = await wishlistApi.delete(`/${productId}`);
    return response.data;
};

// Clear Wishlist
export const clearWishlistApi = async () => {
    const response = await wishlistApi.delete("/");
    return response.data;
};

// Move One Product To Cart
export const moveOneWishlistToCartApi = async (productId) => {
    const response = await wishlistApi.post(`/moveOneToCart/${productId}`);
    return response.data;
};

// Move All Products To Cart
export const moveAllWishlistToCartApi = async () => {
    const response = await wishlistApi.post("/moveAllToCart");
    return response.data;
};