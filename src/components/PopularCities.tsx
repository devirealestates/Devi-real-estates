import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const cities = [
  {
    name: 'Kakinada',
    listings: '264 Listing',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Rajahmundry',
    listings: '923 Listing',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Visakhapatnam',
    listings: '2285 Listing',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Hyderabad',
    listings: '455 Listing',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Vijayawada',
    listings: '312 Listing',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Guntur',
    listings: '198 Listing',
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
];

const PopularCities: React.FC = () => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? cities.length - visibleCount : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev >= cities.length - visibleCount ? 0 : prev + 1));
  };

  const visibleCities = [];
  for (let i = 0; i < visibleCount; i++) {
    visibleCities.push(cities[(startIndex + i) % cities.length]);
  }

  return (
    <section className="bg-gray-950 text-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Popular Cities
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:border-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:border-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8">
          {visibleCities.map((city, index) => (
            <div key={`${city.name}-${index}`} className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden mb-4 ring-4 ring-transparent group-hover:ring-orange-500 transition-all duration-300">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1">{city.name}</h3>
              <p className="text-gray-400 text-sm">{city.listings}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCities;
