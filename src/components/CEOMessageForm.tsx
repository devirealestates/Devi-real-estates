import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, User } from 'lucide-react';
import ImageUploader from './ImageUploader';

interface CEOMessage {
  title: string;
  greeting: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  image: string;
  updatedAt?: any;
}

interface CEOMessageFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CEOMessageForm: React.FC<CEOMessageFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CEOMessage>({
    title: "CEO's Words",
    greeting: 'Dear Devi Real Estates Community,',
    paragraph1: 'It is with great pride and dedication that I lead our team at Devi Real Estates.',
    paragraph2: 'Every decision we make, every project we undertake, is guided by our commitment to excellence, innovation, and sustainability. We strive to create spaces that inspire, uplift, and stand the test of time.',
    paragraph3: 'Thank you for entrusting us with your dreams and aspirations.',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentMessage();
  }, []);

  const fetchCurrentMessage = async () => {
    try {
      const docRef = doc(db, 'siteContent', 'ceoMessage');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as CEOMessage;
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching CEO message:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (imageUrls: string[]) => {
    if (imageUrls.length > 0) {
      const imageUrl = imageUrls[0];
      
      if (imageUrl.startsWith('data:')) {
        toast({
          title: "Error",
          description: "Image upload failed. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: imageUrl
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.greeting.trim()) {
      toast({
        title: "Error",
        description: "Title and greeting are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.image && formData.image.startsWith('data:')) {
      toast({
        title: "Error",
        description: "Please wait for image upload to complete.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    const ceoMessageData = {
      ...formData,
      image: formData.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600',
      updatedAt: new Date()
    };

    try {
      const docRef = doc(db, 'siteContent', 'ceoMessage');
      await setDoc(docRef, ceoMessageData);
      
      toast({
        title: "Success",
        description: "CEO message updated successfully",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error saving CEO message:', error);
      
      toast({
        title: "Error",
        description: `Failed to save CEO message: ${error?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg sm:text-xl">
            Edit CEO's Message
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="transition-all duration-300 hover:scale-110"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CEO Photo
              </label>
              <div className="mb-4">
                {formData.image && !formData.image.startsWith('data:') ? (
                  <div className="flex flex-col items-center space-y-2">
                    <img 
                      src={formData.image} 
                      alt="CEO" 
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="transition-all duration-300 hover:scale-105"
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">No image selected</p>
                  </div>
                )}
              </div>
              <ImageUploader
                onImagesUpload={handleImageUpload}
                maxImages={1}
                initialImages={formData.image && !formData.image.startsWith('data:') ? [formData.image] : []}
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Section Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CEO's Words"
              />
            </div>

            <div>
              <label htmlFor="greeting" className="block text-sm font-medium text-gray-700 mb-1">
                Greeting Line *
              </label>
              <input
                type="text"
                id="greeting"
                name="greeting"
                value={formData.greeting}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Dear Devi Real Estates Community,"
              />
            </div>

            <div>
              <label htmlFor="paragraph1" className="block text-sm font-medium text-gray-700 mb-1">
                Paragraph 1
              </label>
              <textarea
                id="paragraph1"
                name="paragraph1"
                value={formData.paragraph1}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="First paragraph"
              />
            </div>

            <div>
              <label htmlFor="paragraph2" className="block text-sm font-medium text-gray-700 mb-1">
                Paragraph 2
              </label>
              <textarea
                id="paragraph2"
                name="paragraph2"
                value={formData.paragraph2}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Second paragraph"
              />
            </div>

            <div>
              <label htmlFor="paragraph3" className="block text-sm font-medium text-gray-700 mb-1">
                Paragraph 3
              </label>
              <textarea
                id="paragraph3"
                name="paragraph3"
                value={formData.paragraph3}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Third paragraph"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 transition-all duration-300 hover:scale-105"
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading || (formData.image && formData.image.startsWith('data:'))}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                {uploading ? 'Saving...' : 'Update CEO Message'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CEOMessageForm;
