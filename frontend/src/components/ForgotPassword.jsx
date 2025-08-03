import React, { useState } from "react";
import { Link } from "react-router-dom";
import config from "../config/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  React.useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setMessage("Password reset instructions have been sent to your email address.");
      } else {
        setMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#ffcb25]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#A23A56]/5 to-[#ffcb25]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-8">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Success Message */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
                Check Your Email
              </h1>
              
              <p className="text-lg text-white/80 leading-relaxed font-medium max-w-md mx-auto mb-6">
                {message}
              </p>

              <p className="text-sm text-white/60 max-w-md mx-auto">
                If you don't see the email, check your spam folder or try again with a different email address.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 max-w-md w-full">
              <Link
                to="/auth"
                className="block w-full py-4 bg-gradient-to-r from-[#A23A56] to-[#B8456E] text-white rounded-xl font-bold text-lg hover:from-[#B8456E] hover:to-[#A23A56] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#A23A56] focus:ring-opacity-50 text-center"
              >
                Back to Sign In
              </Link>
              
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                  setMessage("");
                }}
                className="block w-full py-3 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                Try Different Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#ffcb25]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#A23A56]/5 to-[#ffcb25]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex flex-col items-center justify-start min-h-screen px-4 py-8">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
              Reset Password
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed font-medium max-w-md mx-auto">
              Enter your email address and we'll send you instructions to reset your password
            </p>
          </div>

          {/* Form Container */}
          <div className="relative group max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#A23A56] to-[#ffcb25] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
            
            <form
              onSubmit={handleSubmit}
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 space-y-6"
            >
              {/* Error/Success Message */}
              {message && (
                <div className={`p-4 rounded-xl ${message.includes('sent') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-sm font-medium ${message.includes('sent') ? 'text-green-800' : 'text-red-800'}`}>
                    {message}
                  </p>
                </div>
              )}

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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#A23A56] to-[#B8456E] text-white rounded-xl font-bold text-lg hover:from-[#B8456E] hover:to-[#A23A56] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#A23A56] focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Sending Instructions...
                  </div>
                ) : (
                  "Send Reset Instructions"
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/auth"
                  className="text-[#A23A56] font-semibold hover:text-[#B8456E] transition-colors duration-300 underline decoration-2 underline-offset-2"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-10 max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Secure Reset</h3>
                  <p className="text-white/70 text-sm">
                    We'll send a secure link to your email that expires in 1 hour. Click the link to create a new password.
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

export default ForgotPassword;