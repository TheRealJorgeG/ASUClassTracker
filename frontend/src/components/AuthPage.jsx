import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthPage = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/users/login" : "/api/users/register";
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
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
        navigate("/"); // ✅ Take them to home page
      } else {
        alert("Registered! Now login.");
        setIsLogin(true);
      }
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-[#92223D] text-white px-4">
      <h1 className="text-4xl font-bold mb-8 mt-20">
        {isLogin ? "Login" : "Register"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-300 mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 text-black rounded"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-300 mb-2">
            Password:
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-3 py-2 text-black rounded"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-white text-[#A23A56] rounded font-bold hover:bg-gray-200 transition"
        >
          {isLogin ? "Login" : "Register"}
        </button>

        <p
          className="mt-4 text-sm text-white underline cursor-pointer"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Register here"
            : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
