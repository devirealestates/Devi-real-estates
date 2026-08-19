import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Plus, Trash2, CheckCircle2, CheckSquare, Square as SquareIcon, Building2 } from 'lucide-react';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';
import AdminMediaPreview from './AdminMediaPreview';
import { defaultBuildingSpecifications, BuildingSpecificationsData } from './BuildingSpecifications';
import PropertyBadge from './PropertyBadge';
import { toast } from 'sonner';
import { triggerNewPropertyNotification, triggerPriceUpdateNotification } from '@/lib/notificationTriggers';

interface AdminPropertyFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  property?: any;
}

const AdminPropertyForm: React.FC<AdminPropertyFormProps> = ({ 
  onClose, 
  onSuccess, 
  property 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    developer: '',
    badge: '',
    price: '',
    priceMayChange: false,
    location: '',
    fullAddress: '',
    mapEmbedLink: '',
    type: '',
    category: '',
    subCategory: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    areaAcres: '',
    plinthArea: '',
    saleableArea: '',
    uds: '',
    description: '',
    plotSize: '',
    landType: '',
    facing: '',
    roadAccess: false,
    legalClearances: false,
    furnishingStatus: '',
    amenities: [] as string[],
    propertyAge: '',
    status: '',
    locationHighlights: [] as string[],
    buildingSpecifications: {} as BuildingSpecificationsData,
  });
  const [enableBuildingSpecs, setEnableBuildingSpecs] = useState(false);
  const [newHighlightInput, setNewHighlightInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Predefined property types for consistency
  const propertyTypes = [
    'Apartment',
    'Villa',
    'Office',
    'House'
  ];

  // Define amenities for building property types
  const propertyAmenities = {
    Apartment: [
      'Car Parking',
      '100% Vastu',
      'Pooja Room',
      'Utility',
      'Lift',
      'Swimming Pool',
      'Covered Parking',
      '24x7 Security',
      'Power Backup',
      'Gym',
      'CCTV Surveillance',
      'Kids Play Area'
    ],
    Villa: [
      'Car Parking',
      '100% Vastu',
      'Pooja Room',
      'Utility',
      'Garden Area',
      'Private Parking',
      'Open Terrace',
      'Swimming Pool',
      '24x7 Security',
      'Power Backup'
    ],
    Office: [
      'Meeting Room',
      'High-Speed Internet',
      'Central AC',
      '24x7 Access',
      'Backup Generator',
      'CCTV Surveillance',
      'Covered Parking'
    ],
    House: [
      'Car Parking',
      '100% Vastu',
      'Pooja Room',
      'Utility',
      'Water Storage',
      'Private Garden',
      'Covered Parking',
      'Security',
      'Backup Power',
      '24x7 Security'
    ]
  };

  // Specific amenities for Land / Plots
  const landAmenities = [
    'Electricity',
    'Water Facility',
    'Wide Roads',
    'Secure Gated Community',
    'Prime Location',
    'Green Pollution Free Environment',
    'Swimming Pool',
    'Security'
  ];

  const furnishingOptions = [
    'Fully Furnished',
    'Semi-Furnished',
    'Unfurnished'
  ];

  // Check if property type supports amenities and furnishing
  const supportsAmenities = ['Apartment', 'Villa', 'Office', 'House'].includes(formData.type);
  const supportsFurnishing = ['Apartment', 'Villa', 'Office', 'House'].includes(formData.type);

  // Populate form data when editing existing property
  useEffect(() => {
    if (property) {
      console.log('Loading property for editing:', property);
      const existingSpecs = property.buildingSpecifications || {};
      const hasSpecs = Object.keys(existingSpecs).length > 0;
      setEnableBuildingSpecs(hasSpecs);

      setFormData({
        title: property.title || '',
        developer: property.developer || '',
        badge: property.badge || '',
        price: property.price || '',
        priceMayChange: property.priceMayChange || false,
        location: property.location || '',
        fullAddress: property.fullAddress || '',
        mapEmbedLink: property.mapEmbedLink || '',
        type: property.type || '',
        category: property.category || '',
        subCategory: property.subCategory || '',
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        area: property.area || '',
        areaAcres: property.areaAcres?.toString() || '',
        plinthArea: property.plinthArea || '',
        saleableArea: property.saleableArea || '',
        uds: property.uds || '',
        description: property.description || '',
        plotSize: property.plotSize || '',
        landType: property.landType || '',
        facing: property.facing || '',
        roadAccess: property.roadAccess || false,
        legalClearances: property.legalClearances || false,
        furnishingStatus: property.furnishingStatus || '',
        amenities: property.amenities || [],
        propertyAge: property.propertyAge?.toString() || '',
        status: property.status || '',
        locationHighlights: property.locationHighlights || [],
        buildingSpecifications: existingSpecs,
      });
      
      // Set existing images - ensure they are valid
      const existingImages = property.images || [];
      const validImages = existingImages.filter(img => 
        img && typeof img === 'string' && !img.startsWith('blob:')
      );
      console.log('Setting existing images:', validImages.length, 'valid images');
      setImages(validImages);

      // Set existing videos - ensure they are valid
      const existingVideos = property.videos || [];
      const validVideos = existingVideos.filter(video => 
        video && typeof video === 'string' && !video.startsWith('blob:')
      );
      console.log('Setting existing videos:', validVideos.length, 'valid videos');
      setVideos(validVideos);
    }
  }, [property]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => {
        let newValue = value;
        
        // Validate Property Age input
        if (name === 'propertyAge') {
          // Allow empty string or valid numbers only
          if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 200)) {
            // Don't update if invalid - show toast for user feedback
            if (value !== '' && (isNaN(Number(value)) || Number(value) < 0)) {
              toast.error('Property age must be a non-negative number');
            } else if (Number(value) > 200) {
              toast.error('Property age cannot exceed 200 years');
            }
            return prev; // Return previous state without update
          }
        }

        // Validate Area Acres input
        if (name === 'areaAcres') {
          // Allow empty string or valid decimal numbers only
          if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 10000)) {
            // Don't update if invalid - show toast for user feedback
            if (value !== '' && (isNaN(Number(value)) || Number(value) < 0)) {
              toast.error('Area in acres must be a non-negative number');
            } else if (Number(value) > 10000) {
              toast.error('Area in acres cannot exceed 10000');
            }
            return prev; // Return previous state without update
          }
        }
        
        const newFormData = { ...prev, [name]: newValue };
        
        // When category is changed to Land, auto-initialize landType and set default type to 'Plots'
        if (name === 'category' && value === 'Land') {
          if (!newFormData.landType) {
            newFormData.landType = 'Plots';
          }
          newFormData.type = 'Plots';
        }

        // Reset subCategory when category changes
        if (name === 'category' && value !== 'PG/Hostels') {
          newFormData.subCategory = '';
        }

        // Reset amenities and furnishing when property type changes
        if (name === 'type') {
          newFormData.amenities = [];
          newFormData.furnishingStatus = '';
        }
        
        return newFormData;
      });
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  // Location Highlights Handlers
  const handleAddHighlight = () => {
    if (newHighlightInput.trim()) {
      setFormData(prev => ({
        ...prev,
        locationHighlights: [...prev.locationHighlights, newHighlightInput.trim()]
      }));
      setNewHighlightInput('');
    }
  };

  const handleAddQuickHighlight = (text: string) => {
    if (!formData.locationHighlights.includes(text)) {
      setFormData(prev => ({
        ...prev,
        locationHighlights: [...prev.locationHighlights, text]
      }));
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      locationHighlights: prev.locationHighlights.filter((_, i) => i !== index)
    }));
  };

  // Building Specifications Handlers
  const handleSpecItemToggle = (category: string, item: string, checked: boolean) => {
    setFormData(prev => {
      const currentCategoryItems = prev.buildingSpecifications[category] || [];
      const updatedCategoryItems = checked
        ? [...currentCategoryItems, item]
        : currentCategoryItems.filter(i => i !== item);

      const newBuildingSpecs = { ...prev.buildingSpecifications };
      if (updatedCategoryItems.length > 0) {
        newBuildingSpecs[category] = updatedCategoryItems;
      } else {
        delete newBuildingSpecs[category];
      }

      return {
        ...prev,
        buildingSpecifications: newBuildingSpecs
      };
    });
  };

  const handleSelectAllSpecs = () => {
    setFormData(prev => ({
      ...prev,
      buildingSpecifications: { ...defaultBuildingSpecifications }
    }));
    setEnableBuildingSpecs(true);
    toast.success('All building specifications selected');
  };

  const handleClearAllSpecs = () => {
    setFormData(prev => ({
      ...prev,
      buildingSpecifications: {}
    }));
    toast.info('Building specifications cleared');
  };

  const handleImageUpload = (uploadedImages: string[]) => {
    console.log('Images updated in form:', uploadedImages.length, 'images');
    setImages(uploadedImages);
  };

  const handleVideoUpload = (uploadedVideos: string[]) => {
    console.log('Videos updated in form:', uploadedVideos.length, 'videos');
    setVideos(uploadedVideos);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    console.log('Image removed at index:', index, 'Remaining images:', updatedImages.length);
  };

  const handleRemoveVideo = (index: number) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    setVideos(updatedVideos);
    console.log('Video removed at index:', index, 'Remaining videos:', updatedVideos.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (images.length === 0) {
        toast.error('Please upload at least one image');
        setLoading(false);
        return;
      }

      // Validate price if priceMayChange is not enabled
      if (!formData.priceMayChange && !formData.price.trim()) {
        toast.error('Please enter a price or check "Prices may change"');
        setLoading(false);
        return;
      }

      // Enhanced validation for Land properties and Apartments
      const isLandCategory = formData.category === 'Land';
      const isPGCategory = formData.category === 'PG/Hostels';
      const isApartment = formData.type === 'Apartment';
      
      if (!isLandCategory && !isApartment && !formData.area.trim()) {
        toast.error('Area (sq.ft) is required');
        setLoading(false);
        return;
      }

      // Validate PG/Hostels subcategory
      if (isPGCategory && !formData.subCategory) {
        toast.error('Please select a subcategory for PG/Hostels');
        setLoading(false);
        return;
      }

      // Validate Status for non-Land properties
      if (!isLandCategory && !formData.status) {
        toast.error('Please select a status for this property');
        setLoading(false);
        return;
      }

      // Filter out any blob URLs before saving
      const validImages = images.filter(img => 
        img && typeof img === 'string' && !img.startsWith('blob:')
      );

      const validVideos = videos.filter(video => 
        video && typeof video === 'string' && !video.startsWith('blob:')
      );

      if (validImages.length === 0) {
        toast.error('No valid images to save. Please upload images again.');
        setLoading(false);
        return;
      }

      // Determine area fallback for Land and Apartment properties
      let computedArea = formData.area;
      if (isLandCategory) {
        computedArea = formData.area.trim() || formData.plotSize.trim() || (formData.areaAcres ? `${formData.areaAcres} Acres` : 'Plots');
      } else if (isApartment && !formData.area.trim()) {
        computedArea = formData.saleableArea.trim() || formData.plinthArea.trim() || (formData.uds ? `${formData.uds} sq.yds UDS` : '');
      }

      // Format price fallback if priceMayChange is enabled and price field is empty
      const computedPrice = formData.priceMayChange && !formData.price.trim() 
        ? 'Price on Request' 
        : formData.price.trim();

      const propertyData = {
        ...formData,
        price: computedPrice,
        priceMayChange: formData.priceMayChange,
        area: computedArea,
        type: isLandCategory ? (formData.landType || 'Plots') : formData.type,
        images: validImages,
        videos: validVideos.length > 0 ? validVideos : undefined,
        bedrooms: (!isLandCategory && formData.bedrooms) ? parseInt(formData.bedrooms) : undefined,
        bathrooms: (!isLandCategory && formData.bathrooms) ? parseInt(formData.bathrooms) : undefined,
        propertyAge: formData.propertyAge ? parseInt(formData.propertyAge) : undefined,
        areaAcres: formData.areaAcres ? parseFloat(formData.areaAcres) : undefined,
        status: (!isLandCategory && formData.status) ? formData.status : undefined,
        developer: formData.developer ? formData.developer.trim() : undefined,
        badge: formData.badge ? formData.badge.trim() : undefined,
        plinthArea: (!isLandCategory && formData.plinthArea) ? formData.plinthArea.trim() : undefined,
        saleableArea: (!isLandCategory && formData.saleableArea) ? formData.saleableArea.trim() : undefined,
        uds: (!isLandCategory && formData.uds) ? formData.uds.trim() : undefined,
        locationHighlights: formData.locationHighlights && formData.locationHighlights.length > 0 ? formData.locationHighlights : undefined,
        buildingSpecifications: (enableBuildingSpecs && Object.keys(formData.buildingSpecifications).length > 0) ? formData.buildingSpecifications : undefined,
        featured: property?.featured || false,
        createdAt: property?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      // Remove undefined/empty fields for cleaner data
      Object.keys(propertyData).forEach(key => {
        if (propertyData[key] === undefined || propertyData[key] === '') {
          delete propertyData[key];
        }
      });

      console.log('Final property data being submitted:', {
        ...propertyData,
        images: `${validImages.length} valid images`
      });

      if (property?.id) {
        // Update existing property
        const oldPrice = property.price;
        await updateDoc(doc(db, 'properties', property.id), propertyData);
        toast.success('Property updated successfully!');

        // Check if price changed
        if (oldPrice && computedPrice && oldPrice !== computedPrice) {
          triggerPriceUpdateNotification({
            id: property.id,
            title: formData.title,
            newPrice: computedPrice,
            location: formData.location,
          }).catch((err) => console.warn('Notification trigger error:', err));
        }
      } else {
        // Add new property
        const docRef = await addDoc(collection(db, 'properties'), propertyData);
        console.log('Property successfully saved with ID:', docRef.id);
        toast.success('Property added successfully!');

        // Trigger real device push notification for new property
        triggerNewPropertyNotification({
          id: docRef.id,
          title: formData.title,
          price: computedPrice,
          location: formData.location,
          category: formData.category,
        }).catch((err) => console.warn('Notification trigger error:', err));
      }
      
      // Call success callback and close form
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      
    } catch (error: any) {
      console.error('Error saving property:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to save property. Please try again.';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your authentication.';
      } else if (error.code === 'invalid-argument') {
        errorMessage = 'Invalid data provided. Please check all fields.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isLandCategory = formData.category === 'Land';
  const isPGCategory = formData.category === 'PG/Hostels';

  // PG/Hostels subcategory options
  const pgSubCategories = ['For Boys', 'For Girls', 'Co-Living'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {property ? 'Edit Property' : 'Add New Property'}
          </h2>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Property Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Property Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter property title"
                  className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                />
              </div>

              <div>
                <Label htmlFor="developer">Developer / Builder (Optional)</Label>
                <Input
                  id="developer"
                  name="developer"
                  value={formData.developer}
                  onChange={handleInputChange}
                  placeholder="e.g., Devi Builders & Developers"
                  className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                />
              </div>

              {/* Property Badge / Highlight Tag (Optional) */}
              <div className="md:col-span-2 bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="badge" className="text-xs sm:text-sm font-semibold text-slate-800">
                    Property Badge / Tag (Optional)
                  </Label>
                  {formData.badge && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Live Preview:</span>
                      <PropertyBadge badge={formData.badge} size="xs" />
                    </div>
                  )}
                </div>
                <Input
                  id="badge"
                  name="badge"
                  value={formData.badge}
                  onChange={handleInputChange}
                  placeholder="e.g., Newly Constructed, Ready to Move, Under Construction, Hot Deal"
                  className="bg-white mb-2"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-xs text-gray-500 font-medium mr-1">Suggestions:</span>
                  {[
                    'Newly Constructed',
                    'Under Construction',
                    'Ready to Move',
                    'Hot Deal',
                    'Prime Location',
                    'Price Negotiable',
                    '100% Vastu',
                    'Corner Plot',
                    'Immediate Possession',
                    'Gated Community',
                    'Luxury Villa'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, badge: suggestion }))}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                        formData.badge === suggestion
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-semibold'
                          : 'bg-white text-slate-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                  {formData.badge && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, badge: '' }))}
                      className="text-[11px] px-2 py-1 text-red-500 hover:text-red-700 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="price">
                    Price {formData.priceMayChange && <span className="text-xs text-gray-500 font-normal">(Optional)</span>}
                  </Label>
                </div>
                <Input
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required={!formData.priceMayChange}
                  placeholder={formData.priceMayChange ? "₹ Enter price (Optional)" : "₹ Enter price"}
                  className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                />
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="priceMayChange"
                    name="priceMayChange"
                    checked={formData.priceMayChange}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                  <Label htmlFor="priceMayChange" className="text-xs sm:text-sm font-normal text-gray-700 cursor-pointer select-none">
                    Prices may change (Prices vary day by day / Price optional)
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter location"
                  className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                />
              </div>

              <div>
                <Label htmlFor="fullAddress">Full Address</Label>
                <Input
                  id="fullAddress"
                  name="fullAddress"
                  value={formData.fullAddress}
                  onChange={handleInputChange}
                  placeholder="Enter complete address with landmarks"
                  className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                />
              </div>

              <div>
                <Label htmlFor="mapEmbedLink">Google Maps Embed Link (Optional)</Label>
                <Input
                  id="mapEmbedLink"
                  name="mapEmbedLink"
                  value={formData.mapEmbedLink}
                  onChange={handleInputChange}
                  placeholder="Paste Google Maps embed code (<iframe...>) or embed link"
                  className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Google Maps → Share → Embed a map → Copy HTML (or link). Map will only appear on the website if this is filled.
                </p>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                >
                  <option value="">Select Category</option>
                  <option value="For Sale">For Sale</option>
                  <option value="For Rent">For Rent</option>
                  <option value="Commercial">Commercial</option>
                  <option value="PG/Hostels">PG/Hostels</option>
                  <option value="Land">Land</option>
                </select>
              </div>

              {/* PG/Hostels Subcategory Selection */}
              {isPGCategory && (
                <div>
                  <Label htmlFor="subCategory">PG/Hostels Type</Label>
                  <select
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                  >
                    <option value="">Select Type</option>
                    {pgSubCategories.map((subCat) => (
                      <option key={subCat} value={subCat}>
                        {subCat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label htmlFor="type" className={isLandCategory ? "text-gray-400" : ""}>
                  Property Type {isLandCategory ? '(Specified in Land Details below)' : ''}
                </Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required={!isLandCategory}
                  disabled={isLandCategory}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md ${
                    isLandCategory ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select Property Type</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Area Section */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Area</h3>
                <div className={`grid grid-cols-1 ${!isLandCategory ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                  {!isLandCategory && (
                    <div>
                      <Label htmlFor="area">
                        Area (sq.ft) {formData.type === 'Apartment' ? '(Optional)' : <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id="area"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        required={!isLandCategory && formData.type !== 'Apartment'}
                        placeholder="e.g., 2500 sq ft"
                        className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                      />
                    </div>
                  )}
                  {!isLandCategory && (
                    <div>
                      <Label htmlFor="plinthArea">Plinth Area (sq.ft) - Optional</Label>
                      <Input
                        id="plinthArea"
                        name="plinthArea"
                        value={formData.plinthArea}
                        onChange={handleInputChange}
                        placeholder="e.g., 1420 sq ft"
                        className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Built-up / Plinth area in sq.ft
                      </p>
                    </div>
                  )}
                  {!isLandCategory && (
                    <div>
                      <Label htmlFor="saleableArea">Saleable Area (sq.ft) - Optional</Label>
                      <Input
                        id="saleableArea"
                        name="saleableArea"
                        value={formData.saleableArea}
                        onChange={handleInputChange}
                        placeholder="e.g., 1950 sq ft"
                        className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Super built-up / Saleable area in sq.ft
                      </p>
                    </div>
                  )}
                  {!isLandCategory && (
                    <div>
                      <Label htmlFor="uds">UDS (sq.yds) - Optional</Label>
                      <Input
                        id="uds"
                        name="uds"
                        value={formData.uds}
                        onChange={handleInputChange}
                        placeholder="e.g., 45 sq.yds"
                        className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Undivided Share of Land in sq.yds (for Apartments)
                      </p>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="areaAcres">Area (acres) - Optional</Label>
                    <Input
                      id="areaAcres"
                      name="areaAcres"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10000"
                      value={formData.areaAcres}
                      onChange={handleInputChange}
                      placeholder="e.g., 1.5 acres"
                      className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: Enter area in acres (decimal values allowed)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="propertyAge">Property Age (in years)</Label>
                <Input
                  id="propertyAge"
                  name="propertyAge"
                  type="number"
                  min="0"
                  max="200"
                  value={formData.propertyAge}
                  onChange={handleInputChange}
                  placeholder="Enter age in years (0 for new construction)"
                  className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty if age is not specified. Enter 0 for new construction.
                </p>
              </div>

              {/* Property Status - Required for all except Land */}
              {!isLandCategory && (
                <div>
                  <Label htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required={!isLandCategory}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                    title="Select current construction status of the property"
                  >
                    <option value="">Select Status</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Ready to Move">Ready to Move</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select the current construction status of the property
                  </p>
                </div>
              )}
            </div>

            {/* Dynamic Amenities Section for Building Properties */}
            {supportsAmenities && formData.type && propertyAmenities[formData.type as keyof typeof propertyAmenities] && !isLandCategory && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {propertyAmenities[formData.type as keyof typeof propertyAmenities].map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        checked={formData.amenities.includes(amenity)}
                        onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                      <Label 
                        htmlFor={`amenity-${amenity}`}
                        className="text-sm font-medium leading-none cursor-pointer text-gray-800 select-none"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Land Amenities Section */}
            {isLandCategory && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Land Amenities & Features
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {landAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`land-amenity-${amenity}`}
                        checked={formData.amenities.includes(amenity)}
                        onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                      <Label 
                        htmlFor={`land-amenity-${amenity}`}
                        className="text-sm font-medium leading-none cursor-pointer text-gray-800 select-none"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Furnishing Status Section - Disabled for Land */}
            {supportsFurnishing && formData.type && !isLandCategory && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Furnishing Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {furnishingOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`furnishing-${option}`}
                        name="furnishingStatus"
                        value={option}
                        checked={formData.furnishingStatus === option}
                        onChange={handleInputChange}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                      <Label 
                        htmlFor={`furnishing-${option}`}
                        className="text-sm font-medium leading-none cursor-pointer text-gray-800 select-none"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conditional Fields for Land */}
            {isLandCategory && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Land-Specific Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="plotSize">Plot Size</Label>
                    <Input
                      id="plotSize"
                      name="plotSize"
                      value={formData.plotSize}
                      onChange={handleInputChange}
                      placeholder="e.g., 2400 sq ft or 200 sq yards"
                    />
                  </div>

                  <div>
                    <Label htmlFor="landType">Land Type</Label>
                    <select
                      id="landType"
                      name="landType"
                      value={formData.landType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Land Type</option>
                      <option value="Plots">Plots</option>
                      <option value="Residential Plot">Residential Plot</option>
                      <option value="Agricultural">Agricultural</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="facing">Land Facing (Optional)</Label>
                    <select
                      id="facing"
                      name="facing"
                      value={formData.facing}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Facing (Optional)</option>
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                      <option value="North-East">North-East</option>
                      <option value="North-West">North-West</option>
                      <option value="South-East">South-East</option>
                      <option value="South-West">South-West</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="roadAccess"
                        name="roadAccess"
                        checked={formData.roadAccess}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <Label htmlFor="roadAccess" className="cursor-pointer select-none">Road Access</Label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="legalClearances"
                        name="legalClearances"
                        checked={formData.legalClearances}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <Label htmlFor="legalClearances" className="cursor-pointer select-none">Legal Clearances</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conditional Fields for Non-Land Properties */}
            {!isLandCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    placeholder="Number of bedrooms"
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    placeholder="Number of bathrooms"
                  />
                </div>
              </div>
            )}

            {/* Location Highlights Section - Optional */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Location Highlights (Optional)</h3>
                  <p className="text-xs text-gray-500">
                    Add nearby landmarks, connectivity, and distances (e.g. "2 km to D-Mart")
                  </p>
                </div>
              </div>

              {/* Input row */}
              <div className="flex gap-2 mb-3">
                <Input
                  value={newHighlightInput}
                  onChange={(e) => setNewHighlightInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHighlight();
                    }
                  }}
                  placeholder="e.g., 2 km to D-Mart, 4 km to Railway Station"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddHighlight}
                  disabled={!newHighlightInput.trim()}
                  className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              {/* Quick suggestions */}
              <div className="mb-4">
                <span className="text-xs text-gray-500 mr-2 font-medium">Quick Suggestions:</span>
                <div className="inline-flex flex-wrap gap-1.5 mt-1">
                  {[
                    '2 km to D-Mart',
                    '4 km to RTC Complex',
                    '4 km to Railway Station',
                    '3.5 km to Bhanugudi',
                    '1 km to Main Road',
                    '1.5 km to Hospital',
                    '500m to Supermarket',
                    '2 km to International School'
                  ].map((quickText) => (
                    <button
                      key={quickText}
                      type="button"
                      onClick={() => handleAddQuickHighlight(quickText)}
                      className="text-[11px] px-2 py-0.5 bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800 rounded-md border border-gray-200 transition-colors"
                    >
                      + {quickText}
                    </button>
                  ))}
                </div>
              </div>

              {/* Added Highlights Chips List */}
              {formData.locationHighlights.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {formData.locationHighlights.map((hl, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-xs text-slate-800 shadow-2xs"
                    >
                      <span className="font-medium">{hl}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(index)}
                        className="text-red-500 hover:text-red-700 p-0.5 rounded-full hover:bg-red-50"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No location highlights added yet.</p>
              )}
            </div>

            {/* Building Specifications Section - Checkmark List for Apartments/Buildings */}
            {!isLandCategory && (
              <div className="border-t pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="enableBuildingSpecs"
                        checked={enableBuildingSpecs}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEnableBuildingSpecs(checked);
                          if (checked && Object.keys(formData.buildingSpecifications).length === 0) {
                            handleSelectAllSpecs();
                          }
                        }}
                        className="h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <Label htmlFor="enableBuildingSpecs" className="text-lg font-semibold text-gray-900 cursor-pointer select-none">
                        Building Specifications (Optional)
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 ml-6">
                      Structure, Doors, Windows, Flooring, Kitchen, Painting, Toilets, Electrical, Generator, Lift, Parking
                    </p>
                  </div>

                  {enableBuildingSpecs && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllSpecs}
                        className="text-xs h-7 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearAllSpecs}
                        className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>

                {enableBuildingSpecs && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {Object.entries(defaultBuildingSpecifications).map(([category, defaultItems]) => {
                      const selectedItems = formData.buildingSpecifications[category] || [];
                      const isCategoryAllSelected = defaultItems.every(item => selectedItems.includes(item));

                      return (
                        <div key={category} className="bg-white rounded-lg p-3.5 border border-gray-200 shadow-2xs">
                          {/* Category Header with Toggle */}
                          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-gray-100">
                            <h4 className="text-sm font-bold text-slate-800 font-premium flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-emerald-600" />
                              {category}
                            </h4>
                            <button
                              type="button"
                              onClick={() => {
                                if (isCategoryAllSelected) {
                                  // Deselect category
                                  setFormData(prev => {
                                    const newSpecs = { ...prev.buildingSpecifications };
                                    delete newSpecs[category];
                                    return { ...prev, buildingSpecifications: newSpecs };
                                  });
                                } else {
                                  // Select all for category
                                  setFormData(prev => ({
                                    ...prev,
                                    buildingSpecifications: {
                                      ...prev.buildingSpecifications,
                                      [category]: [...defaultItems]
                                    }
                                  }));
                                }
                              }}
                              className="text-[11px] text-emerald-600 hover:text-emerald-800 font-medium"
                            >
                              {isCategoryAllSelected ? 'Deselect Category' : 'Select Category'}
                            </button>
                          </div>

                          {/* Items checklist */}
                          <div className="space-y-2">
                            {defaultItems.map((item) => {
                              const isChecked = selectedItems.includes(item);
                              return (
                                <label
                                  key={item}
                                  className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900 select-none"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => handleSpecItemToggle(category, item, e.target.checked)}
                                    className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                  <span className={isChecked ? 'text-slate-900 font-medium' : 'text-slate-500'}>
                                    {item}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Enter property description"
                className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
              />
            </div>

            {/* Image Upload with initial images and deletion */}
            <div>
              <Label>Property Images</Label>
              <ImageUploader 
                onImagesUpload={handleImageUpload} 
                initialImages={images}
                maxImages={10}
              />
            </div>

            {/* Video Upload - Optional */}
            <div>
              <Label>Property Videos (Optional)</Label>
              <p className="text-sm text-gray-600 mb-3">
                Add videos to showcase your property. You can upload video files or paste YouTube/Vimeo links.
              </p>
              <VideoUploader 
                onVideosUpload={handleVideoUpload} 
                initialVideos={videos}
                maxVideos={5}
              />
            </div>

            {/* Media Preview - Shows all uploaded media after saving */}
            {(images.length > 0 || videos.length > 0) && (
              <AdminMediaPreview
                images={images}
                videos={videos}
                onRemoveImage={handleRemoveImage}
                onRemoveVideo={handleRemoveVideo}
                className="border-t pt-6"
              />
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              {onClose && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md hover:border-gray-400"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading || images.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (property ? 'Update Property' : 'Add Property')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyForm;
