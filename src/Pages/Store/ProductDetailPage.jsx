import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/apiClient.js';
import axios from 'axios';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  RotateCcw, 
  Award,
  ArrowLeft,
  CheckCircle,
  Package
} from 'lucide-react';

import EcommNavbar from '../../components/store/EcommNavbar.jsx';
import Footer from '../../components/store/Footer.jsx';
import { useCart } from '../../contexts/CartContext.jsx';

const BACKEND_SERVER_URL = "http://localhost:5000";

// Format currency
function formatCurrency(value, curr) {
  if (curr === "usd" || curr === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value || 0);
  }
  if (curr === "pkr" || curr === "PKR") {
    return new Intl.NumberFormat('en-PK', {
      style: "currency",
      currency: "PKR"
    }).format(value || 0);
  }
  return `$${value || 0}`;
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentVariant, setCurrentVariant] = useState(null);
  const { addItem, openCart, clearCart } = useCart();
  const navigate = useNavigate();


  // Find matching variant based on selected options
  const findMatchingVariant = (variants, selected) => {
    if (!variants || variants.length === 0) return null;
    if (!selected || Object.keys(selected).length === 0) return variants[0];

    return variants.find(variant => {
      return variant.combination.every(combo => {
        return selected[combo.name] === combo.value;
      });
    }) || variants[0];
  };

  // Fetch related products
  const fetchRelatedProducts = async (category) => {
    try {
      const res = await axios.get(`${BACKEND_SERVER_URL}/api/ecomm/getproducts`);
      const rawProducts = res.data || [];
      
      const processed = rawProducts
        .filter(p => p.organization?.Category === category && p._id !== id && p.pricing?.Availability === true)
        .slice(0, 4)
        .map(p => {
          const rawImages = p?.Images || [];
          const validImages = rawImages.filter(img => img && img.trim() !== "");
          const fullImageUrls = validImages.map(imagePath => {
            const lowerPath = imagePath.toLowerCase();
            if (lowerPath.startsWith('http://') || lowerPath.startsWith('https://')) {
              return imagePath;
            }
            return `${BACKEND_SERVER_URL}${imagePath}`;
          });

          return {
            id: p?._id || p?.id,
            name: p?.productInformation?.Name || 'Unknown Product',
            price: p?.pricing?.Price || 0,
            currency: p?.pricing?.Currency,
            imageUrl: fullImageUrls[0] || 'https://placehold.co/400x300/e0e0e0/555?text=No+Image',
          };
        });

      setRelatedProducts(processed);
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(`/ecomm/getProductByID/${id}`);
        
        if (res.data?.success) {
          const productData = res.data.data;
          setProduct(productData);
          
          // Initialize selected variants from first option values
          const initialVariants = {};
          if (productData.options && productData.options.length > 0) {
            productData.options.forEach(option => {
              if (option.values && option.values.length > 0) {
                initialVariants[option.name] = option.values[0];
              }
            });
            setSelectedVariants(initialVariants);
          }

          // Set current variant based on selected variants
          if (productData.generatedVariants && productData.generatedVariants.length > 0) {
            const matchedVariant = findMatchingVariant(productData.generatedVariants, initialVariants);
            setCurrentVariant(matchedVariant || productData.generatedVariants[0]);
          }

          // Fetch related products
          fetchRelatedProducts(productData.organization?.Category);
        } else {
          setError(res.data?.message || 'Failed to fetch product.');
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle variant selection
  const handleVariantChange = (optionName, value) => {
    const newVariants = { ...selectedVariants, [optionName]: value };
    setSelectedVariants(newVariants);

    if (product?.generatedVariants) {
      const matchedVariant = findMatchingVariant(product.generatedVariants, newVariants);
      setCurrentVariant(matchedVariant);
    }
  };

  // Get image URLs
  const getImageUrls = () => {
    if (!product?.Images) return [];
    const rawImages = product.Images.filter(img => img && img.trim() !== "");
    return rawImages.map(imagePath => {
      const lowerPath = imagePath.toLowerCase();
      if (lowerPath.startsWith('http://') || lowerPath.startsWith('https://')) {
        return imagePath;
      }
      return `${BACKEND_SERVER_URL}${imagePath}`;
    });
  };

  const imageUrls = getImageUrls();
  const mainImage = imageUrls[selectedImageIndex] || imageUrls[0] || 'https://placehold.co/600x600/e0e0e0/555?text=No+Image';
  const displayPrice = currentVariant?.price ?? product?.pricing?.Price ?? 0;
  const displayCurrency = product?.pricing?.Currency || 'usd';
  const isAvailable = product?.pricing?.Availability && (currentVariant?.quantity > 0 || !currentVariant);

  const buildCartItemPayload = () => {
    if (!product) {
      return null;
    }

    const productId = product?._id || product?.id;
    if (!productId) {
      console.warn('Unable to determine product id for cart item.', product);
      return null;
    }

    const variantEntries = Object.entries(selectedVariants || {}).sort(([a], [b]) => a.localeCompare(b));
    const variantLabel = variantEntries.length
      ? variantEntries.map(([optionName, value]) => `${optionName}: ${value}`).join(' • ')
      : null;
    const variantKey =
      currentVariant?._id ||
      (variantEntries.length ? JSON.stringify(variantEntries) : 'default');

      console.log(variantKey);

    return {
      id: productId,
      name: product.productInformation?.Name || 'Unnamed Product',
      price: displayPrice,
      currency: displayCurrency,
      imageUrl: mainImage,
      variantLabel,
      variantId: currentVariant._id,
      variantKey: variantKey,
      maxQuantity: currentVariant?.quantity,
    };
  };

  const handleAddToCart = () => {
    if (!product || !isAvailable) {
      return;
    }

    const cartItem = buildCartItemPayload();
    if (!cartItem) {
      return;
    }

    addItem(cartItem, quantity);
    openCart();
  };

  const handleBuyNow = () => {
    if (!product || !isAvailable) {
      return;
    }

    const cartItem = buildCartItemPayload();
    if (!cartItem) {
      return;
    }

    clearCart();
    addItem(cartItem, quantity);
    navigate("/checkout", { state: { source: "buy-now", productId: cartItem.id } });
  };


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EcommNavbar />
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {/* <Link to="/store" className="hover:text-blue-600 transition-colors">
              Home
            </Link> */}
            {/* <span>/</span> */}
            <Link to="/store" className="hover:text-blue-600 transition-colors">
              Store
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {product.productInformation.Name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-xl overflow-hidden shadow-lg aspect-square">
              <img
                src={mainImage}
                alt={product.productInformation.Name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/600x600/e0e0e0/555?text=Image+Error";
                }}
              />
              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-200 shadow-lg ${
                  isWishlisted
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500"
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            {imageUrls.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.productInformation.Name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            {/* Product Specifications */}
            <div className="pt-6 border-t border-gray-200 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Specifications
              </h3>
              {product.specifications && product.specifications.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {product.specifications.map((spec, idx) => (
                    <div key={idx}>
                      <span className="text-sm text-gray-600">
                        {spec.name}:
                      </span>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No specifications available.
                </p>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {product.productInformation.Name}
              </h1>
              <div className="flex items-center gap-4">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-1">
                    (4.5) • 128 reviews
                  </span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900">
                {formatCurrency(displayPrice, displayCurrency)}
              </span>
              {product.pricing.Price > displayPrice && (
                <span className="text-xl text-gray-500 line-through">
                  {formatCurrency(product.pricing.Price, displayCurrency)}
                </span>
              )}
            </div>

            {/* Variant Selectors */}
            {product.options && product.options.length > 0 && (
              <div className="space-y-4">
                {product.options.map((option, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {option.name}:
                      {selectedVariants[option.name] && (
                        <span className="ml-2 text-blue-600">
                          {selectedVariants[option.name]}
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value, valIdx) => (
                        <button
                          key={valIdx}
                          onClick={() =>
                            handleVariantChange(option.name, value)
                          }
                          className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                            selectedVariants[option.name] === value
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stock Status */}
            {currentVariant && (
              <div className="flex items-center gap-2 text-sm">
                {currentVariant.quantity > 0 ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">
                      In Stock ({currentVariant.quantity} available)
                    </span>
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-medium">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-700">
                Quantity:
              </label>
              <div className="flex items-center border-2 border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-2 font-semibold text-gray-900 min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={
                    currentVariant && quantity >= currentVariant.quantity
                  }
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex gap-4">
              <button
                disabled={!isAvailable}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold text-white transition-all ${
                  isAvailable
                    ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5" />
                {isAvailable ? "Add to Cart" : "Out of Stock"}
              </button>
              <button
                className="px-6 py-4 border-2 border-gray-300 rounded-lg hover:bg-gray-300 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                onClick={handleBuyNow}
                disabled={!isAvailable}
              >
                Buy Now
              </button>
            </div>

            {/* Product Description */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.productInformation.Description ||
                  "No description available."}
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Free Shipping
                  </p>
                  <p className="text-xs text-gray-600">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Secure Payment
                  </p>
                  <p className="text-xs text-gray-600">100% secure checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <RotateCcw className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Easy Returns
                  </p>
                  <p className="text-xs text-gray-600">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Award className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Quality Guarantee
                  </p>
                  <p className="text-xs text-gray-600">Premium quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {/* {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/productDetail/${relatedProduct.id}`}
                  className="bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-lg group"
                >
                  <div className="aspect-w-4 aspect-h-3 w-full bg-gray-100 relative overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={relatedProduct.imageUrl}
                      alt={relatedProduct.name}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-xl font-extrabold text-black">
                      {formatCurrency(relatedProduct.price, relatedProduct.currency)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )} */}
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;