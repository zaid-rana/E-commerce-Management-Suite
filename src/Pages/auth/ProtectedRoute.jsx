import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import apiClient from "../../utils/apiClient";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        // const res = await axios.post(
        //   `${import.meta.env.VITE_BASE_URL}/auth/status`,
        //   {},
        //   { withCredentials: true }
        // );
        const res = await apiClient.post("/auth/status");
        if (!mounted) return;
        setIsAuthed(Boolean(res?.data?.sucess || res?.data?.success));
      } catch (e) {
        if (!mounted) return;
        setIsAuthed(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#3869EB] animate-spin" />
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;


