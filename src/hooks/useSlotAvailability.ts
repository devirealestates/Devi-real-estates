import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const TIME_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '2:00 PM',
  '4:00 PM',
  '6:00 PM'
];

export interface SlotStatus {
  time: string;
  isBooked: boolean;
  isUserConflict: boolean;
  userConflictType?: 'same_property' | 'different_property';
  userConflictProperty?: string;
  isAvailable: boolean;
}

export interface BookingValidationResult {
  available: boolean;
  reason?: string;
  conflictType?: 'slot_booked' | 'same_property_duplicate' | 'user_time_conflict';
  conflictPropertyTitle?: string;
}

// Active bookings are pending, confirmed, or completed (step 1-4). Rejected/cancelled do NOT occupy slots.
const isBookingOccupyingSlot = (status?: string) => {
  if (!status) return true;
  return status !== 'rejected' && status !== 'cancelled';
};

const normalizePhone = (phone?: string) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-10);
};

export const useSlotAvailability = (propertyId: string, selectedDate: string, userPhone?: string) => {
  const [dayBookings, setDayBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const cleanUserPhone = useMemo(() => normalizePhone(userPhone), [userPhone]);

  // Real-time listener for all bookings on the selected date
  useEffect(() => {
    if (!selectedDate) {
      setDayBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'visitBookings'),
      where('date', '==', selectedDate)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookings = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((b: any) => isBookingOccupyingSlot(b.status));

        setDayBookings(bookings);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to slot availability:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedDate]);

  // Compute status for all time slots on this date
  const slotStatuses = useMemo<Record<string, SlotStatus>>(() => {
    const map: Record<string, SlotStatus> = {};

    TIME_SLOTS.forEach((time) => {
      // Check if this property is already booked at this time on this date
      const propertyBooking = dayBookings.find(
        (b) => b.propertyId === propertyId && b.time === time
      );

      // Check if the current user has any booking at this time on this date
      const userBooking = cleanUserPhone
        ? dayBookings.find(
            (b) => normalizePhone(b.phone) === cleanUserPhone && b.time === time
          )
        : null;

      const isBooked = Boolean(propertyBooking);
      let isUserConflict = false;
      let userConflictType: 'same_property' | 'different_property' | undefined;
      let userConflictProperty: string | undefined;

      if (userBooking) {
        isUserConflict = true;
        if (userBooking.propertyId === propertyId) {
          userConflictType = 'same_property';
          userConflictProperty = userBooking.propertyTitle || 'This Property';
        } else {
          userConflictType = 'different_property';
          userConflictProperty = userBooking.propertyTitle || 'Another Property';
        }
      }

      // Slot is available ONLY if not booked for this property and has no user conflict
      const isAvailable = !isBooked && !isUserConflict;

      map[time] = {
        time,
        isBooked,
        isUserConflict,
        userConflictType,
        userConflictProperty,
        isAvailable
      };
    });

    return map;
  }, [dayBookings, propertyId, cleanUserPhone]);

  // Total available slots count for the date
  const availableSlotsCount = useMemo(() => {
    return TIME_SLOTS.filter((time) => slotStatuses[time]?.isAvailable).length;
  }, [slotStatuses]);

  const isFullyBooked = useMemo(() => {
    return Boolean(selectedDate) && availableSlotsCount === 0;
  }, [selectedDate, availableSlotsCount]);

  // Suggest alternative available slots on the same date
  const getAlternativeSlots = useCallback(
    (requestedTime?: string) => {
      const available = TIME_SLOTS.filter((time) => slotStatuses[time]?.isAvailable);
      if (available.length === 0) return [];
      if (!requestedTime) return available.slice(0, 3);

      const reqIndex = TIME_SLOTS.indexOf(requestedTime);
      if (reqIndex === -1) return available.slice(0, 3);

      // Sort by proximity to the requested slot index
      return [...available].sort((a, b) => {
        const distA = Math.abs(TIME_SLOTS.indexOf(a) - reqIndex);
        const distB = Math.abs(TIME_SLOTS.indexOf(b) - reqIndex);
        return distA - distB;
      }).slice(0, 3);
    },
    [slotStatuses]
  );

  // Stage 2 Validation: Fresh atomic check right before creating booking in Firestore
  const validateSlotBeforeBooking = useCallback(
    async (
      targetPropertyId: string,
      targetDate: string,
      targetTime: string,
      targetPhone: string
    ): Promise<BookingValidationResult> => {
      try {
        const cleanPhone = normalizePhone(targetPhone);
        const q = query(
          collection(db, 'visitBookings'),
          where('date', '==', targetDate)
        );
        const snapshot = await getDocs(q);

        const activeBookings = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() as any }))
          .filter((b) => isBookingOccupyingSlot(b.status));

        // 1. Check if the slot for this property was booked by someone else
        const samePropertyBooking = activeBookings.find(
          (b) => b.propertyId === targetPropertyId && b.time === targetTime
        );

        if (samePropertyBooking) {
          // Check if it's the exact same user
          if (cleanPhone && normalizePhone(samePropertyBooking.phone) === cleanPhone) {
            return {
              available: false,
              reason: 'You already have a booking for this property at this time.',
              conflictType: 'same_property_duplicate'
            };
          }
          return {
            available: false,
            reason: 'This slot was just booked by another customer. Please select another available time.',
            conflictType: 'slot_booked'
          };
        }

        // 2. Check if user has another property visit booked at this exact time
        if (cleanPhone) {
          const userOtherBooking = activeBookings.find(
            (b) => normalizePhone(b.phone) === cleanPhone && b.time === targetTime
          );

          if (userOtherBooking) {
            const conflictTitle = userOtherBooking.propertyTitle || 'another property';
            return {
              available: false,
              reason: `You already have a visit scheduled at ${targetTime} for "${conflictTitle}".`,
              conflictType: 'user_time_conflict',
              conflictPropertyTitle: conflictTitle
            };
          }
        }

        return { available: true };
      } catch (err) {
        console.error('Error validating slot before booking:', err);
        // Fail-safe: allow proceeding if network check had error, or return false with generic msg
        return { available: true };
      }
    },
    []
  );

  return {
    slotStatuses,
    availableSlotsCount,
    totalSlotsCount: TIME_SLOTS.length,
    isFullyBooked,
    getAlternativeSlots,
    validateSlotBeforeBooking,
    loading
  };
};
