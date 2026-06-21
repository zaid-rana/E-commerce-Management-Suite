import axios from "axios";
import { data } from "react-router-dom";

const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
const MarketUrl = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=180";

const productURL = "https://fakestoreapiserver.reactbd.org/api/orders?page=1&perPage=50";

async function fetchMarketData() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    // Print the first 10 coins with price
    data.slice(0, 10).forEach(coin => {
      console.log(`${coin.name} (${coin.symbol.toUpperCase()}): $${coin.current_price}`);
    });
  } catch (err) {
    console.error("Error fetching market data:", err);
  }
}

async function CryptoMarketData() {
  try{
    const response = await fetch(MarketUrl);
    const data = await response.json();

    console.log(data);
  } catch (error){
    console.error("error fetching bitcoin market data:", error);
  }
}

async function productData() {
  try {
    const response = await fetch(productURL);
    const json = await response.json();

    if (!json.data || !Array.isArray(json.data)) {
      throw new Error("Unexpected response format");
    }

    json.data.forEach((order) => {
      console.log(`\n📦 Order ID: ${order._id}`);
      console.log(`📅 Date: ${order.orderDate}`);
      console.log(`💰 Total: $${order.totalAmount}`);
      console.log(`✅ Status: ${order.status}`);

      console.log("🛒 Items:");
      order.items.forEach((item) => {
        console.log(
          `   - ${item.name} — $${item.price}`
        );
      });
    });
  } catch (error) {
    console.error("Error fetching product data:", error.message);
  }
}

// productData();

async function AddProductData() {
  try {
    const response = await fetch("https://dummyjson.com/products");
    const data = await response.json();

    // pick only the required fields
    const filteredProducts = data.products.map(product => ({
      id: product.id,
      title: product.title,
      category: product.category,
      price: product.price,
      sku: product.sku,
      images: product.images
    }));

    console.log(filteredProducts);
  } catch (error) {
    console.error("cannot fetch data", error.message);
  }
}

// AddProductData();
async function getFromMyAPI() {
  try {
    const res = await axios.get("http://localhost:5000/api/ecomm/getproducts");
    const products = res.data;

    // Loop through all products
    products.forEach((product) => {
      console.log("Product Name:", product.productInformation.Name);
      console.log("SKU:", product.productInformation.SKU);
      console.log("Description:", product.productInformation.Description);
      console.log("Price:", product.pricing.Price);
      console.log("Available:", product.pricing.Availability);
      console.log("Vendor:", product.organization.Vendor);
      console.log("Images:", product.Images);
      console.log("--------------------------");
    });
  } catch (error) {
    console.error("due to:", error.message);
  }
}

getFromMyAPI();





