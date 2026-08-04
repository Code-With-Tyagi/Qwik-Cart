import axios from "axios";

const authApi = axios.create({
  baseURL: "/api/auth",
  withCredentials: true,
});

export const registerUserApi = async (userData) => {
  try {
    const response = await authApi.post("/register", userData);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const verifyOtpApi = async (payload) => {
  try {
    const response = await authApi.post("/verify-otp", payload);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const loginUserApi = async (userData) => {
  try {
    const response = await authApi.post("/login", userData);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getCurrentUserApi = async () => {
  try {
    const response = await authApi.get("/me");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const logoutUserApi = async () => {
  try {
    let response = await authApi.post("/logout");
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const forgotPasswordRequestApi = async (payload) => {
  try {
    let response = await authApi.post("/forgot-password/send-otp", payload);
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const forgotPasswordVerifyApi = async (payload) => {
  try {
    let response = await authApi.post("/forgot-password/reset", payload);
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const resendRegistrationOtpApi=async (payload)=>{
  try {
    let response = await authApi.post("/resend-registration-otp", payload);
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}