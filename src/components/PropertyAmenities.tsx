
import React from 'react';
import { 
  Wifi, 
  Car, 
  Zap, 
  Droplets, 
  Shield, 
  UtensilsCrossed,
  Dumbbell,
  Trees,
  Camera,
  Wind,
  Sofa,
  Building,
  CheckCircle
} from 'lucide-react';

interface PropertyAmenitiesProps {
  amenities: string[];
}

const PropertyAmenities: React.FC<PropertyAmenitiesProps> = ({ amenities }) => {
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return Wifi;
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return Car;
    if (amenityLower.includes('power') || amenityLower.includes('backup') || amenityLower.includes('generator')) return Zap;
    if (amenityLower.includes('water') || amenityLower.includes('supply')) return Droplets;
    if (amenityLower.includes('security') || amenityLower.includes('guard')) return Shield;
    if (amenityLower.includes('kitchen') || amenityLower.includes('meal') || amenityLower.includes('food')) return UtensilsCrossed;
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return Dumbbell;
    if (amenityLower.includes('garden') || amenityLower.includes('park')) return Trees;
    if (amenityLower.includes('cctv') || amenityLower.includes('camera')) return Camera;
    if (amenityLower.includes('ac') || amenityLower.includes('air') || amenityLower.includes('conditioning')) return Wind;
    if (amenityLower.includes('furnished') || amenityLower.includes('furniture')) return Sofa;
    if (amenityLower.includes('lift') || amenityLower.includes('elevator')) return Building;
    
    return CheckCircle;
  };

  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <div className="font-body">
      <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-5 font-premium">Amenities & Features</h2>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {amenities.map((amenity, index) => {
          const IconComponent = getAmenityIcon(amenity);
          
          return (
            <div key={index} className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <span className="text-xs sm:text-sm text-slate-900 font-medium">{amenity}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyAmenities;
