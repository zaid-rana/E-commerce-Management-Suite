import mongoose from "mongoose";
import { type } from "os";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },

    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },

            variantId: {
                type: String,
                required: false
            }
        },
    ],

    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },

    paymentMethod: {
        type: String,
        required: true,
        default: 'COD', // Cash on Delivery
    },

    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },

    isPaid: {
        type: Boolean,
        required: true,
    },

    paymentId: {
        type: String,
        required: false
    },

    status: {
        type: String,
        default: 'Pending', // Processing, Shipped, Delivered
    }
}, {timestamps: true})

export const Order = mongoose.model('Order', orderSchema);