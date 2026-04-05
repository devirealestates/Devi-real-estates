import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { X, Calendar, Clock, User, Phone, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

const TIME_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '2:00 PM',
  '4:00 PM',
  '6:00 PM'
];

const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.time) {
      toast({
        title: "Error",
        description: "Please select a time slot",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      await addDoc(collection(db, 'visitBookings'), {
        name: formData.name.trim(),
        phone: formData.phone.trim().replace(/\D/g, '').slice(-10), // Store last 10 digits only
        date: formData.date,
        time: formData.time,
        message: formData.message.trim() || '',
        propertyId,
        propertyTitle,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSuccess(true);

      // Reset form after delay
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          date: '',
          time: '',
          message: ''
        });
        setSuccess(false);
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error scheduling visit:', error);
      toast({
        title: "Error",
        description: "Failed to schedule visit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        phone: '',
        date: '',
        time: '',
        message: ''
      });
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Bottom Sheet Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Handle Bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Schedule a Visit</h2>
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{propertyTitle}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Success State */}
          {success ? (
            <div className="px-5 py-12 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Visit Scheduled Successfully!</h3>
              <p className="text-gray-500 mb-4">We'll contact you shortly to confirm your visit.</p>
              <button
                onClick={() => {
                  handleClose();
                  navigate('/my-bookings');
                }}
                className="text-emerald-600 font-medium hover:underline"
              >
                Track your booking status →
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-5">
              {/* Date Picker */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Select Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={today}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Select Time Slot *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleTimeSelect(time)}
                      className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                        formData.time === time
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
                />
              </div>

              {/* Message Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Message (Optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Any specific requirements or questions?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 pb-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-4 font-medium text-base transition-all duration-200 shadow-lg shadow-emerald-200"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Scheduling...
                    </span>
                  ) : (
                    'Confirm Visit'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ScheduleVisitModal;
