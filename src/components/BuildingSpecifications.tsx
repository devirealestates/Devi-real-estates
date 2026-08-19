import React from 'react';
import { 
  Building2, 
  DoorClosed, 
  AppWindow, 
  Grid, 
  Utensils, 
  Paintbrush, 
  Bath, 
  Zap, 
  Power, 
  Building, 
  Car, 
  CheckCircle2,
  FileText
} from 'lucide-react';

export interface BuildingSpecificationsData {
  [category: string]: string[];
}

interface BuildingSpecificationsProps {
  specifications?: BuildingSpecificationsData;
}

export const defaultBuildingSpecifications: BuildingSpecificationsData = {
  Structure: [
    'R.C.C. framed structure',
    'Red-brick external and internal walls'
  ],
  Doors: [
    'Teak wood main-door frame and door',
    'Granite stone door frames',
    'French door with clear glass'
  ],
  Windows: [
    'UPVC windows',
    'Plain glass',
    'Mosquito mesh shutters',
    'M.S. safety grills'
  ],
  Flooring: [
    'Premium vitrified tiles',
    '600mm × 1200mm',
    'Anti-skid tiles for balconies and utility area'
  ],
  Kitchen: [
    'Polished granite platform',
    'Sink',
    '2-ft glazed tile dado',
    'Provision for chimney',
    'Water purifier',
    'Wet grinder'
  ],
  Painting: [
    'Interior: 2 coats of emulsion paint',
    'Exterior: weatherproof emulsion paint'
  ],
  Toilets: [
    'Waterproofing treatment',
    'Anti-skid flooring',
    'Glazed tile dado',
    'UPVC ventilators',
    'CP fittings and sanitary ware'
  ],
  Electrical: [
    'Concealed conduit',
    'Light/fan/plug points',
    'TV, telephone and A/C points',
    'Geyser, refrigerator and washing-machine points',
    'Modular switches',
    'ELCB and MCB'
  ],
  Generator: [
    'Common-area lighting',
    'Motor and lift',
    'Five light points for each flat'
  ],
  Lift: [
    '6-passenger capacity',
    '408 kg capacity'
  ],
  Parking: [
    'Spacious parking area',
    'Anti-skid parking floor tiles'
  ]
};

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('structure')) return Building2;
  if (cat.includes('door')) return DoorClosed;
  if (cat.includes('window')) return AppWindow;
  if (cat.includes('floor')) return Grid;
  if (cat.includes('kitchen')) return Utensils;
  if (cat.includes('paint')) return Paintbrush;
  if (cat.includes('toilet') || cat.includes('bath')) return Bath;
  if (cat.includes('electric')) return Zap;
  if (cat.includes('generator') || cat.includes('power')) return Power;
  if (cat.includes('lift') || cat.includes('elevator')) return Building;
  if (cat.includes('park')) return Car;
  return FileText;
};

export const BuildingSpecifications: React.FC<BuildingSpecificationsProps> = ({ specifications }) => {
  const specs = specifications && Object.keys(specifications).length > 0
    ? specifications
    : null;

  if (!specs) return null;

  // Filter categories with at least one item
  const validCategories = Object.entries(specs).filter(([_, items]) => Array.isArray(items) && items.length > 0);

  if (validCategories.length === 0) return null;

  return (
    <div className="font-body space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-premium flex items-center gap-2">
            <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
            Building Specifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Detailed material, structural, and architectural specifications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {validCategories.map(([category, items]) => {
          const IconComponent = getCategoryIcon(category);

          return (
            <div 
              key={category} 
              className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-3.5 pb-2.5 border-b border-gray-100">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 font-premium">
                  {category}
                </h3>
              </div>

              {/* Specification Items with Checkmarks */}
              <ul className="space-y-2.5">
                {items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BuildingSpecifications;
