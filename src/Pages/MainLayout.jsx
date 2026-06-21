import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Header from "../components/admin/Header";
import LeftSidebar from "../components/admin/LeftSidebar";
import RightSidebar from "../components/admin/RightSidebar";


function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebar2Open, setIsSidebar2Open] = useState(false);
  const [isDark, setisDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toggleTheme = () => setisDark(!isDark);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleRightSideBar = () => setIsSidebar2Open(!isSidebar2Open);

  return (
    <div className={`flex min-h-screen ${isDark ? "dark" : ""}`}>
      {/* Sidebar - Fixed Left */}
      <LeftSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "md:ml-[212px]" : ""
        }`}
      >
        <Header
          onMenuClick={toggleSidebar}
          onMenu2Click={toggleRightSideBar}
          darkToggle={toggleTheme}
        />
        <main>
          <Outlet />
        </main>
      </div>

      <RightSidebar
        isOpen={isSidebar2Open}
        onClose={() => setIsSidebar2Open(false)}
      />
    </div>
  );
}

export default MainLayout;
