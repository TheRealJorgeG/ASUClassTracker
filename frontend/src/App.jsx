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
    <Router>
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
    </Router>
  );
}

export default App;
