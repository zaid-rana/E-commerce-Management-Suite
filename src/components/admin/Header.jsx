import React from 'react'
import { Search, Bell, User, Settings, Menu, Sun, Star, Sidebar } from "lucide-react";
import { Link , useLocation } from 'react-router-dom';

const Header = ({ onMenuClick, onMenu2Click , darkToggle }) => {

  const location = useLocation();
  const pathname = location.pathname.split("/").filter((x)=> x);
  
  return (
    <nav className="w-full shadow px-7 py-5 flex items-center justify-between bg-primary dark:bg-primary-dark">
      
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Menu Button - toggles Left Sidebar */}
        <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="w-6 h-6 text-primary-dark dark:text-primary" />
        </button>

        {/* Notification Icon */}
        <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          {/* <Link to="/dashboard" className="px-3 py-1 text-sm text-primary-dark dark:text-primary rounded-2xl hover:bg-gray-100">Dashboard</Link> */}
          {pathname.map((value , index )=>{
            const to = `/${pathname.slice(0 , index + 1).join("/")}`;
            const isLast = index === pathname.length - 1;
            return (
              <span key={to} className="flex items-center">
                <span className="mx-2">/</span>
                {isLast ? (
                  <span className="px-3 py-1 text-sm text-primary-dark dark:text-primary rounded-2xl hover:bg-gray-100">{value}</span>
                ) : (
                  <Link to={to} className="px-3 py-1 text-sm text-primary-dark dark:text-primary rounded-2xl hover:bg-gray-100">
                    {value}
                  </Link>
                )}
              </span>
            );
          })}
          {/* <span className="text-gray-400">/</span> */}
          {/* <button className="px-3 py-1 text-sm text-primary-dark dark:text-primary rounded-2xl hover:bg-gray-100">Default</button> */}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex items-center gap-2 bg-secondary dark:bg-secondary-dark rounded-xl px-2 py-1.5">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-500"
          />
          <span className="text-xs text-gray-600 border border-gray-200 rounded px-1.5">/</span>
        </div>

        {/* Action Icons */}
        <Sun onClick={darkToggle} className="w-6 h-6 text-primary-dark dark:text-primary cursor-pointer"/>
        <Settings className="w-6 h-6 text-primary-dark dark:text-primary cursor-pointer" />
        <Bell className="w-6 h-6 text-primary-dark dark:text-primary cursor-pointer" />

        {/* Menu Button - toggles Right Sidebar */}
        <button onClick={onMenu2Click} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="w-6 h-6 text-primary-dark dark:text-primary" />
        </button>
      </div>
    </nav>
  );
};

export default Header;
