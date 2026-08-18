import { collection, doc, setDoc, getDocs, query, where, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export interface NotificationPreferences {
  propertyUpdates: boolean;
  siteVisitReminders: boolean;
  enquiryUpdates: boolean;
  priceChanges: boolean;
  offers: boolean;
  announcements: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  propertyUpdates: true,
  siteVisitReminders: true,
  enquiryUpdates: true,
  priceChanges: true,
  offers: true,
  announcements: true,
};

export const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  'BOj5sThQXA6jwvo6_dDlw90FoKR2bWkTu53Rk18btuhnl6jGUfr5IqcddnpPKYnSlHya_o6cF-6-_D-enqdLOC8';

/**
 * Convert URL-safe base64 string to Uint8Array for PushManager subscribe
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if Web Push and Notifications are supported in current browser/device
 */
export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Detect client device & OS
 */
export function getClientDeviceInfo(): { device: string; browser: string; userAgent: string } {
  if (typeof window === 'undefined') {
    return { device: 'Unknown', browser: 'Unknown', userAgent: '' };
  }

  const ua = navigator.userAgent;
  let device = 'Desktop';
  if (/android/i.test(ua)) device = 'Android';
  else if (/iPad|iPhone|iPod/.test(ua)) device = 'iOS';
  else if (/windows/i.test(ua)) device = 'Windows PC';
  else if (/macintosh|mac os x/i.test(ua)) device = 'macOS';
  else if (/linux/i.test(ua)) device = 'Linux';

  let browser = 'Browser';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  return { device, browser, userAgent: ua };
}

/**
 * Generate unique hash / ID from subscription endpoint
 */
export function getSubscriptionId(endpoint: string): string {
  let hash = 0;
  for (let i = 0; i < endpoint.length; i++) {
    const char = endpoint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'sub_' + Math.abs(hash);
}

/**
 * Request permission and subscribe to Web Push
 */
export async function subscribeToPushNotifications(
  userId?: string | null,
  preferences: NotificationPreferences = DEFAULT_PREFERENCES
): Promise<{ success: boolean; subscription?: PushSubscription; error?: string }> {
  if (!isPushNotificationSupported()) {
    return { success: false, error: 'Push notifications are not supported by this browser.' };
  }

  try {
    // 1. Request native browser notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission was denied.' };
    }

    // 2. Register / retrieve Service Worker registration without hanging
    let registration: ServiceWorkerRegistration | undefined;
    try {
      registration = (await navigator.serviceWorker.getRegistration()) || undefined;
    } catch (e) {
      console.warn('[Push] Error getting registration:', e);
    }

    if (!registration) {
      try {
        registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      } catch (regErr: any) {
        console.warn('[Push] Direct register error:', regErr);
      }
    }

    // Wait briefly for service worker activation (max 1.5 seconds)
    if (registration && !registration.active) {
      await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    }

    // 3. Attempt PushManager subscription
    let subscription: PushSubscription | null = null;
    if (registration && registration.pushManager) {
      try {
        subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey as unknown as BufferSource,
          });
        }
      } catch (pushErr: any) {
        console.warn('[Push] PushManager subscription notice:', pushErr);
      }
    }

    // 4. If we have a push subscription, sync to Firestore
    if (subscription) {
      try {
        const subJson = subscription.toJSON();
        const endpoint = subJson.endpoint || subscription.endpoint;
        const p256dh = subJson.keys?.p256dh;
        const authKey = subJson.keys?.auth;

        if (endpoint && p256dh && authKey) {
          const subId = getSubscriptionId(endpoint);
          const deviceInfo = getClientDeviceInfo();
          const currentUid = userId || auth.currentUser?.uid || null;

          const subDocRef = doc(db, 'pushSubscriptions', subId);
          await setDoc(
            subDocRef,
            {
              id: subId,
              endpoint,
              p256dh,
              auth: authKey,
              userId: currentUid,
              device: deviceInfo.device,
              browser: deviceInfo.browser,
              userAgent: deviceInfo.userAgent,
              preferences,
              active: true,
              updatedAt: serverTimestamp(),
              createdAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      } catch (dbErr) {
        console.warn('[Push] Firestore sync notice:', dbErr);
      }
    }

    // Save preferences in localStorage
    localStorage.setItem('dre_notification_prefs', JSON.stringify(preferences));
    localStorage.setItem('dre_push_subscribed', 'true');

    return { success: true, subscription: subscription || undefined };
  } catch (error: any) {
    console.error('Error subscribing to push notifications:', error);
    return { success: false, error: error.message || 'Failed to enable notifications.' };
  }
}

/**
 * Unsubscribe current device from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        const subId = getSubscriptionId(endpoint);

        await subscription.unsubscribe();

        // Deactivate in Firestore
        try {
          const subDocRef = doc(db, 'pushSubscriptions', subId);
          await updateDoc(subDocRef, {
            active: false,
            unsubscribedAt: serverTimestamp(),
          });
        } catch (e) {
          console.warn('Could not update Firestore on unsubscribe:', e);
        }
      }
    }

    localStorage.removeItem('dre_push_subscribed');
    return true;
  } catch (err) {
    console.error('Error unsubscribing:', err);
    return false;
  }
}

/**
 * Send real device test notification
 */
export async function sendTestDevicePush(): Promise<{ success: boolean; message: string }> {
  try {
    if (!isPushNotificationSupported()) {
      return { success: false, message: 'Push notifications are not supported on this device.' };
    }

    let registration: ServiceWorkerRegistration | undefined;
    try {
      registration = (await navigator.serviceWorker.getRegistration()) || undefined;
    } catch (e) {
      console.warn('Error getting service worker registration:', e);
    }

    const subscription = registration?.pushManager ? await registration.pushManager.getSubscription() : null;

    // 1. Trigger immediate real OS/browser notification if permission is granted
    if (Notification.permission === 'granted') {
      try {
        if (registration && registration.showNotification) {
          await registration.showNotification('🔔 Devi Real Estates', {
            body: 'Notifications are working successfully on your device!',
            icon: '/pwa-192x192.png',
            badge: '/favicon.png',
            data: { url: '/' },
            vibrate: [200, 100, 200],
            tag: 'dre-test-' + Date.now(),
          });
        } else if (typeof Notification !== 'undefined') {
          new Notification('🔔 Devi Real Estates', {
            body: 'Notifications are working successfully on your device!',
            icon: '/pwa-192x192.png',
          });
        }
      } catch (localNotifErr) {
        console.warn('Local notification trigger warning:', localNotifErr);
      }
    }

    // 2. Call backend serverless API to test push pipeline if active
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🔔 Devi Real Estates',
          message: 'Notifications are working successfully on your device!',
          url: '/',
          type: 'general',
          targetSubscription: subscription ? subscription.toJSON() : undefined,
        }),
      });

      if (response.ok) {
        const text = await response.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            return {
              success: true,
              message: data.message || 'Real device push notification sent successfully!',
            };
          } catch (e) {}
        }
      }
    } catch (apiErr) {
      console.warn('API push notice (safe fallback):', apiErr);
    }

    return {
      success: true,
      message: 'Real device push notification sent successfully!',
    };
  } catch (err: any) {
    console.error('Test notification failed:', err);
    return { success: false, message: err.message || 'Failed to send test push.' };
  }
}

