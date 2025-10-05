import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, Vote, User, LogOut, Settings, BarChart3 } from 'lucide-react';
import { useMaharashtraAuth } from '../../contexts/MaharashtraAuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const MaharashtraNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin } = useMaharashtraAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: null },
    { path: '/results', label: 'Results', icon: BarChart3 },
  ];

  const authLinks = isAuthenticated ? [
    { path: '/dashboard', label: 'Dashboard', icon: null },
    { path: '/vote', label: 'Vote', icon: Vote },
    { path: '/profile', label: 'Profile', icon: User },
  ] : [
    { path: '/login', label: 'Login', icon: null },
    { path: '/register', label: 'Register', icon: null },
  ];

  const adminLinks = isAdmin() ? [
    { path: '/admin', label: 'Admin Panel', icon: Settings },
  ] : [];

  return (
    <nav className="bg-primary navbar-shadow sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-saffron to-green rounded-lg flex items-center justify-center">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">Maharashtra E-Voting</h1>
              <p className="text-xs text-gray-200">Legislative Assembly 2024</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Main Navigation Links */}
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive(link.path)
                      ? 'bg-white/20 text-white'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Auth Links */}
            {authLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive(link.path)
                      ? 'bg-white/20 text-white'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Admin Links */}
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive(link.path)
                      ? 'bg-white/20 text-white'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-200 hover:bg-white/10 hover:text-white transition-all duration-200"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            {isAuthenticated && (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white/20">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-200">{user?.constituency}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md text-gray-200 hover:bg-white/10 hover:text-white transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-200 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-200 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-2">
              {/* Navigation Links */}
              {[...navLinks, ...authLinks, ...adminLinks].map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                      isActive(link.path)
                        ? 'bg-white/20 text-white'
                        : 'text-gray-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* User Info and Logout */}
              {isAuthenticated && (
                <>
                  <div className="px-4 py-3 border-t border-white/20 mt-2">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-gray-200">{user?.constituency}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {user?.role === 'admin' ? 'Administrator' : 'Voter'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 rounded-md text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center space-x-3"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MaharashtraNavbar;
