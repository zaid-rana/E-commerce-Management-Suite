import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/auth/Login";
import Signup from "./Pages/auth/Signup";
import MainLayout from "./Pages/MainLayout";
import ForgotPassword from "./Pages/auth/forgotPassword";
import ResetPassword from "./Pages/auth/ResetPassword";
import VerifyCode from "./Pages/auth/VerifyCode";
import ProtectedRoute from "./Pages/auth/ProtectedRoute";
import "./App.css";
import Overview from "./Pages/Dashboard/OverView";
import UserProfile from "./Pages/Dashboard/UserProfile";
import Orders from "./Pages/Dashboard/Orders";
import AddProduct from "./Pages/Dashboard/AddProduct";
import Products from "./Pages/Dashboard/Products";
import ECommerceLandingPage from "./Pages/ECommerceLandingPage";
import BannerChange from "./Pages/Dashboard/BannerChange";
import ProductDetailPage from "./Pages/Store/ProductDetailPage";
import Checkout from "./Pages/Store/Checkout";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify" element={<VerifyCode />} />

        <Route path="/store" element={<ECommerceLandingPage />} />
        <Route path="productDetail/:id" element={<ProductDetailPage />} />
        <Route path="/checkout" element={<Checkout/>}/>

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="overview" index element={<Overview />} />
          <Route path="ecommerce" element={<Products />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="userprofile" element={<UserProfile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="editBanner" element={<BannerChange />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
