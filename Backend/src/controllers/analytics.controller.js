import productModel from "../models/product.model.js";
import orderModel from "../models/order.model.js";
import userModel from "../models/user.model.js";

export const getAdminStats = async (req, res) => {
    try {

        const [
            totalOrders,
            totalProducts,
            totalUsers,
            pendingOrders,
            recentOrders,
            recentUsers,
            lowStockProducts,
            revenueResult,
            categories,
            topSellingProducts
        ] = await Promise.all([

            orderModel.countDocuments(),

            productModel.countDocuments(),

            userModel.countDocuments({ role: "User" }),

            orderModel.countDocuments({ status: "Pending" }),

            orderModel
                .find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("userId", "name email"),

            userModel
                .find({ role: "User" })
                .sort({ createdAt: -1 })
                .limit(5)
                .select("name email createdAt"),

            productModel
                .find({ stock: { $lt: 10 } })
                .select("title category stock price images totalSold brand"),

            orderModel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]),

            productModel.aggregate([
                {
                    $group: {
                        _id: "$category",
                        totalStock: {
                            $sum: "$stock"
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        category: "$_id",
                        totalStock: 1
                    }
                }
            ]),

            productModel
                .find({})
                .sort({ totalSold: -1 })
                .limit(5)
                .select("title images price totalSold brand category")

        ]);

        const totalRevenue =
            revenueResult.length > 0
                ? revenueResult[0].totalRevenue
                : 0;

        res.status(200).json({
            success: true,

            stats: {
                totalRevenue,
                totalOrders,
                totalProducts,
                totalUsers,
                pendingOrders
            },

            recentOrders,

            recentUsers,

            lowStockProducts,

            categories,

            topSellingProducts

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};