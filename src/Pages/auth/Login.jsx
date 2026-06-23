import React, { useEffect, useState } from 'react';
// import logo from "../assets/Icon.png";
import loginBg from "../../assets/login-bg.png";
import * as Yup from "yup";
import { Link } from 'react-router-dom';  
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/toastHelper';
import apiClient from '../../utils/apiClient';
import {Package} from "lucide-react"

import { loginValidationSchema } from "../../utils/Validations";


const Login = () => {
  const [formData, setFormData] = useState({
      email: "",
      password: "",
    });
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.post("/auth/status");
        console.log("status checked:", res?.data);
        if (!mounted) return;
        if (res?.data?.success) {
          navigate("/dashboard/overview");
          return;
        }
      } catch (e) {
        console.log("Auth status check failed (expected if not logged in)");
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);
  

  
  const handleChange = (e) => {
    const {name, value} = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field when user starts typing
    if (errors && errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await loginValidationSchema.validate(formData, { abortEarly: false });
      
      setErrors({}); 
      setLoading(true);
      // const res = await axios.post(
      //   `${import.meta.env.VITE_BASE_URL}/auth/login`,
      //   formData,
      //   { withCredentials: true }
      // );
      const res = await apiClient.post("/auth/login", formData);
      console.log(res.data);
      
      if (res.data.success) {
        showToast("success", "Login Sucessfully 123");
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 600);
      } else {
        showToast("error", "Incorrect password or email");
        setLoading(false);
      }
      
      
    } catch (error) {
      setLoading(false);
      // const newError = {};
      if (error.name === "ValidationError") {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
        return;
      }
      
      if (error.response) {
        showToast("error", "Invalid credentials");
      } else {
        showToast("error", "Network error. Please try again.");
      }
      
      // error.inner.forEach((err) => {
        //   newError[err.path] = err.message;
        // });
        
        // setErrors(newError);
      }
    };
    

    

  return (
    <div className="w-screen h-screen flex bg-gray-100 relative">
      {(loading || checkingAuth) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#3869EB] animate-spin" />
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#3869EB] animate-spin" />
        </div>
      )}
      {/* Top-left Logo (outside the form) */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-5">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
          <Package className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900 ">
          ShopHub
        </span>
      </div>

      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center bg-white p-10">
        <div className="w-full max-w-md flex flex-col justify-center">
          {/* Title & Subtitle */}
          <h2 className="text-3xl font-bold text-[#313131] mb-1">Login</h2>
          <p className="text-sm text-[#313131] opacity-75 leading-[1.5] mb-8">
            Login to access your travelwise account
          </p>
          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="email"
                name="email"
                className="w-full px-3 py-2 text-sm border border-[#79747E] rounded-md focus:outline-none focus:border-[#3869EB] bg-white"
                placeholder="john.doe@gmail.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors && errors.email && (
                <div className="text-red-500 text-xs mt-1">{errors.email}</div>
              )}
              <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-[#1C1B1F]">
                Email
              </label>
            </div>
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full px-3 py-2 pr-8 text-sm border border-[#79747E] rounded-md focus:outline-none focus:border-[#3869EB] bg-white"
                  placeholder="••••••••••••••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-[#313131]">
                  Password
                </label>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    // Eye open (visible)
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="cursor-pointer"
                    >
                      <path
                        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                        fill="#313131"
                      />
                    </svg>
                  ) : (
                    // Eye closed (hidden)
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="cursor-pointer"
                    >
                      <path
                        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                        fill="#313131"
                      />
                      <path
                        d="M2 2l20 20"
                        stroke="#313131"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors && errors.password && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.password}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-xs mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-blue-600 rounded mr-2"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="text-xs text-[#313131] font-medium">
                  Remember me
                </span>
              </label>
              <Link
                to={"/forgotpassword"}
                className="text-[#3869EB] hover:underline font-medium text-xs"
              >
                Forgot Password ?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full py-2 mt-6 bg-[#3869EB] text-[#F3F3F3] rounded-md text-sm font-semibold hover:bg-[#2c5bc4] transition cursor-pointer"
            >
              Login
            </button>
          </form>
          {/* Sign up link */}
          <div className="text-center mt-4 text-xs">
            <span className="text-gray-700">Don't have an account? </span>
            <Link
              to={"/signup"}
              className="text-[#3869EB] hover:underline font-medium text-xs"
            >
              Sign up
            </Link>
          </div>
          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-[#313131] opacity-25"></div>
            <span className="mx-2 text-[#313131] text-xs opacity-50">
              Or login with
            </span>
            <div className="flex-grow h-px bg-[#313131] opacity-25"></div>
          </div>
          {/* Social Buttons */}
          <div className="flex justify-between gap-3">
            {/* Facebook */}
            <button className="flex items-center justify-center flex-1 h-10 rounded border border-[#3869EB] p-2 cursor-pointer hover:bg-blue-200">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  fill="#1877F2"
                  d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.018 4.388 10.995 10.125 11.854v-8.385H7.078v-3.47h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.953.926-1.953 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.068 24 18.091 24 12.073z"
                />
              </svg>
            </button>
            {/* Google */}
            <button className="flex items-center justify-center flex-1 h-10 rounded border border-[#3869EB] p-2 cursor-pointer hover:bg-blue-200">
              <svg width="20" height="20" viewBox="0 0 48 48">
                <g>
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.6 0 5 .8 7 2.3l5.3-5.3C33.5 5.1 28.9 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.5 16.1 18.8 13 24 13c2.6 0 5 .8 7 2.3l5.3-5.3C33.5 5.1 28.9 3 24 3c-7.2 0-13.4 3.1-17.7 8.1z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 43c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.5 34.7 26.9 35.5 24 35.5c-5.6 0-10.3-3.6-12-8.5l-6.6 5.1C7.7 39.1 15.2 43 24 43z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 3-3.7 5.5-7.3 6.5l6.5 5.3C40.2 36.2 44 30.2 44 23c0-1.3-.1-2.7-.4-4z"
                  />
                </g>
              </svg>
            </button>
            {/* Apple */}
            <button className="flex items-center justify-center flex-1 h-10 rounded border border-[#3869EB] p-2 cursor-pointer hover:bg-blue-200">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path
                  fill="#000"
                  d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Right Side - Image */}
      <div className="hidden md:flex w-1/2 h-full items-center justify-center bg-white relative">
        <img
          className="w-full h-full absolute rounded-lg object-contain"
          src={loginBg}
          alt="Signup Illustration"
        />
        {/* <div className="w-12 absolute bottom-20 left-1/2 -translate-x-1/2 flex justify-center items-center gap-1">
          <div className="w-3 h-1 bg-blue-600 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-white rounded-full border border-gray-300" />
          <div className="w-2.5 h-2.5 bg-white rounded-full border border-gray-300" />
        </div> */}
      </div>
      {/* </div> */}
    </div>
  );
};

export default Login;
