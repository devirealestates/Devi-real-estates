import React, { useEffect } from 'react';
import { X, Heart, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShortlist } from '@/hooks/useShortlist';
import { useRealtimeProperties } from '@/hooks/useRealtimeProperties';
import { formatPriceWithSlash } from '@/lib/utils';

interface ShortlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortlistSidebar: React.FC<ShortlistSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { shortlistedIds, toggleShortlist } = useShortlist();
  const { properties: allProperties, loading } = useRealtimeProperties();

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Match all properties that are currently shortlisted
  const shortlistedProperties = allProperties.filter(p => shortlistedIds.includes(p.id));

  const handleRemove = async (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleShortlist(propertyId);
  };

  const handleViewProperty = (propertyId: string) => {
    onClose();
    navigate(`/property/${propertyId}`);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                My Shortlist
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {shortlistedProperties.length} {shortlistedProperties.length === 1 ? 'property' : 'properties'} saved
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content List */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {loading && shortlistedProperties.length === 0 ? (
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                      <div className="h-3 bg-gray-200 rounded mb-1 w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : shortlistedProperties.length > 0 ? (
              <div className="p-4 space-y-3">
                {shortlistedProperties.map((property) => (
                  <div 
                    key={property.id}
                    onClick={() => handleViewProperty(property.id)}
                    className="flex gap-4 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100/90 border border-gray-200/60 cursor-pointer transition-all group"
                  >
                    <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 shadow-2xs">
                      <img 
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=200'}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=200';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-0.5">
                        {property.title}
                      </h3>
                      <p className="text-emerald-600 font-bold text-sm mb-0.5 font-display">
                        {formatPriceWithSlash(property.price)}
                      </p>
                      <p className="text-gray-500 text-xs line-clamp-1">{property.location}</p>
                      {property.area && (
                        <p className="text-gray-400 text-[11px] mt-0.5">{property.area}</p>
                      )}
                    </div>
                    <div className="flex flex-col justify-between items-end flex-shrink-0">
                      <button
                        onClick={(e) => handleRemove(property.id, e)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove from shortlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] font-semibold text-emerald-600 group-hover:underline flex items-center gap-0.5">
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 font-display">No properties saved</h3>
                <p className="text-gray-500 text-xs max-w-xs mb-6 leading-relaxed">
                  Click the heart icon on any property card to save it here for quick access!
                </p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/buy');
                  }}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Explore Properties
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {shortlistedProperties.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  onClose();
                  navigate('/buy');
                }}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors text-xs font-display shadow-sm"
              >
                Explore More Properties
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShortlistSidebar;
