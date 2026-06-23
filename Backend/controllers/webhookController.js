import Stripe from 'stripe';
import { Order } from '../models/Order.js'; // Import your Order Model

const process = globalThis.process;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook Signature Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            console.log(`Payment captured for ID: ${paymentIntent.id}`);

            try {
                // Find the order with this Stripe Payment ID and update it
                const order = await Order.findOneAndUpdate(
                    { paymentId: paymentIntent.id },
                    {
                        isPaid: true,
                        paidAt: Date.now(),
                        status: 'Processing' // Move from 'Pending' to 'Processing'
                    },
                    { new: true }
                );

                if (order) {
                    console.log(`Order ${order._id} marked as Paid!`);
                } else {
                    console.error(` Order not found for Payment ID: ${paymentIntent.id}`);
                }
            } catch (error) {
                console.error('Error updating order:', error);
            }
            break;
        }

        case 'payment_intent.payment_failed':
            console.log('Payment failed');
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
};