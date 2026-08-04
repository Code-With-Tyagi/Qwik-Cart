import axios from "axios";

const addressApi = axios.create({
    baseURL: "/api/user/address",
    withCredentials: true,
});

export const addAddressApi = async function (payload) {
    const response = await addressApi.post("/", payload);
    return response.data;
};

export const getAllAddressApi = async function () {
    const response = await addressApi.get("/");
    return response.data;
};

export const getAddressByIdApi = async function (id) {
    const response = await addressApi.get(`/${id}`);
    return response.data;
};

export const updateAddressApi = async function (id, payload) {
    const response = await addressApi.put(`/${id}`, payload);
    return response.data;
};

export const deleteAddressApi = async function (id) {
    const response = await addressApi.delete(`/${id}`);
    return response.data;
};

export const setDefaultAddressApi = async function (id) {
    const response = await addressApi.patch(`/default/${id}`);
    return response.data;
};