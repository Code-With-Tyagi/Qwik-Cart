import axios from "axios";

const statsApi = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

const getAdminStatsApi=async function(){
    const response=await statsApi.get("/analytics");
    return response;
}

export default getAdminStatsApi