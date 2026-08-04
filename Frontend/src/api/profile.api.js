import axios from "axios";

const profileApi = axios.create({
    baseURL: "/api/user/profile",
    withCredentials: true
});


export const personalInfoUpdateApi = async function (payload) {
    const response = await profileApi.patch("/personal", payload);
    return response.data;
};

export const requestEmailUpdateApi = async function (payload) {
    const response = await profileApi.patch("/email/request", payload);
    return response.data;
};

export const verifyEmailUpdateApi = async function (payload) {
    const response = await profileApi.patch("/email/verify", payload);
    return response.data;
};

export const requestMobileUpdateApi = async function (payload) {
    const response = await profileApi.patch("/mobile/request", payload);
    return response.data;
};

export const verifyMobileUpdateApi = async function (payload) {
    const response = await profileApi.patch("/mobile/verify", payload);
    return response.data;
};

export const changePasswordApi = async function (payload) {
    const response = await profileApi.patch("/change-password", payload);
    return response.data;
};

export const deactivateAccountApi = async function (payload) {
    const response = await profileApi.post("/account/deactivate", payload);
    return response.data;
};

export const deleteAccountApi = async function (payload) {
    const response = await profileApi.delete("/account/delete", {
        data: payload
    });
    return response.data;
};

export const reactivateAccountRequestApi = async function (payload) {
    const response = await profileApi.post("/reactivate/request", payload);
    return response.data;
};

export const reactivateAccountVerifyApi = async function (payload) {
    const response = await profileApi.patch("/reactivate/verify", payload);
    return response.data;
};