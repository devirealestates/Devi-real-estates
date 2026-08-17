import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Smartphone,
  Users,
  CheckCircle2,
  AlertCircle,
  Building,
  Tag,
  Calendar,
  MessageSquare,
  Sparkles,
  Megaphone,
  Layers,
  History,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { broadcastPushNotification, sendTestDevicePush } from '@/lib/notificationService';

export const AdminNotificationPanel: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'property' | 'price' | 'visit' | 'enquiry' | 'offer' | 'general'>('property');
  const [audience, setAudience] = useState<'all' | 'specific_user' | 'location'>('all');
  const [destinationUrl, setDestinationUrl] = useState('/');
  const [targetLocation, setTargetLocation] = useState('');
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
    type: any;
    url: string;
  }) => {
    setTitle(preset.title);
    setMessage(preset.message);
    setType(preset.type);
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
        type,
        url: destinationUrl.trim() || '/',
        audience,
        targetLocation: targetLocation.trim() || undefined,
      });

      if (result.success) {
        toast({
          title: '✓ Push Notification Broadcasted',
          description: result.message || 'Notification was delivered to active devices.',
        });
        setTitle('');
        setMessage('');
        setDestinationUrl('/');
        loadData();
      } else {
        toast({
          title: 'Broadcast Failed',
          description: result.message || 'Failed to deliver push notification.',
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
          title: '🔔 Test Push Sent',
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
      type: 'property' as const,
      url: '/buy',
    },
    {
      label: '💰 Price Drop Alert',
      title: '💰 Price Dropped on Listed Property',
      message: 'Great news! A property you were viewing has reduced its price. Check it out!',
      type: 'price' as const,
      url: '/buy',
    },
    {
      label: '📅 Site Visit Reminder',
      title: '📅 Site Visit Reminder for Tomorrow',
      message: 'Your scheduled property visit is planned for tomorrow. Our executive will guide you.',
      type: 'visit' as const,
      url: '/my-bookings',
    },
    {
      label: '🎉 Festive Property Offer',
      title: '🎉 Special Festive Property Deals',
      message: 'Exclusive discounts and premium plots available this festival season. Inquire now!',
      type: 'offer' as const,
      url: '/contact',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">Push Notification Center</h2>
          <p className="text-xs text-slate-500 mt-1">
            Send real-time device push notifications to all subscribed mobile and desktop devices.
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
            <span>Send Test to My Device</span>
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
              Subscribed to Web Push
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
            <p className="text-[11px] text-slate-500 mt-3">Native Android Chrome/PWA</p>
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
            <p className="text-[11px] text-slate-500 mt-3">Windows & macOS Desktops</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-100 shadow-sm bg-gradient-to-br from-orange-50/50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Broadcasts Sent</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{sentHistory.length}</h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Logged in notification history</p>
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
                    Create Push Notification
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Dispatches real OS push notifications to eligible user devices.
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
                    placeholder="e.g. A new 2 BHK apartment in Thimmapuram, Kakinada is now available for ₹ 45,00,000/-. Tap to view!"
                    required
                    rows={3}
                    className="rounded-xl border-slate-200 text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Notification Type
                    </label>
                    <Select value={type} onValueChange={(val: any) => setType(val)}>
                      <SelectTrigger className="rounded-xl border-slate-200 h-10 text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="property">🏠 New Property</SelectItem>
                        <SelectItem value="price">💰 Price Update</SelectItem>
                        <SelectItem value="visit">📅 Site Visit</SelectItem>
                        <SelectItem value="enquiry">🔥 Enquiry Update</SelectItem>
                        <SelectItem value="offer">🎉 Offer & Promo</SelectItem>
                        <SelectItem value="general">📢 General Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Target Audience
                    </label>
                    <Select value={audience} onValueChange={(val: any) => setAudience(val)}>
                      <SelectTrigger className="rounded-xl border-slate-200 h-10 text-sm">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">🌐 All Subscribed Devices</SelectItem>
                        <SelectItem value="location">📍 Location-Specific</SelectItem>
                        <SelectItem value="specific_user">👤 Specific User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Destination URL (Opened on Click)
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
                    disabled={isSending || subscribers.length === 0}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-3 h-11 text-sm font-semibold shadow-lg shadow-slate-900/15 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span>{isSending ? 'Broadcasting...' : `Send Notification to ${subscribers.length} Device(s)`}</span>
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
                Device Popup Preview
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
                    {message || 'A new property matching your interests is now available. Tap to view!'}
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
                Recent Broadcast History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-64 overflow-y-auto divide-y divide-slate-100">
                {sentHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No broadcasts sent yet.</p>
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
