import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingCart, ChevronDown, User, Home, Info, Building2, Calculator, Heart, Phone, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ShortlistSidebar from './ShortlistSidebar';

const HeaderRedesign: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.left = '0';
      document.body.style.right = '0';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
      setShowPagesDropdown(false);
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.left = '';
      document.body.style.right = '';
    };
  }, [isMobileMenuOpen]);

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
              <a
                key={link.name}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.path);
                }}
                href={link.path}
                className={`text-lg font-light font-display ${textColor} ${hoverColor} transition-colors cursor-pointer ${
                  location.pathname === link.path ? 'text-orange-500' : ''
                }`}
              >
                {link.name}
              </a>
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
                    <a
                      key={link.name}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(link.path);
                        setShowPagesDropdown(false);
                      }}
                      href={link.path}
                      className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                    >
                      {link.name}
                    </a>
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

            <button
              onClick={() => navigate(currentUser ? '/profile' : '/contact')}
              className={`px-6 py-2.5 rounded-full text-base font-light font-display transition-all duration-300 border ${
                isHomePage && !isScrolled
                  ? 'border-white/60 text-white hover:bg-white/10'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {currentUser ? 'Profile' : 'Contact Us'}
            </button>
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
            onClick={() => {
              navigate('/');
              setIsMobileMenuOpen(false);
            }}
          >
            <img 
              src="/dre-logo.png" 
              alt="DRE Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-7 h-7 text-gray-900" />
          </button>
        </div>

        {/* Menu Content - Scrollable */}
        <div className="h-[calc(100vh-64px)] overflow-y-auto overscroll-contain">
          <div className="px-6 pt-8 pb-20">
            <nav>
              {/* Home */}
              <a
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                  setIsMobileMenuOpen(false);
                }}
                href="/"
                className="block py-4 text-2xl text-gray-900 hover:text-orange-500 transition-colors border-b border-gray-100"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              >
                Home
              </a>

              {/* About */}
              <a
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/about');
                  setIsMobileMenuOpen(false);
                }}
                href="/about"
                className="block py-4 text-2xl text-gray-900 hover:text-orange-500 transition-colors border-b border-gray-100"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              >
                About
              </a>

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
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/buy');
                        setIsMobileMenuOpen(false);
                      }}
                      href="/buy"
                      className="block py-3 pl-4 text-xl text-gray-600 hover:text-orange-500 transition-colors border-b border-gray-50"
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                    >
                      Buy
                    </a>
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/rent');
                        setIsMobileMenuOpen(false);
                      }}
                      href="/rent"
                      className="block py-3 pl-4 text-xl text-gray-600 hover:text-orange-500 transition-colors border-b border-gray-50"
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                    >
                      Rent
                    </a>
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/commercial');
                        setIsMobileMenuOpen(false);
                      }}
                      href="/commercial"
                      className="block py-3 pl-4 text-xl text-gray-600 hover:text-orange-500 transition-colors border-b border-gray-50"
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                    >
                      Commercial
                    </a>
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/pg-hostels');
                        setIsMobileMenuOpen(false);
                      }}
                      href="/pg-hostels"
                      className="block py-3 pl-4 text-xl text-gray-600 hover:text-orange-500 transition-colors border-b border-gray-50"
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                    >
                      PG/Hostels
                    </a>
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/land');
                        setIsMobileMenuOpen(false);
                      }}
                      href="/land"
                      className="block py-3 pl-4 text-xl text-gray-600 hover:text-orange-500 transition-colors"
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                    >
                      Land
                    </a>
                  </div>
                </div>
              </div>

              {/* EMI Calculator */}
              <a
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/emi-calculator');
                  setIsMobileMenuOpen(false);
                }}
                href="/emi-calculator"
                className="block py-4 text-2xl text-gray-900 hover:text-orange-500 transition-colors border-b border-gray-100"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              >
                EMI Calculator
              </a>

              {/* Shortlist */}
              <a
                onClick={(e) => {
                  e.preventDefault();
                  setIsShortlistOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                href="/shortlist"
                className="block py-4 text-2xl text-gray-900 hover:text-orange-500 transition-colors border-b border-gray-100"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              >
                Shortlist
              </a>

              {/* Contact */}
              <a
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/contact');
                  setIsMobileMenuOpen(false);
                }}
                href="/contact"
                className="block py-4 text-2xl text-gray-900 hover:text-orange-500 transition-colors border-b border-gray-100"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              >
                Contact
              </a>
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
