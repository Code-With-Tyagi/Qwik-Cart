import orderModel from "../models/order.model.js";
import productModel from "../models/product.model.js";


export const createOrder = async function (req, res) {
    try {
        // 1. Extract addressId instead of address
        let { items, totalAmount, addressId, paymentId } = req.body;

        if (items && items.length == 0) {
            return res.status(400).json({
                message: "No items found in order"
            })
        }

        const existingPendingOrder = await orderModel.findOne({
            userId: req.user._id,
            items,
            totalAmount,
            addressId, // 2. Update to addressId
            paymentStatus: "Pending",
            paymentId: { $exists: false }
        }).populate('items.productId');

        if (existingPendingOrder) {
            return res.status(200).json({
                message: "Order already created",
                orderDetails: {
                    _id: existingPendingOrder._id,
                    userId: existingPendingOrder.userId,
                    items: existingPendingOrder.items,
                    totalAmount: existingPendingOrder.totalAmount,
                    addressId: existingPendingOrder.addressId, // 3. Update in response
                    paymentId: existingPendingOrder.paymentId,
                    status: existingPendingOrder.status,
                    createdAt: existingPendingOrder.createdAt,
                    updatedAt: existingPendingOrder.updatedAt
                }
            })
        }

        // Check stock for all products before creating order
        for (const item of items) {

            const product = await productModel.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            if (product.stock < item.qty) {
                return res.status(400).json({
                    success: false,
                    message: `${product.title} is out of stock`
                });
            }
        }

        let order = await orderModel.create({
            userId: req.user._id,
            items,
            totalAmount,
            addressId, // 4. Create using addressId
            paymentId
        })

        order = await order.populate('items.productId');

        res.status(201).json({
            message: "Order created successfully",
            orderDetails: {
                _id: order._id,
                userId: order.userId,
                items: order.items,
                totalAmount: order.totalAmount,
                addressId: order.addressId, // 5. Update in response
                paymentId: order.paymentId,
                status: order.status,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }
        })
        
    } catch (err) {
        res.status(500).json({
            message: "Some error occurred!",
            error: err.message,
        })
    }
}

export const getMyOrder = async function (req, res) {
    try {
        const order = await orderModel.find({ userId: req.user._id }).populate("items.productId");
        res.status(200).json({
            message: "User order fetched successfully!",
            orderDetails: order
        })
    }

    catch (err) {
        res.status(500).json({
            message: "Some error occurred",
            error: err.message
        })
    }
}

export const getOrders = async (req, res) => {
    try {

        const orders = await orderModel
            .find({})
            .populate("userId", "name email")
            .populate("addressId")
            .populate({
                path: "items.productId",
                select: "title brand category price stock images availabilityStatus totalSold"
            });

            console.log(orders);

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully!",
            orderDetails: orders,
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: "Some error occurred",
            error: err.message,
        });

    }
};

export const updateOrderStatus = async function (req, res) {
    try {
        let { status } = req.body;
        let orderId = req.params.id;
        console.log(orderId);

        let order = await orderModel.findById({ _id: orderId });

        if (!order) {
            res.status(404).json({
                message: "Order not found",
            })
        }

        if (order) {
            order.status = status;
            const updatedOrder = await order.save();

            res.status(200).json({
                message: "Orders status updates!",
                orderDetails: updatedOrder
            })
        }

    }

    catch (err) {
        res.status(500).json({
            message: "Some error occurred",
            error: err.message
        })
    }


}