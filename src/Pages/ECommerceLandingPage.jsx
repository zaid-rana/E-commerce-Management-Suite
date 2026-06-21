import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {  
  Package,  
  Filter,
  Laptop,
  Smartphone,
  Camera,
  Tv,
  Refrigerator,
  Headphones,
  Gamepad2,
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';

import { Link } from 'react-router-dom';
import EcommNavbar from '../components/store/EcommNavbar';
import ProductCard from '../components/store/ProductCard';
import Footer from '../components/store/Footer';
import BannerSlideshow from ".././components/store/BannerSlideshow";

// --- Configuration ---
const BACKEND_SERVER_URL = "http://localhost:5000";

// Custom hook to fetch and structure data
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_SERVER_URL}/api/ecomm/getproducts`);
        const rawProducts = res.data;

        const processedProducts = rawProducts
          .filter(p => p.pricing?.Availability === true)
          .map((product) => {
            const rawImages = product?.Images || []; 
            const validImages = rawImages.filter((img) => img && img.trim() !== "");
            
            const fullImageUrls = validImages.map(imagePath => {
              const lowerPath = imagePath.toLowerCase(); 
              if (lowerPath.startsWith('http://') || lowerPath.startsWith('https://')) {
                  return imagePath; 
              } 
              return `${BACKEND_SERVER_URL}${imagePath}`;
            });

            return {
              id: product?._id || product?.id,
              name: product?.productInformation?.Name || 'Unknown Product',
              category: product?.organization?.Category,
              price: product?.pricing?.Price || 0,
              currency: product?.pricing?.Currency,
              description: product?.productInformation?.Description || 'No description provided.',
              imageUrl: fullImageUrls[0] || 'https://placehold.co/400x300/e0e0e0/555?text=No+Image',
            };
        });

        setProducts(processedProducts);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Check server connection (http://localhost:5000).");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

// --- Main Component ---
const LandingPage = () => {
  const { products, loading, error } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [ctaSearchQuery, setCtaSearchQuery] = useState('');

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Category icons mapping - matching Figma design
  const categoryIconMap = {
    'Electronics': Smartphone,
    'Computer & Laptop': Laptop,
    'Mobile & Phone': Smartphone,
    'Camera': Camera,
    'TV & Smart Box': Tv,
    'Home Appliance': Refrigerator,
    'Accessories': Headphones,
    'Other Categories': Gamepad2,
  };

  // Get category counts
  const getCategoryCount = (cat) => {
    return products.filter(p => p.category === cat).length;
  };

  // Get category badge color
  const getCategoryBadgeColor = (index) => {
    const colors = ['bg-gray-600', 'bg-green-500', 'bg-purple-500', 'bg-gray-600', 'bg-yellow-400'];
    return colors[index % colors.length];
  };

  // All Products - filter by search and category
  const allProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const shuffled = [...products].sort(() => 0.5 - Math.random());
  const featuredProducts = shuffled.slice(0, 6);
  const newArrivalProducts = shuffled.slice(0, 6);
  const flashSaleProducts = shuffled.slice(0, 3);

  // Format currency
  const formatCurrency = (value, curr = "USD") => {
    if (curr?.toLowerCase() === "usd") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value || 0);
    }
    if (curr?.toLowerCase() === "pkr") {
      return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
      }).format(value || 0);
    }
    return `$${(value || 0).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top Navigation Bar */}
      <EcommNavbar query={searchQuery} setQuery={setSearchQuery} />

      {/* Hero Section with 50% Off Badge */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative">
              {/* 50% Off Badge */}
              <div className="absolute -top-4 left-0 z-10 bg-[#8B5CF6] text-white px-6 py-3 rounded-lg font-bold text-xl">
                50%
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mt-8 leading-tight">
                Grab 50% Off Smartphone Collection
              </h1>
              <p className="text-gray-600 mt-4 text-lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              {/* Featured Product Card */}
              <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 shadow-md max-w-xs">
                <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                  <Smartphone className="w-16 h-16 text-gray-400" />
                </div>
                <p className="font-bold text-gray-900 mt-2">Xiphone 14 Edition</p>
              </div>
              {/* Quality Badges */}
              <div className="mt-4 flex gap-2">
                <span className="bg-gray-200 text-white px-4 py-2 rounded-lg text-sm font-semibold">Highest</span>
                <span className="bg-yellow-400 text-white px-4 py-2 rounded-lg text-sm font-semibold">Quality</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-gray-100 rounded-2xl h-96">
                <BannerSlideshow/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - "What we provide?" */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What we <span className="text-[#8B5CF6]">provide?</span>
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {categories.slice(0, 7).map((category, index) => {
              const IconComponent = categoryIconMap[category] || Package;
              return (
                <div key={category} className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:border-[#8B5CF6] transition-colors cursor-pointer">
                    <IconComponent className="w-10 h-10 text-gray-600" />
                  </div>
                  <p className="mt-3 text-sm text-gray-600 text-center max-w-[100px]">{category}</p>
                </div>
              );
            })}
            {/* Other Categories */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:border-[#8B5CF6] transition-colors cursor-pointer">
                <Gamepad2 className="w-10 h-10 text-gray-600" />
              </div>
              <p className="mt-3 text-sm text-gray-600 text-center max-w-[100px]">Other Categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrival Section with Sidebar */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900">
              New arrival <span className="text-[#8B5CF6]">for you</span>
            </h2>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center hover:bg-[#059669]">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                        selectedCategory === category 
                          ? 'bg-[#8B5CF6] text-white' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{category}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        selectedCategory === category 
                          ? 'bg-white text-[#8B5CF6]' 
                          : `text-white ${getCategoryBadgeColor(index)}`
                      }`}>
                        {getCategoryCount(category)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Product Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6] mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600">Loading products...</p>
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <strong>API Error: </strong>{error}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newArrivalProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banners - 2x2 Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Banner 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Might Sound, Everywhere</h3>
              <div className="bg-gray-100 rounded-lg h-48 mb-4"></div>
              <button className="bg-[#8B5CF6] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#7C3AED] transition-colors">
                Discover Now
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
            {/* Banner 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">20% OFF</h3>
              <p className="text-gray-600 mb-4">Special Christmas Day Offer</p>
              <div className="bg-gray-100 rounded-lg h-48 mb-4"></div>
              <button className="bg-[#8B5CF6] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#7C3AED] transition-colors">
                Discover Now
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
            {/* Banner 3 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Control Your Daily Activity On Yourself</h3>
              <div className="bg-gray-100 rounded-lg h-48 mb-4"></div>
              <button className="bg-[#8B5CF6] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#7C3AED] transition-colors">
                Discover Now
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
            {/* Banner 4 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Travels Light, Sounds Heavy</h3>
              <p className="text-gray-600 mb-4">20+ hours of portable playtime</p>
              <div className="bg-gray-100 rounded-lg h-48 mb-4"></div>
              <button className="bg-[#8B5CF6] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#7C3AED] transition-colors">
                Discover Now
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Flash sale for <span className="text-[#8B5CF6]">best sellers</span>
          </h2>
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6] mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashSaleProducts.map((product, index) => {
                const discountPercent = [8, 8, 13][index] || 10;
                return (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
                    <Link to={`/productDetail/${product.id}`}>
                      <div className="relative">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/400x300/e0e0e0/555?text=No+Image";
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-[#10B981] text-white px-3 py-1 rounded-lg text-sm font-semibold">
                          {discountPercent}% Off
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-lg font-bold text-gray-900 mb-2">{formatCurrency(product.price, product.currency)}</p>
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-[#10B981] fill-current" />
                          ))}
                          <span className="text-sm text-gray-500">(25)</span>
                        </div>
                        <button className="w-full border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA/Search Section */}
      <section className="py-16 bg-[#1F2937] rounded-2xl mx-4 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Gateway to a world of innovation with{' '}
                <span className="text-[#8B5CF6]">SPHERE</span>
                <span className="inline-block w-2 h-2 bg-[#8B5CF6] rounded-sm ml-1"></span>
              </h2>
            </div>
            <div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for products"
                  value={ctaSearchQuery}
                  onChange={(e) => setCtaSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
              </div>
              <button 
                onClick={() => setSearchQuery(ctaSearchQuery)}
                className="mt-4 w-full bg-[#10B981] text-white px-6 py-4 rounded-lg font-semibold hover:bg-[#059669] transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* All Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                All Products
              </h2>
              <p className="text-gray-600">
                Showing {allProducts.length} products
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
          {allProducts.length === 0 && !loading && !error ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer/>
    </div>
  );
};

export default LandingPage;
