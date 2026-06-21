import React, { useState, useEffect } from "react";
import resetPasswordBg from "../../assets/forgot-password-bg.png";
import logo from "../../assets/logo.png";
import * as Yup from "yup";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { showToast } from "../../utils/toastHelper";
import apiClient from "../../utils/apiClient";

import { resetValidationSchema }  from "../../utils/Validations";

const ResetPassword = () => {
  // const [searchParams] = useSearchParams();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    console.log(token);
    console.log(typeof(token))
    if (!token) {
      showToast("error", "Invalid or missing reset token");
      navigate("/forgotpassword");
    }
  }, [token, navigate]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
      await resetValidationSchema.validate(formData, { abortEarly: false });
      
      setErrors({}); 
      setLoading(true);
      // const res = await axios.post(
      //   `${import.meta.env.VITE_BASE_URL}auth/reset-password`,
      //   {
      //     token,
      //     password: formData.password,
      //   },
      //   { withCredentials: true }
      // );
      const res = await apiClient.post("/auth/reset-password", {token, password: formData.password})
      
      if (res.data.success) {
        setPasswordReset(true);
        showToast("success", "Password reset successfully!");
      } else {
        showToast("error", "Failed to reset password");
        setLoading(false);
      }
      
    } catch (error) {
      setLoading(false);
      
      if (error.name === "ValidationError") {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
        return;
      }
      
      if (error.response) {
        showToast("error", "Failed to reset password");
      } else {
        showToast("error", "Network error. Please try again.");
      }
    }
  };

  if (passwordReset) {
    return (
      <div className="w-screen h-screen flex bg-gray-100 relative">
        {/* Top-left Logo */}
        <div className="absolute top-6 left-6 z-20 flex items-center">
          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full mr-3">
            <img src={logo} alt="Logo" className="w-8 h-8" />
          </div>
          <span className="font-bold text-3xl text-[#313131]">Your Logo</span>
        </div>

        {/* Left Side - Success Message */}
        <div className="w-full md:w-1/2 h-full flex items-center justify-center bg-white p-10">
          <div className="w-full max-w-md flex flex-col justify-center text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Title & Message */}
            <h2 className="text-3xl font-bold text-[#313131] mb-3">Password Reset Successful!</h2>
            <p className="text-sm text-[#313131] opacity-75 leading-[1.5] mb-8">
              Your password has been successfully reset. You can now login with your new password.
            </p>

            {/* Action Button */}
            <Link
              to="/"
              className="block w-full py-2 bg-[#3869EB] text-[#F3F3F3] rounded-md text-sm font-semibold hover:bg-[#2c5bc4] transition cursor-pointer text-center"
            >
              Continue to Login
            </Link>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:flex w-1/2 h-full items-center justify-center bg-white relative">
          <img
            className="w-full h-full absolute rounded-lg object-contain"
            src={resetPasswordBg}
            alt="Password Reset Success"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex bg-gray-100 relative">
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#3869EB] animate-spin" />
        </div>
      )}

      {/* Top-left Logo */}
      <div className="absolute top-6 left-6 z-20 flex items-center">
        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full mr-3">
          <img src={logo} alt="Logo" className="w-8 h-8" />
        </div>
        <span className="font-bold text-3xl text-[#313131]">Your Logo</span>
      </div>

      {/* Left Side - Reset Password Form */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center bg-white p-10">
        <div className="w-full max-w-md flex flex-col justify-center">
          {/* Title & Subtitle */}
          <h2 className="text-3xl font-bold text-[#313131] mb-1">Reset your Password</h2>
          <p className="text-sm text-[#313131] opacity-75 leading-[1.5] mb-8">
            Enter your new password below to complete the reset process
          </p>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Password Field */}
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
                  New Password
                </label>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    // Eye open (visible)
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className='cursor-pointer'>
                      <path
                        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                        fill="#313131"
                      />
                    </svg>
                  ) : (
                    // Eye closed (hidden)
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className='cursor-pointer'>
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
              {errors && errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="w-full px-3 py-2 pr-8 text-sm border border-[#79747E] rounded-md focus:outline-none focus:border-[#3869EB] bg-white"
                  placeholder="••••••••••••••••••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-[#313131]">
                  Confirm Password
                </label>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    // Eye open (visible)
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className='cursor-pointer'>
                      <path
                        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                        fill="#313131"
                      />
                    </svg>
                  ) : (
                    // Eye closed (hidden)
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className='cursor-pointer'>
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
              {errors && errors.confirmPassword && <div className="text-red-500 text-xs mt-1">{errors.confirmPassword}</div>}
            </div>

            <button
              type="submit"
              className="w-full py-2 mt-6 bg-[#3869EB] text-[#F3F3F3] rounded-md text-sm font-semibold hover:bg-[#2c5bc4] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {/* Back to login link */}
          <div className="text-center mt-6 text-xs">
            <span className="text-gray-700">Remember your password? </span>
            <Link to="/" className="text-[#3869EB] hover:underline font-medium text-xs">Back to Login</Link>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:flex w-1/2 h-full items-center justify-center bg-white relative">
        <img
          className="w-full h-full absolute rounded-lg object-contain"
          src={resetPasswordBg}
          alt="Reset Password Illustration"
        />
      </div>
    </div>
  );
};

export default ResetPassword;
