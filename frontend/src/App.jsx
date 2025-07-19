import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Villain from "./components/Villain";
import Analytics from "./components/Analytics";
import Card from "./components/Card";
import AuthPage from "./components/AuthPage";
import ClassesPage from "./components/ClassesPage"; 
import { decodeJwt } from "./utils/decodeJwt";

function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const decoded = decodeJwt(storedToken);
      if (decoded && decoded.user && decoded.user.email) {
        setToken(storedToken);
        setUser(decoded.user);
      } else {
        localStorage.removeItem("token");
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      const decoded = decodeJwt(token);
      setUser(decoded.user);
    } else {
      setUser(null);
    }
  }, [token]);

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(to bottom, #A23A56 0%, #92223D 25%, #6b1a2f 50%, #92223D 75%, #A23A56 100%)'
      }}
    >
      {/* Gradient overlays for extra depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-900/10 to-yellow-900/10"></div>
      
      <Router>
        <div className="relative z-10">
          <Navbar user={user} setToken={setToken} />
          <Routes>
            <Route
              path="/"
              element={
                user ? (
                  <ClassesPage />
                ) : (
                  <>
                    <Villain />
                    <Analytics />
                    <Card />
                  </>
                )
              }
            />
            <Route path="/auth" element={<AuthPage setToken={setToken} />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;