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

  const executeSearch = async (phoneToSearch: string) => {
    const cleanPhone = phoneToSearch.trim().replace(/\D/g, ''); // Remove non-digits
    
    if (!cleanPhone || cleanPhone.length < 10) {
      return;
    }

    setLoading(true);
    setSearched(true);
    localStorage.setItem('devi_last_booking_phone', cleanPhone.slice(-10));

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

  const searchBookings = () => {
    executeSearch(phoneNumber);
  };

  // Auto-fill from localStorage on load
  useEffect(() => {
    const savedPhone = localStorage.getItem('devi_last_booking_phone');
    if (savedPhone && savedPhone.length >= 10) {
      setPhoneNumber(savedPhone);
      executeSearch(savedPhone);
    }
  }, []);

  const refreshBookings = () => {
    if (phoneNumber.trim()) {
      executeSearch(phoneNumber);
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header - Desktop */}
      <HeaderRedesign />
      
      <main className="pt-20 sm:pt-24 lg:pt-28 pb-16 flex-1">
        {/* Mobile Top Bar */}
        <div className="md:hidden sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900 font-display">My Bookings</h1>
            </div>
          </div>
        </div>

        {/* Desktop Header Title Banner */}
        <div className="hidden md:block max-w-4xl mx-auto px-4 sm:px-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 hover:bg-white bg-white/80 shadow-sm border border-gray-200 rounded-full transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-display tracking-tight">My Bookings</h1>
                <p className="text-sm text-gray-500 mt-0.5">Track your property visit requests and scheduled appointments</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Real-time Status
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Tabs - Above Search Bar */}
          <div className="flex gap-2 mb-4 mt-2 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[75px] sm:min-w-0 px-3 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all border text-center ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-600 shadow-2xs'
                }`}
              >
                {tab.label}
                {searched && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {getTabCount(tab.id)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex-1 flex items-center bg-white rounded-2xl sm:rounded-full border border-gray-200 px-4 py-2.5 sm:py-3 shadow-xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter 10-digit phone number"
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-sm sm:text-base ml-2.5 sm:ml-3"
                  maxLength={15}
                />
                {phoneNumber && (
                  <button
                    onClick={() => {
                      setPhoneNumber('');
                      setSearched(false);
                      setBookings([]);
                      localStorage.removeItem('devi_last_booking_phone');
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                    title="Clear"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Button
                onClick={searchBookings}
                disabled={loading || !phoneNumber.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl sm:rounded-full px-5 sm:px-6 py-2.5 sm:py-3 h-auto text-sm sm:text-base font-medium shadow-sm transition-all flex items-center gap-2 flex-shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Button>

              {searched && (
                <button
                  onClick={refreshBookings}
                  disabled={loading}
                  className="p-2.5 sm:p-3 bg-white rounded-2xl sm:rounded-full border border-gray-200 shadow-xs hover:bg-gray-50 transition-colors disabled:opacity-50 flex-shrink-0"
                  title="Refresh bookings"
                >
                  <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          {searched ? (
            <>
              {/* Bookings List */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-500 text-sm">Loading your bookings...</p>
                </div>
              ) : filteredBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBookings.map((booking, index) => {
                    const statusConfig = getStatusConfig(booking.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <div
                        key={booking.id}
                        className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div>
                          {/* Status Header */}
                          <div className={`px-4 py-3 ${statusConfig.bgColor} flex items-center justify-between border-b ${statusConfig.borderColor}`}>
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${statusConfig.bgColor} border-2 ${statusConfig.borderColor}`}>
                                <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.iconColor}`} />
                              </div>
                              <span className={`text-sm font-bold ${statusConfig.textColor}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                            {booking.createdAt && (
                              <p className="text-xs text-gray-500 font-medium">
                                Booked on {booking.createdAt.toDate?.().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                            )}
                          </div>

                          {/* Booking Details */}
                          <div className="p-4 space-y-3">
                            {/* Property Title & Link */}
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-700">
                                <Home className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">
                                  {booking.propertyTitle || 'Property Visit'}
                                </h3>
                                <button
                                  onClick={() => navigate(`/property/${booking.propertyId}`)}
                                  className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline inline-flex items-center gap-1 mt-0.5"
                                >
                                  View Property Details →
                                </button>
                              </div>
                            </div>

                            {/* Date & Time Pills */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                                <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Date</p>
                                  <p className="text-xs font-semibold text-gray-800 truncate">{formatDate(booking.date)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                                <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Time</p>
                                  <p className="text-xs font-semibold text-gray-800 truncate">{booking.time}</p>
                                </div>
                              </div>
                            </div>

                            {/* Message */}
                            {booking.message && (
                              <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">
                                <p className="text-[11px] text-blue-600 font-semibold mb-0.5">Your Note:</p>
                                <p className="text-xs text-gray-700 line-clamp-2">{booking.message}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Message Footer */}
                        <div className="px-4 pb-4">
                          {booking.status === 'confirmed' && (
                            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2 text-xs text-emerald-700 font-medium">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>Your visit is confirmed! We look forward to meeting you.</span>
                            </div>
                          )}
                          {booking.status === 'rejected' && (
                            <div className="p-2.5 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2 text-xs text-red-700 font-medium">
                              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <span>Visit request unavailable. Please try another date/time.</span>
                            </div>
                          )}
                          {booking.status === 'pending' && (
                            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-amber-700 font-medium">
                              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <span>Request pending confirmation by our team.</span>
                            </div>
                          )}
                          {booking.status === 'completed' && (
                            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-2 text-xs text-blue-700 font-medium">
                              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <span>Visit completed. Thank you!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 md:p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No Bookings Found</h3>
                  <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                    {activeTab === 'all' 
                      ? "No property visit requests found for this phone number."
                      : `No ${activeTab} bookings found.`}
                  </p>
                  <Button
                    onClick={() => navigate('/buy')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 py-2.5 text-sm font-medium"
                  >
                    Browse Properties
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Initial State */
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-emerald-100/70 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-600">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 font-display">Track Your Bookings</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-2 max-w-md mx-auto">
                Enter your phone number above to view all your property visit requests and their status.
              </p>
              <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
                Check if your scheduled visits are pending, confirmed, visited, or rejected in real time.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <FooterRedesign />
    </div>
  );
};

export default BookingHistory;
