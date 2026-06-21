// components/PaymentForm.jsx
import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function PaymentForm({ handlePaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/order-success',
      },
      redirect: "if_required", // Important: prevents redirect for simple card payments
    });

    if (error) {
      setMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Payment worked! Now call your existing placeOrder function
      console.log("STRIPE SUCCESS! Payment ID:", paymentIntent.id);
      handlePaymentSuccess(paymentIntent.id);
    } else {
      setMessage("Unexpected state");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <PaymentElement />
      {message && <div className="text-red-500 text-sm mt-2">{message}</div>}
      <button 
        disabled={isProcessing || !stripe || !elements} 
        id="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-4 hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}