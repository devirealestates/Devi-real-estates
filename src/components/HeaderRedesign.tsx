import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingCart, ChevronDown, User, Home, Info, Building2, Calculator, Heart, Phone, ArrowRight, LogOut } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ShortlistSidebar from './ShortlistSidebar';

const HeaderRedesign: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug log for location changes
  useEffect(() => {
    console.log('[HeaderRedesign] Current pathname:', location.pathname);
  }, [location.pathname]);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPagesDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowPagesDropdown(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open - simplified approach
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Helper function for mobile navigation
  const handleMobileNavigation = (path: string) => {
    // Reset body styles immediately
    document.body.style.overflow = '';
    setIsMobileMenuOpen(false);
    setShowPagesDropdown(false);
    // Navigate after state is reset
    navigate(path);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      document.body.style.overflow = '';
      setIsMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Properties', path: '/buy' },
  ];

  const pagesLinks = [
    { name: 'Buy Property', path: '/buy' },
    { name: 'Rent Property', path: '/rent' },
    { name: 'Commercial', path: '/commercial' },
    { name: 'PG/Hostels', path: '/pg-hostels' },
    { name: 'Land', path: '/land' },
    { name: 'EMI Calculator', path: '/emi-calculator' },
  ];

  const mobileMenuLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About Us', path: '/about', icon: Info },
    { name: 'Buy Property', path: '/buy', icon: Building2 },
    { name: 'Rent Property', path: '/rent', icon: Building2 },
    { name: 'Commercial', path: '/commercial', icon: Building2 },
    { name: 'PG/Hostels', path: '/pg-hostels', icon: Building2 },
    { name: 'Land', path: '/land', icon: Building2 },
    { name: 'EMI Calculator', path: '/emi-calculator', icon: Calculator },
    { name: 'Shortlist', path: '/shortlist', icon: Heart },
  ];

  const headerBg = isHomePage && !isScrolled
    ? 'bg-transparent'
    : 'bg-white shadow-sm';
  const textColor = isHomePage && !isScrolled ? 'text-white' : 'text-gray-700';
  const logoColor = isHomePage && !isScrolled ? 'text-white' : 'text-gray-900';
  const hoverColor = 'hover:text-orange-500';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img 
              src="/dre-logo.png" 
              alt="DRE Logo" 
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-lg font-light font-display ${textColor} ${hoverColor} transition-colors cursor-pointer ${
                  location.pathname === link.path ? 'text-orange-500' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Pages Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowPagesDropdown(!showPagesDropdown)}
                className={`flex items-center gap-1 text-lg font-light font-display ${textColor} ${hoverColor} transition-colors`}
              >
                Pages <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showPagesDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {pagesLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setShowPagesDropdown(false)}
                      className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setIsShortlistOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center"
            >
              <ShoppingCart className={`w-5 h-5 ${textColor} ${hoverColor} transition-colors`} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                0
              </span>
            </button>

            {/* Contact Us button - Always visible */}
            <button
              onClick={() => navigate('/contact')}
              className={`px-6 py-2.5 rounded-full text-base font-light font-display transition-all duration-300 border ${
                isHomePage && !isScrolled
                  ? 'border-white/60 text-white hover:bg-white/10'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Contact Us
            </button>

            {/* Show Sign In button if user is not logged in */}
            {!currentUser && (
              <button
                onClick={() => navigate('/login')}
                className={`px-6 py-2.5 rounded-full text-base font-light font-display transition-all duration-300 border ${
                  isHomePage && !isScrolled
                    ? 'border-white/60 text-white hover:bg-white/10'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sign In
              </button>
            )}

            {/* Logout Button - Desktop */}
            {currentUser && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-base font-light font-display transition-all duration-300 border border-red-500 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isMobileMenuOpen ? 'text-gray-900' : textColor}`} />
            ) : (
              <Menu className={`w-6 h-6 ${textColor}`} />
            )}
          </button>
        </div>
      </div>

      {/* Fullscreen Mobile Menu */}
      <div 
        className={`lg:hidden fixed inset-0 bg-white z-40 transition-all duration-300 ease-out ${
          isMobileMenuOpen 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 translate-x-full pointer-events-none'
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => handleMobileNavigation('/')}
          >
            <img 
              src="/dre-logo.png" 
              alt="DRE Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center"
            onClick={() => {
              document.body.style.overflow = '';
              setIsMobileMenuOpen(false);
            }}
          >
            <X className="w-7 h-7 text-gray-900" />
          </button>
        </div>

        {/* Menu Content - Scrollable */}
        <div className="h-[calc(100vh-64px)] overflow-y-auto overscroll-contain">
          <div className="px-6 pt-8 pb-20">
            <nav>
              {/* Home */}
              <button
                onClick={() => handleMobileNavigation('/')}
                className="block w-full text-left py-4 text-2xl text-gray-900 hover:text-orange-500 transition-colors border-b border-gray-100"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              >
                Home
              </button>

              {/* About */}
              <button
                onClick={() => handleMobileNavigation('/about')}
                className="block w-full text-left py-4 text-2xl text-gray-900 hover:text-orange-500 transition-colors border-b border-gray-100"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              >
                About
              </button>

              {/* Properties Dropdown */}
              <div className="border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPagesDropdown(!showPagesDropdown)}
                  className="flex items-center justify-between w-full py-4 text-2xl text-left text-gray-900 hover:text-orange-500 transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
                >
                  Properties
                  <ChevronDown className={`w-6 h-6 transition-transform duration-200 ${showPagesDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${showPagesDropdown ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-3 space-y-0">
                    <button
                      onClick={() => handleMobileNavigation('/buy')}
                      className="block w-full text-left py-3 pl-4 text-xl text-gray-600 hover:text-orange-500 transition-colors border-b border-gray-50"
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => handleMobileNavigation('/rent')}
                      className="block w-full text-left py-3 pl-4 text-xl text-gray-600 hover:text-orange-500 transition-colors border-b border-gray-50"
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                    >
                      Rent
                    </button>
                    <button
                      onClick={() => handleMobileNavigation('/commercial')}
                      className="block w-full text-left py-3 pl-4 text-xl text-gray-600 hover:text-orange-500 transition-colors border-b border-gray-50"
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                    >
                      Commercial
                    </button>
                    <button
                      onClick={() => handleMobileNavigation('/pg-hostels')}
                      className="block w-full text-left py-3 pl-4 text-xl text-gray-600 hover:text-orange-500 transition-colors border-b border-gray-50"
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                    >
                      PG/Hostels
                    </button>
                    <button
                      onClick={() => handleMobileNavigation('/land')}
                      className="block w-full text-left py-3 pl-4 text-xl text-gray-600 hover:text-orange-500 transition-colors"
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                    >
                      Land
                    </button>
                  </div>
                </div>
              </div>

              {/* EMI Calculator */}
              <button
                onClick={() => handleMobileNavigation('/emi-calculator')}
                className="block w-full text-left py-4 text-2xl text-gray-900 hover:text-orange-500 transition-colors border-b border-gray-100"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              >
                EMI Calculator
              </button>

              {/* Shortlist */}
              <button
                onClick={() => {
                  document.body.style.overflow = '';
                  setIsMobileMenuOpen(false);
                  setIsShortlistOpen(true);
                }}
                className="block w-full text-left py-4 text-2xl text-gray-900 hover:text-orange-500 transition-colors border-b border-gray-100"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              >
                Shortlist
              </button>

              {/* My Bookings */}
              <button
                onClick={() => handleMobileNavigation('/my-bookings')}
                className="block w-full text-left py-4 text-2xl text-gray-900 hover:text-orange-500 transition-colors border-b border-gray-100"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              >
                My Bookings
              </button>

              {/* Contact */}
              <button
                onClick={() => handleMobileNavigation('/contact')}
                className="block w-full text-left py-4 text-2xl text-gray-900 hover:text-orange-500 transition-colors border-b border-gray-100"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              >
                Contact
              </button>

              {/* Sign In Button - Only show if user is NOT logged in */}
              {!currentUser && (
                <button
                  onClick={() => handleMobileNavigation('/login')}
                  className="flex items-center gap-3 w-full text-left py-4 text-2xl text-blue-600 hover:text-blue-700 transition-colors border-b border-gray-100"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
                >
                  <User className="w-6 h-6" />
                  Sign In
                </button>
              )}

              {/* Logout Button - Only show if user is logged in */}
              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left py-4 text-2xl text-red-600 hover:text-red-700 transition-colors border-b border-gray-100"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
                >
                  <LogOut className="w-6 h-6" />
                  Logout
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Shortlist Sidebar */}
      <ShortlistSidebar isOpen={isShortlistOpen} onClose={() => setIsShortlistOpen(false)} />
    </header>
  );
};

export default HeaderRedesign;
