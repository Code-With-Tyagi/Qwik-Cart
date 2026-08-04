import mongoose from "mongoose";

const panCardSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        panNumber: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            unique: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        panCardImage: {
            type: String,
            required: true
        },
        isVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const panCardModel = mongoose.model("PanCard", panCardSchema);

export default panCardModel;