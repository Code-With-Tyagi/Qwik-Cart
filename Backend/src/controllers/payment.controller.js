import razorpay from "../services/razorpay.service.js";
import paymentModel from "../models/payment.model.js";
import orderModel from "../models/order.model.js";
import cartModel from "../models/Cart.model.js";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";
import crypto from "crypto";
import mongoose from "mongoose";

export const createPayment = async function (req, res) {

    try {

        const { amount, orderId } = req.body;

        // These options will come from frontend
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const razorpayOrder = await razorpay.orders.create(
            options
        );

        const payment = await paymentModel.create({

            userId: req.user._id,
            orderId: orderId,
            razorpayOrderId: razorpayOrder.id,
            amount: amount,
            currency: "INR"
        });

        return res.status(200).json({
            message: "Payment order created",
            payment,
            razorpayOrder
        });

    }

    catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }


}

export const verifyPayment = async function (req, res) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const secret = (process.env.RAZORPAY_SECRET || '').trim();
        const generatedSignature = crypto
            .createHmac(
                "sha256",
                secret
            )
            .update(
                razorpay_order_id + "|" + razorpay_payment_id
            )
            .digest("hex");

        // Use timingSafeEqual to compare signatures when possible
        let signaturesMatch = false;
        try {
            const a = Buffer.from(generatedSignature, 'hex');
            const b = Buffer.from(String(razorpay_signature).trim(), 'hex');
            if (a.length === b.length && a.length > 0) {
                signaturesMatch = crypto.timingSafeEqual(a, b);
            }
        } catch (e) {
            signaturesMatch = false;
        }

        if (!signaturesMatch) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }

        // Initialize the session and start the transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Find Payment (Pass session to read operation)
            const payment = await paymentModel.findOne({
                razorpayOrderId: razorpay_order_id
            }).session(session);

            if (!payment) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    success: false,
                    message: "Payment record not found"
                });
            }

            // 2. Find Order
            const order = await orderModel.findById(payment.orderId).session(session);

            if (!order) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }

            // 3. Find User
            const user = await userModel.findById(order.userId).session(session);

            if (!user) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // 4. Validate all products first
            for (const item of order.items || []) {
                const product = await productModel.findById(item.productId).session(session);

                if (!product) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(404).json({
                        success: false,
                        message: "Product not found"
                    });
                }

                if (product.stock < item.qty) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({
                        success: false,
                        message: `${product.title} is out of stock`
                    });
                }
            }

            // ==========================
            // ALL VALIDATIONS PASSED
            // START UPDATING DATABASE
            // ==========================

            // 5. Update Payment (Pass session to save operation)
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = "paid";
            await payment.save({ session });

            // 6. Update Order
            order.paymentId = razorpay_payment_id;
            order.paymentStatus = "Paid";
            await order.save({ session });

            // 7. Update Products
            for (const item of order.items || []) {
                await productModel.findByIdAndUpdate(
                    item.productId,
                    {
                        $inc: {
                            stock: -item.qty,
                            totalSold: item.qty
                        }
                    },
                    { session } // Pass session to findByIdAndUpdate
                );
            }

            // 8. Update User
            user.ordersCount += 1;
            await user.save({ session });

            // 9. Clear Cart
            await cartModel.findOneAndUpdate(
                {
                    user: payment.userId
                },
                {
                    $set: {
                        items: []
                    }
                },
                { session } // Pass session to findOneAndUpdate
            );

            // 10. Commit the transaction and end session
            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                payment,
                order // Note: Changed from updatedOrder to order since order was modified and saved
            });

        } catch (transactionError) {
            // If ANY error occurs during the transaction blocks, abort it
            await session.abortTransaction();
            session.endSession();

            // Re-throw to be caught by the outer catch block
            throw transactionError;
        }

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Verification failed",
            error: err.message
        });
    }
};
