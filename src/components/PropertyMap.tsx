
import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyMapProps {
  location: string;
  title: string;
  fullAddress?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ location, title, fullAddress }) => {
  // Use fullAddress if available, otherwise fallback to location
  const addressForMap = fullAddress || location;
  const encodedLocation = encodeURIComponent(`${addressForMap}, India`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  // Using the standard Google Maps embed URL that doesn't require API key
  const embedUrl = `https://www.google.com/maps?q=${encodedLocation}&output=embed`;

  return (
    <div className="font-body">
      {/* Mobile: Clean header with proper spacing */}
      <div className="p-4 sm:p-6 pb-3 block lg:hidden">
        <div className="mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 font-premium">Location & Map</h3>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium break-words">{location}</p>
          </div>
        </div>
      </div>

      {/* Desktop: Full header with icon and title */}
      <div className="p-6 pb-3 hidden lg:block">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 font-premium">Location & Map</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(googleMapsUrl, '_blank')}
            className="flex items-center gap-2 rounded-full border-2 border-emerald-600 text-emerald-600 bg-transparent hover:bg-emerald-50 transition-all duration-200 font-semibold"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Maps
          </Button>
        </div>
        
        <p className="text-slate-600 mb-4 font-medium">{location}</p>
      </div>

      {/* Map Container - Mobile optimized with working Google Maps embed */}
      <div className="px-4 sm:px-0">
        <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 mb-4">
          {/* Working Google Maps Embed - No API Key Required */}
          <div className="aspect-[16/9] sm:aspect-[16/10] relative">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
              title={`Map showing ${title} location`}
            />
          </div>
        </div>
        
        {/* Mobile: Bottom button - Outside map container for full visibility */}
        <div className="lg:hidden px-0 pb-4">
          <Button 
            onClick={() => window.open(googleMapsUrl, '_blank')}
            className="w-full bg-transparent hover:bg-emerald-50 text-emerald-600 border-2 border-emerald-600 rounded-full transition-all duration-200 flex items-center justify-center gap-2 py-3 font-semibold"
          >
            <ExternalLink className="w-4 h-4" />
            View on Google Maps
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;
