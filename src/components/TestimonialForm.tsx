import React, { useState } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, User, Quote } from 'lucide-react';
import CircularImageCropper from './CircularImageCropper';

export interface Testimonial {
  id: string;
  name: string;
  designation: string;
  avatar: string;
  quote: string;
  order?: number;
  createdAt?: any;
  updatedAt?: any;
}

interface TestimonialFormProps {
  onClose: () => void;
  onSuccess: () => void;
  testimonial?: Testimonial | null;
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({ onClose, onSuccess, testimonial }) => {
  const [formData, setFormData] = useState({
    name: testimonial?.name || '',
    designation: testimonial?.designation || '',
    quote: testimonial?.quote || '',
    avatar: testimonial?.avatar || '',
    order: testimonial?.order?.toString() || ''
  });
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string>('');
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      avatar: croppedImageUrl
    }));
    setShowCropper(false);
    setTempImage('');
    toast({
      title: "Success",
      description: "Profile picture uploaded successfully",
    });
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.quote.trim()) {
      toast({
        title: "Error",
        description: "Name and Review Message are required",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    const testimonialData = {
      name: formData.name.trim(),
      designation: formData.designation.trim() || 'Client',
      quote: formData.quote.trim(),
      avatar: formData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      order: formData.order ? parseInt(formData.order) : 0,
      updatedAt: new Date()
    };

    try {
      if (testimonial) {
        const docRef = doc(db, 'testimonials', testimonial.id);
        await updateDoc(docRef, testimonialData);
        toast({
          title: "Success",
          description: "Testimonial updated successfully",
        });
      } else {
        const collectionRef = collection(db, 'testimonials');
        await addDoc(collectionRef, {
          ...testimonialData,
          createdAt: new Date()
        });
        toast({
          title: "Success",
          description: "Testimonial added successfully",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving testimonial:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save testimonial",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white shadow-2xl rounded-2xl border border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-orange-500" />
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
              {testimonial ? 'Edit Testimonial' : 'Add Testimonial'}
            </CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="mb-3">
                {formData.avatar ? (
                  <div className="flex flex-col items-center space-y-2">
                    <img 
                      src={formData.avatar} 
                      alt="Avatar Preview" 
                      className="w-20 h-20 object-cover rounded-full ring-4 ring-orange-100 shadow-md"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                      className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove Picture
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center bg-gray-50">
                    <User className="w-8 h-8 text-gray-400 mx-auto mb-1.5" />
                    <p className="text-xs text-gray-500">No profile picture selected</p>
                  </div>
                )}
              </div>
              
              {/* Upload Button */}
              <div className="flex justify-center">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm">
                    <Upload className="w-4 h-4" />
                    <span>{formData.avatar ? 'Change Picture' : 'Upload Profile Picture'}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g. Ravi Kumar"
              />
            </div>

            {/* Designation */}
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                Designation / Role
              </label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g. CEO, Tech Innovations Inc. / Home Buyer"
              />
            </div>

            {/* Review Message */}
            <div>
              <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-1">
                Review Message *
              </label>
              <textarea
                id="quote"
                name="quote"
                value={formData.quote}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none leading-relaxed"
                placeholder="Write the client's review or feedback here..."
              />
            </div>

            {/* Display Order */}
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="text"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                pattern="[0-9]*"
                inputMode="numeric"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g. 1, 2, 3..."
              />
              <p className="text-xs text-gray-400 mt-1">Lower numbers appear first in the carousel</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl"
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md transition-all"
              >
                {uploading ? 'Saving...' : testimonial ? 'Update' : 'Add Testimonial'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Circular Image Cropper */}
      {showCropper && (
        <CircularImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

export default TestimonialForm;
