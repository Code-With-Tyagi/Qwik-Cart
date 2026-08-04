import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },

    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },

    reviewerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const reviewModel = mongoose.model("review", reviewSchema);

export default reviewModel;