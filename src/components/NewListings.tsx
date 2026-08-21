import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowRight, MapPin, Heart, Send, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeProperties } from '@/hooks/useRealtimeProperties';
import { formatPriceWithSlash } from '@/lib/utils';
import EnhancedShareMenu from '@/components/EnhancedShareMenu';
import { ProtectedImage } from '@/components/ProtectedImage';
import PropertyBadge from '@/components/PropertyBadge';

interface ListingItem {
  id: string | number;
  name: string;
  price: string;
  location: string;
  area: string;
  image: string;
  badge?: string;
}

// Skeleton card for loading state
const ListingSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl mb-2 sm:mb-3 aspect-square sm:aspect-[4/3] bg-gray-200" />
    <div className="space-y-1.5">
      <div className="h-4 sm:h-5 bg-gray-200 rounded w-4/5" />
      <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/2" />
      <div className="hidden sm:flex justify-between gap-2 pt-0.5">
        <div className="h-3.5 bg-gray-200 rounded w-1/2" />
        <div className="h-3.5 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  </div>
);

// Individual Listing Card Component
const ListingCard: React.FC<{
  listing: ListingItem;
  onClick: () => void;
}> = ({ listing, onClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={cardRef}
        className={`group cursor-pointer transition-all duration-700 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
        onClick={onClick}
      >
        {/* Protected Image with Watermark */}
        <ProtectedImage
          src={listing.image}
          alt={listing.name}
          aspectRatioClass="aspect-square sm:aspect-[4/3]"
          className="rounded-xl sm:rounded-2xl mb-2 sm:mb-3 bg-gray-100 shadow-sm"
          imgClassName="group-hover:scale-105"
          watermarkSize="sm"
        >
          {/* Top Left: Property Badge */}
          {listing.badge && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
              <PropertyBadge badge={listing.badge} size="xs" />
            </div>
          )}

          {/* Top Right: Wish list & Share icon buttons on the card image */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5 sm:gap-2 z-20">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all shadow-sm"
              aria-label="Wishlist"
            >
              <Heart 
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                  isLiked 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-white stroke-[2.2]'
                }`} 
              />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen(true);
              }}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all shadow-sm"
              aria-label="Share"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.2]" />
            </button>
          </div>
        </ProtectedImage>
        {/* Info: On mobile, show only single-line title with ellipsis and green price on next line */}
        <div className="space-y-0.5 sm:space-y-1">
          <h3 
            className="text-xs sm:text-base lg:text-lg font-semibold text-gray-900 truncate block group-hover:text-orange-600 transition-colors"
            title={listing.name}
          >
            {listing.name}
          </h3>
          <p className="text-xs sm:text-base font-bold text-green-600 truncate">
            {listing.price}
          </p>
          {/* Location & Area: Hidden on mobile screens, shown on desktop (sm+) */}
          <div className="hidden sm:flex items-center justify-between text-xs sm:text-sm text-gray-500 pt-0.5">
            <p className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 text-gray-400" />
              <span className="truncate">{listing.location}</span>
            </p>
            <span className="whitespace-nowrap flex-shrink-0 ml-1">{listing.area}</span>
          </div>
        </div>
      </div>

      <EnhancedShareMenu
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        propertyTitle={listing.name}
        propertyPrice={listing.price}
        propertyLocation={listing.location}
        propertyId={String(listing.id)}
        propertyImage={listing.image}
      />
    </>
  );
};

const NewListings: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const { properties, loading } = useRealtimeProperties();

  const displayListings = useMemo<ListingItem[]>(() => {
    if (properties && properties.length > 0) {
      return properties.slice(0, 3).map((prop) => ({
        id: prop.id,
        name: prop.title || 'Featured Property',
        price: formatPriceWithSlash(prop.price),
        location: prop.location || 'Andhra Pradesh',
        area: prop.area ? `${prop.area} Sq.Ft` : 'Prime Space',
        badge: prop.badge,
        image:
          prop.images && prop.images.length > 0 && prop.images[0]
            ? prop.images[0]
            : 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      }));
    }
    return [];
  }, [properties]);

  useEffect(() => {
    const headerObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsHeaderVisible(true);
        headerObserver.disconnect();
      }
    }, { threshold: 0.1 });

    if (sectionRef.current) {
      headerObserver.observe(sectionRef.current);
    }

    return () => {
      headerObserver.disconnect();
    };
  }, []);

  const handleCardClick = (listing: ListingItem) => {
    if (listing.id) {
      navigate(`/property/${listing.id}`);
    } else {
      navigate('/buy');
    }
  };

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 lg:py-24 bg-white">
      {/* Typewriter animation styles */}
      <style>{`
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: #1f2937; }
        }
        .typewriter-text {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 3px solid #1f2937;
          width: 0;
        }
        .typewriter-text.animate {
          animation: 
            typewriter 1.5s steps(12, end) forwards,
            blink-caret 0.75s step-end infinite;
        }
        @keyframes revealUp {
          from { 
            clip-path: inset(100% 0 0 0);
            transform: translateY(30px);
          }
          to { 
            clip-path: inset(0 0 0 0);
            transform: translateY(0);
          }
        }
        .text-reveal {
          clip-path: inset(100% 0 0 0);
          transform: translateY(20px);
        }
        .text-reveal.animate {
          animation: revealUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-16">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 font-display tracking-tight">
            <span className={`typewriter-text ${isHeaderVisible ? 'animate' : ''}`}>
              New Listings
            </span>
          </h2>
          <div className="max-w-lg">
            <p
              className={`text-gray-500 text-lg leading-relaxed mb-6 text-reveal ${isHeaderVisible ? 'animate' : ''}`}
              style={{ animationDelay: '1s' }}
            >
              From chic urban apartments to serene countryside retreats.<br />
              Start your search today and find the perfect place to call home.
            </p>
            <button
              onClick={() => navigate('/buy')}
              className={`inline-flex items-center gap-2 px-8 py-3.5 border border-orange-500 text-orange-500 rounded-full text-base font-medium hover:bg-orange-500 hover:text-white transition-colors duration-300 text-reveal ${isHeaderVisible ? 'animate' : ''}`}
              style={{ animationDelay: '1.2s' }}
            >
              Explore All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cards Section */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
            <ListingSkeleton />
            <ListingSkeleton />
            <ListingSkeleton />
          </div>
        ) : displayListings.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
            {displayListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => handleCardClick(listing)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium text-lg">No new listings available</p>
            <p className="text-gray-400 text-sm mt-1">Properties added from the admin dashboard will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewListings;
