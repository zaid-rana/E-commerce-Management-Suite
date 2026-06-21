import React, { useState } from 'react';
import signupBg from "../../assets/signup-illustration.png";
import logo from "../../assets/logo.png";
import * as Yup from "yup";
import { Link, useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/toastHelper';
import apiClient from '../../utils/apiClient';

import { signupValidationSchema } from "../../utils/Validations";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  
  const [agreeTos, setAgreeTos] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const [errors, setErrors] = useState({});


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
    const {confirmPassword, ...dataToSend} = formData;
    try {
      await signupValidationSchema.validate(formData, {abortEarly: false});
      setErrors({}); // Clear all errors on successful validation
      setLoading(true);

      // const res = await axios.post(
      //   `${import.meta.env.VITE_BASE_URL}auth/signup`,
      //   dataToSend,
      //   {withCredentials: true}
      // );

      const res = await apiClient.post("/auth/signup", dataToSend);

      if (res.data.success) {
        showToast("success", "Signup Sucessfull");

        setTimeout(() => {
          navigate("/verify");
        }, 600);
      } else {
        showToast("error", "Incorrect email");
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
        showToast("error", "Invalid credentials");
      } else {
        showToast("error", "Network error. Please try again.");
      }

      // error.inner.forEach(err =>{
      //   newError[err.path] = err.message;
      // });

      // setErrors(newError);
      // console.log(newError);
    }
  };

  return (
    <div className="w-screen h-screen flex bg-gray-100 relative">

      {/* Top-left Logo */}
      <div className="absolute top-6 right-10 z-20 flex items-center">
        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full mr-3 shadow-sm">
          <img src={logo} alt="Logo" className="w-8 h-8" />
        </div>
        <span className="font-bold text-3xl text-[#313131]">Your Logo</span>
      </div>

      {/* Left Side - Image */}
      <div className="hidden md:flex w-1/2 h-full items-center justify-center bg-white relative">
          <img
            className="w-full h-full absolute rounded-lg object-contain"
            src= {signupBg}
            alt="Signup Illustration"
          />
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center bg-white p-10">
        <div className="w-full max-w-md">
          {/* Signup Card */}
          {/* <div className="bg-white rounded-[14px] shadow-[2.72px_3.62px_39.2px_rgba(0,0,0,0.12)] p-8"> */}
            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-[#313131] mb-1">Sign up</h2>
              <p className="text-sm text-[#313131] opacity-75 leading-[1.5]">Let's get you all set up so you can access your personal account.</p>
            </div>

            {/* Form */}
            <form className="space-y-3" onSubmit={handleSubmit}>
              {/* First Name and Last Name Row */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      className="w-full px-3 py-2 text-sm border border-[#79747E] rounded-md focus:outline-none focus:border-[#3869EB] bg-white"
                      placeholder="john.doe@gmail.com"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors && errors.firstName && <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>}
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-[#1C1B1F]">First Name</label>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      className="w-full px-3 py-2 text-sm border border-[#79747E] rounded-md focus:outline-none focus:border-[#3869EB] bg-white"
                      placeholder="john.doe@gmail.com"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    {errors && errors.lastName && <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>}
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-[#1C1B1F]">Last Name</label>
                  </div>
                </div>
              </div>

              {/* Email and Phone Number Row */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      className="w-full px-3 py-2 text-sm border border-[#79747E] rounded-md focus:outline-none focus:border-[#3869EB] bg-white"
                      placeholder="john.doe@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors && errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-[#1C1B1F]">Email</label>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      className="w-full px-3 py-2 text-sm border border-[#79747E] rounded-md focus:outline-none focus:border-[#3869EB] bg-white"
                      placeholder="john.doe@gmail.com"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors && errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-[#1C1B1F]">Phone Number</label>
                  </div>
                </div>
              </div>

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
                  <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-[#313131]">Password</label>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      // Eye open (visible)
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#313131"/>
                      </svg>
                    ) : (
                      // Eye closed (hidden)
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#313131"/>
                        <path d="M2 2l20 20" stroke="#313131" strokeWidth="2" strokeLinecap="round"/>
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
                  <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-[#313131]">Confirm Password</label>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      // Eye open (visible)
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className='cursor-pointer'>
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#313131"/>
                      </svg>
                    ) : (
                      // Eye closed (hidden)
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className='cursor-pointer'>
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#313131"/>
                        <path d="M2 2l20 20" stroke="#313131" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errors && errors.confirmPassword && <div className="text-red-500 text-xs mt-1">{errors.confirmPassword}</div>}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center gap-1 mt-2">
                <input
                  type="checkbox"
                  className="w-3 h-3 border border-[#313131] rounded"
                  checked={agreeTos}
                  onChange={(e) => setAgreeTos(e.target.checked)}
                />
                <span className="text-xs text-[#313131] font-medium">I agree to all the Terms and Privacy Policies</span>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                className="w-full py-2 mt-2 bg-[#3869EB] text-[#F3F3F3] rounded-md text-sm font-semibold hover:bg-[#2c5bc4] transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                // disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.password || formData.password !== formData.confirmPassword || !agreeTos}
              >
                Create account
              </button>
            </form>

            {/* Login link */}
          <div className="text-center mt-4 text-xs">
            <span className="text-gray-700">Do have an account? </span>
            <Link to={"/"} className='text-blue-600 font-medium hover:underline'>Login</Link>
          </div>

            {/* Divider */}
            <div className="flex items-center my-3">
              <div className="flex-grow h-px bg-[#313131] opacity-25"></div>
              <span className="mx-2 text-[#313131] text-xs opacity-50">Or Sign up with</span>
              <div className="flex-grow h-px bg-[#313131] opacity-25"></div>
            </div>

            {/* Social Buttons */}
            <div className="flex justify-between gap-3">
              {/* Facebook */}
              <button className="flex items-center justify-center flex-1 h-10 rounded border border-[#3869EB] p-2 hover:bg-blue-200 cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.018 4.388 10.995 10.125 11.854v-8.385H7.078v-3.47h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.953.926-1.953 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.068 24 18.091 24 12.073z"/>
                </svg>
              </button>
              {/* Google */}
              <button className="flex items-center justify-center flex-1 h-10 rounded border border-[#3869EB] p-2 hover:bg-blue-200 cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <g>
                    <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.6 0 5 .8 7 2.3l5.3-5.3C33.5 5.1 28.9 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.8 13 24 13c2.6 0 5 .8 7 2.3l5.3-5.3C33.5 5.1 28.9 3 24 3c-7.2 0-13.4 3.1-17.7 8.1z"/>
                    <path fill="#4CAF50" d="M24 43c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.5 34.7 26.9 35.5 24 35.5c-5.6 0-10.3-3.6-12-8.5l-6.6 5.1C7.7 39.1 15.2 43 24 43z"/>
                    <path fill="#1976D2" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 3-3.7 5.5-7.3 6.5l6.5 5.3C40.2 36.2 44 30.2 44 23c0-1.3-.1-2.7-.4-4z"/>
                  </g>
                </svg>
              </button>
              {/* Apple */}
              <button className="flex items-center justify-center flex-1 h-10 rounded border border-[#3869EB] p-2 hover:bg-blue-200 cursor-pointer">
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
      </div>
    // </div>
  );
};

export default Signup;
