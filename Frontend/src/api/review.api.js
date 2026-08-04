import axios from "axios";

const reviewApiOne = axios.create({
    baseURL: "/api",
    withCredentials: true,
})

const reviewApiTwo = axios.create({
    baseURL: "/api/reviews",
    withCredentials: true,
})

export const createReviewApi = async function (productId, review) {
    try {
        const response = await reviewApiOne.post(`/product/${productId}/reviews`, review);
        return response.data;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}

export const updateReviewApi = async function (reviewId, payload) {
    try {
        const response = await reviewApiOne.put(`/reviews/${reviewId}`, payload);
        return response.data;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}

export const deleteReviewApi = async function (reviewId) {
    try {
        const response = await reviewApiOne.delete(`/reviews/${reviewId}`);
        return response.data;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}

export const getAllReviewsAdminApi = async function () {
    const response = await reviewApiTwo.get("/allReviews");
    return response.data;
}

export const getAllReviewsUserApi = async function (req, res) {
    const response = await reviewApiTwo.get("/userReviews");
    return response.data;
}

