import reviewModel from "../models/reviews.model.js";
import productModel from "../models/product.model.js";

export const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.productId;

        if (!rating || !comment) {
            return res.status(400).json({
                message: "Rating and comment are required",
            });
        }

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        const review = await reviewModel.create({
            rating,
            comment,
            reviewerName: req.user.userName,
            reviewerEmail: req.user.userEmail,
            product: productId,
            user: req.user._id,
        });

        product.reviews.push(review._id);
        product.numReviews += 1;

        await product.save();

        res.status(201).json({
            message: "Review Created Successfully",
            review,
        });
    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            error: err.message,
        });
    }
};

export const getReviewsById = async (req, res) => {
    let { productId } = req.params;

    let product = await productModel.findById(productId).populate({
        path: "reviews",
        populate: { path: "user", select: "_id" }
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        })
    }

    res.status(200).json({
        message: "Product reviews fetched successfully!",
        productReviews: product.reviews
    })
};

export const updateReview = async (req, res) => {
    let { rating, comment } = req.body;
    let { reviewId } = req.params;

    const review = await reviewModel.findById(reviewId);

    if (!review) {
        return res.status(404).json({
            success: false,
            message: "Review not found"
        });
    }

    // Check if the user is the reviewer
    if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "You can only update your own review"
        });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    await review.save();

    res.status(200).json({
        message: "Review updated successfully",
        updatedReview: review,
    })

}

export const deleteReview = async (req, res) => {
    let { reviewId } = req.params;
    const review = await reviewModel.findById(reviewId);

    if (!review) {
        return res.status(404).json({
            message: "Review not found"
        })
    }

    // Check if the user is the reviewer
    if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "You can only delete your own review"
        });
    }

    let deletedReview = await reviewModel.findByIdAndDelete(reviewId);

    // Remove review from product's reviews array
    await productModel.findByIdAndUpdate(review.product, {
        $pull: { reviews: reviewId }
    });

    res.status(200).json({
        message: "Review deleted successfully",
        deletedReview: deletedReview
    })

}

export const getAllReviews = async (req, res) => {
    try {
        const allReviews = await reviewModel.find({});
        res.status(200).json({
            success: "true",
            message: "Review Fetched Successfully",
            reviews: allReviews
        })
    }
    catch (err) {
        res.status(500).json({
            message: "Something went wrong while fetching",
            error: err.message
        })
    }
}

export const getUserReviews = async function (req, res) {
    try {
        const userReviews = await reviewModel.find({ user: req.user._id }).populate("product");

        return res.status(200).json({
            message: "User reviews fetched successfully.",
            reviews: userReviews,
        });

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong while fetching user reviews.",
            error: err.message,
        });
    }
};