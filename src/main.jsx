import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import { CartProvider } from "./contexts/CartContext.jsx";
import { WishlistProvider } from "./contexts/WishlistContext.jsx";

// Fix for mobile 100vh issue: update --vh on load and resize
// function setVhVar() {
//   document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
// }
// window.addEventListener('resize', setVhVar);
// window.addEventListener('orientationchange', setVhVar);
// setVhVar();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CartProvider>
      <WishlistProvider>
        <App />
      </WishlistProvider>
    </CartProvider>
    <ToastContainer />
  </StrictMode>
);
