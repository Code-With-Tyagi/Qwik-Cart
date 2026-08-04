import mongoose from "mongoose";
import { uploadFile, deleteFile } from "../services/storage.service.js";
import productModel from "../models/product.model.js";
import redisClient from "../services/redis.service.js";

const isValidProductId = (value) => {
  return typeof value === "string" && value.trim() !== "" && mongoose.Types.ObjectId.isValid(value);
};

export const createProduct = async (req, res) => {
  try {

    const {
      title,
      description,
      category,
      brand,
      price,
      discountPercentage,
      stock,
      tags,
      weight,
      width,
      height,
      depth,
      warrantyInformation,
      shippingInformation,
      returnPolicy,
    } = req.body;

    const images = req.files;

    // ============================
    // Required Field Validation
    // ============================

    if (
      !title ||
      !description ||
      !category ||
      !price
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category and price are required",
      });
    }

    // ============================
    // Image Validation
    // ============================

    if (!images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    // ============================
    // Upload All Images
    // ============================

    const uploadedImages = [];

    for (const image of images) {

      const uploadedImage = await uploadFile(
        image.buffer.toString("base64"),
        "QwikCart/Products"
      );

      uploadedImages.push({
        url: uploadedImage.url,
        fileId: uploadedImage.fileId,
      });

    }

    // ============================
    // Availability Status
    // ============================

    let availabilityStatus = "In Stock";

    if (stock <= 0) {

      availabilityStatus = "Out of Stock";

    } else if (stock <= 10) {

      availabilityStatus = "Low Stock";

    }

    // ============================
    // Create Product
    // ============================

    const productCreated = await productModel.create({

      title,

      description,

      category,

      brand,

      price,

      discountPercentage,

      stock,

      tags: tags
        ? (Array.isArray(tags)
          ? tags
          : typeof tags === 'string'
            ? tags.split(",").map((tag) => tag.trim())
            : [])
        : [],

      weight,

      dimensions: {
        width,
        height,
        depth,
      },

      warrantyInformation,

      shippingInformation,

      availabilityStatus,

      returnPolicy,

      images: uploadedImages,

      rating: 0,

      numReviews: 0,

      totalSold: 0,

      reviews: [],

    });

    await redisClient.del("products");

    return res.status(201).json({

      success: true,

      message: "Product created successfully",

      productDetails: productCreated,

    });

  } catch (err) {

    return res.status(500).json({

      success: false,

      message: "Something went wrong",

      error: err.message,

    });

  }
};

export const getAllProducts = async function (req, res) {
  try {
    const cacheKey = "products";

    const cachedProducts = await redisClient.get(cacheKey);

    if (cachedProducts) {
      console.log("Serving data from redis")
      return res.status(200).json({
        message: "Products fetched successfully",
        productDetails: JSON.parse(cachedProducts),
      });
    }

    const allProducts = await productModel.find({}).populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "_id",
      },
    });

    await redisClient.setEx(
      cacheKey,
      600,
      JSON.stringify(allProducts)
    );

    const check = await redisClient.get(cacheKey);

    console.log("serving data from db")
    return res.status(200).json({
      message: "Products fetched successfully",
      productDetails: allProducts,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getProductById = async function (req, res) {
  const productId = req.params.id;

  if (!isValidProductId(productId)) {
    return res.status(400).json({
      success: false,
      message: "A valid product id is required"
    });
  }

  const product = await productModel.findById(productId).populate({
    path: "reviews",
    populate: { path: "user", select: "_id" }
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }

  return res.status(200).json({
    message: "Product details fetched successfully",
    productDetails: product
  });
}

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!isValidProductId(productId)) {
      return res.status(400).json({
        success: false,
        message: "A valid product id is required",
      });
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let imageDetails = product.images;

    // Update Image If New Image Provided
    if (req.file) {
      if (product.images?.[0]?.fileId) {
        await deleteFile(product.images[0].fileId);
      }

      const uploadedImage = await uploadFile(
        req.file.buffer.toString("base64")
      );

      imageDetails = [
        {
          url: uploadedImage.url,
          fileId: uploadedImage.fileId,
        },
      ];
    }

    const {
      title,
      description,
      category,
      brand,
      price,
      discountPercentage,
      stock,
      tags,
      weight,
      width,
      height,
      depth,
      warrantyInformation,
      shippingInformation,
      returnPolicy,
      availabilityStatus: receivedAvailabilityStatus,
    } = req.body;

    // Auto availability status - use received value if provided, else calculate from stock
    let availabilityStatus = receivedAvailabilityStatus || product.availabilityStatus;

    const updatedStock =
      stock !== undefined
        ? Number(stock)
        : product.stock;

    // Only auto-calculate if not explicitly provided
    if (!receivedAvailabilityStatus) {
      if (updatedStock <= 0) {
        availabilityStatus = "Out of Stock";
      } else if (updatedStock <= 10) {
        availabilityStatus = "Low Stock";
      } else {
        availabilityStatus = "In Stock";
      }
    }

    const updatedProduct =
      await productModel.findByIdAndUpdate(
        productId,
        {
          title: title ?? product.title,

          description:
            description ?? product.description,

          category:
            category ?? product.category,

          brand:
            brand ?? product.brand,

          price:
            price ?? product.price,

          discountPercentage:
            discountPercentage ??
            product.discountPercentage,

          stock:
            updatedStock,

          tags:
            tags
              ? (Array.isArray(tags)
                ? tags
                : typeof tags === 'string'
                  ? tags.split(",").map((tag) => tag.trim())
                  : product.tags)
              : product.tags,

          weight:
            weight ?? product.weight,

          dimensions: {
            width:
              width ??
              product.dimensions?.width,

            height:
              height ??
              product.dimensions?.height,

            depth:
              depth ??
              product.dimensions?.depth,
          },

          warrantyInformation:
            warrantyInformation ??
            product.warrantyInformation,

          shippingInformation:
            shippingInformation ??
            product.shippingInformation,

          returnPolicy:
            returnPolicy ??
            product.returnPolicy,

          availabilityStatus,

          images: imageDetails,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    await redisClient.del("products");

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      updatedProduct,
    });
  } catch (err) {
    console.error("Update Product Error:", err);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong",
      error: err.message,
    });
  }
};

export const deleteProduct = async function (req, res) {
  const productId = req.params.id;

  if (!isValidProductId(productId)) {
    return res.status(400).json({
      success: false,
      message: "A valid product id is required"
    });
  }

  const productDetails = await productModel.findByIdAndDelete(productId);

  await redisClient.del("products");

  return res.status(200).json({
    message: "Product deleted successfully!",
    productInfo: productDetails
  });
}

export const getAllCategories = async (req, res) => {
  try {

    const categories = await productModel.distinct("category");

    res.status(200).json({
      success: true,
      categories
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};