import axios from "axios";

const seedApi = axios.create({
    baseURL: "http://localhost:3000/api/seed",
    withCredentials: true
})

export const productSeedApi = async function (payload) {
    const response = await seedApi.post("/products", payload);
    return response.data;
}