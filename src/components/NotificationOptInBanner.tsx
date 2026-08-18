import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeviceNotifications } from '@/hooks/useDeviceNotifications';

export const NotificationOptInBanner: React.FC = () => {
  const { permission, isSubscribed, isLoading, enableNotifications } = useDeviceNotifications();
  const [isDismissed, setIsDismissed] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Only show if notifications are supported and permission is 'default' (not yet allowed or denied)
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
    if (Notification.permission !== 'default') return;

    // Check if dismissed within last 7 days
    const dismissedUntil = localStorage.getItem('dre_notification_banner_dismissed');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // Delay slightly after initial load (1.5s)
    const timer = setTimeout(() => {
      setIsDismissed(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [permission, isSubscribed]);

  // Don't show on admin dashboard, login, or signup pages
  const isExcludedPage =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/login' ||
    location.pathname === '/signup';

  if (isDismissed || permission !== 'default' || isExcludedPage) {
    return null;
  }

  const handleAllow = async () => {
    await enableNotifications();
    setIsDismissed(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('dre_notification_banner_dismissed', nextWeek.toString());
  };

  return (
    <aside
      aria-label="Notification opt-in banner"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-orange-500/20">
          <Bell className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-sm font-bold text-slate-900 truncate font-display">
              Enable Notifications
            </h4>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 rounded-full transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Turn on notifications to receive new property alerts, offers and important updates.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <Button
              onClick={handleAllow}
              disabled={isLoading}
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold px-4 h-8 shadow-sm flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isLoading ? 'Enabling...' : 'Enable Notifications'}</span>
            </Button>

            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-800 rounded-xl text-xs h-8 px-3"
            >
              Not Now
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};
