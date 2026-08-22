import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { triggerSiteVisitNotification } from '@/lib/notificationTriggers';
import { useSlotAvailability, TIME_SLOTS } from '@/hooks/useSlotAvailability';

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

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
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Auto pre-populate phone if user previously booked
  useEffect(() => {
    if (isOpen) {
      const storedPhone = localStorage.getItem('devi_last_booking_phone');
      if (storedPhone && !formData.phone) {
        setFormData(prev => ({ ...prev, phone: storedPhone }));
      }
    }
  }, [isOpen]);

  // Lock background body scroll when modal is open to prevent scroll bleed
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isOpen]);

  // Real-time slot availability hook for this property and selected date
  const {
    slotStatuses,
    availableSlotsCount,
    totalSlotsCount,
    isFullyBooked,
    getAlternativeSlots,
    validateSlotBeforeBooking,
    loading: availabilityLoading
  } = useSlotAvailability(propertyId, formData.date, formData.phone);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear conflict warning if date or time changes
    if (name === 'date') {
      setConflictWarning(null);
      setFormData(prev => ({ ...prev, date: value, time: '' }));
    }
  };

  const handleTimeSelect = (time: string) => {
    const status = slotStatuses[time];

    // If booked by another user for this property
    if (status?.isBooked) {
      const suggestions = getAlternativeSlots(time);
      const suggestStr = suggestions.length > 0 ? ` Try: ${suggestions.join(', ')}` : '';
      setConflictWarning(`This slot (${time}) is already booked for this property.${suggestStr}`);
      toast({
        title: "Slot Unavailable",
        description: `This slot is already booked for this property.${suggestStr}`,
        variant: "destructive"
      });
      return;
    }

    // If user has a conflicting visit at this time
    if (status?.isUserConflict) {
      if (status.userConflictType === 'same_property') {
        setConflictWarning(`You have already booked this property for ${time}.`);
        toast({
          title: "Duplicate Booking",
          description: `You already have a visit scheduled for this property at ${time}.`,
          variant: "destructive"
        });
      } else {
        setConflictWarning(`You already have another visit scheduled at ${time} for "${status.userConflictProperty}".`);
        toast({
          title: "Schedule Conflict",
          description: `You already have a visit scheduled at ${time} for "${status.userConflictProperty}".`,
          variant: "destructive"
        });
      }
      return;
    }

    // Available slot -> select cleanly
    setConflictWarning(null);
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
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit phone number",
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
    setConflictWarning(null);

    try {
      const cleanPhone = formData.phone.trim().replace(/\D/g, '').slice(-10);

      // ===================================================================
      // STAGE 2 VALIDATION: Fresh atomic race-condition check right before saving
      // ===================================================================
      const validation = await validateSlotBeforeBooking(
        propertyId,
        formData.date,
        formData.time,
        cleanPhone
      );

      if (!validation.available) {
        setConflictWarning(validation.reason || 'This slot is no longer available.');
        toast({
          title: "Slot Unavailable",
          description: validation.reason || 'This slot was just booked by another customer.',
          variant: "destructive"
        });
        setFormData(prev => ({ ...prev, time: '' }));
        setLoading(false);
        return;
      }

      // Create booking in Firestore
      await addDoc(collection(db, 'visitBookings'), {
        name: formData.name.trim(),
        phone: cleanPhone, // Store last 10 digits only
        date: formData.date,
        time: formData.time,
        message: formData.message.trim() || '',
        propertyId,
        propertyTitle,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Save phone to localStorage for My Bookings page auto-fill
      localStorage.setItem('devi_last_booking_phone', cleanPhone);

      setSuccess(true);

      // Trigger real device notification for site visit confirmation
      triggerSiteVisitNotification({
        propertyTitle,
        propertyId,
        visitDate: formData.date,
        visitTime: formData.time,
        userName: formData.name,
      }).catch((err) => console.warn('Could not trigger site visit notification:', err));

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
        setConflictWarning(null);
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
      setConflictWarning(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const alternativeSlots = getAlternativeSlots(formData.time);

  return (
    <>
      {/* Backdrop with overscroll-contain */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity overscroll-contain"
        onClick={handleClose}
        style={{ touchAction: 'none' }}
      />
      
      {/* Bottom Sheet Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300 max-w-xl mx-auto">
        <div 
          className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto overscroll-contain touch-pan-y [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border border-gray-100"
          style={{ overscrollBehavior: 'contain' }}
        >
          {/* Handle Bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-display">Schedule a Visit</h2>
              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{propertyTitle}</p>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Success State */}
          {success ? (
            <div className="px-5 py-12 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300 shadow-sm">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 font-display">Visit Scheduled Successfully!</h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-4">
                Our property specialists will contact you shortly to confirm your visit.
              </p>
              <button
                onClick={() => {
                  handleClose();
                  navigate('/my-bookings');
                }}
                className="inline-flex items-center gap-1 text-emerald-600 font-bold text-sm hover:underline"
              >
                <span>Track your booking status</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
              
              {/* Date Picker & Real-Time Availability Indicator */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-800">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Select Date *</span>
                  </label>
                  {formData.date && (
                    availabilityLoading ? (
                      <span className="text-[10px] text-gray-400 animate-pulse">Checking availability...</span>
                    ) : isFullyBooked ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        Fully Booked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {availableSlotsCount} of {totalSlotsCount} slots available
                      </span>
                    )
                  )}
                </div>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={today}
                  className="w-full px-3.5 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 text-sm font-medium"
                />
              </div>

              {/* Time Slots Grid with Visual States */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-800">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Select Time Slot *</span>
                  </label>
                  <span className="text-[11px] text-gray-400">45-60 min visit</span>
                </div>

                {!formData.date ? (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center">
                    <p className="text-xs text-gray-500">Please pick a date first to view live slot availability</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((time) => {
                        const status = slotStatuses[time];
                        const isSelected = formData.time === time;
                        const isBooked = status?.isBooked ?? false;
                        const isUserConflict = status?.isUserConflict ?? false;

                        // Booked slot styling
                        if (isBooked) {
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleTimeSelect(time)}
                              className="py-2.5 px-2 rounded-xl text-xs font-semibold bg-gray-100/90 border border-gray-200/70 text-gray-400 cursor-not-allowed transition-all flex flex-col items-center justify-center relative overflow-hidden group shadow-none"
                              title="This slot is already booked for this property"
                            >
                              <span className="line-through decoration-gray-400/80">{time}</span>
                              <span className="text-[9px] text-gray-400 font-bold flex items-center gap-0.5 mt-0.5">
                                <Lock className="w-2.5 h-2.5" /> Booked
                              </span>
                            </button>
                          );
                        }

                        // User conflict styling
                        if (isUserConflict) {
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleTimeSelect(time)}
                              className="py-2.5 px-2 rounded-xl text-xs font-semibold bg-amber-50/90 border border-amber-300/80 text-amber-800 cursor-not-allowed transition-all flex flex-col items-center justify-center relative overflow-hidden shadow-none"
                              title={`You already have a visit scheduled at this time`}
                            >
                              <span>{time}</span>
                              <span className="text-[9px] text-amber-700 font-bold flex items-center gap-0.5 mt-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> Your Visit
                              </span>
                            </button>
                          );
                        }

                        // Available slot styling
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => handleTimeSelect(time)}
                            className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/20'
                                : 'bg-white text-gray-800 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/60 shadow-2xs'
                            }`}
                          >
                            <span>{time}</span>
                            <span className={`text-[9px] font-bold mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-emerald-600'}`}>
                              Available
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Compact Slot Legend */}
                    <div className="flex items-center justify-center gap-3 pt-2 text-[10px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-700 ring-1 ring-emerald-300" /> Selected
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-300" /> <span className="line-through">Booked</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400" /> Conflict
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Conflict / Fully Booked Alert Banner with Intelligent Alternatives */}
              {conflictWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-2xl space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{conflictWarning}</div>
                  </div>

                  {alternativeSlots.length > 0 && (
                    <div className="pt-1.5 border-t border-amber-200/60 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" /> Suggested Available Slots:
                      </span>
                      {alternativeSlots.map((altTime) => (
                        <button
                          key={altTime}
                          type="button"
                          onClick={() => handleTimeSelect(altTime)}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-600 hover:text-white border border-amber-300 hover:border-emerald-600 rounded-lg text-xs font-bold text-gray-800 transition-colors shadow-2xs"
                        >
                          {altTime}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setConflictWarning(null)}
                      className="text-[11px] font-bold text-amber-800 hover:underline"
                    >
                      Choose Another Time
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        navigate('/my-bookings');
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
                    >
                      <span>View My Bookings</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Name Input */}
              <div>
                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Your Name *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 text-sm font-medium"
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Phone Number *</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-3.5 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 text-sm font-medium"
                />
              </div>

              {/* Message Input */}
              <div>
                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Message (Optional)</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Any specific questions or pickup requests?"
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 resize-none text-sm font-medium"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 pb-5">
                <Button
                  type="submit"
                  disabled={loading || (Boolean(formData.date) && isFullyBooked)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3.5 font-bold text-sm sm:text-base transition-all duration-200 shadow-md shadow-emerald-600/30"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying Slot & Scheduling...
                    </span>
                  ) : isFullyBooked ? (
                    'Date Fully Booked — Pick Another Date'
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
