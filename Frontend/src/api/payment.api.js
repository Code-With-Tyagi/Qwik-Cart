import axios from "axios";

const paymentApi = axios.create({
    baseURL: "/api/payment",
    withCredentials: true
})

export const createPaymentApi = async function (payload) {
    try {
        const response = await paymentApi.post("/create", payload);
        return response.data;
    } catch (err) {
        throw err;
    }
}

export const verifyPaymentApi = async function (payload) {
    try {
        const response = await paymentApi.post("/verify", payload);
        return response.data;
    } catch (err) {
        throw err;
    }
}