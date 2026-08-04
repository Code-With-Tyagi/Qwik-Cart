import axios from "axios";

const userApi=axios.create({
    baseURL:"/api/admin",
    withCredentials:true
});

export const adminAllUsersApi=async function(){
    const response=await userApi.get("/users");
    return response.data;
}