import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FolderOpen, LogOut } from "lucide-react";

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get initial user from location.state if passed
  const initialUser = location.state?.username
    ? { username: location.state.username }
    : null;

  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

// Always check session on mount, back/forward nav, and tab focus
useEffect(() => {
  const checkSession = async () => {
    try {
      const res = await fetch("http://localhost:4000/auth/check-session", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Session check failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Run check when homepage mounts
  checkSession();

  // Re-check if user navigates back/forward
  const handleBackForward = () => checkSession();
  window.addEventListener("pageshow", handleBackForward);

  // Re-check if tab regains focus
  const handleFocus = () => checkSession();
  window.addEventListener("focus", handleFocus);

  return () => {
    window.removeEventListener("pageshow", handleBackForward);
    window.removeEventListener("focus", handleFocus);
  };
}, []);


  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4000/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
    navigate("/login");
  };

  if (loading) {
    return (
      <p className="text-white text-center mt-10 text-lg">
        Checking session...
      </p>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex flex-col justify-center items-center text-white">
        <h1 className="text-2xl font-bold mb-4">No user logged in</h1>
        <p className="text-gray-300 mb-4">Please log in or sign up.</p>
        <div className="flex space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-300 transition"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-300 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col justify-center items-center text-white overflow-hidden">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl font-extrabold mb-10"
      >
        Welcome, <span className="text-indigo-400">{user.username}</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex space-x-6 mb-8"
      >
        <button
          onClick={() => navigate("/my-projects")}
          className="flex items-center px-6 py-3 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-lg"
        >
          <FolderOpen className="mr-2" size={20} />
          View My Projects
        </button>
      </motion.div>

      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-pink-400 font-medium"
        >
          {message}
        </motion.p>
      )}

      <motion.button
        onClick={handleLogout}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-10 flex items-center px-5 py-3 bg-red-600 rounded-xl hover:bg-red-700 transition shadow-lg"
      >
        <LogOut className="mr-2" size={20} />
        Logout
      </motion.button>
    </div>
  );
}
