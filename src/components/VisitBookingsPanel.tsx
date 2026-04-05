import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
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
  Filter
} from 'lucide-react';

interface VisitBooking {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  message?: string;
  propertyId: string;
  propertyTitle?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  createdAt?: any;
}

const VisitBookingsPanel: React.FC = () => {
  const [bookings, setBookings] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'completed'>('all');
  const { toast } = useToast();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'visitBookings'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VisitBooking[];
      
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch visit bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'rejected' | 'completed') => {
    try {
      await updateDoc(doc(db, 'visitBookings', bookingId), { status });
      
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );

      const statusMessages = {
        confirmed: 'confirmed',
        rejected: 'rejected',
        completed: 'marked as completed'
      };

      toast({
        title: "Success",
        description: `Booking ${statusMessages[status]} successfully`
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      await deleteDoc(doc(db, 'visitBookings', bookingId));
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3" />
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

  return (
    <Card className="bg-white/60 backdrop-blur-lg border border-white/30 shadow-xl w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <CardTitle className="text-lg md:text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Visit Bookings ({bookings.length})
          </CardTitle>
          <div className="flex gap-3 mt-2 text-sm flex-wrap">
            <span className="text-amber-600">{pendingCount} Pending</span>
            <span className="text-emerald-600">{confirmedCount} Confirmed</span>
            <span className="text-blue-600">{completedCount} Completed</span>
            <span className="text-red-600">{rejectedCount} Rejected</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBookings}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['all', 'pending', 'confirmed', 'completed', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'all' && ` (${bookings.length})`}
              {status === 'pending' && ` (${pendingCount})`}
              {status === 'confirmed' && ` (${confirmedCount})`}
              {status === 'completed' && ` (${completedCount})`}
              {status === 'rejected' && ` (${rejectedCount})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Booking Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">{booking.name}</span>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <a href={`tel:${booking.phone}`} className="hover:text-emerald-600">
                          {booking.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        {formatDate(booking.date)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-purple-600" />
                        {booking.time}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Home className="w-4 h-4 text-orange-600" />
                        <span className="truncate">{booking.propertyTitle || booking.propertyId}</span>
                      </div>
                    </div>

                    {booking.message && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <MessageSquare className="w-4 h-4 mt-0.5 text-gray-400" />
                        <p>{booking.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex sm:flex-col gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Accept</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBookingStatus(booking.id, 'rejected')}
                          className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Reject</span>
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Mark Visited</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteBooking(booking.id)}
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-500 text-sm">
              {filter === 'all' 
                ? 'No visit bookings have been made yet.'
                : `No ${filter} bookings found.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisitBookingsPanel;
