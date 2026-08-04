import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        brand: {
            type: String,
            default: "",
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
        },

        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        tags: [
            {
                type: String,
                trim: true,
            },
        ],

        weight: {
            type: Number,
            default: 0,
        },

        dimensions: {
            width: {
                type: Number,
                default: 0,
            },

            height: {
                type: Number,
                default: 0,
            },

            depth: {
                type: Number,
                default: 0,
            },
        },

        warrantyInformation: {
            type: String,
            default: "",
        },

        shippingInformation: {
            type: String,
            default: "",
        },

        availabilityStatus: {
            type: String,
            enum: [
                "In Stock",
                "Out of Stock",
                "Low Stock",
            ],
            default: "In Stock",
        },

        returnPolicy: {
            type: String,
            default: "",
        },

        images: [
            {
                url: {
                    type: String,
                    required: true,
                },

                fileId: {
                    type: String,
                    default: "",
                },
            },
        ],

        reviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "review",
            },
        ],

        numReviews: {
            type: Number,
            default: 0,
        },
        totalSold: {
            type: Number,
            default: 0,
        }
    },
    {
        timestamps: true,
    }
);
const productModel = mongoose.model("product", productSchema);

export default productModel;