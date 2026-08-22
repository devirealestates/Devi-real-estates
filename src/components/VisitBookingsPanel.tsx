import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Home, 
  RefreshCw, 
  Filter, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  Edit3, 
  Save, 
  Eye, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export interface VisitBooking {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  message?: string;
  propertyId: string;
  propertyTitle?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  currentStep?: number; // 1: Submitted, 2: Under Review, 3: Scheduled, 4: Visited, 5: Decision
  assignedAgent?: string;
  adminNote?: string;
  createdAt?: any;
  updatedAt?: any;
}

const VisitBookingsPanel: React.FC = () => {
  const [bookings, setBookings] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'completed'>('all');
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editAgent, setEditAgent] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editStep, setEditStep] = useState<number>(1);
  const { toast } = useToast();

  // Setup real-time listener for visit bookings
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'visitBookings'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VisitBooking[];
      
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      console.error('Error in visitBookings real-time listener:', error);
      toast({
        title: "Error",
        description: "Failed to connect to real-time visit bookings",
        variant: "destructive"
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateBookingStatusAndStep = async (
    bookingId: string, 
    status: 'pending' | 'confirmed' | 'rejected' | 'completed',
    step?: number,
    agent?: string,
    note?: string
  ) => {
    try {
      const updatePayload: any = { 
        status,
        updatedAt: serverTimestamp()
      };
      
      if (step !== undefined) {
        updatePayload.currentStep = step;
      } else {
        // Infer step from status
        if (status === 'pending') updatePayload.currentStep = 2;
        if (status === 'confirmed') updatePayload.currentStep = 3;
        if (status === 'completed') updatePayload.currentStep = 4;
        if (status === 'rejected') updatePayload.currentStep = 1;
      }

      if (agent !== undefined) updatePayload.assignedAgent = agent;
      if (note !== undefined) updatePayload.adminNote = note;

      await updateDoc(doc(db, 'visitBookings', bookingId), updatePayload);

      toast({
        title: "Timeline Updated",
        description: `Booking updated to ${status} (Step ${updatePayload.currentStep}). Customer will see this in real-time.`
      });

      if (editingBookingId === bookingId) {
        setEditingBookingId(null);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status and timeline",
        variant: "destructive"
      });
    }
  };

  const startEditing = (booking: VisitBooking) => {
    setEditingBookingId(booking.id);
    setEditAgent(booking.assignedAgent || 'Devi Team');
    setEditNote(booking.adminNote || '');
    setEditStep(booking.currentStep || (booking.status === 'confirmed' ? 3 : booking.status === 'completed' ? 4 : 2));
  };

  const saveBookingDetails = async (bookingId: string, currentStatus: any) => {
    await updateBookingStatusAndStep(bookingId, currentStatus, editStep, editAgent, editNote);
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking? This will remove it permanently.')) return;

    try {
      await deleteDoc(doc(db, 'visitBookings', bookingId));
      toast({
        title: "Success",
        description: "Booking deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive"
      });
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            Visited
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const rejectedCount = bookings.filter(b => b.status === 'rejected').length;

  const timelineSteps = [
    { step: 1, label: '1. Request Submitted' },
    { step: 2, label: '2. Under Review' },
    { step: 3, label: '3. Visit Scheduled' },
    { step: 4, label: '4. Property Visited' },
    { step: 5, label: '5. Decision & Booking' }
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-lg border border-slate-200 shadow-xl w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
              Visit Bookings & Live Journey ({bookings.length})
            </CardTitle>
            <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full animate-pulse">
              ● Live Sync
            </span>
          </div>
          <div className="flex gap-3 mt-2 text-xs sm:text-sm flex-wrap font-medium">
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">{pendingCount} Pending</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">{confirmedCount} Confirmed</span>
            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">{completedCount} Visited</span>
            <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">{rejectedCount} Rejected</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {(['all', 'pending', 'confirmed', 'completed', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' && `All Bookings (${bookings.length})`}
              {status === 'pending' && `Pending Review (${pendingCount})`}
              {status === 'confirmed' && `Scheduled / Confirmed (${confirmedCount})`}
              {status === 'completed' && `Visited (${completedCount})`}
              {status === 'rejected' && `Rejected (${rejectedCount})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-3"></div>
            <p className="text-gray-500 text-sm">Connecting to real-time visit bookings...</p>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => {
              const currentStep = booking.currentStep || (booking.status === 'confirmed' ? 3 : booking.status === 'completed' ? 4 : 2);
              const isEditing = editingBookingId === booking.id;

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all duration-300 relative"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    
                    {/* Booking User & Property Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 text-base">{booking.name}</span>
                            <span className="text-xs text-gray-400 ml-2 font-mono">{booking.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(booking.status)}
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            Step {currentStep}/5
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs text-gray-700 pt-1">
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                          <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <a href={`tel:${booking.phone}`} className="font-semibold text-emerald-700 hover:underline truncate">
                            {booking.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                          <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="font-semibold truncate">{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                          <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <span className="font-semibold truncate">{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                          <Home className="w-4 h-4 text-orange-600 flex-shrink-0" />
                          <span className="font-semibold truncate">{booking.propertyTitle || booking.propertyId}</span>
                        </div>
                      </div>

                      {/* Customer Note */}
                      {booking.message && (
                        <div className="flex items-start gap-2 text-xs text-gray-600 bg-amber-50/60 border border-amber-200/60 p-2.5 rounded-xl">
                          <MessageSquare className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
                          <p><strong className="text-gray-800">User Message:</strong> {booking.message}</p>
                        </div>
                      )}

                      {/* Assigned Agent & Admin Note Display */}
                      <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
                        <span className="text-gray-500">
                          Assigned Agent: <strong className="text-gray-800 font-bold">{booking.assignedAgent || 'Devi Team'}</strong>
                        </span>
                        {booking.adminNote && (
                          <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                            Note for User: {booking.adminNote}
                          </span>
                        )}
                      </div>

                      {/* ---------------------------------------------------- */}
                      {/* DYNAMIC TIMELINE PROGRESSION BAR FOR ADMIN */}
                      {/* ---------------------------------------------------- */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Customer Live Journey Status (Updates in Real-Time):
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                          {timelineSteps.map((s) => {
                            const isPassed = currentStep >= s.step;
                            const isCurrent = currentStep === s.step;

                            return (
                              <button
                                key={s.step}
                                onClick={() => {
                                  let newStatus: any = booking.status;
                                  if (s.step === 1 || s.step === 2) newStatus = 'pending';
                                  if (s.step === 3) newStatus = 'confirmed';
                                  if (s.step === 4 || s.step === 5) newStatus = 'completed';
                                  updateBookingStatusAndStep(booking.id, newStatus, s.step);
                                }}
                                className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                                  isCurrent
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                    : isPassed
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                    : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                                }`}
                              >
                                <span className="truncate">{s.label}</span>
                                {isPassed && <Check className="w-3 h-3 flex-shrink-0 ml-1" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Edit Mode for Agent & Note */}
                      {isEditing && (
                        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] font-bold text-gray-600">Assigned Agent Name</label>
                              <input
                                type="text"
                                value={editAgent}
                                onChange={(e) => setEditAgent(e.target.value)}
                                placeholder="e.g. Ramesh / Devi Team"
                                className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-600">Note to User (Shown on their timeline)</label>
                              <input
                                type="text"
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                                placeholder="e.g. Executive will meet at gate 11:00 AM"
                                className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingBookingId(null)}
                              className="text-xs h-7"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => saveBookingDetails(booking.id, booking.status)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 gap-1"
                            >
                              <Save className="w-3 h-3" />
                              Save & Sync Live
                            </Button>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Quick Status Action Buttons */}
                    <div className="flex lg:flex-col gap-2 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatusAndStep(booking.id, 'confirmed', 3)}
                            className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1 shadow-xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Confirm (Step 3)</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatusAndStep(booking.id, 'rejected', 1)}
                            className="flex-1 lg:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8 gap-1 border-red-200"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </Button>
                        </>
                      )}

                      {booking.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatusAndStep(booking.id, 'completed', 4)}
                          className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Mark Visited (Step 4)</span>
                        </Button>
                      )}

                      {booking.status === 'completed' && currentStep === 4 && (
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatusAndStep(booking.id, 'completed', 5)}
                          className="flex-1 lg:flex-none bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 gap-1 shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Finalize Decision (Step 5)</span>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(booking)}
                        className="text-gray-700 hover:bg-gray-100 text-xs h-8 gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                        <span>Edit Timeline</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBooking(booking.id)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 text-xs h-8"
                        title="Delete booking"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center text-gray-400">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">No Visit Bookings Found</h3>
            <p className="text-gray-500 text-xs max-w-sm mx-auto">
              {filter === 'all' 
                ? 'No property visit requests have been submitted yet.'
                : `No bookings found under the "${filter}" filter.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisitBookingsPanel;
