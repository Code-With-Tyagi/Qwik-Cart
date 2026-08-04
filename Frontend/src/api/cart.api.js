import axios from "axios";

const cartApi = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
})

export const addToCartApi = async function (payload) {
    try {
        const response = await cartApi.post("/add", payload);
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export const getCartApi = async function () {
    try {
        const response = await cartApi.get("/");
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export const updateCartQuantityApi = async function (quantity,productId) {
    try {
        const response = await cartApi.put(`/${productId}`, {quantity});
        return response.data;
    }
    catch (err) {
        throw err;
        console.log(err);
    }
}

export const removeCartApi = async function (productId) {
    try {
        const response = await cartApi.delete(`/${productId}`);
        console.log(productId);
        return response.data;
    }
    catch (err) {
        throw err;
        console.log(err);
    }
}

