import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { 
  Star, 
  Heart,
  ShoppingCart,
} from 'lucide-react';

import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';

const ProductCard = ({ product, featured = false }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const isWishlisted = isInWishlist(product.id);

  
  function formatCurrency(value, curr) {
    if (!value) return "$0.00";
    
    const currency = curr?.toLowerCase() || "usd";
    
    if (currency === "usd") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    }
    if (currency === "pkr") {
      return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
      }).format(value);
    }
    
    // Default fallback
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }
  
  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  }

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  } 

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full group ${
        featured ? "ring-2 ring-[#8B5CF6]" : ""
      }`}
    >
      <Link to={`/productDetail/${product.id}`}>
        {/* Product Image */}
        <div className="w-full bg-gray-100 relative overflow-hidden">
          <img
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            src={product.imageUrl}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/400x300/e0e0e0/555?text=No+Image";
            }}
          />

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? "fill-current" : ""
              }`}
            />
          </button>
        </div>
      </Link>
      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/productDetail/${product.id}`}>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-[#8B5CF6] transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="mb-2">
          <span className="text-xl font-extrabold text-gray-900">
            {formatCurrency(product.price, product.currency)}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-grow">
          {product.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 text-[#10B981] fill-current"
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">(25)</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
