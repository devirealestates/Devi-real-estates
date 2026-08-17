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
  Settings,
  ExternalLink,
  Trash2,
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
  where,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationPreferencesModal } from '@/components/NotificationPreferencesModal';
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();
  const { isSubscribed, permission } = useDeviceNotifications();

  // Listen to in-app notifications from Firestore in real time
  useEffect(() => {
    try {
      const q = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(20)
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
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
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
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-80 sm:w-96 p-0 rounded-3xl border border-slate-100 shadow-2xl bg-white overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 font-display">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-7 px-2 text-[11px] font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
                  title="Mark all as read"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                title="Notification Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100 text-xs px-3 bg-white">
            <button
              onClick={() => setActiveFilter('all')}
              className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'border-orange-500 text-orange-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                activeFilter === 'unread'
                  ? 'border-orange-500 text-orange-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  You'll be notified here when new properties or visits are updated.
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                    !n.read ? 'bg-orange-50/30' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className={`text-xs truncate ${!n.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {n.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
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

          {/* Footer Bar */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs px-3">
            <span className="text-[11px] text-slate-500">
              {isSubscribed ? '🟢 Device Push Active' : '⚪ Device Push Disabled'}
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsSettingsOpen(true);
              }}
              className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Configure Push Settings →
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
