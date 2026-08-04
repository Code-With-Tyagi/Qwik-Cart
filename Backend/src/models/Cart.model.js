import mongoose from "mongoose";
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1,
        },

        price:{
          type:Number,
        }
      },
    ],
  },
  {
    timestamps: true,
  }
);


const cartModel = mongoose.model("cart", cartSchema);

export default cartModel;