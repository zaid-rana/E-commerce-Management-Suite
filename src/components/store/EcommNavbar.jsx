import React, { useMemo, useState } from 'react'
import { 
  ShoppingCart, 
  Search,  
  Heart, 
  X,
  Trash2,
  ChevronRight,
} from 'lucide-react';

import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext.jsx';
import CartModal from './CartModal.jsx';
import { useWishlist } from '../../contexts/WishlistContext.jsx';


const EcommNavbar = ({ query, setQuery }) => {
  const [internalQuery, setInternalQuery] = useState('');
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { cartCount, openCart, addItem } = useCart();
  const {wishlist, removeFromWishlist} = useWishlist();

  const searchValue = query ?? internalQuery;

  const handleSearchChange = (event) => {
    const { value } = event.target;
    if (setQuery) {
      setQuery(value);
    } else {
      setInternalQuery(value);
    }
  };

  const formatPrice = (price, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price || 0);
  };

  const wishlistBadge = useMemo(() => {
    if (wishlist.length === 0) return null;
    const displayValue = wishlist.length > 99 ? "99+" : wishlist.length;
    return (
      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-pink-500 rounded-full">
        {displayValue}
      </span>
    );
  }, [wishlist.length]);

  const cartBadge = useMemo(() => {
    if (!cartCount) return null;
    const displayValue = cartCount > 99 ? '99+' : cartCount;

    return (
      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
        {displayValue}
      </span>
    );
  }, [cartCount]);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                SPHE
                <span className="text-[#8B5CF6]">R</span>
                <span className="inline-block w-2 h-2 bg-[#8B5CF6] rounded-sm ml-0.5"></span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8 ml-8">
              <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">HOME</Link>
              <Link to="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">PRICING</Link>
              <Link to="/events" className="text-sm font-medium text-gray-600 hover:text-gray-900">EVENTS</Link>
              <Link to="/company" className="text-sm font-medium text-gray-600 hover:text-gray-900">COMPANY</Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4 ml-auto">
              {/* --- WISHLIST DROPDOWN SECTION --- */}
              <div className="relative hidden sm:block">
                <button
                  className="p-2 text-gray-600 hover:text-pink-600 transition-colors relative"
                  title="Wishlist"
                  onClick={() => setIsWishlistOpen(!isWishlistOpen)}
                >
                  <Heart className="w-6 h-6" color="black" />
                  {wishlistBadge}
                </button>

                {/* The Dropdown */}
                {isWishlistOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-700">
                        Your Wishlist ({wishlist.length})
                      </h3>
                      <button
                        onClick={() => setIsWishlistOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {wishlist.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No items yet.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {wishlist.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 flex gap-3 hover:bg-gray-50 transition-colors group"
                            >
                              {/* Tiny Image */}
                              <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/productDetail/${item.id}`}
                                  onClick={() => setIsWishlistOpen(false)}
                                >
                                  <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600">
                                    {item.name}
                                  </p>
                                </Link>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {formatPrice(item.price, item.currency)}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-1 justify-center">
                                <button
                                  onClick={() => addItem(item, 1)}
                                  className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                                  title="Move to Cart"
                                >
                                  Add
                                </button>
                                <button
                                  onClick={() => removeFromWishlist(item.id)}
                                  className="text-gray-400 hover:text-red-500 self-end p-1"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {wishlist.length > 0 && (
                      <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                        <Link
                          to="/wishlist" // Assuming you might build a full page later
                          className="text-xs font-semibold text-blue-600 hover:underline"
                          onClick={() => setIsWishlistOpen(false)}
                        >
                          View Full Wishlist
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* --- END WISHLIST SECTION --- */}

              {/* Cart Button */}
              <button
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
                title="Cart"
                onClick={openCart}
              >
                <ShoppingCart className="w-6 h-6" />
                {cartBadge}
              </button>

              {/* Login Link */}
              <Link
                to="/"
                className="hidden sm:inline-block text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                LOGIN
              </Link>

              {/* Sign up Button */}
              <Link
                to="/signup"
                className="hidden sm:inline-flex items-center justify-center gap-1 px-5 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
              >
                Sign up Now
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4 px-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchValue}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </nav>

      <CartModal />
    </>
  );
};

export default EcommNavbar
