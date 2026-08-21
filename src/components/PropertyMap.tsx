
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
 * Extracts a clean, working iframe embed URL from any user input.
 * Supports:
 * - Full HTML iframe snippets: <iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>
 * - Direct Google Maps Embed URLs: https://www.google.com/maps/embed?pb=...
 * - Maps output=embed URLs: https://maps.google.com/maps?q=...&output=embed
 * - Place URLs: https://www.google.com/maps/place/PlaceName/@lat,lng,zoom/...
 * - Search URLs: https://www.google.com/maps/search/?api=1&query=...
 * - Short links (maps.app.goo.gl, goo.gl/maps) -> converts to query embed using place/address
 * - Coordinates: @16.989,82.247 or 16.989,82.247
 * - Plain address / Landmark text
 */
export const getCleanEmbedUrl = (
  rawInput?: string,
  fallbackAddress?: string,
  fallbackLocation?: string,
  fallbackTitle?: string
): string | null => {
  if (!rawInput && !fallbackAddress && !fallbackLocation && !fallbackTitle) return null;
  const trimmed = (rawInput || '').trim();

  // 1. Extract src if admin pasted full <iframe ...> embed code
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    const src = iframeSrcMatch[1];
    if (src.includes('google.com/maps/embed') || (src.includes('maps.google.com') && src.includes('output=embed'))) {
      return src;
    }
    return getCleanEmbedUrl(src, fallbackAddress, fallbackLocation, fallbackTitle);
  }

  // 2. Direct official Google Maps Embed URL (from Google's "Embed a map" feature)
  if (trimmed.includes('google.com/maps/embed') || (trimmed.includes('maps.google.com/maps') && trimmed.includes('output=embed'))) {
    return trimmed;
  }

  // 3. Extract place name or query from Google Maps place URLs
  // Example: https://www.google.com/maps/place/Sasikanth+Nagar,+Kakinada,+Andhra+Pradesh+533003/@16.9891,82.2471,17z/...
  const placeMatch = trimmed.match(/\/maps\/place\/([^/@?]+)/i);
  if (placeMatch && placeMatch[1]) {
    try {
      const decodedPlace = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return `https://maps.google.com/maps?q=${encodeURIComponent(decodedPlace)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    } catch {
      return `https://maps.google.com/maps?q=${encodeURIComponent(placeMatch[1])}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // 4. Extract search query from ?q= or ?query=
  const queryMatch = trimmed.match(/[?&](?:q|query)=([^&]+)/i);
  if (queryMatch && queryMatch[1]) {
    try {
      const decodedQuery = decodeURIComponent(queryMatch[1].replace(/\+/g, ' '));
      return `https://maps.google.com/maps?q=${encodeURIComponent(decodedQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    } catch {
      return `https://maps.google.com/maps?q=${encodeURIComponent(queryMatch[1])}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // 5. Extract coordinates from /@lat,lng or "lat, lng"
  const coordMatch = trimmed.match(/@([0-9.-]+),([0-9.-]+)/i) || trimmed.match(/^([0-9.-]+),\s*([0-9.-]+)$/);
  if (coordMatch && coordMatch[1] && coordMatch[2]) {
    return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // 6. Short links (maps.app.goo.gl or goo.gl/maps)
  // Short links cannot be iframed by browsers due to Google CSP, so embed using the property's address/location/title
  if (trimmed.includes('goo.gl') || trimmed.includes('maps.app.goo.gl')) {
    const searchTarget = fallbackAddress || fallbackLocation || fallbackTitle;
    if (searchTarget) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(searchTarget)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // 7. If it's plain text address / location entered in the field
  if (trimmed && !trimmed.startsWith('http')) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // 8. Fallback to location/address if provided
  const searchTarget = fallbackAddress || fallbackLocation || fallbackTitle;
  if (searchTarget) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(searchTarget)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  return null;
};

/**
 * Extracts a direct clickable URL to open in Google Maps in a new tab
 */
export const getDirectMapUrl = (
  rawInput?: string, 
  fallbackAddress?: string, 
  fallbackLocation?: string, 
  fallbackTitle?: string
): string => {
  if (!rawInput) {
    const target = fallbackAddress || fallbackLocation || fallbackTitle;
    return target 
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`
      : 'https://www.google.com/maps';
  }
  const trimmed = rawInput.trim();
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const url = iframeSrcMatch ? iframeSrcMatch[1] : trimmed;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(url)}`;
};

const PropertyMap: React.FC<PropertyMapProps> = ({ location, title, fullAddress, mapEmbedLink }) => {
  const embedUrl = useMemo(
    () => getCleanEmbedUrl(mapEmbedLink, fullAddress, location, title),
    [mapEmbedLink, fullAddress, location, title]
  );
  const directMapsUrl = useMemo(
    () => getDirectMapUrl(mapEmbedLink, fullAddress, location, title),
    [mapEmbedLink, fullAddress, location, title]
  );

  // If no embed link is provided, do not show any map based on location field
  if (!mapEmbedLink || mapEmbedLink.trim() === '' || !embedUrl) {
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
