import React, { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import HeaderRedesign from '@/components/HeaderRedesign';
import FooterRedesign from '@/components/FooterRedesign';
import { Search, MapPin, Mountain, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePropertyLocations } from '@/hooks/usePropertyLocations';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  fullAddress?: string;
  type: string;
  category: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  description: string;
  featured?: boolean;
}

const Land = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const navigate = useNavigate();
  const { locationData } = usePropertyLocations();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, searchQuery, selectedType, priceRange]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const fetchProperties = async () => {
    try {
      const allPropertiesQuery = query(collection(db, 'properties'));
      const querySnapshot = await getDocs(allPropertiesQuery);
      
      const propertiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
      
      const landProperties = propertiesData.filter(property => 
        property.category === 'Land' || 
        property.type === 'Land' || 
        property.type === 'Agricultural' || 
        property.type === 'Residential Plot'
      );
      
      setProperties(landProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = properties;

    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm)
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(property => 
        property.category === selectedType || property.type === selectedType
      );
    }

    setFilteredProperties(filtered);
  };

  const handleSearch = () => {
    filterProperties();
    setTimeout(() => {
      const resultsSection = document.querySelector('#properties-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const propertyTypes = ['all', 'Agricultural', 'Residential Plot', 'Commercial Land'];

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes propertiesReveal {
          from { 
            clip-path: inset(100% 0 0 0);
            transform: translateY(30px);
            opacity: 0;
          }
          to { 
            clip-path: inset(0 0 0 0);
            transform: translateY(0);
            opacity: 1;
          }
        }
        .properties-reveal {
          opacity: 0;
          clip-path: inset(100% 0 0 0);
          transform: translateY(30px);
        }
        .properties-reveal.visible {
          animation: propertiesReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      <HeaderRedesign />
      
      {/* Hero Section */}
      <section className="relative h-[45vh] min-h-[350px] flex items-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070" 
            alt="Land Properties" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <p className="text-gray-300 text-sm mb-4">Home / Land</p>
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-medium text-white"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Land
          </h1>
        </div>
      </section>

      {/* Property Listing Section */}
      <section ref={sectionRef} id="properties-section" className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header and Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
            <div>
              <h2 
                className={`text-3xl sm:text-4xl font-medium text-gray-900 mb-2 properties-reveal ${isVisible ? 'visible' : ''}`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Property Listing
              </h2>
              <p className={`text-orange-500 text-sm properties-reveal ${isVisible ? 'visible' : ''}`} style={{ animationDelay: '0.1s' }}>
                {filteredProperties.length} Properties result found
              </p>
            </div>

            {/* Filters */}
            <div className={`flex flex-wrap items-center gap-4 properties-reveal ${isVisible ? 'visible' : ''}`} style={{ animationDelay: '0.2s' }}>
              {/* Location Dropdown */}
              <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white min-w-[150px]">
                <MapPin className="w-4 h-4 text-gray-400" />
                <Select 
                  value={searchQuery || 'all-locations'} 
                  onValueChange={(value) => setSearchQuery(value === 'all-locations' ? '' : value)}
                >
                  <SelectTrigger className="border-0 p-0 h-auto shadow-none focus:ring-0">
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-gray-400">Location</span>
                      <SelectValue placeholder="All Locations" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg z-[200]">
                    <SelectItem value="all-locations">All Locations</SelectItem>
                    {locationData.locations.map((location, index) => (
                      <SelectItem key={index} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type Dropdown */}
              <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white min-w-[180px]">
                <Mountain className="w-4 h-4 text-gray-400" />
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="border-0 p-0 h-auto shadow-none focus:ring-0">
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-gray-400">Types of Property</span>
                      <SelectValue placeholder="All Types" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg z-[200]">
                    {propertyTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Dropdown */}
              <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white min-w-[180px]">
                <span className="text-gray-400 text-sm">₹</span>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="border-0 p-0 h-auto shadow-none focus:ring-0">
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-gray-400">In price range of</span>
                      <SelectValue placeholder="All Prices" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg z-[200]">
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-1000000">Under ₹10,00,000</SelectItem>
                    <SelectItem value="1000000-5000000">₹10,00,000 - ₹50,00,000</SelectItem>
                    <SelectItem value="5000000-10000000">₹50,00,000 - ₹1,00,00,000</SelectItem>
                    <SelectItem value="10000000+">Above ₹1,00,00,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <button 
                onClick={handleSearch}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Properties Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-4"></div>
                  <div className="flex justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredProperties.map((property, index) => (
                <div 
                  key={property.id}
                  className={`cursor-pointer group properties-reveal ${isVisible ? 'visible' : ''}`}
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  onClick={() => navigate(`/property/${property.id}`)}
                >
                  {/* Image */}
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4">
                    <img 
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600';
                      }}
                    />
                  </div>
                  
                  {/* Details */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">
                      {property.title}
                    </h3>
                    <span className="text-gray-900 font-semibold whitespace-nowrap ml-2">
                      {property.price}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{property.location}</span>
                    <span>{property.area}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Land Properties Found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search criteria or browse all properties.</p>
              <button 
                onClick={() => {setSearchQuery(''); setSelectedType('all'); setPriceRange('all');}}
                className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:border-orange-500 hover:text-orange-500 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070" 
            alt="Property" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-6 leading-tight"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Are you looking to buy<br />or rent a property?
          </h2>
          <button 
            onClick={() => navigate('/contact')}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white rounded-full text-sm font-medium hover:bg-white hover:text-gray-900 transition-all duration-300"
          >
            Get in Touch <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <FooterRedesign />
    </div>
  );
};

export default Land;
