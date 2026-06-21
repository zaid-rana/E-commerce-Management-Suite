import Stripe from "stripe";

// Initialize Stripe only if the API key is available
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not defined in environment variables. Please check your .env file.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const createPayment = async (req, res) => {
    try {
        const { amount } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), 
            currency: 'pkr', // or 'pkr'
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}