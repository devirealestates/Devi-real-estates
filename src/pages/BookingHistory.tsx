import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import HeaderRedesign from '@/components/HeaderRedesign';
import FooterRedesign from '@/components/FooterRedesign';
import { Button } from '@/components/ui/button';
import { useRealtimeProperties } from '@/hooks/useRealtimeProperties';
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
  Eye,
  Play,
  Headphones,
  MapPin,
  ArrowRight,
  CalendarCheck,
  Check,
  X,
  User,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { formatPriceWithSlash } from '@/lib/utils';

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

type FilterTab = 'all' | 'upcoming' | 'visited' | 'rejected';
type ViewMode = 'card' | 'timeline';

const BookingHistory: React.FC = () => {
  const navigate = useNavigate();
  const { properties } = useRealtimeProperties();
  const [allRawBookings, setAllRawBookings] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [activeSidebarNav, setActiveSidebarNav] = useState('bookings');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  
  // State for Booking Details Pop-up Modal
  const [detailBooking, setDetailBooking] = useState<VisitBooking | null>(null);

  // Complete background scroll lock to prevent scroll chaining when popup modal is open
  useEffect(() => {
    if (detailBooking) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [detailBooking]);

  // Real-time Firestore onSnapshot listener for all visit bookings
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'visitBookings'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VisitBooking[];

      setAllRawBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching real-time bookings:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter bookings: By default, shows ALL bookings! Filters if search text is entered.
  const userBookings = useMemo(() => {
    const search = phoneNumber.trim().toLowerCase();
    const cleanDigits = search.replace(/\D/g, '');

    // By default: Show ALL bookings!
    if (!search) {
      return allRawBookings;
    }

    return allRawBookings.filter(booking => {
      const bPhone = (booking.phone || '').toString().replace(/\D/g, '');
      const bName = (booking.name || '').toLowerCase();
      const bProperty = (booking.propertyTitle || '').toLowerCase();

      const matchesPhone = cleanDigits && (
        bPhone.includes(cleanDigits) ||
        cleanDigits.includes(bPhone) ||
        bPhone.slice(-10) === cleanDigits.slice(-10)
      );

      const matchesText = bName.includes(search) || bProperty.includes(search);

      return matchesPhone || matchesText;
    });
  }, [allRawBookings, phoneNumber]);

  // Auto select first booking for the right sidebar journey tracker
  useEffect(() => {
    if (userBookings.length > 0 && (!selectedBookingId || !userBookings.some(b => b.id === selectedBookingId))) {
      setSelectedBookingId(userBookings[0].id);
    }
  }, [userBookings, selectedBookingId]);

  // Counts based on all bookings
  const totalCount = allRawBookings.length;
  const upcomingCount = allRawBookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
  const visitedCount = allRawBookings.filter(b => b.status === 'completed').length;
  const rejectedCount = allRawBookings.filter(b => b.status === 'rejected').length;

  const filteredBookings = userBookings.filter(booking => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return booking.status === 'pending' || booking.status === 'confirmed';
    if (activeTab === 'visited') return booking.status === 'completed';
    if (activeTab === 'rejected') return booking.status === 'rejected';
    return true;
  });

  // Selected booking for right sidebar tracker
  const activeBooking = userBookings.find(b => b.id === selectedBookingId) || allRawBookings[0] || null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: CheckCircle,
          label: 'Visit Confirmed',
          shortLabel: 'Confirmed',
          badgeText: 'Upcoming Visit',
          badgeBg: 'bg-emerald-600 text-white font-bold shadow-sm border border-emerald-700/30',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          iconColor: 'text-emerald-600',
          dotColor: 'bg-emerald-500'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Visited',
          shortLabel: 'Visited',
          badgeText: 'Visited',
          badgeBg: 'bg-teal-600 text-white font-bold shadow-sm border border-teal-700/30',
          textColor: 'text-teal-700',
          borderColor: 'border-teal-200',
          iconColor: 'text-teal-600',
          dotColor: 'bg-teal-500'
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rejected',
          shortLabel: 'Rejected',
          badgeText: 'Rejected',
          badgeBg: 'bg-rose-600 text-white font-bold shadow-sm border border-rose-700/30',
          textColor: 'text-rose-700',
          borderColor: 'border-rose-200',
          iconColor: 'text-rose-600',
          dotColor: 'bg-rose-500'
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Pending Review',
          shortLabel: 'Pending',
          badgeText: 'Under Review',
          badgeBg: 'bg-amber-500 text-white font-bold shadow-sm border border-amber-600/30',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600',
          dotColor: 'bg-amber-500'
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

  // Helper to build 5-step dynamic timeline for any booking
  const getBookingTimeline = (booking: VisitBooking) => {
    const step = booking.currentStep || (
      booking.status === 'confirmed' ? 3 : 
      booking.status === 'completed' ? 4 : 
      2
    );

    const isRejected = booking.status === 'rejected';

    const createdTimeStr = booking.createdAt?.toDate?.() 
      ? booking.createdAt.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : 'Submitted';

    const createdDateStr = booking.createdAt?.toDate?.() 
      ? booking.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : 'Recently';

    return [
      {
        step: 1,
        title: 'Request Submitted',
        subtitle: `You requested a site visit on ${createdDateStr}`,
        timestamp: createdTimeStr,
        isCompleted: true,
        isActive: step === 1 && !isRejected,
        icon: Check
      },
      {
        step: 2,
        title: 'Under Review',
        subtitle: isRejected 
          ? 'Visit request declined. Please choose another date.'
          : step > 2 
          ? 'Verified by Devi Real Estates support team' 
          : 'Our team is verifying schedule & owner slot',
        timestamp: step >= 2 ? 'Verified' : 'In Progress',
        isCompleted: step > 2 && !isRejected,
        isActive: step === 2 && !isRejected,
        icon: Clock
      },
      {
        step: 3,
        title: 'Visit Scheduled',
        subtitle: step >= 3 
          ? `${booking.assignedAgent || 'Devi Team'} confirmed for ${formatDate(booking.date)} at ${booking.time}`
          : 'Slot confirmation with property specialist',
        timestamp: step >= 3 ? `${booking.time}` : 'Pending',
        isCompleted: step > 3 && !isRejected,
        isActive: step === 3 && !isRejected,
        icon: Calendar
      },
      {
        step: 4,
        title: 'Property Visit',
        subtitle: step >= 4
          ? 'Physical property walkthrough conducted'
          : 'Guided visit with property specialist',
        timestamp: step >= 4 ? 'Visited' : 'Upcoming',
        isCompleted: step >= 5 && !isRejected,
        isActive: step === 4 && !isRejected,
        icon: Eye
      },
      {
        step: 5,
        title: 'Decision & Booking',
        subtitle: step >= 5
          ? 'Site visit completed. Ready for property booking!'
          : 'Finalize negotiation, token advance, or explore more',
        timestamp: step >= 5 ? 'Done' : 'Next Step',
        isCompleted: step >= 5 && !isRejected,
        isActive: step >= 5 && !isRejected,
        icon: Home
      }
    ];
  };

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All Requests', count: totalCount },
    { id: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { id: 'visited', label: 'Visited', count: visitedCount },
    { id: 'rejected', label: 'Rejected', count: rejectedCount }
  ];

  // Helper to find matched property from state
  const getPropertyDetails = (propertyId: string) => {
    return properties.find(p => p.id === propertyId);
  };

  const formatArea = (areaString?: string) => {
    if (!areaString) return 'Prime Area';
    const lower = areaString.toLowerCase();
    if (lower.includes('sq') || lower.includes('acre') || lower.includes('yd')) {
      return areaString;
    }
    return `${areaString} Sq.Ft`;
  };

  const recommendedProperties = properties.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <HeaderRedesign />
      
      {/* Main Container */}
      <div className="pt-16 sm:pt-20 lg:pt-20 flex-1 flex">
        
        {/* ======================================================== */}
        {/* LEFT LUXURY DARK SIDEBAR (Desktop lg: and above) */}
        {/* ======================================================== */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-[#090e15] border-r border-slate-800/80 text-slate-300 flex-shrink-0 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto overscroll-contain py-6 px-4 justify-between scrollbar-hide select-none z-20">
          <div className="space-y-6">
            {/* Primary Nav Items */}
            <div className="space-y-1">
              {/* My Bookings - Active Highlight Pill */}
              <div className="relative">
                <button
                  onClick={() => {
                    setActiveSidebarNav('bookings');
                    setActiveTab('all');
                    setPhoneNumber('');
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-950/60 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3.5">
                    <Calendar className="w-5 h-5 text-white" />
                    <span>My Bookings</span>
                  </div>
                  {totalCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-white/20 text-white rounded-full font-bold">
                      {totalCount}
                    </span>
                  )}
                </button>
              </div>

              <Link
                to="/buy"
                onClick={() => setActiveSidebarNav('explore')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeSidebarNav === 'explore'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Search className="w-5 h-5 text-slate-400" />
                <span>Explore Properties</span>
              </Link>

              <button
                onClick={() => {
                  setActiveSidebarNav('visits');
                  setActiveTab('visited');
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === 'visited' && activeSidebarNav === 'visits'
                    ? 'bg-white/10 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Eye className="w-5 h-5 text-slate-400" />
                  <span>My Visits</span>
                </div>
                {visitedCount > 0 && (
                  <span className="w-5 h-5 text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center font-bold">
                    {visitedCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Card: "Find Your Perfect Home with DRE" */}
          <div className="mt-8 pt-4">
            <div 
              onClick={() => navigate('/buy')}
              className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-b from-slate-800/60 to-slate-900/90 border border-slate-700/50 cursor-pointer group hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className="relative z-10 space-y-2">
                <h4 className="text-sm font-semibold text-white font-display leading-tight">
                  Find Your<br />Perfect Home<br />with DRE
                </h4>
                <div className="w-8 h-0.5 bg-amber-400/80 rounded-full" />
              </div>
              <div className="mt-3 relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=400"
                  alt="Modern Home"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                    <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* RIGHT MAIN CONTENT AREA */}
        {/* ======================================================== */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-[1600px] w-full mx-auto min-w-0">
          
          {/* Mobile Top Navigation & Back */}
          <div className="lg:hidden flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-200/60 rounded-xl transition-colors text-gray-700 -ml-1"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 font-display text-center flex-1">
              My Bookings
            </h1>
            <div className="w-10 -mr-1" />
          </div>

          {/* ---------------------------------------------------- */}
          {/* TOP BAR: COMPACT SEARCH INPUT ONLY */}
          {/* ---------------------------------------------------- */}
          <div className="mb-4">
            <div className="max-w-md">
              <div className="bg-white rounded-xl border border-gray-200/90 px-3 py-1.5 sm:py-2 shadow-2xs flex items-center gap-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <Search className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Search by phone, name, or property..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-xs sm:text-sm font-medium min-w-0"
                />
                {phoneNumber && (
                  <button
                    onClick={() => setPhoneNumber('')}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                    title="Clear search"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* STATS SUMMARY ROW (SLIGHTLY SMALLER BOXES) */}
          {/* ---------------------------------------------------- */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
            {/* Card 1: Total Bookings */}
            <div 
              onClick={() => {
                setActiveTab('all');
                setPhoneNumber('');
              }}
              className={`bg-white rounded-xl p-3 sm:p-3.5 border border-gray-200/80 shadow-2xs flex items-center justify-between relative overflow-hidden group cursor-pointer hover:shadow-xs transition-all ${
                activeTab === 'all' ? 'ring-2 ring-emerald-500/50' : ''
              }`}
            >
              <div className="space-y-0.5 z-10 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">Total Bookings</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900 font-display">
                    {totalCount}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                    +24%
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 truncate">All time requests</p>
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden opacity-90 flex-shrink-0 bg-slate-100 ml-2">
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=200"
                  alt="Building"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            </div>

            {/* Card 2: Upcoming */}
            <div 
              onClick={() => setActiveTab('upcoming')}
              className={`bg-white rounded-xl p-3 sm:p-3.5 border border-gray-200/80 shadow-2xs flex items-center justify-between relative overflow-hidden group cursor-pointer hover:shadow-xs transition-all ${
                activeTab === 'upcoming' ? 'ring-2 ring-amber-500/50 bg-amber-50/20' : ''
              }`}
            >
              <div className="space-y-0.5 z-10 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="truncate">Upcoming</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900 font-display">
                    {upcomingCount}
                  </span>
                  {upcomingCount > 0 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded">
                      {upcomingCount} this week
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 truncate">Scheduled visits</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500 flex-shrink-0 ml-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            {/* Card 3: Visited */}
            <div 
              onClick={() => setActiveTab('visited')}
              className={`bg-white rounded-xl p-3 sm:p-3.5 border border-gray-200/80 shadow-2xs flex items-center justify-between relative overflow-hidden group cursor-pointer hover:shadow-xs transition-all ${
                activeTab === 'visited' ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : ''
              }`}
            >
              <div className="space-y-0.5 z-10 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Eye className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="truncate">Visited</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900 font-display">
                    {visitedCount}
                  </span>
                  {visitedCount > 0 && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 truncate">Completed visits</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 flex-shrink-0 ml-2">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            {/* Card 4: Rejected */}
            <div 
              onClick={() => setActiveTab('rejected')}
              className={`bg-white rounded-xl p-3 sm:p-3.5 border border-gray-200/80 shadow-2xs flex items-center justify-between relative overflow-hidden group cursor-pointer hover:shadow-xs transition-all ${
                activeTab === 'rejected' ? 'ring-2 ring-rose-500/50 bg-rose-50/20' : ''
              }`}
            >
              <div className="space-y-0.5 z-10 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  <span className="truncate">Rejected</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900 font-display">
                    {rejectedCount}
                  </span>
                  {rejectedCount > 0 && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1 py-0.2 rounded">
                      Declined
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 truncate">Cancelled/Declined</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-500 flex-shrink-0 ml-2">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* MAIN DUAL COLUMN CONTENT: LEFT (BOOKINGS) + RIGHT (WIDGETS ON DESKTOP ONLY) */}
          {/* ---------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* ================================================== */}
            {/* LEFT MAIN SECTION: YOUR BOOKING REQUESTS (col-span-12 on mobile, col-span-8 on desktop) */}
            {/* ================================================== */}
            <div className="w-full lg:col-span-8 space-y-4 min-w-0">
              
              {/* Header Container (Hidden on Mobile, Visible on Desktop lg:) */}
              <div className="hidden lg:block bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <CalendarCheck className="w-4 h-4" />
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 font-display">
                        Your Booking Requests
                      </h2>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 ml-9">
                      Manage and track each property visit request
                    </p>
                  </div>

                  {/* Right View Switchers */}
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-semibold">
                      <button
                        onClick={() => setViewMode('card')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          viewMode === 'card'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Card View
                      </button>
                      <button
                        onClick={() => setViewMode('timeline')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          viewMode === 'timeline'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Timeline View
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 overflow-x-auto pb-1 scrollbar-hide">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                        activeTab === tab.id
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                        activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings List Content */}
              {loading ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-200/80 shadow-2xs text-center space-y-4">
                  <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-gray-600 font-medium text-xs">Syncing your bookings...</p>
                </div>
              ) : filteredBookings.length > 0 ? (
                viewMode === 'card' ? (
                  /* ================================================= */
                  /* CARD VIEW (Clean & Compact on both Mobile & Desktop) */
                  /* ================================================= */
                  <div className="space-y-3.5">
                    {filteredBookings.map((booking) => {
                      const statusConfig = getStatusConfig(booking.status);
                      const matchedProperty = getPropertyDetails(booking.propertyId);
                      const propImage = matchedProperty?.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600';
                      const propTitle = booking.propertyTitle || matchedProperty?.title || 'Devi Luxury Property';
                      const propLocation = matchedProperty?.location || 'Kakinada, Andhra Pradesh';
                      const propBedrooms = matchedProperty?.bedrooms ? `${matchedProperty.bedrooms} BHK ` : '';
                      const propType = matchedProperty?.type || matchedProperty?.category || 'Luxury Property';
                      const propArea = formatArea(matchedProperty?.area);
                      const propFacing = matchedProperty?.facing ? `${matchedProperty.facing} Facing` : 'East Facing';
                      const currentStep = booking.currentStep || (booking.status === 'confirmed' ? 3 : booking.status === 'completed' ? 4 : 2);
                      const isSelected = selectedBookingId === booking.id;

                      // Check if visit is scheduled/confirmed or finished -> Reschedule should be disabled!
                      const isScheduledOrConfirmed = booking.status === 'confirmed' || booking.status === 'completed' || currentStep >= 3;

                      return (
                        <div
                          key={booking.id}
                          onClick={() => setSelectedBookingId(booking.id)}
                          className={`bg-white rounded-2xl border transition-all p-4 relative group cursor-pointer overflow-hidden ${
                            isSelected 
                              ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500/30' 
                              : 'border-gray-200/80 shadow-2xs hover:border-gray-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-start justify-between">
                            
                            {/* Left: Image & Details */}
                            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                              <div className="relative w-24 h-20 sm:w-28 sm:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-2xs">
                                <img
                                  src={propImage}
                                  alt={propTitle}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-1.5 left-1.5 z-10">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase shadow-sm ${statusConfig.badgeBg}`}>
                                    {statusConfig.badgeText}
                                  </span>
                                </div>
                              </div>

                              {/* Middle Details */}
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  <h3 
                                    className="text-sm sm:text-base font-bold text-gray-900 hover:text-emerald-600 transition-colors truncate block flex-1"
                                    title={propTitle}
                                  >
                                    {propTitle}
                                  </h3>
                                  {matchedProperty?.featured && (
                                    <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 rounded-full flex-shrink-0">
                                      Featured
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{propLocation}</span>
                                </p>

                                <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                                  <span className="font-medium">{propBedrooms}{propType}</span>
                                  <span>•</span>
                                  <span>{propArea}</span>
                                  <span>•</span>
                                  <span>{propFacing}</span>
                                </div>

                                {/* Date & Agent Name (Without "Agent:" prefix) */}
                                <div className="flex items-center gap-2 text-xs pt-0.5 flex-wrap text-slate-700">
                                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded-md flex-shrink-0">
                                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="font-semibold text-xs">{formatDate(booking.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded-md flex-shrink-0">
                                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="font-semibold text-xs">{booking.time}</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50/80 border border-emerald-100 text-emerald-800 font-semibold text-[11px] flex-shrink-0">
                                    {booking.assignedAgent || 'Devi Team'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex md:flex-col items-center md:items-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 flex-shrink-0 w-full md:w-auto">
                              {/* Open Booking Details Popup */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetailBooking(booking);
                                }}
                                className="flex-1 md:flex-initial w-full md:w-28 px-3 py-1.5 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-500 rounded-xl text-xs font-bold text-gray-800 hover:text-emerald-700 transition-all shadow-2xs flex items-center justify-center text-center"
                              >
                                View Details
                              </button>

                              {isScheduledOrConfirmed ? (
                                <button
                                  disabled
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 md:flex-initial w-full md:w-28 px-3 py-1.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-xl text-xs font-semibold cursor-not-allowed opacity-75 shadow-none text-center"
                                  title="Visit has already been scheduled and confirmed"
                                >
                                  Visit Scheduled
                                </button>
                              ) : (
                                <a
                                  href="https://wa.me/919912991671?text=Hello%2C%20I%20want%20to%20reschedule%20my%20visit%20for%20property%20booking"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 md:flex-initial w-full md:w-28 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs text-center"
                                >
                                  Reschedule
                                </a>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ================================================= */
                  /* TIMELINE VIEW (DEDICATED VISUAL JOURNEY) */
                  /* ================================================= */
                  <div className="space-y-5">
                    {filteredBookings.map((booking) => {
                      const statusConfig = getStatusConfig(booking.status);
                      const matchedProperty = getPropertyDetails(booking.propertyId);
                      const propTitle = booking.propertyTitle || matchedProperty?.title || 'Devi Property Visit';
                      const timeline = getBookingTimeline(booking);

                      return (
                        <div
                          key={booking.id}
                          className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-4 sm:p-5 space-y-3.5 overflow-hidden"
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
                                <Home className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate" title={propTitle}>
                                  {propTitle}
                                </h3>
                                <p className="text-xs text-gray-500 truncate">
                                  {formatDate(booking.date)} at {booking.time} • {booking.assignedAgent || 'Devi Team'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => setDetailBooking(booking)}
                                className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                              >
                                Details
                              </button>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusConfig.badgeBg}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                          </div>

                          {/* Connected Vertical Timeline */}
                          <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-emerald-400 before:to-gray-200">
                            {timeline.map((item) => (
                              <div key={item.step} className="relative">
                                <div className={`absolute -left-[23px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white ring-4 ring-white ${
                                  item.isCompleted 
                                    ? 'bg-emerald-500' 
                                    : item.isActive 
                                    ? 'bg-amber-500' 
                                    : 'bg-gray-300 text-gray-500'
                                }`}>
                                  {item.isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-[10px]">{item.step}</span>}
                                </div>
                                <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <h4 className={`text-xs font-bold ${
                                      item.isActive ? 'text-amber-800' : item.isCompleted ? 'text-emerald-800' : 'text-gray-500'
                                    }`}>
                                      {item.title}
                                    </h4>
                                    <span className="text-[10px] font-semibold text-gray-400 bg-white px-2 py-0.2 rounded border border-gray-200">
                                      {item.timestamp}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-0.5">{item.subtitle}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : allRawBookings.length > 0 && phoneNumber ? (
                <div className="bg-white rounded-2xl p-8 border border-gray-200/80 shadow-2xs text-center space-y-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <Package className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No Bookings Found</h3>
                  <p className="text-gray-500 text-xs max-w-md mx-auto">
                    No results found for <span className="font-semibold text-gray-800">"{phoneNumber}"</span> in the {activeTab} section.
                  </p>
                  <Button
                    onClick={() => setPhoneNumber('')}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 text-xs h-8"
                  >
                    Show All Bookings
                  </Button>
                </div>
              ) : (
                /* Empty state when no bookings exist yet in database */
                <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-200/80 shadow-2xs text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-display">
                    No Visit Bookings Yet
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    You haven't scheduled any property visits yet. Explore our top properties and schedule a site visit with our experts!
                  </p>
                  <Button
                    onClick={() => navigate('/buy')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 text-xs"
                  >
                    Explore Properties
                  </Button>
                </div>
              )}
            </div>

            {/* ================================================== */}
            {/* RIGHT SIDEBAR WIDGETS (Desktop Only lg:block - Hidden on Mobile) */}
            {/* ================================================== */}
            <div className="hidden lg:block lg:col-span-4 space-y-4">
              
              {/* Widget 1: Visit Journey (Dark Card with Glow Live Timeline - Desktop Rail) */}
              <div className="bg-[#0b1017] rounded-2xl p-4 sm:p-5 border border-slate-800 text-white shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-sm sm:text-base font-bold text-white font-display flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Visit Journey
                  </h3>
                  <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Live Flow
                  </span>
                </div>

                {activeBooking ? (
                  <>
                    <div className="mb-3.5 pb-2.5 border-b border-slate-800/80">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Property</p>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                        {activeBooking.propertyTitle || 'Property Visit'}
                      </h4>
                      <p className="text-xs text-emerald-400 font-medium mt-0.5">
                        {formatDate(activeBooking.date)} at {activeBooking.time} • {activeBooking.assignedAgent || 'Devi Team'}
                      </p>
                    </div>

                    {/* Vertical Timeline connected to Active Booking */}
                    <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-emerald-500/50 before:to-slate-700">
                      {getBookingTimeline(activeBooking).map((item) => (
                        <div key={item.step} className="relative">
                          <div className={`absolute -left-[23px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-[#0b1017] ${
                            item.isCompleted
                              ? 'bg-emerald-500 text-white'
                              : item.isActive
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 border border-slate-700 text-slate-500'
                          }`}>
                            {item.isCompleted ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : (
                              <span className="text-[10px] font-bold">{item.step}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className={`text-xs font-bold ${
                                item.isActive ? 'text-amber-400' : item.isCompleted ? 'text-white' : 'text-slate-400'
                              }`}>
                                {item.title}
                              </h4>
                              <span className={`text-[9px] font-semibold ${
                                item.isActive ? 'text-amber-400' : 'text-slate-500'
                              }`}>
                                {item.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center text-slate-400 space-y-2">
                    <Calendar className="w-7 h-7 mx-auto text-slate-600" />
                    <p className="text-xs">Select a property visit to view its live journey.</p>
                  </div>
                )}

                {/* Contact Box inside Dark Widget */}
                <div className="mt-5 pt-3.5 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Need Help?</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2.5">
                    Our local property specialists are ready to assist you.
                  </p>
                  <a
                    href="https://wa.me/919912991671?text=Hello%2C%20I%20have%20an%20inquiry%20regarding%20my%20property%20booking"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-bold transition-all"
                  >
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Widget 2: Location Insights */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 font-display">
                    Location Insights
                  </h3>
                  <Link to="/buy" className="text-xs text-emerald-600 hover:underline font-semibold flex items-center gap-0.5">
                    <span>See all</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div 
                  onClick={() => navigate('/buy')}
                  className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-900 cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400"
                    alt="Kakinada Map"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5 flex flex-col justify-between">
                    <div className="flex justify-end">
                      <span className="px-1.5 py-0.2 text-[9px] font-bold bg-white/90 text-slate-900 rounded shadow-xs">
                        12+ Areas
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Top Properties Near You</h4>
                      <p className="text-[10px] text-slate-300">Kakinada & Rajahmundry, AP</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget 3: Recommended for You */}
              {recommendedProperties.length > 0 && (
                <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 font-display">
                        Recommended for You
                      </h3>
                      <p className="text-[10px] text-gray-400">Based on popular demand</p>
                    </div>
                    <Link to="/buy" className="text-xs text-emerald-600 hover:underline font-semibold">
                      View All →
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {recommendedProperties.map((prop) => (
                      <div
                        key={prop.id}
                        onClick={() => navigate(`/property/${prop.id}`)}
                        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200/60 cursor-pointer transition-all group"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={prop.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=200'}
                            alt={prop.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                            {prop.title}
                          </h4>
                          <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
                            {formatPriceWithSlash(prop.price)}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {prop.location}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* ======================================================== */}
      {/* BOOKING DETAILS POP-UP MODAL (OVERSCROLL CONTAINED - NO BACKGROUND SCROLL) */}
      {/* ======================================================== */}
      {detailBooking && (() => {
        const statusConfig = getStatusConfig(detailBooking.status);
        const matchedProp = getPropertyDetails(detailBooking.propertyId);
        const propImage = matchedProp?.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600';
        const propTitle = detailBooking.propertyTitle || matchedProp?.title || 'Devi Luxury Property';
        const propLocation = matchedProp?.location || 'Kakinada, Andhra Pradesh';
        const currentStep = detailBooking.currentStep || (detailBooking.status === 'confirmed' ? 3 : detailBooking.status === 'completed' ? 4 : 2);
        const timeline = getBookingTimeline(detailBooking);

        return (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overscroll-contain animate-in fade-in duration-200 select-none"
            onClick={() => setDetailBooking(null)}
            style={{ touchAction: 'none' }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[88vh] overflow-y-auto overscroll-contain touch-pan-y [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shadow-2xl border border-gray-100 flex flex-col relative animate-in zoom-in-95 duration-200 select-text"
              style={{ overscrollBehavior: 'contain' }}
            >
              {/* Header with image preview banner */}
              <div className="relative h-32 sm:h-36 w-full bg-slate-900 overflow-hidden flex-shrink-0">
                <img
                  src={propImage}
                  alt={propTitle}
                  className="w-full h-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* Close Button */}
                <button
                  onClick={() => setDetailBooking(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors backdrop-blur-md z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-xs ${statusConfig.badgeBg}`}>
                    {statusConfig.badgeText}
                  </span>
                </div>

                {/* Banner Property Title */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-base sm:text-lg font-bold font-display leading-tight truncate">
                    {propTitle}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1 truncate mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>{propLocation}</span>
                  </p>
                </div>
              </div>

              {/* Modal Body with hidden scrollbar */}
              <div className="p-4 sm:p-5 space-y-4 text-gray-800">
                
                {/* =================================================== */}
                {/* FULL VISIT JOURNEY TIMELINE (Inside View Details Pop-up) */}
                {/* =================================================== */}
                <div className="bg-[#0b1017] rounded-2xl p-4 sm:p-5 border border-slate-800 text-white shadow-md relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="text-xs sm:text-sm font-bold text-white font-display flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Visit Journey
                    </h4>
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Step {currentStep}/5
                    </span>
                  </div>

                  {/* Connected Vertical 5-Step Timeline */}
                  <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-emerald-500/50 before:to-slate-700">
                    {timeline.map((item) => (
                      <div key={item.step} className="relative">
                        <div className={`absolute -left-[23px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-[#0b1017] ${
                          item.isCompleted
                            ? 'bg-emerald-500 text-white'
                            : item.isActive
                            ? 'bg-amber-500 text-slate-950 ring-amber-400/30'
                            : 'bg-slate-800 border border-slate-700 text-slate-500'
                        }`}>
                          {item.isCompleted ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <span className="text-[10px] font-bold">{item.step}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <h5 className={`text-xs font-bold ${
                              item.isActive ? 'text-amber-400' : item.isCompleted ? 'text-white' : 'text-slate-400'
                            }`}>
                              {item.title}
                            </h5>
                            <span className={`text-[9px] font-semibold ${
                              item.isActive ? 'text-amber-400' : 'text-slate-500'
                            }`}>
                              {item.timestamp}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {detailBooking.adminNote && (
                    <div className="mt-3.5 pt-3 border-t border-slate-800 text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                      <strong className="font-bold text-white">Team Note: </strong>
                      {detailBooking.adminNote}
                    </div>
                  )}
                </div>

                {/* Key Booking Details Grid */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Booking Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Visit Date</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">
                        {formatDate(detailBooking.date)}
                      </p>
                    </div>

                    <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Time Slot</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">
                        {detailBooking.time}
                      </p>
                    </div>

                    <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Visitor Name</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {detailBooking.name || 'Customer'}
                      </p>
                    </div>

                    <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mobile Number</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {detailBooking.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assigned Specialist */}
                <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      DRE
                    </div>
                    <div>
                      <p className="text-[11px] text-emerald-800 font-medium">Assigned Property Specialist</p>
                      <h5 className="text-xs sm:text-sm font-bold text-gray-900">
                        {detailBooking.assignedAgent || 'Devi Team'}
                      </h5>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/919912991671?text=Hello%2C%20I%20have%20a%20question%20regarding%20my%20visit%20booking"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                  >
                    Contact
                  </a>
                </div>

                {/* Customer Note if any */}
                {detailBooking.message && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-1">
                    <p className="text-[11px] font-semibold text-gray-500">Your Message / Requirements:</p>
                    <p className="text-xs text-gray-700">{detailBooking.message}</p>
                  </div>
                )}

                {/* Property Quick Specs */}
                {matchedProp && (
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Property Price:</span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-600 font-display">
                        {formatPriceWithSlash(matchedProp.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Type & Area:</span>
                      <span className="text-xs font-semibold text-gray-800">
                        {matchedProp.type || matchedProp.category} • {formatArea(matchedProp.area)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/70 rounded-b-2xl sm:rounded-b-3xl flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    const id = detailBooking.propertyId;
                    setDetailBooking(null);
                    navigate(`/property/${id}`);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 transition-colors shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>View Property Page</span>
                </button>

                <button
                  onClick={() => setDetailBooking(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer */}
      <FooterRedesign />
    </div>
  );
};

export default BookingHistory;
