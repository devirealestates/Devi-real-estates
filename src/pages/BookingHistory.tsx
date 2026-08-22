import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import HeaderRedesign from '@/components/HeaderRedesign';
import FooterRedesign from '@/components/FooterRedesign';
import { Button } from '@/components/ui/button';
import { useRealtimeProperties, Property } from '@/hooks/useRealtimeProperties';
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
  RefreshCw,
  LayoutDashboard,
  Compass,
  Eye,
  Heart,
  MessageSquare,
  Bell,
  Star,
  TrendingUp,
  BookOpen,
  Users,
  Play,
  FileText,
  Headphones,
  MapPin,
  Building,
  ChevronDown,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  Share2,
  CalendarCheck,
  Check,
  ExternalLink
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { formatPriceWithSlash } from '@/lib/utils';

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
type ViewMode = 'card' | 'timeline';

const BookingHistory: React.FC = () => {
  const navigate = useNavigate();
  const { properties } = useRealtimeProperties();
  const [bookings, setBookings] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [activeSidebarNav, setActiveSidebarNav] = useState('bookings');

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

  // Counts
  const totalCount = bookings.length;
  const upcomingCount = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
  const visitedCount = bookings.filter(b => b.status === 'completed').length;
  const rejectedCount = bookings.filter(b => b.status === 'rejected').length;

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
          label: 'Visit Confirmed',
          shortLabel: 'Confirmed',
          badgeText: 'Upcoming Visit',
          bgColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
          badgeBg: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
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
          bgColor: 'bg-teal-500/10 text-teal-600 border-teal-500/30',
          badgeBg: 'bg-teal-500/15 text-teal-700 border-teal-500/30',
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
          bgColor: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
          badgeBg: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
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
          bgColor: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
          badgeBg: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
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
              <Link
                to="/"
                onClick={() => setActiveSidebarNav('dashboard')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeSidebarNav === 'dashboard'
                    ? 'bg-white/10 text-white shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 text-slate-400" />
                <span>Dashboard</span>
              </Link>

              {/* My Bookings - Active Highlight Pill */}
              <div className="relative">
                <button
                  onClick={() => {
                    setActiveSidebarNav('bookings');
                    setActiveTab('all');
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

              <Link
                to="/shortlist"
                onClick={() => setActiveSidebarNav('saved')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeSidebarNav === 'saved'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Heart className="w-5 h-5 text-slate-400" />
                <span>Saved Properties</span>
              </Link>

              <Link
                to="/contact"
                onClick={() => setActiveSidebarNav('inbox')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeSidebarNav === 'inbox'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                  <span>Inbox</span>
                </div>
                <span className="w-5 h-5 text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </Link>

              <Link
                to="/"
                onClick={() => setActiveSidebarNav('notifications')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeSidebarNav === 'notifications'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Bell className="w-5 h-5 text-slate-400" />
                  <span>Notifications</span>
                </div>
                <span className="w-5 h-5 text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center font-bold">
                  5
                </span>
              </Link>
            </div>

            {/* Section Divider: MORE */}
            <div>
              <div className="flex items-center gap-3 px-4 mb-2">
                <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase font-display">MORE</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <div className="space-y-1">
                <Link
                  to="/shortlist"
                  className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Star className="w-4 h-4 text-slate-400" />
                  <span>Shortlisted</span>
                </Link>

                <Link
                  to="/emi-calculator"
                  className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <span>Price Alerts</span>
                </Link>

                <Link
                  to="/about"
                  className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>Property Guide</span>
                </Link>

                <Link
                  to="/commercial"
                  className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Communities</span>
                </Link>
              </div>
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          
          {/* Mobile Top Navigation & Back */}
          <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200/60 rounded-xl transition-colors flex items-center gap-2 text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold text-base font-display">Back</span>
            </button>
            <h1 className="text-lg font-bold text-gray-900 font-display">My Bookings</h1>
            <button
              onClick={refreshBookings}
              className="p-2 hover:bg-gray-200/60 rounded-xl text-gray-700"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* ---------------------------------------------------- */}
          {/* TOP BAR: SEARCH & QUICK ACTION BUTTONS */}
          {/* ---------------------------------------------------- */}
          <div className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between mb-6">
            {/* Phone Number Search Input */}
            <div className="flex-1 max-w-2xl">
              <div className="bg-white rounded-2xl border border-gray-200/90 p-2 sm:p-2.5 shadow-sm flex items-center gap-2 sm:gap-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                {/* Country Code Pill */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-xs sm:text-sm font-semibold flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+91</span>
                  <ChevronDown className="w-3 h-3 text-gray-400 ml-0.5" />
                </div>

                {/* Number Input */}
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter phone number to track bookings..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm sm:text-base font-medium min-w-0"
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
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
                    title="Clear"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}

                {/* Action Button */}
                <button
                  onClick={searchBookings}
                  disabled={loading || !phoneNumber.trim()}
                  className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
                >
                  <span>Track Bookings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Action Tiles on Desktop */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => navigate('/buy')}
                className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-2xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-700 shadow-xs transition-all"
              >
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Schedule Visit</span>
              </button>

              <button
                onClick={() => navigate('/about')}
                className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-2xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-700 shadow-xs transition-all"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Download Brochure</span>
              </button>

              <a
                href="tel:+919912991671"
                className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-2xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-700 shadow-xs transition-all"
              >
                <Headphones className="w-4 h-4 text-emerald-600" />
                <span>Chat with Agent</span>
              </a>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* STATS SUMMARY ROW (4 CARDS AS IN IMAGE) */}
          {/* ---------------------------------------------------- */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {/* Card 1: Total Bookings */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
              <div className="space-y-1 z-10">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Total Bookings</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">
                    {searched ? totalCount : 0}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    +24%
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">All time requests</p>
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden opacity-90 flex-shrink-0 bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=200"
                  alt="Total Building"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            </div>

            {/* Card 2: Upcoming */}
            <div 
              onClick={() => setActiveTab('upcoming')}
              className={`bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group cursor-pointer hover:shadow-md transition-all ${
                activeTab === 'upcoming' ? 'ring-2 ring-amber-500/50 bg-amber-50/20' : ''
              }`}
            >
              <div className="space-y-1 z-10">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Upcoming</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">
                    {searched ? upcomingCount : 0}
                  </span>
                  {upcomingCount > 0 && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                      {upcomingCount} this week
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">Scheduled visits</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500 flex-shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Visited */}
            <div 
              onClick={() => setActiveTab('visited')}
              className={`bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group cursor-pointer hover:shadow-md transition-all ${
                activeTab === 'visited' ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : ''
              }`}
            >
              <div className="space-y-1 z-10">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Visited</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">
                    {searched ? visitedCount : 0}
                  </span>
                  {visitedCount > 0 && (
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                      Great choices!
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">Completed visits</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Eye className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Rejected */}
            <div 
              onClick={() => setActiveTab('rejected')}
              className={`bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group cursor-pointer hover:shadow-md transition-all ${
                activeTab === 'rejected' ? 'ring-2 ring-rose-500/50 bg-rose-50/20' : ''
              }`}
            >
              <div className="space-y-1 z-10">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Rejected</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">
                    {searched ? rejectedCount : 0}
                  </span>
                  {rejectedCount > 0 && (
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md">
                      Last 30 days
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">Cancelled/Declined</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-500 flex-shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* MAIN DUAL COLUMN CONTENT: LEFT (BOOKINGS) + RIGHT (WIDGETS) */}
          {/* ---------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ================================================== */}
            {/* LEFT MAIN SECTION: YOUR BOOKING REQUESTS (col-span-8) */}
            {/* ================================================== */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Header Container */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <CalendarCheck className="w-4 h-4" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-display">
                        Your Booking Requests
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-10">
                      Manage and track each property request
                    </p>
                  </div>

                  {/* Right View Switchers & Tabs */}
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-semibold">
                      <button
                        onClick={() => setViewMode('card')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          viewMode === 'card'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Card View
                      </button>
                      <button
                        onClick={() => setViewMode('timeline')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          viewMode === 'timeline'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Timeline View
                      </button>
                    </div>

                    <button
                      onClick={refreshBookings}
                      className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 overflow-x-auto pb-1 scrollbar-hide">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                        activeTab === tab.id
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {searched && (
                        <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                          activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings List Content */}
              {loading ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-200/80 shadow-xs text-center space-y-4">
                  <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-gray-600 font-medium text-sm">Fetching your booking details...</p>
                </div>
              ) : searched && filteredBookings.length > 0 ? (
                <div className="space-y-4">
                  {filteredBookings.map((booking, index) => {
                    const statusConfig = getStatusConfig(booking.status);
                    const StatusIcon = statusConfig.icon;
                    const matchedProperty = getPropertyDetails(booking.propertyId);
                    const propImage = matchedProperty?.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600';
                    const propTitle = booking.propertyTitle || matchedProperty?.title || 'Devi Luxury Property';
                    const propLocation = matchedProperty?.location || 'Kakinada, Andhra Pradesh';
                    const propBedrooms = matchedProperty?.bedrooms ? `${matchedProperty.bedrooms} BHK ` : '';
                    const propType = matchedProperty?.type || matchedProperty?.category || 'Luxury Property';
                    const propArea = matchedProperty?.area ? `${matchedProperty.area} Sq.Ft` : 'Prime Area';
                    const propFacing = matchedProperty?.facing ? `${matchedProperty.facing} Facing` : 'East Facing';

                    return (
                      <div
                        key={booking.id}
                        className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 relative group"
                      >
                        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                          
                          {/* Left: Image & Badge */}
                          <div className="flex items-start gap-4">
                            <div className="relative w-28 h-24 sm:w-36 sm:h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-xs">
                              <img
                                src={propImage}
                                alt={propTitle}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {/* Status Tag Pill on Image */}
                              <div className="absolute top-2 left-2 z-10">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md ${statusConfig.badgeBg}`}>
                                  {statusConfig.badgeText}
                                </span>
                              </div>
                            </div>

                            {/* Middle Details */}
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 hover:text-emerald-600 transition-colors truncate">
                                  {propTitle}
                                </h3>
                                {matchedProperty?.featured && (
                                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 rounded-full">
                                    Featured
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span>{propLocation}</span>
                              </p>

                              <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap pt-0.5">
                                <span className="font-medium">{propBedrooms}{propType}</span>
                                <span>•</span>
                                <span>{propArea}</span>
                                <span>•</span>
                                <span>{propFacing}</span>
                              </div>

                              {/* Date & Assigned Agent */}
                              <div className="flex items-center gap-3 text-xs pt-1 flex-wrap text-slate-700">
                                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/60 px-2.5 py-1 rounded-lg">
                                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="font-semibold">{formatDate(booking.date)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/60 px-2.5 py-1 rounded-lg">
                                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="font-semibold">{booking.time}</span>
                                </div>
                                <span className="text-gray-400 text-xs">
                                  Agent: <strong className="text-gray-700 font-semibold">Devi Team</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex md:flex-col items-center md:items-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 flex-shrink-0">
                            <button
                              onClick={() => navigate(`/property/${booking.propertyId}`)}
                              className="flex-1 md:flex-initial px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-emerald-500 rounded-xl text-xs font-bold text-gray-800 transition-all shadow-2xs"
                            >
                              View Details
                            </button>

                            {booking.status === 'pending' || booking.status === 'confirmed' ? (
                              <a
                                href="tel:+919912991671"
                                className="flex-1 md:flex-initial px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs text-center"
                              >
                                Reschedule
                              </a>
                            ) : (
                              <a
                                href="tel:+919912991671"
                                className="flex-1 md:flex-initial px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all text-center"
                              >
                                Contact
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Customer note if exists */}
                        {booking.message && (
                          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-2">
                            <span className="font-semibold text-gray-700">Note:</span>
                            <span className="truncate">{booking.message}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : searched ? (
                <div className="bg-white rounded-2xl p-10 border border-gray-200/80 shadow-xs text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No Bookings Found</h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    We could not find any {activeTab !== 'all' ? activeTab : ''} bookings for <span className="font-semibold text-gray-800">{phoneNumber}</span>.
                  </p>
                  <Button
                    onClick={() => navigate('/buy')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6"
                  >
                    Browse Available Properties
                  </Button>
                </div>
              ) : (
                /* Initial State When No Search Yet */
                <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-200/80 shadow-xs text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                    <Search className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-display">
                    Track Your Property Bookings
                  </h3>
                  <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
                    Enter your registered 10-digit mobile number above to access real-time status of your scheduled property visits and visit history.
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                    <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">✓ Verified Status</span>
                    <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">✓ Instant Reschedule</span>
                    <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">✓ Agent Direct Connect</span>
                  </div>
                </div>
              )}
            </div>

            {/* ================================================== */}
            {/* RIGHT SIDEBAR WIDGETS (col-span-4) */}
            {/* ================================================== */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Widget 1: Visit Journey (Dark Card with Glow Timeline) */}
              <div className="bg-[#0b1017] rounded-2xl p-5 border border-slate-800 text-white shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Visit Journey
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Live Flow
                  </span>
                </div>

                {/* Vertical Timeline */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-emerald-500/50 before:to-slate-700">
                  
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -left-[23px] top-0.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-[#0b1017]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">Request Submitted</h4>
                        <span className="text-[10px] text-slate-400">Step 1</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">You requested a site visit</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute -left-[23px] top-0.5 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 ring-4 ring-[#0b1017]">
                      <Clock className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">Under Review</h4>
                        <span className="text-[10px] text-amber-400 font-semibold">Active</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Our team is verifying schedule</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className="absolute -left-[23px] top-0.5 w-5 h-5 rounded-full bg-slate-800 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 ring-4 ring-[#0b1017]">
                      <Calendar className="w-2.5 h-2.5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-300">Visit Scheduled</h4>
                        <span className="text-[10px] text-slate-500">Step 3</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Agent confirmation & route</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <div className="absolute -left-[23px] top-0.5 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 ring-4 ring-[#0b1017]">
                      <Eye className="w-2.5 h-2.5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-400">Property Visit</h4>
                        <span className="text-[10px] text-slate-500">Step 4</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Physical property walkthrough</p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative">
                    <div className="absolute -left-[23px] top-0.5 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 ring-4 ring-[#0b1017]">
                      <Home className="w-2.5 h-2.5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-400">Decision & Booking</h4>
                        <span className="text-[10px] text-slate-500">Step 5</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Book your dream property</p>
                    </div>
                  </div>
                </div>

                {/* Need Help? Box inside Dark Widget */}
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Need Help?</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Our local property experts are ready to assist you.
                  </p>
                  <a
                    href="tel:+919912991671"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-bold transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call +91 99129 91671</span>
                  </a>
                </div>
              </div>

              {/* Widget 2: Location Insights */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 font-display">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-between">
                    <div className="flex justify-end">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-white/90 text-slate-900 rounded-md shadow-xs">
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
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 font-display">
                        Recommended for You
                      </h3>
                      <p className="text-[11px] text-gray-400">Based on popular demand</p>
                    </div>
                    <Link to="/buy" className="text-xs text-emerald-600 hover:underline font-semibold">
                      View All →
                    </Link>
                  </div>

                  <div className="space-y-2.5">
                    {recommendedProperties.map((prop) => (
                      <div
                        key={prop.id}
                        onClick={() => navigate(`/property/${prop.id}`)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200/60 cursor-pointer transition-all group"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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

      {/* Footer */}
      <FooterRedesign />
    </div>
  );
};

export default BookingHistory;
