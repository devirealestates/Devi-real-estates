import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface City {
  id: string;
  name: string;
  listings: number;
  image: string;
  order?: number;
}

// Individual city card with scroll animation
const CityCard: React.FC<{
  city: City;
  index: number;
}> = ({ city, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`flex flex-col items-center text-center group cursor-pointer transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-95'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden mb-4 ring-4 ring-transparent group-hover:ring-orange-500 transition-all duration-300">
        <img
          src={city.image}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <h3 className="text-base sm:text-lg font-semibold mb-1">{city.name}</h3>
      <p className="text-gray-400 text-sm">{city.listings} Listings</p>
    </div>
  );
};

const PopularCities: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const maxVisibleCount = 4;
  
  // Use actual city count or max, whichever is smaller
  const visibleCount = Math.min(cities.length, maxVisibleCount);

  useEffect(() => {
    // Real-time listener for cities
    const citiesQuery = query(
      collection(db, 'cities'),
      orderBy('order', 'asc')
    );
    
    const unsubscribeCities = onSnapshot(citiesQuery, async (citiesSnapshot) => {
      try {
        const citiesData = citiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as City[];
        
        // Fetch all properties to count by location
        const propertiesSnapshot = await getDocs(collection(db, 'properties'));
        const propertiesByCity: { [key: string]: number } = {};
        
        propertiesSnapshot.docs.forEach(doc => {
          const property = doc.data();
          const location = property.location?.toLowerCase().trim() || '';
          if (location) {
            propertiesByCity[location] = (propertiesByCity[location] || 0) + 1;
          }
        });
        
        // Update cities with dynamic listing counts
        const citiesWithCounts = citiesData.map(city => ({
          ...city,
          listings: propertiesByCity[city.name.toLowerCase()] || 0
        }));
        
        setCities(citiesWithCounts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error listening to cities:', error);
      setCities([]);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribeCities();
  }, []);

  const handlePrev = () => {
    if (cities.length <= maxVisibleCount) return; // Don't scroll if all cities are visible
    setStartIndex((prev) => (prev === 0 ? cities.length - visibleCount : prev - 1));
  };

  const handleNext = () => {
    if (cities.length <= maxVisibleCount) return; // Don't scroll if all cities are visible
    setStartIndex((prev) => (prev >= cities.length - visibleCount ? 0 : prev + 1));
  };

  const visibleCities = [];
  for (let i = 0; i < visibleCount; i++) {
    const city = cities[(startIndex + i) % cities.length];
    if (city) visibleCities.push(city); // Only add if city exists
  }

  if (loading) {
    return (
      <section className="bg-gray-950 text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-12">
            Popular Cities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex flex-col items-center">
                <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gray-800 animate-pulse mb-4" />
                <div className="h-6 w-24 bg-gray-800 rounded animate-pulse mb-2" />
                <div className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (cities.length === 0) {
    return (
      <section className="bg-gray-950 text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-12">
            Popular Cities
          </h2>
          <p className="text-gray-400 text-center">No cities available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-950 text-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Popular Cities
          </h2>
          {cities.length > maxVisibleCount && (
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
          )}
        </div>

        {/* Cities Grid - responsive column count based on actual cities */}
        <div className={`grid gap-6 lg:gap-8 ${
          visibleCount === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
          visibleCount === 2 ? 'grid-cols-2 max-w-2xl mx-auto' :
          visibleCount === 3 ? 'grid-cols-2 sm:grid-cols-3' :
          'grid-cols-2 sm:grid-cols-4'
        }`}>
          {visibleCities.map((city, index) => (
            <CityCard 
              key={`${city.id}-${index}`} 
              city={city} 
              index={index} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCities;
