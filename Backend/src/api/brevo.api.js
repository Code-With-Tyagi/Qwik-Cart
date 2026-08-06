import axios from "axios";

const brevoApi = axios.create({
    baseURL: "https://api.brevo.com/v3",
    headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

export default brevoApi;