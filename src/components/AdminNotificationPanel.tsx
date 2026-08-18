import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Smartphone,
  CheckCircle2,
  Layers,
  History,
  RefreshCw,
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { broadcastPushNotification, sendTestDevicePush } from '@/lib/notificationService';

export const AdminNotificationPanel: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('/');
  const [isSending, setIsSending] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [sentHistory, setSentHistory] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const { toast } = useToast();

  const loadData = async () => {
    setIsLoadingStats(true);
    try {
      // 1. Fetch active push subscriptions
      const subsSnap = await getDocs(collection(db, 'pushSubscriptions'));
      const activeSubs = subsSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((s: any) => s.active !== false);
      setSubscribers(activeSubs);

      // 2. Fetch notification history
      const historyQuery = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const historySnap = await getDocs(historyQuery);
      const historyList = historySnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSentHistory(historyList);
    } catch (e) {
      console.error('Error loading notification stats:', e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyPreset = (preset: {
    title: string;
    message: string;
    url: string;
  }) => {
    setTitle(preset.title);
    setMessage(preset.message);
    setDestinationUrl(preset.url);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter both a title and a message.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const result = await broadcastPushNotification({
        title: title.trim(),
        message: message.trim(),
        url: destinationUrl.trim() || '/',
        audience: 'all',
      });

      if (result.success) {
        toast({
          title: '✓ Notification Sent to All Users',
          description: result.message || 'Notification was delivered to all devices.',
        });
        setTitle('');
        setMessage('');
        setDestinationUrl('/');
        loadData();
      } else {
        toast({
          title: 'Broadcast Failed',
          description: result.message || 'Failed to deliver notification.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'An error occurred while broadcasting.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTestToAdmin = async () => {
    setIsSending(true);
    try {
      const result = await sendTestDevicePush();
      if (result.success) {
        toast({
          title: '🔔 Test Notification Sent',
          description: 'A test notification has been sent directly to your device!',
        });
      } else {
        toast({
          title: 'Test Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to send test push.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const deviceCounts = subscribers.reduce((acc: Record<string, number>, sub) => {
    const dev = sub.device || 'Desktop';
    acc[dev] = (acc[dev] || 0) + 1;
    return acc;
  }, {});

  const presets = [
    {
      label: '🏠 New House/Flat',
      title: '🏠 New Property Available',
      message: 'A luxury 3 BHK residential house is now available in Kakinada. Tap to explore!',
      url: '/buy',
    },
    {
      label: '💰 Price Drop Alert',
      title: '💰 Price Dropped on Listed Property',
      message: 'Great news! A property has reduced its price. Check it out now!',
      url: '/buy',
    },
    {
      label: '📅 Site Visit Reminder',
      title: '📅 Site Visit Reminder',
      message: 'Your scheduled property visit is planned. Our executive will guide you.',
      url: '/my-bookings',
    },
    {
      label: '🎉 Special Offer',
      title: '🎉 Special Festive Property Deals',
      message: 'Exclusive discounts and premium plots available this season. Inquire now!',
      url: '/contact',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">Notification Center</h2>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast notifications to all users and devices with notification permissions enabled.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={handleSendTestToAdmin}
            disabled={isSending}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Notification</span>
          </Button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-100 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Devices</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{subscribers.length}</h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Receiving all alerts
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-100 shadow-sm bg-gradient-to-br from-purple-50/50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Android Phones</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{deviceCounts['Android'] || 0}</h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Android Mobile Devices</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-100 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Desktop & PC</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {(deviceCounts['Windows PC'] || 0) + (deviceCounts['macOS'] || 0) + (deviceCounts['Desktop'] || 0)}
                </h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Computer Browsers</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-100 shadow-sm bg-gradient-to-br from-orange-50/50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Broadcasts</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{sentHistory.length}</h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Logged in notification center</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Send Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border-slate-100 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 font-display">
                    Send Notification to All Users
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Delivers a notification directly to all users and devices.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Quick Template Presets */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Notification Title *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 🏠 New Property Available"
                    required
                    className="rounded-xl border-slate-200 text-sm h-10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Message Content *
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. A new 2 BHK apartment in Kakinada is now available for ₹ 45,00,000/-. Tap to view!"
                    required
                    rows={3}
                    className="rounded-xl border-slate-200 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Destination Page / Link (Opened on Click)
                  </label>
                  <Input
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    placeholder="e.g. /property/123 or /buy or /my-bookings"
                    className="rounded-xl border-slate-200 text-sm h-10 font-mono text-xs"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSending}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-3 h-11 text-sm font-semibold shadow-lg shadow-slate-900/15 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span>{isSending ? 'Sending...' : 'Send Notification to All Users'}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Real-Time Device Preview & Recent History */}
        <div className="space-y-6">
          {/* Live Mobile Notification Preview */}
          <Card className="rounded-3xl border-slate-100 shadow-xl bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 font-display">
                Device Notification Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-md border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <img src="/favicon.png" alt="DRE" className="w-3.5 h-3.5 rounded" />
                    <span className="font-semibold text-slate-200">Devi Real Estates</span>
                  </div>
                  <span>Just now</span>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">
                    {title || '🏠 New Property Available'}
                  </h5>
                  <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                    {message || 'A new property is now available. Tap to view details and photos!'}
                  </p>
                </div>
                <div className="pt-1 text-[10px] text-emerald-400 font-medium">
                  Tap to open: {destinationUrl || '/'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Broadcasts */}
          <Card className="rounded-3xl border-slate-100 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 font-display">
                Recent Notifications History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-64 overflow-y-auto divide-y divide-slate-100">
                {sentHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No notifications sent yet.</p>
                ) : (
                  sentHistory.map((h, i) => (
                    <div key={i} className="pt-2.5 first:pt-0">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800 truncate max-w-[180px]">{h.title}</span>
                        <span className="text-slate-400 text-[10px]">
                          {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{h.message}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
