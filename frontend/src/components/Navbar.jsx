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
    <div className="flex justify-between items-center h-24 mx-auto px-4 text-white bg-[#92223D] relative border-b-4 border-[#6b1a2f] shadow-lg rounded-b-md">
      <h1 className="md:ml-10 md:text-4xl sm:text-3xl w-full text-2xl font-bold text-[#ffcb25]">
        <Link to="/">ASU Class Finder.</Link>
      </h1>

      {user ? (
        <div className="hidden md:flex items-center space-x-4 text-xl relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center font-bold focus:outline-none"
          >
            {user.email}
            <AiOutlineDown className="ml-1" />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-white text-[#A23A56] rounded shadow-md z-50">
              <Link
                to="/view-classes"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                View Classes
              </Link>
              <Link
                to="/add-class"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                Add Classes
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <ul className="hidden md:flex text-xl">
          <li className="p-4">
            <Link to="/auth">Login</Link>
          </li>
        </ul>
      )}

      <div onClick={handleNav} className="block md:hidden">
        {!nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={25} />}
      </div>

      {/* Mobile Menu */}
      <div
        className={
          !nav
            ? "fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500"
            : "fixed left-[-100%]"
        }
      >
        <h1 className="w-full text-3xl font-bold text-[#A23A56] m-4">
          ASU Class Finder.
        </h1>
        {user ? (
          <ul className="uppercase p-4">
            <li
              className="p-4 border-b border-gray-600 flex justify-between items-center"
              onClick={toggleDropdown}
            >
              {user.email}
              <AiOutlineDown className="ml-2" />
            </li>
            {dropdownOpen && (
              <>
                <li className="p-4 border-b border-gray-600">
                  <Link to="/view-classes" onClick={() => setNav(false)}>
                    View Classes
                  </Link>
                </li>
                <li className="p-4 border-b border-gray-600">
                  <Link to="/add-class" onClick={() => setNav(false)}>
                    Add Classes
                  </Link>
                </li>
                <li
                  className="p-4 border-b border-gray-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </>
            )}
          </ul>
        ) : (
          <ul className="uppercase p-4">
            <li className="p-4 border-b border-gray-600">
              <Link to="/">Home</Link>
            </li>
            <li className="p-4 border-b border-gray-600">
              <Link to="/auth">Login</Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Navbar;
