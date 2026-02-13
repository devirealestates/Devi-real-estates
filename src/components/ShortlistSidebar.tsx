import React, { useState, useEffect } from 'react';
import { X, Heart, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  images: string[];
  area: string;
}

interface ShortlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortlistSidebar: React.FC<ShortlistSidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchShortlistedProperties();
    }
  }, [isOpen, currentUser]);

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

  const fetchShortlistedProperties = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const shortlistQuery = query(
        collection(db, 'users', currentUser.uid, 'shortlisted')
      );
      const shortlistSnapshot = await getDocs(shortlistQuery);
      const propertyIds = shortlistSnapshot.docs.map(doc => doc.id);

      if (propertyIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      // Fetch property details for each ID
      const propertiesRef = collection(db, 'properties');
      const propertiesSnapshot = await getDocs(propertiesRef);
      const allProperties = propertiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Property));

      const shortlisted = allProperties.filter(p => propertyIds.includes(p.id));
      setProperties(shortlisted);
    } catch (error) {
      console.error('Error fetching shortlisted properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'shortlisted', propertyId));
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast({
        title: "Removed",
        description: "Property removed from shortlist",
      });
    } catch (error) {
      console.error('Error removing property:', error);
      toast({
        title: "Error",
        description: "Failed to remove property",
        variant: "destructive",
      });
    }
  };

  const handleViewProperty = (propertyId: string) => {
    onClose();
    navigate(`/property/${propertyId}`);
  };

  const handleViewAll = () => {
    onClose();
    navigate('/shortlist');
  };

  if (!currentUser) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
        />
        
        {/* Sidebar */}
        <div 
          className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                My Shortlist
              </h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Login prompt */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <Heart className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Sign in to view shortlist</h3>
              <p className="text-gray-500 text-center mb-6">Save your favorite properties by signing in</p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
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
              <p className="text-sm text-gray-500">{properties.length} properties saved</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
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
            ) : properties.length > 0 ? (
              <div className="p-4 space-y-3">
                {properties.map((property) => (
                  <div 
                    key={property.id}
                    onClick={() => handleViewProperty(property.id)}
                    className="flex gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group"
                  >
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                      <img 
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=200'}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=200';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
                        {property.title}
                      </h3>
                      <p className="text-orange-600 font-bold text-sm mb-1">{property.price}</p>
                      <p className="text-gray-500 text-xs line-clamp-1">{property.location}</p>
                      {property.area && (
                        <p className="text-gray-400 text-xs">{property.area}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => handleRemove(property.id, e)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove from shortlist"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProperty(property.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                        title="View property"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <Heart className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No properties saved</h3>
                <p className="text-gray-500 text-center mb-6">Start exploring and save your favorite properties!</p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/buy');
                  }}
                  className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  Explore Properties
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {properties.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={handleViewAll}
                className="w-full py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                View All Shortlisted
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShortlistSidebar;
