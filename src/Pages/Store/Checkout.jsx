import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext'; 
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, CheckCircle } from 'lucide-react';
import apiClient from '../../utils/apiClient';

// --- STRIPE IMPORTS ---
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../../components/store/PaymentForm'; // Ensure this path is correct

// Initialize Stripe (Replace with your Publishable Key)
const publicationKEY = import.meta.env.VITE_publishable_key;
console.log(publicationKEY);
const stripePromise = loadStripe(publicationKEY); 
console.log("primise is this :",stripePromise);

const Checkout = () => {
  const { items, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'Card'
  const [clientSecret, setClientSecret] = useState("");
  const [address, setAddress] = useState({
    address: '', city: '', postalCode: '', country: ''
  });

  // 1. Fetch Client Secret when User selects Card
  useEffect(() => {
    if (paymentMethod === 'Card') {
      const initStripePayment = async () => {
        if (cartTotal <= 0) return;

        try {
          // Amount must be in cents/lowest unit inside backend, but we send raw total here
          const response = await apiClient.post("/payment/create-payment-intent", {
            amount: cartTotal, 
          });
          setClientSecret(response.data.clientSecret);
        } catch (error) {
          console.error("Stripe Error", error);
        }
      };
      initStripePayment();
    }
  }, [paymentMethod, cartTotal]);

  console.log(cartTotal);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // 2. Handle Order Placement for COD (Standard)
  const placeOrderCOD = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const orderData = {
      orderItems: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        image: item.imageUrl,
        price: item.price,
        product: item.id,
        variantId: item.variantId,
      })),
      shippingAddress: address,
      paymentMethod: "Cash on Delivery",
      totalPrice: cartTotal,
      isPaid: false,
    };

    try {
      const response = await apiClient.post("/order/createOrder", orderData);
      if (response.status === 200 || response.status === 201) {
        alert("Order Placed Successfully!");
        clearCart();
        navigate("/order-success");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      alert(message);
    }
  };

  // 3. Handle Order Placement for STRIPE (Callback)
  const handleStripeOrder = async (paymentIntentId) => {
    const orderData = {
      orderItems: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        image: item.imageUrl,
        price: item.price,
        product: item.id,
        variantId: item.variantId,
      })),
      shippingAddress: address,
      paymentMethod: "Card Payment", // Stripe handles the network (Visa/Mastercard)
      totalPrice: cartTotal,
      isPaid: false, // Mark as Paid
      paymentId: paymentIntentId, // Save the Stripe Transaction ID
    };

    try {
      const response = await apiClient.post("/order/createOrder", orderData);
      console.log("order data :",orderData);
      if (response.status === 200 || response.status === 201) {
        console.log("sucess !!!!")
        alert("Payment Successful & Order Placed!"); // PaymentForm might handle the alert
        clearCart();
        navigate("/order-success");
      }
    } catch (error) {
      console.error("Database Save Error:", error);
      alert("Payment succeeded but order save failed. Please contact support.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Shipping & Payment Form */}
        <div className="space-y-6">
          
          {/* Section 1: Address (Shared for both methods) */}
          <form id="address-form" onSubmit={placeOrderCOD} className="space-y-4">
            <h2 className="text-xl font-semibold">Shipping Details</h2>
            <input 
              name="address" placeholder="Address" required 
              onChange={handleChange} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            />
            <div className="grid grid-cols-2 gap-4">
              <input name="city" placeholder="City" required onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              <input name="postalCode" placeholder="Postal Code" required onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <input name="country" placeholder="Country" required onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </form>

          {/* Section 2: Payment Method Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Payment Method</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {/* COD Selection */}
              <div 
                onClick={() => setPaymentMethod('COD')}
                className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'COD' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Banknote className="w-6 h-6" />
                <span className="font-medium text-sm">Cash on Delivery</span>
                {paymentMethod === 'COD' && <CheckCircle className="w-4 h-4 text-blue-600" />}
              </div>

              {/* Card Selection */}
              <div 
                onClick={() => setPaymentMethod('Card')}
                className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'Card' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="font-medium text-sm">Card Payment</span>
                {paymentMethod === 'Card' && <CheckCircle className="w-4 h-4 text-blue-600" />}
              </div>
            </div>

            {/* --- STRIPE ELEMENT RENDER --- */}
            {paymentMethod === 'Card' && (
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-fadeIn mt-4">
                {clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm handlePaymentSuccess={handleStripeOrder} />
                  </Elements>
                ) : (
                  <div className="text-center py-4 text-gray-500">Loading Secure Payment...</div>
                )}
              </div>
            )}
          </div>
          
          {/* CONFIRM BUTTON (Only for COD) */}
          {paymentMethod === 'COD' && (
            <button 
              type="submit"
              form="address-form" // Connects to the form ID above
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Confirm Order (COD) - {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(cartTotal)}
            </button>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {items.map((item) => (
            <div key={`${item.id}-${item.variantKey}`} className="flex justify-between items-center border-b border-gray-200 py-3 last:border-0">
              <div className="flex items-center gap-3">
                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-md bg-white border border-gray-200" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  {item.variantLabel && (
                    <p className="text-xs text-gray-500">{item.variantLabel}</p>
                  )}
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900">{new Intl.NumberFormat('en-PK', {style: 'currency', currency: 'PKR'}).format(item.price * item.quantity)}</span>
            </div>
          ))}
          
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between items-center pt-2 text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>{new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(cartTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;