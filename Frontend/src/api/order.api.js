import axios from "axios";

const orderApi = axios.create({
    baseURL: "/api/order",
    withCredentials: true
})

export const createOrderApi = async function (payload) {
    try {
        const response = await orderApi.post("/create", payload);
        return response.data;
    } catch (err) {
        throw err;
    }
}

export const getAllOrdersApi = async function () {
    try {
        const response = await orderApi.get("/allOrders");
        console.log(response);
        return response.data;
    } catch (err) {
        throw err;
    }
}

export const updateOrderStatusApi = async function (id, payload) {
    try {
        const response = await orderApi.put(`/status/${id}`, payload);
        return response.data;
    } catch (err) {
        throw err;
    }
}

export const getUserOrdersApi = async function () {
    try {
        const response = await orderApi.get("/my-orders");
        return response.data;
    } catch (err) {
        throw err;
    }
}