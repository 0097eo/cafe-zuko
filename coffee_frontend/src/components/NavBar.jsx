import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, LogOut, User } from "lucide-react"; // Importing Lucide icons
import PropTypes from "prop-types";

// Logo Component
const Logo = () => (
  <div className="text-2xl font-bold text-white tracking-wider cursor-pointer transition-colors hover:text-gray-300 flex items-center">
    <p className="font-bold-xl text-amber-500">
    ☕ Coffee Haven
    </p>
  </div>
);

// NavItem Component for reusability
const NavItem = ({ to, children, setIsOpen }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block py-2 px-4 ${
        isActive ? 'text-amber-500' : 'text-white hover:text-gray-300'
      }`
    }
    onClick={() => setIsOpen(false)}
  >
    {children}
  </NavLink>
);

NavItem.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

// Main Navbar Component
const NavBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Handle Logout
  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="h-16 md:h-[4rem]"></div>
      
      <nav className="fixed top-0 left-0 w-full bg-black px-6 py-3 z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Logo />

          {/* Desktop Links */}
          <div className="hidden md:flex space-x">
            <NavItem to="/" setIsOpen={setIsOpen}>Home</NavItem>
            <NavItem to="/about" setIsOpen={setIsOpen}>About</NavItem>
            <NavItem to="/shop" setIsOpen={setIsOpen}>Shop</NavItem>
            <NavItem to="/contact" setIsOpen={setIsOpen}>Contact</NavItem>
            {isAuthenticated && <NavItem to="/profile" setIsOpen={setIsOpen}>Profile</NavItem>}
          </div>

          {/* User Actions (hidden in mobile) */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-white">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium capitalize">
                    {user.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-md 
                             transition-all duration-300 hover:bg-amber-700 
                             focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <NavLink to="/login">
                <button
                  className="bg-amber-600 text-white px-6 py-2 rounded-md 
                             transition-all duration-300 hover:bg-amber-700 
                             focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                >
                  Login
                </button>
              </NavLink>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4">
            <NavItem to="/home" setIsOpen={setIsOpen}>Home</NavItem>
            <NavItem to="/about" setIsOpen={setIsOpen}>About</NavItem>
            <NavItem to="/shop" setIsOpen={setIsOpen}>Shop</NavItem>
            <NavItem to="/contact" setIsOpen={setIsOpen}>Contact</NavItem>
            {isAuthenticated && <NavItem to="/profile" setIsOpen={setIsOpen}>Profile</NavItem>}
            <div className="mt-4">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="bg-amber-500 text-white px-4 py-2 rounded-md w-full 
                             hover:bg-amber-700 transition duration-300"
                >
                  Logout
                </button>
              ) : (
                <NavLink to="/login" onClick={() => setIsOpen(false)}>
                  <button
                    className="bg-amber-600 text-white px-4 py-2 rounded-md w-full 
                               hover:bg-amber-700 transition duration-300"
                  >
                    Login
                  </button>
                </NavLink>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default NavBar;
