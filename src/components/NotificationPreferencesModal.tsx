import React from 'react';
import { useDeviceNotifications } from '@/hooks/useDeviceNotifications';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  MessageSquare,
  Tag,
  Sparkles,
  Megaphone,
  Smartphone,
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
    updatePreferences,
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
                Notification Settings
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Choose which property updates and alerts you want to receive.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className="rounded-2xl p-4 border transition-all">
            {permission === 'granted' && isSubscribed ? (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">✓ Notifications are Active</h4>
                  <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                    You will receive instant alerts for new properties and updates.
                  </p>
                </div>
              </div>
            ) : permission === 'denied' ? (
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">Notifications are blocked</h4>
                    <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                      To receive notifications, please tap the lock/settings icon in your browser address bar and set Notifications to <strong>Allow</strong>.
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
                    Notifications are not supported on this browser. On iOS devices, install our app to your Home Screen to receive notifications.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Enable Notifications</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Get instant notifications for new property listings and visit updates.
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
              Preferences
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
                      <h5 className="text-sm font-semibold text-slate-900">{cat.label}</h5>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{cat.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences[cat.key]}
                    onCheckedChange={(checked) => handleToggleCategory(cat.key, checked)}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <Button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 text-xs font-semibold h-9"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
