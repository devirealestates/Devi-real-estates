
import React from 'react';
import { Bed, Bath, Square, Compass, Home, Building, Calendar, CheckCircle, MapPin } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  fullAddress?: string;
  type: string;
  category: string;
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  areaAcres?: number;
  description: string;
  facing?: string;
  propertyAge?: number;
  status?: string;
}

interface PropertyOverviewProps {
  property: Property;
}

const PropertyOverview: React.FC<PropertyOverviewProps> = ({ property }) => {
  const isLandProperty = property.category === 'Land' || property.type === 'Land' || 
                        property.type === 'Agricultural' || property.type === 'Residential Plot';

  return (
    <div className="font-body">
      <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 font-premium mt-2 sm:mt-0">Property Overview</h2>
      
      {/* Key Metrics - Compact Design */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {!isLandProperty && property.bedrooms && (
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base sm:text-lg font-semibold text-slate-900">{property.bedrooms} Beds</div>
              <div className="text-xs text-slate-500">Type</div>
            </div>
          </div>
        )}
        {!isLandProperty && property.bathrooms && (
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bath className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base sm:text-lg font-semibold text-slate-900">{property.bathrooms} Baths</div>
              <div className="text-xs text-slate-500">House</div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Square className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base sm:text-lg font-semibold text-slate-900">{property.area}</div>
            {property.areaAcres && (
              <div className="text-xs text-slate-500">({property.areaAcres} acres)</div>
            )}
          </div>
        </div>
        {property.status && property.category !== 'Land' && (
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm sm:text-base font-semibold text-emerald-600">{property.status}</div>
            </div>
          </div>
        )}
        {property.facing && (
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base sm:text-lg font-semibold text-slate-900">{property.facing}</div>
              <div className="text-xs text-slate-500">Facing</div>
            </div>
          </div>
        )}
        {property.propertyAge !== undefined && property.propertyAge !== null && (
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base sm:text-lg font-semibold text-slate-900">
                {property.propertyAge === 0 ? 'New' : `${property.propertyAge} ${property.propertyAge === 1 ? 'Year' : 'Years'}`}
              </div>
              <div className="text-xs text-slate-500">Property Age</div>
            </div>
          </div>
        )}
      </div>

      {/* Property Details Section - Boxed Design */}
      <div className="mb-4 sm:mb-6 bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 font-premium">Property Details</h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
              {property.category === 'Land' ? (
                <Building className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              ) : (
                <Home className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 mb-0.5">Category</div>
              <div className="text-sm sm:text-base font-semibold text-slate-900">{property.category}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 mb-0.5">Type</div>
              <div className="text-sm sm:text-base font-semibold text-slate-900">{property.type}</div>
            </div>
          </div>
          {property.fullAddress && (
            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500 mb-0.5">Location</div>
                <div className="text-sm sm:text-base font-semibold text-slate-900">{property.fullAddress}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* About This Property - Boxed with Green Accent */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 font-premium flex items-center gap-2">
          <div className="w-1 h-5 bg-emerald-600 rounded-full"></div>
          About This Property
        </h3>
        <div className="prose text-slate-700 leading-relaxed font-body">
          {property.description.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-2 sm:mb-3 text-slate-600 leading-6 text-sm sm:text-base">{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyOverview;
