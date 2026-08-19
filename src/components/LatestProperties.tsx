import React, { useRef, useState, useEffect, useMemo } from 'react';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeProperties, Property } from '@/hooks/useRealtimeProperties';
import { formatPriceWithSlash } from '@/lib/utils';
import { ProtectedImage } from '@/components/ProtectedImage';
import PropertyBadge from '@/components/PropertyBadge';

interface DisplayListing {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  image: string;
  badge?: string;
}

// Helper to extract timestamp from various Firestore date representations
const getPropertyTimestamp = (prop: Property): number => {
  if (!prop.createdAt) return 0;
  if (typeof prop.createdAt === 'object') {
    if (typeof prop.createdAt.toDate === 'function') {
      return prop.createdAt.toDate().getTime();
    }
    if (typeof prop.createdAt.seconds === 'number') {
      return prop.createdAt.seconds * 1000;
    }
    if (prop.createdAt instanceof Date) {
      return prop.createdAt.getTime();
    }
  }
  if (typeof prop.createdAt === 'number') return prop.createdAt;
  if (typeof prop.createdAt === 'string') {
    const parsed = new Date(prop.createdAt).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Helper to format price cleanly with Indian currency styling and /-
const formatPrice = (price?: string): string => {
  if (!price) return 'Price on Request';
  const trimmed = price.trim();
  if (trimmed.startsWith('₹') || trimmed.toLowerCase().startsWith('rs')) {
    return formatPriceWithSlash(trimmed);
  }
  const numeric = Number(trimmed.replace(/[^0-9.]/g, ''));
  if (!isNaN(numeric) && numeric > 0) {
    return formatPriceWithSlash(`₹ ${numeric.toLocaleString('en-IN')}`);
  }
  return formatPriceWithSlash(`₹ ${trimmed}`);
};

// Helper to determine rental period label
const getPeriod = (category?: string, price?: string): string => {
  if (price && (price.includes('/') || price.toLowerCase().includes('mo') || price.toLowerCase().includes('month') || price.toLowerCase().includes('rent'))) {
    return '';
  }
  if (category === 'For Rent' || category === 'PG/Hostels') {
    return '/Monthly';
  }
  return '';
};

// Skeleton loading card matching the layout
const SkeletonCard: React.FC<{ isLast: boolean }> = ({ isLast }) => (
  <div className="animate-pulse">
    <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
      <div className="md:w-2/5 rounded-2xl aspect-[4/3] md:aspect-auto md:h-64 flex-shrink-0 bg-gray-200" />
      <div className="flex-1 flex flex-col justify-center space-y-4">
        <div className="h-8 bg-gray-200 rounded-lg w-2/3" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-4/5" />
        </div>
        <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
      </div>
    </div>
    {!isLast && <hr className="my-8 border-gray-200" />}
  </div>
);

// Individual listing card with intersection observer animation
const ListingCard: React.FC<{
  listing: DisplayListing;
  isLast: boolean;
  onClick: () => void;
}> = ({ listing, isLast, onClick }) => {
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
        threshold: 0.2,
        rootMargin: '-10% 0px -10% 0px'
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
      className={`transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
    >
      <div
        className="flex flex-col md:flex-row gap-6 lg:gap-10 cursor-pointer group"
        onClick={onClick}
      >
        {/* Protected Image with Watermark */}
        <ProtectedImage
          src={listing.image}
          alt={listing.name}
          className="md:w-2/5 rounded-2xl aspect-[4/3] md:aspect-auto md:h-64 flex-shrink-0 bg-gray-100 shadow-sm"
          imgClassName="group-hover:scale-105"
          watermarkSize="md"
        >
          {listing.badge && (
            <div className="absolute top-3 left-3 z-20">
              <PropertyBadge badge={listing.badge} size="sm" />
            </div>
          )}
        </ProtectedImage>
        {/* Details */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 font-display group-hover:text-orange-600 transition-colors duration-300">
            {listing.name}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-lg line-clamp-3">
            {listing.description}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">
              {listing.price}
            </span>
            {listing.period && (
              <span className="text-gray-400 text-sm">{listing.period}</span>
            )}
          </div>
        </div>
      </div>
      {/* Divider */}
      {!isLast && (
        <hr className="my-8 border-gray-200" />
      )}
    </div>
  );
};

const LatestProperties: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const { properties, loading } = useRealtimeProperties();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsHeaderVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Sort by latest added (createdAt timestamp descending) and take top recent properties
  const displayListings = useMemo<DisplayListing[]>(() => {
    if (!properties || properties.length === 0) return [];

    const sorted = [...properties].sort((a, b) => {
      const timeA = getPropertyTimestamp(a);
      const timeB = getPropertyTimestamp(b);
      return timeB - timeA;
    });

    return sorted.slice(0, 3).map((prop) => {
      // Pick first valid image or high-res fallback
      const mainImage =
        prop.images && prop.images.length > 0 && prop.images[0]
          ? prop.images[0]
          : 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

      // Meaningful description fallback
      let desc = prop.description?.trim();
      if (!desc || desc === 'No description available.') {
        const specs = [
          prop.bedrooms ? `${prop.bedrooms} BHK` : null,
          prop.type || null,
          prop.location ? `in ${prop.location}` : null,
          prop.area ? `(${prop.area})` : null,
        ]
          .filter(Boolean)
          .join(' ');
        desc = `Discover this exceptional ${specs || 'property'} featuring premium architecture, modern amenities, and prime connectivity.`;
      }

      return {
        id: prop.id,
        name: prop.title || 'Exclusive Property',
        description: desc,
        price: formatPrice(prop.price),
        period: getPeriod(prop.category, prop.price),
        image: mainImage,
        badge: prop.badge,
      };
    });
  }, [properties]);

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white" ref={sectionRef}>
      <style>{`
        @keyframes latestTypewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes latestBlinkCaret {
          from, to { border-color: transparent; }
          50% { border-color: #1f2937; }
        }
        .latest-typewriter {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 3px solid #1f2937;
          width: 0;
          vertical-align: bottom;
        }
        .latest-typewriter.visible {
          animation: 
            latestTypewriter 1.5s steps(17, end) forwards,
            latestBlinkCaret 0.75s step-end infinite;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium text-gray-900 inline-block font-display"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <span className={`latest-typewriter ${isHeaderVisible ? 'visible' : ''}`}>
              Latest Properties
            </span>
          </h2>
        </div>

        {/* Listings / Skeletons */}
        <div className="space-y-8">
          {loading ? (
            <>
              <SkeletonCard isLast={false} />
              <SkeletonCard isLast={false} />
              <SkeletonCard isLast={true} />
            </>
          ) : displayListings.length > 0 ? (
            displayListings.map((listing, index) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isLast={index === displayListings.length - 1}
                onClick={() => navigate(`/property/${listing.id}`)}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium text-lg">No properties listed yet.</p>
              <p className="text-gray-400 text-sm mt-1">Properties added from the admin dashboard will appear here.</p>
            </div>
          )}
        </div>

        {/* Explore Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate('/buy')}
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-orange-500 text-orange-500 rounded-full text-sm font-medium hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Explore All Properties <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default LatestProperties;
