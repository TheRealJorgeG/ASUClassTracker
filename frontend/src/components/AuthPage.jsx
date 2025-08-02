import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config/api";

const AuthPage = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const endpoint = isLogin ? "/api/users/login" : "/api/users/register";

    console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('config.API_BASE_URL:', config.API_BASE_URL);
    console.log('Full URL being called:', `${config.API_BASE_URL}${endpoint}`);

    try {
      const response = await fetch(`${config.API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const data = await response.json();
      if (isLogin) {
        localStorage.setItem("token", data.accessToken);
        setToken(data.accessToken);
        alert("Login successful!");
        navigate("/");
      } else {
        alert("Registered! Now login.");
        setIsLogin(true);
      }
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Removed the background gradient override - now inherits from App.jsx
    <div className="min-h-screen relative overflow-hidden">
      {/* Simple background decorations - kept but made more subtle */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#ffcb25]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#A23A56]/5 to-[#ffcb25]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex flex-col items-center justify-start min-h-screen px-4 py-8">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Simple Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
              {isLogin ? "Welcome Back" : "Join Class Tracker"}
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed font-medium max-w-md mx-auto">
              {isLogin 
                ? "Sign in to continue monitoring your classes" 
                : "Create your account to start tracking ASU classes"
              }
            </p>
          </div>

          {/* Clean Form Container */}
          <div className="relative group max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#A23A56] to-[#ffcb25] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
            
            <form
              onSubmit={handleSubmit}
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 space-y-6"
            >
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A23A56] focus:border-transparent focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                    placeholder="your.email@asu.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A23A56] focus:border-transparent focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#A23A56] to-[#B8456E] text-white rounded-xl font-bold text-lg hover:from-[#B8456E] hover:to-[#A23A56] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#A23A56] focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </div>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#A23A56] font-semibold hover:text-[#B8456E] transition-colors duration-300 underline decoration-2 underline-offset-2"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Simple Additional Info */}
          <div className="mt-10 max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ffcb25] to-[#ffd700] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Getting Started</h3>
                  <p className="text-white/70 text-sm">
                    Once signed in, you can add classes to track and receive instant notifications when spots become available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;