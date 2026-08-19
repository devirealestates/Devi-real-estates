import React from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface LocationHighlightsProps {
  highlights?: string[];
  className?: string;
}

export const LocationHighlights: React.FC<LocationHighlightsProps> = ({ 
  highlights = [],
  className = ''
}) => {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  // Filter out any empty strings
  const validHighlights = highlights.filter(h => h && h.trim() !== '');

  if (validHighlights.length === 0) {
    return null;
  }

  return (
    <div className={`font-body bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-premium">
            Location Highlights
          </h3>
          <p className="text-xs text-slate-500">Key distances and nearby landmark connectivity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {validHighlights.map((highlight, index) => {
          // Parse distance if present (e.g. "2 km to D-Mart" -> distance: "2 km", destination: "D-Mart")
          const match = highlight.match(/^([\d.]+\s*(?:km|kms|meters|m|min|mins|minutes)?(?:\s+to)?)\s+(.+)$/i);
          const distancePart = match ? match[1].replace(/\s+to$/i, '').trim() : null;
          const destinationPart = match ? match[2].trim() : highlight;

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-slate-50/80 hover:bg-emerald-50/50 rounded-xl border border-slate-200/70 hover:border-emerald-200 transition-all duration-200"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-2xs flex-shrink-0 border border-slate-100">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                  {destinationPart}
                </span>
              </div>

              {distancePart ? (
                <span className="flex-shrink-0 text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  {distancePart}
                </span>
              ) : (
                <Navigation className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LocationHighlights;
