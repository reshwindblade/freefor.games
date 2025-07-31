import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Gamepad2, Menu, X, User, Calendar, Settings, LogOut } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-gaming-600" />
              <span className="font-gaming text-xl font-bold text-gray-900">
                freefor.games
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/explore"
              className="text-gray-700 hover:text-gaming-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Explore
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={`/${user?.username}`}
                  className="text-gray-700 hover:text-gaming-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  My Profile
                </Link>
                <Link
                  to="/availability"
                  className="text-gray-700 hover:text-gaming-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Calendar
                </Link>
                
                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-gaming-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <User className="h-4 w-4" />
                    <span>{user?.profile?.displayName || user?.username}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <Link
                      to="/edit-profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </Link>
                    <Link
                      to="/settings/calendar"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gaming-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gaming-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <Link
              to="/explore"
              className="text-gray-700 hover:text-gaming-600 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={`/${user?.username}`}
                  className="text-gray-700 hover:text-gaming-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/availability"
                  className="text-gray-700 hover:text-gaming-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Calendar
                </Link>
                <Link
                  to="/edit-profile"
                  className="text-gray-700 hover:text-gaming-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Edit Profile
                </Link>
                <Link
                  to="/settings/calendar"
                  className="text-gray-700 hover:text-gaming-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-gaming-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gaming-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-gaming-600 hover:text-gaming-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
