import axios from "axios";
import productModel from "../models/product.model.js";
import reviewModel from "../models/reviews.model.js";
import { uploadFile } from "../services/storage.service.js";

export const seedProducts = async (req, res) => {
  try {
    const { limit, skip } = req.body || {};

    const { data } = await axios.get(
      `https://dummyjson.com/products?limit=${limit}&skip=${skip}`
    );

    const products = data.products;

    let insertedCount = 0;

    for (const product of products) {
      const existingProduct = await productModel.findOne({
        title: product.title,
      });

      if (existingProduct) continue;

      const uploadedImages = [];

      // Upload Product Images
      for (const imageUrl of product.images) {
        try {
          const imageResponse = await axios.get(imageUrl, {
            responseType: "arraybuffer",
          });

          const buffer = Buffer.from(imageResponse.data);

          const uploadResult = await uploadFile(buffer,"QwikCart/Products");

          uploadedImages.push({
            url:
              uploadResult.url ||
              uploadResult.thumbnailUrl ||
              uploadResult.filePath ||
              "",
            fileId: uploadResult.fileId || "",
          });
        } catch (error) {
          console.log(
            `Failed to upload image for ${product.title}`,
            error.message
          );
        }
      }

      // Create Product without embedded review objects
      const createdProduct = await productModel.create({
        title: product.title,

        description: product.description,

        category: product.category,

        brand: product.brand || "",

        price: product.price,

        discountPercentage:
          product.discountPercentage || 0,

        stock: product.stock,

        rating: product.rating || 0,

        tags: product.tags || [],

        weight: product.weight || 0,

        dimensions: {
          width:
            product.dimensions?.width || 0,

          height:
            product.dimensions?.height || 0,

          depth:
            product.dimensions?.depth || 0,
        },

        warrantyInformation:
          product.warrantyInformation || "",

        shippingInformation:
          product.shippingInformation || "",

        availabilityStatus:
          product.availabilityStatus ||
          "In Stock",

        returnPolicy:
          product.returnPolicy || "",

        images: uploadedImages,
        reviews: [],
        numReviews: 0,
      });

      if (Array.isArray(product.reviews) && product.reviews.length > 0) {
        const reviewIds = [];

        for (const review of product.reviews) {
          const createdReview = await reviewModel.create({
            rating: review.rating,
            comment: review.comment,
            reviewerName: review.reviewerName,
            reviewerEmail: review.reviewerEmail,
            product: createdProduct._id,
            user: null,
            date: review.date,
          });

          reviewIds.push(createdReview._id);
        }

        createdProduct.reviews = reviewIds;
        createdProduct.numReviews = reviewIds.length;
        await createdProduct.save();
      }

      insertedCount++;
    }

    return res.status(201).json({
      success: true,
      insertedCount,
      message: "Products seeded successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};