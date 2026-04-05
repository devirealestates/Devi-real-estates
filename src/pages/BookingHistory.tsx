import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import HeaderRedesign from '@/components/HeaderRedesign';
import FooterRedesign from '@/components/FooterRedesign';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Home, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Phone,
  ArrowLeft,
  Package,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

type FilterTab = 'all' | 'upcoming' | 'visited' | 'rejected';

const BookingHistory: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const searchBookings = async () => {
    const cleanPhone = phoneNumber.trim().replace(/\D/g, ''); // Remove non-digits
    
    if (!cleanPhone || cleanPhone.length < 10) {
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Try searching with the last 10 digits (most common phone format)
      const last10Digits = cleanPhone.slice(-10);
      
      const q = query(
        collection(db, 'visitBookings'),
        where('phone', '==', last10Digits)
      );
      
      const querySnapshot = await getDocs(q);
      let bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VisitBooking[];
      
      // If no results with last 10, try with full number
      if (bookingsData.length === 0 && cleanPhone !== last10Digits) {
        const q2 = query(
          collection(db, 'visitBookings'),
          where('phone', '==', cleanPhone)
        );
        const querySnapshot2 = await getDocs(q2);
        bookingsData = querySnapshot2.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as VisitBooking[];
      }
      
      // Sort by createdAt descending (newest first)
      bookingsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBookings = () => {
    if (searched && phoneNumber.trim()) {
      searchBookings();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchBookings();
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return booking.status === 'pending' || booking.status === 'confirmed';
    if (activeTab === 'visited') return booking.status === 'completed';
    if (activeTab === 'rejected') return booking.status === 'rejected';
    return true;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: CheckCircle,
          label: 'Accepted',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          iconColor: 'text-emerald-600'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Visited',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600'
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rejected',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600'
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Pending',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600'
        };
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

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'visited', label: 'Visited' },
    { id: 'rejected', label: 'Rejected' }
  ];

  const getTabCount = (tabId: FilterTab) => {
    if (tabId === 'all') return bookings.length;
    if (tabId === 'upcoming') return bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
    if (tabId === 'visited') return bookings.filter(b => b.status === 'completed').length;
    if (tabId === 'rejected') return bookings.filter(b => b.status === 'rejected').length;
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header & Footer - Hidden on Mobile */}
      <div className="hidden md:block">
        <HeaderRedesign />
      </div>
      
      <main className="md:pt-20 pb-safe">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">My Bookings</h1>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block max-w-3xl mx-auto px-4 mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-sm text-gray-500 mt-1">Track your property visit requests</p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4">
          {/* Tabs - Above Search Bar */}
          <div className="flex gap-2 mb-4 mt-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-2 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border text-center ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-transparent border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {tab.label}
                {searched && (
                  <span className={`ml-1 px-1 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {getTabCount(tab.id)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Section - Clean Minimal Design */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-white rounded-full border border-gray-200 px-4 py-3 shadow-sm">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search with phone number"
                  className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-base ml-3"
                  maxLength={15}
                />
              </div>
              {searched && (
                <button
                  onClick={refreshBookings}
                  disabled={loading}
                  className="p-3 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                  title="Refresh bookings"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          {searched ? (
            <>
              {/* Bookings List */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-500 text-sm">Loading bookings...</p>
                </div>
              ) : filteredBookings.length > 0 ? (
                <div className="space-y-3">
                  {filteredBookings.map((booking, index) => {
                    const statusConfig = getStatusConfig(booking.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <div
                        key={booking.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Status Header */}
                        <div className={`px-4 py-3 ${statusConfig.bgColor} flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig.bgColor} border-2 ${statusConfig.borderColor}`}>
                              <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
                            </div>
                            <div>
                              <span className={`text-sm font-semibold ${statusConfig.textColor}`}>
                                {statusConfig.label}
                              </span>
                              {booking.createdAt && (
                                <p className="text-xs text-gray-500">
                                  {booking.createdAt.toDate?.().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Booking Details */}
                        <div className="p-4">
                          {/* Property */}
                          <div className="mb-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Home className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {booking.propertyTitle || 'Property'}
                                </h3>
                                <button
                                  onClick={() => navigate(`/property/${booking.propertyId}`)}
                                  className="text-sm text-emerald-600 hover:underline font-medium"
                                >
                                  View Details →
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Date & Time */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2.5 rounded-xl">
                              <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-gray-500 truncate">Date</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{formatDate(booking.date)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2.5 rounded-xl">
                              <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-gray-500 truncate">Time</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{booking.time}</p>
                              </div>
                            </div>
                          </div>

                          {/* Message */}
                          {booking.message && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                              <p className="text-xs text-blue-600 font-medium mb-1">Your Message</p>
                              <p className="text-sm text-gray-700">{booking.message}</p>
                            </div>
                          )}

                          {/* Status Message */}
                          {booking.status === 'confirmed' && (
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-emerald-700">
                                Your visit is confirmed! We'll see you on the scheduled date.
                              </p>
                            </div>
                          )}
                          {booking.status === 'rejected' && (
                            <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-red-700">
                                This visit could not be scheduled. Please try booking again with a different date/time.
                              </p>
                            </div>
                          )}
                          {booking.status === 'pending' && (
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-amber-700">
                                Your request is under review. We'll notify you soon!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    {activeTab === 'all' 
                      ? "No bookings found with this phone number."
                      : `No ${activeTab} bookings found.`}
                  </p>
                  <Button
                    onClick={() => navigate('/buy')}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl"
                  >
                    Browse Properties
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Initial State */
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Your Bookings</h3>
              <p className="text-gray-600 mb-2 max-w-md mx-auto">
                Enter your phone number to view all your property visit requests and their status.
              </p>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Check if your bookings are pending, accepted, or rejected.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer - Hidden on Mobile */}
      <div className="hidden md:block">
        <FooterRedesign />
      </div>
    </div>
  );
};

export default BookingHistory;
