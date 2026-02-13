import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingCart, ChevronDown, User } from 'lucide-react';
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
              <X className={`w-6 h-6 ${textColor}`} />
            ) : (
              <Menu className={`w-6 h-6 ${textColor}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.path);
                  setIsMobileMenuOpen(false);
                }}
                href={link.path}
                className={`block py-3 px-3 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </a>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <p className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wider">More Pages</p>
              {pagesLinks.map((link) => (
                <a
                  key={link.name}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(link.path);
                    setIsMobileMenuOpen(false);
                  }}
                  href={link.path}
                  className="block py-3 px-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 mt-2 flex gap-3">
              <button
                onClick={() => {
                  setIsShortlistOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Shortlist
              </button>
              <button
                onClick={() => {
                  navigate(currentUser ? '/profile' : '/contact');
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {currentUser ? 'Profile' : 'Contact Us'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shortlist Sidebar */}
      <ShortlistSidebar isOpen={isShortlistOpen} onClose={() => setIsShortlistOpen(false)} />
    </header>
  );
};

export default HeaderRedesign;
