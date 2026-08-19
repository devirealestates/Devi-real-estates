
import React, { useMemo } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyMapProps {
  location?: string;
  title?: string;
  fullAddress?: string;
  mapEmbedLink?: string;
}

/**
 * Extracts a clean iframe embed URL from user input.
 * Supports:
 * - Full HTML iframe snippets: <iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>
 * - Direct Google Maps Embed URLs: https://www.google.com/maps/embed?pb=...
 * - Maps output=embed URLs: https://maps.google.com/maps?q=...&output=embed
 * - Standard Google Maps URLs: https://www.google.com/maps/place/... or https://maps.app.goo.gl/...
 */
export const getCleanEmbedUrl = (rawInput?: string): string | null => {
  if (!rawInput) return null;
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  // 1. Extract src if admin pasted full <iframe ...> embed code
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    return iframeSrcMatch[1];
  }

  // 2. Direct embed URL (contains /embed or output=embed)
  if (trimmed.includes('/maps/embed') || trimmed.includes('output=embed')) {
    return trimmed;
  }

  // 3. Regular Google Maps URL
  if (trimmed.includes('google.com/maps') || trimmed.includes('maps.google.com')) {
    if (trimmed.includes('?')) {
      return `${trimmed}&output=embed`;
    }
    return `${trimmed}?output=embed`;
  }

  // 4. If it starts with http/https, return it as the embed source
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return null;
};

/**
 * Extracts a direct clickable URL to open in Google Maps in a new tab
 */
export const getDirectMapUrl = (rawInput?: string, fallbackLocation?: string): string => {
  if (!rawInput) {
    return fallbackLocation 
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackLocation)}`
      : 'https://www.google.com/maps';
  }
  const trimmed = rawInput.trim();
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const url = iframeSrcMatch ? iframeSrcMatch[1] : trimmed;
  return url.startsWith('http') ? url : `https://${url}`;
};

const PropertyMap: React.FC<PropertyMapProps> = ({ location, title, fullAddress, mapEmbedLink }) => {
  const embedUrl = useMemo(() => getCleanEmbedUrl(mapEmbedLink), [mapEmbedLink]);
  const directMapsUrl = useMemo(() => getDirectMapUrl(mapEmbedLink, fullAddress || location), [mapEmbedLink, fullAddress, location]);

  // If no embed link is provided, do not show any map based on location field
  if (!embedUrl) {
    return null;
  }

  return (
    <div className="font-body">
      {/* Mobile: Clean header with proper spacing */}
      <div className="p-4 sm:p-6 pb-3 block lg:hidden">
        <div className="mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 font-premium">Location & Map</h3>
          {(fullAddress || location) && (
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-medium break-words">{fullAddress || location}</p>
            </div>
          )}
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
            onClick={() => window.open(directMapsUrl, '_blank')}
            className="flex items-center gap-2 rounded-full border-2 border-emerald-600 text-emerald-600 bg-transparent hover:bg-emerald-50 transition-all duration-200 font-semibold"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Maps
          </Button>
        </div>
        
        {(fullAddress || location) && (
          <p className="text-slate-600 mb-4 font-medium">{fullAddress || location}</p>
        )}
      </div>

      {/* Map Container with verified Google Maps embed */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 mb-4 shadow-sm">
          <div className="aspect-[16/9] sm:aspect-[16/10] relative min-h-[300px]">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
              title={title ? `Map showing ${title} location` : 'Property Location Map'}
            />
          </div>
        </div>
        
        {/* Mobile: Bottom button */}
        <div className="lg:hidden px-0 pb-2">
          <Button 
            onClick={() => window.open(directMapsUrl, '_blank')}
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
