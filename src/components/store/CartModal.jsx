import React from 'react';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext.jsx';
import { useNavigate } from 'react-router-dom';



const formatCurrency = (value, currency) => {
  if (!value) value = 0;
  const normalizedCurrency = currency?.toUpperCase?.() || 'USD';

  try {
    return new Intl.NumberFormat(
      normalizedCurrency === 'PKR' ? 'en-PK' : 'en-US',
      {
        style: 'currency',
        currency: normalizedCurrency === 'PKR' ? 'PKR' : 'USD',
      }
    ).format(value);
  } catch (error) {
    console.warn('Unsupported currency passed to formatCurrency:', currency);
    return `$${value.toFixed(2)}`;
  }
};

const CartModal = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    setItemQuantity,
    cartTotal,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) {
    return null;
  }

  const handleDecrease = (item) => {
    if (item.quantity <= 1) {
      removeItem(item.id, item.variantKey);
    } else {
      setItemQuantity(item.id, item.quantity - 1, item.variantKey);
    }
  };

  const handleIncrease = (item) => {
    const nextQuantity = item.quantity + 1;
    if (item.maxQuantity && nextQuantity > item.maxQuantity) {
      return;
    }

    setItemQuantity(item.id, nextQuantity, item.variantKey);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
            <p className="text-sm text-gray-500">
              {items.length === 0
                ? 'Your cart is empty'
                : `${items.length} ${items.length === 1 ? 'item' : 'items'} in your cart`}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500">
              Add items to your cart to see them here.
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.variantKey}`} className="flex gap-4 px-6 py-5">
                <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                      {item.variantLabel && (
                        <p className="text-sm text-gray-500 mt-1">{item.variantLabel}</p>
                      )}
                      {item.maxQuantity && (
                        <p className="text-xs text-gray-400 mt-1">
                          {item.maxQuantity} available in stock
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(item.price, item.currency)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDecrease(item)}
                        className="p-1 rounded-full border border-gray-200 hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="min-w-[2rem] text-center font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrease(item)}
                        className={`p-1 rounded-full border border-gray-200 hover:bg-gray-100 ${
                          item.maxQuantity && item.quantity >= item.maxQuantity
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        aria-label="Increase quantity"
                        disabled={item.maxQuantity && item.quantity >= item.maxQuantity}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id, item.variantKey)}
                      className="inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-5 border-t border-gray-100 space-y-4">
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-sm font-medium">Subtotal</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(cartTotal, items[0]?.currency)}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 justify-between">
            <button
              onClick={clearCart}
              className="flex-1 min-w-[140px] px-4 py-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50"
              disabled={items.length === 0}
            >
              Clear Cart
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 min-w-[140px] px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-md"
              disabled={items.length === 0}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModal;