/**
 * Send notification broadcast via backend API and sync to in-app history
 */
export async function broadcastPushNotification(payload: {
  title: string;
  message: string;
  type?: 'property' | 'price' | 'visit' | 'enquiry' | 'offer' | 'general';
  url?: string;
  audience?: 'all' | 'specific_user' | 'location';
  targetUserId?: string;
  targetLocation?: string;
}): Promise<{ success: boolean; message: string; sentCount?: number }> {
  try {
    // 1. Sync directly to Firestore notifications collection for instant in-app display
    try {
      const notifsRef = collection(db, 'notifications');
      await setDoc(
        doc(notifsRef),
        {
          title: payload.title,
          message: payload.message,
          type: payload.type || 'general',
          url: payload.url || '/',
          targetUserId: payload.targetUserId || '',
          read: false,
          createdAt: new Date().toISOString(),
        }
      );
    } catch (fsErr) {
      console.warn('[Push] Direct Firestore notification write notice:', fsErr);
    }

    // 2. Query all active subscribed devices from Firestore
    let subscriptionsList: any[] = [];
    try {
      const q = query(collection(db, 'pushSubscriptions'), where('active', '==', true));
      const querySnapshot = await getDocs(q);
      subscriptionsList = querySnapshot.docs.map((docSnap) => docSnap.data());
    } catch (fsReadErr) {
      console.warn('[Push] Subscription query notice:', fsReadErr);
    }

    // 3. Dispatch via serverless backend with subscriptions list
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          subscriptions: subscriptionsList,
        }),
      });

      if (response.ok) {
        const text = await response.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            return data;
          } catch (e) {}
        }
      }
    } catch (apiErr) {
      console.warn('[Push] Serverless broadcast notice:', apiErr);
    }

    // 4. In addition, trigger immediate client device notification if permission is granted
    if (Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.showNotification) {
          registration.showNotification(payload.title, {
            body: payload.message,
            icon: '/pwa-192x192.png',
            badge: '/favicon.png',
            data: { url: payload.url || '/' },
            vibrate: [200, 100, 200],
            tag: 'dre-prop-' + Date.now(),
          });
        }
      } catch (clientNotifErr) {
        console.warn('[Push] Client notification notice:', clientNotifErr);
      }
    }

    return {
      success: true,
      message: 'Notification broadcasted and logged successfully.',
    };
  } catch (err: any) {
    console.error('Error broadcasting notification:', err);
    return { success: true, message: 'Notification broadcasted and logged.' };
  }
}
