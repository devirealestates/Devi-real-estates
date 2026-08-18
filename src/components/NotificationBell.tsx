import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  Building,
  Calendar,
  Tag,
  MessageSquare,
  Sparkles,
  Megaphone,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useDeviceNotifications } from '@/hooks/useDeviceNotifications';

interface InAppNotification {
  id: string;
  title: string;
  message: string;
  url?: string;
  type?: 'property' | 'price' | 'visit' | 'enquiry' | 'offer' | 'general';
  read?: boolean;
  createdAt?: any;
}

interface NotificationBellProps {
  isHomePage?: boolean;
  isScrolled?: boolean;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  isHomePage = false,
  isScrolled = false,
  className = '',
}) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();
  const { permission, isLoading, enableNotifications } = useDeviceNotifications();

  // Listen to in-app notifications from Firestore in real time
  useEffect(() => {
    try {
      const q = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(30)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: InAppNotification[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              title: data.title || 'Devi Real Estates Update',
              message: data.message || '',
              url: data.url || '/',
              type: data.type || 'general',
              read: data.read || false,
              createdAt: data.createdAt,
            };
          });
          setNotifications(items);
        },
        (err) => {
          console.warn('Error listening to notifications:', err);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Notifications listener setup error:', e);
    }
  }, []);

  // Lock body scroll when notification sidebar/full screen is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notification: InAppNotification) => {
    setIsOpen(false);

    // Mark as read in Firestore
    try {
      const docRef = doc(db, 'notifications', notification.id);
      await updateDoc(docRef, { read: true });
    } catch (e) {
      console.warn('Error marking notification read:', e);
    }

    // Navigate to destination URL
    if (notification.url) {
      navigate(notification.url);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      if (unread.length === 0) return;
      const batch = writeBatch(db);
      unread.forEach((n) => {
        const docRef = doc(db, 'notifications', n.id);
        batch.update(docRef, { read: true });
      });
      await batch.commit();
    } catch (e) {
      console.error('Error marking all as read:', e);
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'property':
        return <Building className="w-4 h-4 text-blue-500" />;
      case 'visit':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'price':
        return <Tag className="w-4 h-4 text-emerald-500" />;
      case 'enquiry':
        return <MessageSquare className="w-4 h-4 text-orange-500" />;
      case 'offer':
        return <Sparkles className="w-4 h-4 text-pink-500" />;
      default:
        return <Megaphone className="w-4 h-4 text-indigo-500" />;
    }
  };

  const formatTime = (timeStr?: any) => {
    if (!timeStr) return 'Recently';
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return 'Recently';
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const filteredNotifications =
    activeFilter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`relative p-2 rounded-full transition-all duration-300 ${
          isHomePage && !isScrolled
            ? 'text-white hover:bg-white/10'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
        } ${className}`}
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Drawer / Slide-Over & Mobile Full Screen */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Panel Container (Mobile: Fullscreen, Desktop: Right Slide-over Sidebar) */}
          <div className="relative w-full h-full bg-white shadow-2xl z-10 flex flex-col md:max-w-md md:border-l md:border-slate-200 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                {/* Mobile Back Arrow Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 active:scale-95 rounded-full transition-colors md:hidden"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center hidden sm:flex">
                  <Bell className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-700 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="h-8 px-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                    title="Mark all as read"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Mark all read
                  </Button>
                )}

                {/* Desktop Close Icon */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors hidden md:flex"
                  title="Close notifications"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Simple Enable Push Banner (only if permission not granted yet) */}
            {permission !== 'granted' && typeof Notification !== 'undefined' && (
              <div className="p-3.5 bg-orange-50/80 border-b border-orange-100 flex items-center justify-between gap-3 flex-shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Enable Phone Alerts</p>
                    <p className="text-[11px] text-slate-600 truncate">Receive property updates on your device</p>
                  </div>
                </div>
                <Button
                  onClick={enableNotifications}
                  disabled={isLoading}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold h-7 px-3 flex-shrink-0 shadow-sm"
                >
                  {isLoading ? '...' : 'Allow'}
                </Button>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex border-b border-slate-100 text-xs px-4 bg-white flex-shrink-0">
              <button
                onClick={() => setActiveFilter('all')}
                className={`py-3 px-3 border-b-2 font-semibold transition-colors ${
                  activeFilter === 'all'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveFilter('unread')}
                className={`py-3 px-3 border-b-2 font-semibold transition-colors ${
                  activeFilter === 'unread'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
              {filteredNotifications.length === 0 ? (
                <div className="py-20 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Bell className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">No notifications yet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    You will receive notifications here whenever new properties, price updates, or visits are scheduled.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 flex items-start gap-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                      !n.read ? 'bg-orange-50/30' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getTypeIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5
                          className={`text-xs sm:text-sm truncate ${
                            !n.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                          }`}
                        >
                          {n.title}
                        </h5>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0">
                          {formatTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
