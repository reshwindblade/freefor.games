import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Gamepad2, Menu, X, User, Calendar, Settings, LogOut, Zap } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const logoVariants = {
    hover: { 
      scale: 1.05,
      rotate: 2,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const linkVariants = {
    hover: { 
      scale: 1.05,
      y: -2,
      transition: { duration: 0.2, ease: "easeInOut" }
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const isActivePage = (path) => location.pathname === path;

  return (
    <motion.nav 
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-dark-900/95 backdrop-blur-md shadow-glow border-b border-neon-600/30' 
          : 'bg-dark-900/80 backdrop-blur-sm border-b border-dark-700/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <motion.div
              variants={logoVariants}
              whileHover="hover"
            >
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <Gamepad2 className="h-8 w-8 text-gaming-500 group-hover:text-neon-400 transition-colors duration-300 drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gaming-500/20 group-hover:bg-neon-400/20"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>
                 <span className="font-gaming text-xl font-bold bg-gradient-to-r from-gaming-400 to-neon-400 bg-clip-text text-transparent group-hover:from-neon-400 group-hover:to-gaming-400 transition-all duration-300 drop-shadow-[0_0_12px_rgba(217,70,239,0.35)]">
                  freefor.games
                </span>
                <Zap className="h-4 w-4 text-neon-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
              </Link>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <motion.div variants={linkVariants} whileHover="hover">
              <Link
                to="/explore"
                className={`nav-link ${isActivePage('/explore') ? 'active text-gaming-400' : ''}`}
              >
                Explore
              </Link>
            </motion.div>

            {isAuthenticated ? (
              <>
                <motion.div variants={linkVariants} whileHover="hover">
                  <Link
                    to={`/${user?.username}`}
                    className={`nav-link ${isActivePage(`/${user?.username}`) ? 'active text-gaming-400' : ''}`}
                  >
                    My Profile
                  </Link>
                </motion.div>
                <motion.div variants={linkVariants} whileHover="hover">
                  <Link
                    to="/availability"
                    className={`nav-link ${isActivePage('/availability') ? 'active text-gaming-400' : ''}`}
                  >
                    Calendar
                  </Link>
                </motion.div>
                <motion.div variants={linkVariants} whileHover="hover">
                  <Link
                    to="/friends"
                    className={`nav-link ${isActivePage('/friends') ? 'active text-gaming-400' : ''}`}
                  >
                    Friends
                  </Link>
                </motion.div>
                
                {/* User Menu */}
                <div className="relative group ml-4">
                  <motion.button 
                    className="flex items-center space-x-2 text-dark-300 hover:text-white px-4 py-2 rounded-xl bg-dark-800/50 hover:bg-dark-700/50 border border-dark-600/50 hover:border-gaming-500/50 transition-all duration-300 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative">
                      <User className="h-4 w-4" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-sm font-medium">{user?.profile?.displayName || user?.username}</span>
                  </motion.button>
                  
                  <div className="absolute right-0 mt-2 w-56 glass-card p-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Link
                      to="/edit-profile"
                      className="dropdown-item"
                    >
                      <User className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </Link>
                    <Link
                      to="/settings/calendar"
                      className="dropdown-item"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <div className="border-t border-white/10 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4 ml-4">
                <motion.div variants={linkVariants} whileHover="hover">
                  <Link
                    to="/login"
                    className="text-dark-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-300 font-medium"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-700/50 focus:outline-none focus:ring-2 focus:ring-gaming-500 border border-dark-600/50 hover:border-gaming-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="block h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="block h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileMenuVariants}
            className="md:hidden overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-2 bg-dark-800/95 backdrop-blur-md border-t border-dark-700/50">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  to="/explore"
                  className="block px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-700/50 font-medium transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Explore
                </Link>
              </motion.div>

              {isAuthenticated ? (
                <>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      to={`/${user?.username}`}
                      className="block px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-700/50 font-medium transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      to="/availability"
                      className="block px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-700/50 font-medium transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Calendar
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Link
                      to="/friends"
                      className="block px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-700/50 font-medium transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Friends
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.45 }}
                  >
                    <Link
                      to="/edit-profile"
                      className="block px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-700/50 font-medium transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Edit Profile
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link
                      to="/settings/calendar"
                      className="block px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-700/50 font-medium transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                  </motion.div>
                  <div className="border-t border-dark-700/50 my-2"></div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.55 }}
                  >
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium transition-all duration-300"
                    >
                      Logout
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      to="/login"
                      className="block px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-700/50 font-medium transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      to="/register"
                      className="block px-4 py-3 rounded-xl bg-gradient-to-r from-gaming-600 to-neon-500 text-white font-medium text-center transition-all duration-300 hover:from-gaming-500 hover:to-neon-400"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
