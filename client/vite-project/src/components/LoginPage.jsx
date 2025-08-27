import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username and password cannot be empty");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        navigate("/home", { state: { username: data.user.username } });
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col justify-center items-center text-white px-4">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl font-extrabold mb-8"
      >
        Welcome Back
      </motion.h1>

      {/* Form */}
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col space-y-4 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-8 rounded-2xl shadow-2xl w-96"
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-600 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-600 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <button
          type="submit"
          className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition text-white font-semibold shadow-md"
        >
          Login
        </button>
      </motion.form>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-red-400 font-medium text-center"
        >
          {error.includes("signing up") ? (
            <>
              Username does not exist, try{" "}
              <Link to="/signup" className="underline text-white">
                signing up
              </Link>
              .
            </>
          ) : (
            error
          )}
        </motion.p>
      )}

      {/* Redirect */}
      <p className="mt-6 text-gray-300">
        Don’t have an account?{" "}
        <span
          className="text-green-400 cursor-pointer underline"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </span>
      </p>
    </div>
  );
}
