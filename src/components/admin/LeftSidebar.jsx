import React, { useState } from "react";
import { Home, LayoutDashboard, FileText, User, LogOut, ChartPie, Folder, ShoppingBag, Users, Notebook, MessageCircle, X, ClipboardList, ChevronDown, Image } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Slide, toast } from 'react-toastify';


const LeftSidebar = ({ isOpen, onClose }) => {
  const [isEcomOpen, setIsEcomOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      
      const res = await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Logged out successfully!", {
          position: "top-center",
          autoClose: 2000,
          theme: "light",
          transition: Slide,
        });
        
        setTimeout(() => {
          navigate("/");
        }, 600);
      } else {
        toast.error("Logout failed. Please try again.", {
          position: "top-center",
          autoClose: 3000,
          theme: "light",
          transition: Slide,
        });
        setLoading(false);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "light",
        transition: Slide,
      });
      setLoading(false);
    }
  };


  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#3869EB] animate-spin" />
        </div>
      )}
      <aside
        className={`
          bg-primary dark:bg-primary-dark border-r border-gray-200 shadow flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-[212px]" : "w-0"}
          overflow-hidden 
          use-vh // Use custom viewport height for mobile compatibility
          fixed // Always positioning
          top-0 left-0 z-10 // Position it at top left with proper stacking
          text-primary-dark dark:text-primary

        `}
      >
      {/* Cross Button */}
      {isOpen && (
        <button
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 focus:outline-none z-20 md:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
      )}
      <div className="flex flex-col gap-2 pb-3 p-4">
        {/* Profile */}
        <div className="flex items-center gap-2 p-2 rounded-lg">
          <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
            <img
              src="https://placehold.co/24x24"
              alt="avatar"
              className="w-6 h-6 rounded-full"
            />
          </div>
          <span className="text-sm font-semibold">ByeWind</span>
          
        </div>

        {/* Divider (hidden by default, use when needed) */}
        <div className="opacity-0 h-px bg-gray-800"></div>

        {/* Favorites & Recently */}
        {/* <div className="items-center gap-2 p-2 rounded-lg">
          <button className="px-3 py-1 rounded-2xl text-sm text-gray-500 hover:bg-gray-100">
            Favorites
          </button>
          <button className="px-3 py-1 rounded-2xl text-sm text-gray-500 hover:bg-gray-100">
            Recently
          </button>
        </div> */}
      </div>
      {/* Top Section - User Info */}
      <div className="p-4 flex-1 overflow-y-auto">
        {/* Dashboards */}
        <div className="p-4 text-primary-dark dark:text-primary">
          <h3 className="text-sm font-normal text-gray-500 mb-3">
            Dashboard
          </h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-100 cursor-pointer">
              <ChartPie className="w-5 h-5" />
              <Link to={"/dashboard/overview"} className="text-sm">Overview</Link>
            </li>
            <li>
              <button
                className="w-full flex items-center justify-between px-2 py-2 rounded-xl hover:bg-gray-100 cursor-pointer"
                onClick={() => setIsEcomOpen((prev) => !prev)}
                aria-expanded={isEcomOpen}
              >
                <span className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-sm">eCommerce</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isEcomOpen ? "rotate-180" : "rotate-0"}`} />
              </button> 
              {isEcomOpen && (
                <ul className="mt-1 ml-6 space-y-1">
                  <li className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-100 cursor-pointer">
                    <Link to={"/dashboard/ecommerce"} className="text-sm">Products</Link>
                  </li>
                  <li className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-100 cursor-pointer">
                    <Link to={"/dashboard/add-product"} className="text-sm">Add Product</Link>
                  </li>
                </ul>
              )}
            </li>
            <li className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-100 cursor-pointer">
              <ClipboardList className="w-5 h-5" />
              <Link to={"/dashboard/orders"} className="text-sm">Orders</Link>
            </li>
            <li className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-100 cursor-pointer">
              <Image className="w-5 h-5"/>
              <Link to={"/dashboard/editBanner"} className="text-sm">Edit Banner</Link>
            </li>
            {/* <li className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-100 cursor-pointer">
              <MessageCircle className="w-5 h-5" />
              <Link to={"/dashboard/social"} className="text-sm">Social</Link>
            </li> */}
          </ul>
        </div>

        {/* Pages */}
        <div className="p-4 text-primary-dark dark:text-primary">
          <h3 className="text-sm font-normal text-gray-500 mb-3">
            Pages
          </h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-100 cursor-pointer">
              <User className="w-5 h-5" />
              <Link to={"/dashboard/userprofile"} className="text-sm">User Profle</Link>
            </li>
            <li className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-100 cursor-pointer">
              <Notebook className="w-5 h-5" />
              <span className="text-sm">Documents</span>
            </li>
            <li className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-100 cursor-pointer">
              <Users className="w-5 h-5" />
              <span className="text-sm">Account</span>
            </li>
          </ul>
        </div>
      </div>
      {/* Bottom Section - Logout */}
      <div className="p-4 border-t">
        <button className="flex items-center gap-3 hover:text-red-500 cursor-pointer w-full" onClick={handleLogout} >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
};

export default LeftSidebar;