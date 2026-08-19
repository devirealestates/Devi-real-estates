import React, { useState } from 'react';
import { Heart, MapPin, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShortlist } from '@/hooks/useShortlist';
import EnhancedShareMenu from '@/components/EnhancedShareMenu';
import { ProtectedImage } from '@/components/ProtectedImage';
import PropertyBadge from '@/components/PropertyBadge';
import { combineMediaItems, MediaItem } from '@/lib/mediaUtils';
import { formatPriceWithSlash } from '@/lib/utils';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: string;
    location: string;
    fullAddress?: string;
    type: string;
    badge?: string;
    images: string[];
    videos?: string[];
    bedrooms?: number;
    bathrooms?: number;
    area: string;
    areaAcres?: number;
    description: string;
    featured?: boolean;
    category?: string;
    propertyAge?: number;
    status?: string;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();
  const { isShortlisted, toggleShortlist, isLoading: shortlistLoading } = useShortlist();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  const getMediaItems = (): MediaItem[] => {
    const images = property.images || [];
    const videos = property.videos || [];
    return combineMediaItems(images, videos);
  };

  const mediaItems = getMediaItems();
  const currentMedia = mediaItems[0];

  const handleCardClick = () => {
    navigate(`/property/${property.id}`);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareMenuOpen(true);
  };

  const handleShortlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleShortlist(property.id);
  };

  const currentImageUrl = currentMedia?.type === 'image' ? currentMedia.url : currentMedia?.thumbnail || 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500';
  const isPropertyShortlisted = isShortlisted(property.id);

  return (
    <>
      <div 
        className="cursor-pointer group transition-all duration-300"
        onClick={handleCardClick}
      >
        {/* Card Image with ProtectedImage, Watermark, Wishlist, Share overlay, and badges */}
        <ProtectedImage
          src={currentImageUrl}
          alt={property.title}
          aspectRatioClass="aspect-[4/3]"
          className="rounded-xl sm:rounded-2xl mb-2.5 sm:mb-3 bg-gray-100 shadow-sm"
          imgClassName="group-hover:scale-105"
          watermarkSize="sm"
        >
          {/* Top Right: Wish list & Share icon buttons on the card image */}
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex items-center gap-1.5 sm:gap-2 z-20">
            <button 
              onClick={handleShortlistClick}
              disabled={shortlistLoading}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all shadow-sm"
              aria-label="Wishlist"
            >
              <Heart 
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                  isPropertyShortlisted 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-white stroke-[2.2]'
                }`} 
              />
            </button>
            
            <button 
              onClick={handleShareClick}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all shadow-sm"
              aria-label="Share"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.2]" />
            </button>
          </div>

          {/* Top Left: Badges */}
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col items-start gap-1 z-20 max-w-[70%]">
            {property.badge && (
              <PropertyBadge badge={property.badge} size="xs" />
            )}
            {property.featured && !property.badge && (
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium shadow">
                Featured
              </div>
            )}
          </div>
        </ProtectedImage>

        {/* Details: Title & Price */}
        <div className="flex items-start justify-between gap-1 sm:gap-2 mb-0.5 sm:mb-1">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg leading-snug group-hover:text-orange-500 transition-colors truncate">
            {property.title}
          </h3>
          <span className="font-semibold text-gray-900 text-xs sm:text-base lg:text-lg whitespace-nowrap flex-shrink-0 ml-1 sm:ml-2">
            {formatPriceWithSlash(property.price)}
          </span>
        </div>

        {/* Details: Location & Sq Ft */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <span className="truncate flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 hidden sm:inline" />
            {property.location}
          </span>
          <span className="whitespace-nowrap flex-shrink-0 ml-1 sm:ml-2">
            {property.area || (property.areaAcres ? `${property.areaAcres} acres` : '')}
          </span>
        </div>
      </div>

      {/* Enhanced Share Menu */}
      <EnhancedShareMenu
        isOpen={isShareMenuOpen}
        onClose={() => setIsShareMenuOpen(false)}
        propertyTitle={property.title}
        propertyPrice={property.price}
        propertyLocation={property.location}
        propertyId={property.id}
        propertyImage={mediaItems.find(m => m.type === 'image')?.url || currentMedia?.url}
      />
    </>
  );
};

export default PropertyCard;
