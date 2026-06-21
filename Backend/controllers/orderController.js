import { Order } from "../models/Order.js";
import Product from "../models/Product.js";
import { sendResponse } from "../utils/response.js";

export const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, totalPrice, isPaid, paymentId } = req.body;
        console.log(paymentId);

        if (!orderItems || orderItems.length === 0) {
            return sendResponse(res, false, "No order items", 400);
        }

        for (const item of orderItems) {
            const product = await Product.findById(item.product);

            if (!product) {
                return sendResponse(res, false, `Product not found: ${item.name}`, 404);
            }

            if (item.variantId) {
                // generatedVariants is an array of subdocuments, so each has an _id
                const variant = product.generatedVariants.id(item.variantId);
                console.log(variant);

                if (!variant) {
                    return sendResponse(res, false, `Variant not found for: ${item.name}`, 404);
                }

                // Check Stock
                if (variant.quantity < item.quantity) {
                    return sendResponse(res, false, `Not enough stock for ${item.name}`, 400);
                }


                console.log(variant.quantity -= item.quantity);
            }

            else {
                if (product.quantity < item.quantity) {
                    return sendResponse(res, false, `Not enough stock for ${item.name}`, 400);
                }
                product.stock -= item.quantity;
            }

            await product.save();
        }

        const order = new Order({
            user: req.user?._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            isPaid,
            paymentId
        });

        const createdOrder = await order.save();

        sendResponse(res, true, "Order Created", createdOrder, 200);
    } catch (error) {
        console.error("Create Order Error:", error);
        sendResponse(res, false, { message: error.message }, 500);
    }
};



export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        sendResponse(res, true, "order fetched sucessfully", orders, 200);
    } catch (error) {
        console.error("Error fetching Orders:", error)
    }
}