import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      enum: [
        "Question about an order",
        "Product inquiry",
        "Other",
      ],
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Resolved",
        "Closed",
      ],
      default: "Pending",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    repliedAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const contactModel = mongoose.model("Contact", contactSchema);

export default contactModel;