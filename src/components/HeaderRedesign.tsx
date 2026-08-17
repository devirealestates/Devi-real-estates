import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingCart, ChevronDown, User, Home, Info, Building2, Calculator, Heart, Phone, ArrowRight, LogOut, Download } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useShortlist } from '@/hooks/useShortlist';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { NotificationBell } from './NotificationBell';
import ShortlistSidebar from './ShortlistSidebar';

const HeaderRedesign: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { shortlistedCount } = useShortlist();
  const { isInstalled, promptInstall } = usePWAInstall();
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
    { name: 'My Shortlist', path: '/shortlist' },
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
              className="relative w-10 h-10 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              title="My Shortlist"
              aria-label="My Shortlist"
            >
              <Heart className={`w-5 h-5 ${textColor} ${hoverColor} transition-colors`} strokeWidth={1.75} />
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-orange-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                {shortlistedCount}
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

            {/* Install App Button - Desktop (Show only if not installed) */}
            {!isInstalled && (
              <button
                onClick={() => promptInstall()}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${
                  isHomePage && !isScrolled
                    ? 'bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md border border-slate-700/60'
                    : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-800'
                }`}
                title="Install Devi Real Estates App"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Install App</span>
              </button>
            )}

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

            {/* Notification Bell - Desktop */}
            <NotificationBell isHomePage={isHomePage} isScrolled={isScrolled} />

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

          {/* Mobile Right Section: Bell & Menu Toggle */}
          <div className="flex items-center gap-1 lg:hidden">
            <NotificationBell isHomePage={isHomePage} isScrolled={isScrolled} />
            <button
              className="w-10 h-10 flex items-center justify-center"
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

              {/* Install App Button - Mobile (Professional Dark Slate & Emerald styling) */}
              {!isInstalled && (
                <div className="py-3 border-b border-gray-100">
                  <button
                    onClick={() => {
                      document.body.style.overflow = '';
                      setIsMobileMenuOpen(false);
                      promptInstall();
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md shadow-slate-900/10 hover:shadow-lg transition-all duration-300 active:scale-[0.98] group text-left border border-slate-700/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-white tracking-wide font-display">Install App</span>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full uppercase tracking-wider">Free</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 font-sans">Faster access & home screen app</p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-white group-hover:bg-white group-hover:text-slate-900 transition-all font-sans">
                      Get
                    </div>
                  </button>
                </div>
              )}

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
