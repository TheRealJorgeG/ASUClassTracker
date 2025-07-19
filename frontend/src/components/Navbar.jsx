import React, { useState } from "react";
import { AiOutlineClose, AiOutlineMenu, AiOutlineDown } from "react-icons/ai";
import { Link } from "react-router-dom";

const Navbar = ({ user, setToken }) => {
  const [nav, setNav] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleNav = () => {
    setNav(!nav);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="flex justify-between items-center h-24 mx-auto px-4 text-white relative">
      <h1 className="md:ml-10 md:text-4xl sm:text-3xl w-full text-2xl font-black text-[#ffcb25] relative z-10 tracking-tight">
        <Link to="/" className="hover:text-[#ffd700] transition-colors duration-300 flex items-center gap-2">
          <div className="w-3 h-3 bg-[#ffcb25] rounded-full animate-pulse"></div>
          ASU Class Tracker
        </Link>
      </h1>

      {user ? (
        <div className="hidden md:flex items-center space-x-4 text-xl relative z-10">
          <button
            onClick={toggleDropdown}
            className="flex items-center font-bold focus:outline-none px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 focus:ring-2 focus:ring-[#ffcb25] focus:ring-opacity-50 shadow-lg hover:shadow-xl"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            {user.email}
            <AiOutlineDown className="ml-3 transition-transform duration-300" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-3 w-48 bg-white/95 backdrop-blur-xl text-[#A23A56] rounded-2xl shadow-2xl z-50 border border-white/20 overflow-hidden">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-6 py-4 hover:bg-gray-100 transition-all duration-200 font-semibold flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <ul className="hidden md:flex text-xl relative z-10">
          <li className="p-4">
            <Link 
              to="/auth"
              className="bg-[#ffcb25] text-[#1a1a1a] font-bold px-6 py-3 rounded-2xl hover:bg-[#ffd700] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Login
            </Link>
          </li>
        </ul>
      )}

      <div onClick={handleNav} className="block md:hidden relative z-10">
        <button className="p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
          {!nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={25} />}
        </button>
      </div>

      {/* Enhanced Mobile Menu */}
      <div
        className={
          !nav
            ? "fixed left-0 top-0 w-[70%] h-full bg-gradient-to-b from-[#1a1a1a] via-[#2a2a2a] to-[#000300] backdrop-blur-xl ease-in-out duration-500 z-50 shadow-2xl"
            : "fixed left-[-100%]"
        }
      >
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-3xl font-black text-[#ffcb25] flex items-center gap-3">
            <div className="w-3 h-3 bg-[#ffcb25] rounded-full animate-pulse"></div>
            ASU Class Tracker
          </h1>
        </div>
        
        {user ? (
          <ul className="p-6 space-y-4">
            <li
              className="flex justify-between items-center p-4 border border-gray-600 rounded-xl bg-white/5 backdrop-blur-md cursor-pointer hover:bg-white/10 transition-all duration-300"
              onClick={toggleDropdown}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold">{user.email}</span>
              </div>
              <AiOutlineDown className="text-[#ffcb25] transition-transform duration-300" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </li>
            {dropdownOpen && (
              <div className="ml-4 space-y-2 animate-fadeIn">
                <li className="p-4 border border-gray-600 rounded-xl bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
                  <Link 
                    to="/view-classes" 
                    onClick={() => setNav(false)}
                    className="text-white font-semibold flex items-center gap-3"
                  >
                    <svg className="w-5 h-5 text-[#ffcb25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Classes
                  </Link>
                </li>
                <li
                  className="p-4 border border-gray-600 rounded-xl bg-white/5 backdrop-blur-md hover:bg-red-500/20 transition-all duration-300 cursor-pointer"
                  onClick={handleLogout}
                >
                  <span className="text-red-400 font-semibold flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </span>
                </li>
              </div>
            )}
          </ul>
        ) : (
          <ul className="p-6 space-y-4">
            <li className="p-4 border border-gray-600 rounded-xl bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
              <Link 
                to="/" 
                className="text-white font-semibold flex items-center gap-3"
                onClick={() => setNav(false)}
              >
                <svg className="w-5 h-5 text-[#ffcb25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
            </li>
            <li className="p-4 border border-gray-600 rounded-xl bg-gradient-to-r from-[#ffcb25] to-[#ffd700] hover:from-[#ffd700] hover:to-[#ffcb25] transition-all duration-300">
              <Link 
                to="/auth"
                className="text-[#1a1a1a] font-bold flex items-center gap-3"
                onClick={() => setNav(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Login
              </Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Navbar;