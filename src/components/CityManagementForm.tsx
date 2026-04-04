import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

interface City {
  id?: string;
  name: string;
  image: string;
  order?: number;
}

interface CityManagementFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingCity?: City | null;
}

const CityManagementForm: React.FC<CityManagementFormProps> = ({
  onClose,
  onSuccess,
  editingCity
}) => {
  const [formData, setFormData] = useState<City>({
    name: '',
    image: '',
    order: 0
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingCity) {
      setFormData({
        name: editingCity.name,
        image: editingCity.image,
        order: editingCity.order || 0
      });
      setImagePreview(editingCity.image);
    }
  }, [editingCity]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert image to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, image: url });
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.image) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (editingCity?.id) {
        // Update existing city
        await updateDoc(doc(db, 'cities', editingCity.id), {
          name: formData.name,
          image: formData.image,
          order: formData.order || 0,
          updatedAt: serverTimestamp()
        });
        
        toast({
          title: 'Success',
          description: 'City updated successfully',
        });
      } else {
        // Add new city
        await addDoc(collection(db, 'cities'), {
          name: formData.name,
          image: formData.image,
          order: formData.order || 0,
          createdAt: serverTimestamp()
        });
        
        toast({
          title: 'Success',
          description: 'City added successfully',
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving city:', error);
      toast({
        title: 'Error',
        description: 'Failed to save city',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {editingCity ? 'Edit City' : 'Add New City'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* City Name */}
          <div className="space-y-2">
            <Label htmlFor="name">City Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter city name (e.g., Kakinada)"
              required
            />
            <p className="text-xs text-gray-500">
              Must match the location field in properties for auto-counting
            </p>
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              placeholder="Enter display order (0 = first)"
            />
            <p className="text-xs text-gray-500">
              Lower numbers appear first
            </p>
          </div>

          {/* Image Upload/URL */}
          <div className="space-y-2">
            <Label>City Image</Label>
            
            <div className="space-y-3">
              {/* Image URL Input */}
              <div>
                <Label htmlFor="imageUrl" className="text-sm text-gray-600">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.image.startsWith('http') ? formData.image : ''}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="text-center text-sm text-gray-500">OR</div>

              {/* File Upload */}
              <div>
                <Label htmlFor="imageFile" className="text-sm text-gray-600">
                  Upload Image
                </Label>
                <div className="mt-1">
                  <label
                    htmlFor="imageFile"
                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Choose Image File</span>
                  </label>
                  <input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Preview</Label>
                  <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingCity ? 'Update City' : 'Add City'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CityManagementForm;
