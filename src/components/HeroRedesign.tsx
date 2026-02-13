import React, { useState } from 'react';
import { Building2, MapPin, DollarSign, ChevronDown, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroRedesign: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent'>('buy');
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const navigate = useNavigate();

  const propertyTypes = ['Apartments', 'Houses', 'Villas', 'Commercial', 'Land', 'PG/Hostels'];
  const locations = ['Kakinada', 'Rajahmundry', 'Visakhapatnam', 'Hyderabad', 'Vijayawada', 'Guntur'];
  const priceRanges = [
    '₹5,00,000 - ₹15,00,000',
    '₹15,00,000 - ₹30,00,000',
    '₹30,00,000 - ₹50,00,000',
    '₹50,00,000 - ₹1,00,00,000',
    '₹1,00,00,000+',
  ];

  const handleSearch = () => {
    const route = activeTab === 'buy' ? '/buy' : '/rent';
    navigate(route);
  };

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Modern home"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Search Form - Top Right */}
      <div className="absolute top-24 right-4 sm:right-6 lg:right-8 z-20 w-full max-w-md px-4 sm:px-0">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Buy / Rent Tabs */}
          <div className="flex gap-6 mb-6 border-b border-gray-200 pb-3">
            <button
              onClick={() => setActiveTab('buy')}
              className={`text-base font-medium pb-1 transition-all ${
                activeTab === 'buy'
                  ? 'text-gray-900 border-b-2 border-orange-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setActiveTab('rent')}
              className={`text-base font-medium pb-1 transition-all ${
                activeTab === 'rent'
                  ? 'text-gray-900 border-b-2 border-orange-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Rent
            </button>
          </div>

          {/* Property Type Dropdown */}
          <div className="relative mb-4">
            <p className="text-xs text-gray-400 mb-1">I'm looking to {activeTab}</p>
            <div
              className="flex items-center gap-3 cursor-pointer border-b border-gray-200 pb-3"
              onClick={() => {
                setShowPropertyDropdown(!showPropertyDropdown);
                setShowLocationDropdown(false);
                setShowPriceDropdown(false);
              }}
            >
              <Building2 className="w-5 h-5 text-gray-400" />
              <span className={`flex-1 text-base ${propertyType ? 'text-gray-900' : 'text-gray-400'}`}>
                {propertyType || 'Apartments'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            {showPropertyDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1 max-h-48 overflow-auto">
                {propertyTypes.map((type) => (
                  <div
                    key={type}
                    onClick={() => {
                      setPropertyType(type);
                      setShowPropertyDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-orange-50 cursor-pointer text-sm text-gray-700 transition-colors"
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location Dropdown */}
          <div className="relative mb-4">
            <p className="text-xs text-gray-400 mb-1">In the city of</p>
            <div
              className="flex items-center gap-3 cursor-pointer border-b border-gray-200 pb-3"
              onClick={() => {
                setShowLocationDropdown(!showLocationDropdown);
                setShowPropertyDropdown(false);
                setShowPriceDropdown(false);
              }}
            >
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className={`flex-1 text-base ${location ? 'text-gray-900' : 'text-gray-400'}`}>
                {location || 'Location'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            {showLocationDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1 max-h-48 overflow-auto">
                {locations.map((loc) => (
                  <div
                    key={loc}
                    onClick={() => {
                      setLocation(loc);
                      setShowLocationDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-orange-50 cursor-pointer text-sm text-gray-700 transition-colors"
                  >
                    {loc}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Dropdown */}
          <div className="relative mb-6">
            <p className="text-xs text-gray-400 mb-1">In price range of</p>
            <div
              className="flex items-center gap-3 cursor-pointer border-b border-gray-200 pb-3"
              onClick={() => {
                setShowPriceDropdown(!showPriceDropdown);
                setShowPropertyDropdown(false);
                setShowLocationDropdown(false);
              }}
            >
              <DollarSign className="w-5 h-5 text-gray-400" />
              <span className={`flex-1 text-base ${priceRange ? 'text-gray-900' : 'text-gray-400'}`}>
                {priceRange || '₹50,000 - ₹1,25,000'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            {showPriceDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1 max-h-48 overflow-auto">
                {priceRanges.map((range) => (
                  <div
                    key={range}
                    onClick={() => {
                      setPriceRange(range);
                      setShowPriceDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-orange-50 cursor-pointer text-sm text-gray-700 transition-colors"
                  >
                    {range}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full py-3.5 bg-white border-2 border-orange-500 text-orange-500 rounded-xl font-semibold text-base hover:bg-orange-500 hover:text-white transition-all duration-300"
          >
            Search
          </button>
        </div>
      </div>

      {/* Heading - Bottom Left */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
        <style>{`
          @keyframes heroSlideUp {
            0% {
              transform: translate3d(0px, 80px, 0px) scale3d(1, 1, 1);
              opacity: 0;
            }
            100% {
              transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1);
              opacity: 1;
            }
          }
          .hero-line {
            display: block;
            opacity: 0;
            transform: translate3d(0px, 80px, 0px);
            transform-style: preserve-3d;
            animation: heroSlideUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }
          .hero-line-1 { animation-delay: 0.1s; }
          .hero-line-2 { animation-delay: 0.3s; }
          .hero-line-3 { animation-delay: 0.5s; }
        `}</style>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-light text-white leading-[1.05] font-display tracking-tight max-w-5xl">
          <span className="hero-line hero-line-1">Find the right</span>
          <span className="hero-line hero-line-2">and best home</span>
          <span className="hero-line hero-line-3">for your family</span>
        </h1>
      </div>
    </section>
  );
};

export default HeroRedesign;
