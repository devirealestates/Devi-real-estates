
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, Play, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { combineMediaItems, MediaItem, getEmbedUrl } from '@/lib/mediaUtils';
import { ProtectedImage } from '@/components/ProtectedImage';
import { ProtectedVideoPlayer } from '@/components/ProtectedVideoPlayer';
import { WatermarkOverlay } from '@/components/WatermarkOverlay';

interface PropertyImageGalleryProps {
  images: string[];
  videos?: string[];
  title: string;
  propertyId?: string;
  isShortlisted?: boolean;
  onToggleShortlist?: (e: React.MouseEvent) => void;
  shortlistLoading?: boolean;
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({ 
  images, 
  videos = [], 
  title,
  propertyId,
  isShortlisted = false,
  onToggleShortlist,
  shortlistLoading = false
}) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Touch Swipe Gesture State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const minSwipeDistance = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchEndX === null) return;
    const distanceX = touchStartX - touchEndX;
    const currentY = e.changedTouches?.[0]?.clientY ?? touchStartY ?? 0;
    const distanceY = touchStartY !== null ? Math.abs(currentY - touchStartY) : 0;

    // Check if horizontal swipe exceeds minimum distance and is predominantly horizontal
    if (Math.abs(distanceX) > minSwipeDistance && Math.abs(distanceX) > distanceY) {
      if (distanceX > 0) {
        // Swiped Left -> Show Next
        nextMedia();
      } else {
        // Swiped Right -> Show Previous
        prevMedia();
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
    setTouchEndX(null);
  };

  // Combine images and videos into media items
  const getMediaItems = (): MediaItem[] => {
    const mediaItems = combineMediaItems(images, videos);
    
    if (mediaItems.length === 0) {
      const defaultImage = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500';
      return [{ url: defaultImage, type: 'image' }];
    }
    
    return mediaItems;
  };

  const mediaItems = getMediaItems();
  const currentMedia = mediaItems[selectedMediaIndex];

  const nextMedia = () => {
    setSelectedMediaIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevMedia = () => {
    setSelectedMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const openLightbox = (index: number) => {
    setSelectedMediaIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  return (
    <div className="space-y-3 select-none protected-media" onContextMenu={(e) => e.preventDefault()}>
      {/* Main Media Display with Touch Swipe & Protection */}
      <div 
        className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer touch-pan-y shadow-sm"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => e.preventDefault()}
      >
        {currentMedia?.type === 'video' ? (
          // Video Display
          <div className="relative w-full h-full">
            <ProtectedImage
              src={currentMedia.thumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop'}
              alt={`${title} - Video ${selectedMediaIndex + 1}`}
              className="w-full h-full"
              imgClassName="group-hover:scale-105"
              watermarkSize="md"
              onClick={() => openLightbox(selectedMediaIndex)}
            />
            
            {/* Video Play Button Overlay */}
            <div 
              className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer z-20"
              onClick={() => openLightbox(selectedMediaIndex)}
            >
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg">
                <Play className="w-8 h-8 text-gray-800 ml-1 fill-gray-800" />
              </div>
            </div>
            
            {/* Video Type Indicator */}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 z-20">
              <Play className="w-3.5 h-3.5 fill-white" />
              Video
            </div>
          </div>
        ) : (
          // Protected Image Display
          <ProtectedImage
            src={currentMedia?.url}
            alt={`${title} - Main image`}
            className="w-full h-full"
            imgClassName="group-hover:scale-105"
            watermarkSize="md"
            onClick={() => openLightbox(selectedMediaIndex)}
          />
        )}
        
        {/* Navigation Arrows - Always visible on mobile & desktop */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevMedia();
              }}
              className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-gray-800 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 z-20"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextMedia();
              }}
              className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-gray-800 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 z-20"
              aria-label="Next Image"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </>
        )}

        {/* View Full Gallery Button */}
        <button
          onClick={() => openLightbox(selectedMediaIndex)}
          className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
        >
          <Maximize2 className="w-3 h-3" />
          Gallery
        </button>

        {/* Media Counter */}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs z-20">
          {selectedMediaIndex + 1} / {mediaItems.length}
        </div>

        {/* Wishlist Heart Icon */}
        {onToggleShortlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleShortlist(e);
            }}
            disabled={shortlistLoading}
            className="absolute top-2 left-2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg z-20"
          >
            <Heart 
              className={`w-5 h-5 transition-all duration-300 ${
                isShortlisted 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-700'
              }`} 
            />
          </button>
        )}
      </div>

      {/* Compact Thumbnail Strip */}
      {mediaItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {mediaItems.slice(0, 6).map((media, index) => (
            <button
              key={index}
              onClick={() => setSelectedMediaIndex(index)}
              className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                index === selectedMediaIndex 
                  ? 'border-emerald-600 ring-1 ring-emerald-200' 
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="relative w-full h-full">
                <ProtectedImage
                  src={media.type === 'video' ? (media.thumbnail || '') : media.url}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  className="w-full h-full"
                  showWatermark={false}
                />
                {media.type === 'video' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                    <Play className="w-3 h-3 text-white fill-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
          {mediaItems.length > 6 && (
            <button
              onClick={() => openLightbox(0)}
              className="flex-shrink-0 w-16 h-12 rounded-md bg-gray-100 border-2 border-gray-200 hover:border-emerald-300 flex items-center justify-center text-gray-600 text-xs font-semibold"
            >
              +{mediaItems.length - 6}
            </button>
          )}
        </div>
      )}

      {/* Lightbox with Watermark & Protected Player */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 touch-pan-y select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="relative max-w-7xl max-h-full w-full flex items-center justify-center">
            {currentMedia?.type === 'video' ? (
              // Protected Video Lightbox
              <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl">
                <ProtectedVideoPlayer
                  url={currentMedia.url}
                  title={title}
                  thumbnail={currentMedia.thumbnail}
                  autoPlay={true}
                  showWatermark={true}
                />
              </div>
            ) : (
              // Protected Image Lightbox
              <div className="relative max-w-full max-h-[85vh] flex items-center justify-center">
                <ProtectedImage
                  src={currentMedia?.url}
                  alt={`${title} - Full size`}
                  className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                  imgClassName="max-w-full max-h-[85vh] object-contain"
                  watermarkSize="lg"
                />
              </div>
            )}
            
            {/* Close Button */}
            <Button
              onClick={closeLightbox}
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40 z-30"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation in Lightbox */}
            {mediaItems.length > 1 && (
              <>
                <Button
                  onClick={prevMedia}
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40 z-30"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  onClick={nextMedia}
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40 z-30"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Media Counter in Lightbox */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm z-30 border border-white/20">
              {selectedMediaIndex + 1} of {mediaItems.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyImageGallery;
