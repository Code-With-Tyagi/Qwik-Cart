import axios from "axios";

let contactApi = axios.create({
    baseURL: "/api/contact",
    withCredentials: true,
})

export const createContactApi = async function (payload) {
    const response = await contactApi.post("/", payload);
    return response;
}

export const getAllContactsApi = async function () {
    const response = await contactApi.get("/");
    return response.data;
}

export const getContactByIdApi = async function (id) {
    const response = await contactApi.get(`/${id}`);
    return response.data;
}

export const deleteContactApi = async function (id) {
    const response = await contactApi.delete(`/${id}`);
    return response.data;
}

export const updateContactStatusApi = async function (id, payload) {
    const response = await contactApi.patch(`/${id}/status`, payload);
    return response.data;
}

export const markAsReadApi = async function (id) {
    const response = await contactApi.patch(`/${id}/read`);
    return response.data;
}

export const updateAdminNotesApi = async function (id, payload) {
    const response = await contactApi.patch(`/${id}/note`, payload);
    return response.data;
}

export const getContactsStatsApi = async function () {
    const response = await contactApi.get("/stats");
    return response.data;
}

export const getUserContactRequestsApi = async function () {
    const response = await contactApi.get("/me/contact-requests");
    return response.data;
}