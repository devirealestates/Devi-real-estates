import React from 'react';
import { useDeviceNotifications } from '@/hooks/useDeviceNotifications';
import {
  Bell,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building,
  Calendar,
  MessageSquare,
  Tag,
  Sparkles,
  Megaphone,
  X,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    permission,
    isSubscribed,
    isLoading,
    preferences,
    enableNotifications,
    disableNotifications,
    updatePreferences,
    sendTestNotification,
  } = useDeviceNotifications();

  const handleToggleCategory = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences({
      ...preferences,
      [key]: value,
    });
  };

  const categories = [
    {
      key: 'propertyUpdates' as const,
      label: 'Property Updates',
      desc: 'Receive alerts when new houses, flats, lands, and commercial spaces are listed.',
      icon: Building,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      key: 'siteVisitReminders' as const,
      label: 'Site Visit Reminders',
      desc: 'Get timely reminders for your scheduled property visits.',
      icon: Calendar,
      color: 'text-purple-500 bg-purple-50',
    },
    {
      key: 'priceChanges' as const,
      label: 'Price Changes',
      desc: 'Be notified when properties you are interested in drop their prices.',
      icon: Tag,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      key: 'enquiryUpdates' as const,
      label: 'Enquiry Updates',
      desc: 'Get instant status notifications when your enquiry is reviewed or assigned.',
      icon: MessageSquare,
      color: 'text-orange-500 bg-orange-50',
    },
    {
      key: 'offers' as const,
      label: 'Offers & Promotions',
      desc: 'Exclusive discount offers, festive property deals, and premium listings.',
      icon: Sparkles,
      color: 'text-pink-500 bg-pink-50',
    },
    {
      key: 'announcements' as const,
      label: 'Important Announcements',
      desc: 'Official platform news, regulatory alerts, and AP RERA updates.',
      icon: Megaphone,
      color: 'text-indigo-500 bg-indigo-50',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border border-slate-100 shadow-2xl bg-white">
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 font-display">
                Device Notifications
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Stay updated about properties, site visits, and important real estate updates.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Permission Status Banner */}
          <div className="rounded-2xl p-4 border transition-all">
            {permission === 'granted' && isSubscribed ? (
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">✓ Notifications Enabled</h4>
                    <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                      Your device is active and receiving instant property alerts.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={sendTestNotification}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold h-8 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Test Push</span>
                </Button>
              </div>
            ) : permission === 'denied' ? (
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">Notifications are blocked</h4>
                    <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                      To receive notifications, please click the lock/settings icon in your browser address bar and change Notifications permission to <strong>Allow</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : permission === 'unsupported' ? (
              <div className="flex items-start gap-3 text-slate-600">
                <Smartphone className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Browser Not Supported</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Web Push notifications are not supported on this browser. On iOS devices, install our PWA to your Home Screen to enable notifications.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Enable Device Notifications</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Get instant OS notifications for new properties and scheduled site visits.
                  </p>
                </div>
                <Button
                  onClick={enableNotifications}
                  disabled={isLoading}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2 h-9 text-xs font-semibold shadow-md flex items-center gap-1.5 w-full sm:w-auto"
                >
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span>{isLoading ? 'Enabling...' : 'Enable Notifications'}</span>
                </Button>
              </div>
            )}
          </div>

          {/* Notification Category Preferences */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Notification Preferences
            </h4>

            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50">
              {categories.map((cat) => (
                <div
                  key={cat.key}
                  className="p-4 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                      <cat.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900 leading-snug">{cat.label}</h5>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{cat.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences[cat.key]}
                    onCheckedChange={(checked) => handleToggleCategory(cat.key, checked)}
                    disabled={permission === 'denied'}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Security Note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>
              We respect your privacy. You can adjust your preferences or disable notifications at any time.
            </span>
          </div>

          {/* Disable Option */}
          {isSubscribed && (
            <div className="pt-2 flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={disableNotifications}
                disabled={isLoading}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
              >
                <BellOff className="w-3.5 h-3.5 mr-1.5" />
                Disable All Notifications
              </Button>

              <Button
                onClick={onClose}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 text-xs font-semibold"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
