import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function StarterPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col justify-center items-center px-6 text-white">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-5xl font-extrabold mb-6 text-center"
      >
        Project Management System
      </motion.h1>

      {/* Summary */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg sm:text-xl mb-10 text-center max-w-3xl text-gray-300"
      >
        Build a MERN stack app with authentication, projects, and tasks.  
        Manage your workflow efficiently with a modern and responsive UI.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-6"
      >
        <button
          onClick={() => navigate("/signup")}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition text-white font-semibold shadow-lg"
        >
          Get Started
        </button>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl hover:from-gray-800 hover:to-black transition text-white font-semibold shadow-lg"
        >
          Login
        </button>
      </motion.div>
    </div>
  );
}
