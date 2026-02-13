import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import HeaderRedesign from '@/components/HeaderRedesign';
import FooterRedesign from '@/components/FooterRedesign';
import PropertyImageGallery from '@/components/PropertyImageGallery';
import PropertyOverview from '@/components/PropertyOverview';
import PropertyAmenities from '@/components/PropertyAmenities';
import PropertyMap from '@/components/PropertyMap';
import PropertyContact from '@/components/PropertyContact';
import SuggestedProperties from '@/components/SuggestedProperties';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Calendar, Home, ImageIcon, MapIcon, Phone, CheckCircle } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  fullAddress?: string;
  type: string;
  category: string;
  images: string[];
  videos?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  areaAcres?: number;
  description: string;
  highlights?: string[];
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt?: any;
  facing?: string;
  amenities?: string[];
  propertyAge?: number;
  status?: string;
}

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProperty(id);
    }
  }, [id]);

  // Add scroll to top effect when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchProperty = async (propertyId: string) => {
    try {
      console.log('Fetching property with ID:', propertyId);
      const docRef = doc(db, 'properties', propertyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const propertyData = {
          id: docSnap.id,
          ...docSnap.data()
        } as Property;
        console.log('Property data fetched:', propertyData);
        setProperty(propertyData);
      } else {
        setError('Property not found');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <HeaderRedesign />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="h-[60vh] bg-gray-200 rounded-2xl mb-8"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <FooterRedesign />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-white">
        <HeaderRedesign />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>Property Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The property you are looking for does not exist.'}</p>
            <Button 
              onClick={handleBackClick} 
              className="bg-transparent hover:bg-gray-900 text-gray-900 hover:text-white border-2 border-gray-900 rounded-full px-8 py-6 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
        <FooterRedesign />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderRedesign />
      
      {/* Navigation - Back button */}
      <section className="pt-24 sm:pt-28 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Properties</span>
          </button>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Main Content Area - Image Gallery */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Image Gallery */}
            <div className="rounded-2xl overflow-hidden">
              <PropertyImageGallery 
                images={property.images} 
                videos={property.videos} 
                title={property.title} 
              />
            </div>

            {/* Mobile Property Info */}
            <div className="lg:hidden space-y-4">
              <h1 
                className="text-2xl sm:text-3xl font-semibold text-gray-900"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{property.location}</span>
              </div>
              <p 
                className="text-3xl font-semibold text-emerald-600"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {property.price}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1.5 rounded-full text-sm font-medium border border-gray-200 text-gray-700">
                  {property.type}
                </span>
                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {property.category}
                </span>
              </div>
              {property.propertyAge !== undefined && property.propertyAge !== null && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Property Age: {property.propertyAge === 0 ? 'New Construction' : `${property.propertyAge} ${property.propertyAge === 1 ? 'Year' : 'Years'} Old`}
                </div>
              )}
              {property.status && property.category !== 'Land' && (
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                  Status: {property.status}
                </div>
              )}
              {property.createdAt && (
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Listed on {new Date(property.createdAt.toDate()).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Tabbed Content Sections */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-50 p-1 m-4 mb-0 rounded-xl w-[calc(100%-2rem)]">
                  <TabsTrigger value="overview" className="flex items-center gap-2 rounded-lg font-medium text-sm">
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Overview</span>
                    <span className="sm:hidden">Info</span>
                  </TabsTrigger>
                  <TabsTrigger value="amenities" className="flex items-center gap-2 rounded-lg font-medium text-sm">
                    <ImageIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Amenities</span>
                    <span className="sm:hidden">Features</span>
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2 rounded-lg font-medium text-sm">
                    <MapIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Location</span>
                    <span className="sm:hidden">Map</span>
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="flex items-center gap-2 rounded-lg font-medium text-sm">
                    <Phone className="w-4 h-4" />
                    Contact
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="p-4 sm:p-6 mt-2">
                  <PropertyOverview property={property} />
                </TabsContent>
                
                <TabsContent value="amenities" className="p-4 sm:p-6 mt-2">
                  {property.amenities && property.amenities.length > 0 ? (
                    <PropertyAmenities amenities={property.amenities} />
                  ) : (
                    <div className="text-center py-12">
                      <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No amenities listed for this property.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="map" className="p-0 mt-2">
                  <div className="h-80 lg:h-96">
                    <PropertyMap 
                      location={property.location} 
                      title={property.title} 
                      fullAddress={property.fullAddress}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="p-4 sm:p-6 mt-2">
                  <PropertyContact 
                    contactName={property.contactName}
                    contactPhone={property.contactPhone}
                    contactEmail={property.contactEmail}
                    propertyTitle={property.title}
                    propertyLocation={property.location}
                    propertyFullAddress={property.fullAddress}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-2 space-y-6">
            <div className="sticky top-28 border border-gray-100 rounded-2xl p-6">
              <h1 
                className="text-2xl font-semibold text-gray-900 mb-3"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {property.title}
              </h1>
              <div className="flex items-center text-gray-500 mb-4">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">{property.location}</span>
              </div>
              <p 
                className="text-3xl font-semibold text-emerald-600 mb-6"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {property.price}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-4 py-1.5 rounded-full text-sm font-medium border border-gray-200 text-gray-700">
                  {property.type}
                </span>
                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {property.category}
                </span>
              </div>
              
              <div className="space-y-3 border-t border-gray-100 pt-6">
                {property.propertyAge !== undefined && property.propertyAge !== null && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-3" />
                    Property Age: {property.propertyAge === 0 ? 'New Construction' : `${property.propertyAge} ${property.propertyAge === 1 ? 'Year' : 'Years'} Old`}
                  </div>
                )}
                {property.status && property.category !== 'Land' && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-3 text-emerald-600" />
                    Status: {property.status}
                  </div>
                )}
                {property.createdAt && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-3" />
                    Listed on {new Date(property.createdAt.toDate()).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Properties */}
      <SuggestedProperties 
        currentPropertyId={property.id}
        category={property.category}
        location={property.location}
      />

      <FooterRedesign />
    </div>
  );
};

export default PropertyDetails;
