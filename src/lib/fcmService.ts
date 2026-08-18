import { getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { collection, doc, setDoc, getDocs, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, auth, getFCMInstance, FCM_VAPID_KEY } from '@/lib/firebase';
import { getClientDeviceInfo } from '@/lib/notificationService';

/**
 * Requests FCM Registration Token and registers device in Firestore
 */
export async function registerFCMDevice(): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { success: false, error: 'Notifications are not supported on this browser.' };
    }

    // 1. Request Browser Notification Permission if not yet granted
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
    }

    if (perm !== 'granted') {
      return { success: false, error: 'Notification permission was denied.' };
    }

    // 2. Obtain Firebase Messaging Instance
    const messaging = await getFCMInstance();
    if (!messaging) {
      return { success: false, error: 'Firebase Messaging is not supported on this device/browser.' };
    }

    // 3. Register or obtain Service Worker Registration for firebase-messaging-sw.js
    let swRegistration: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      try {
        // Register the firebase messaging service worker
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        await navigator.serviceWorker.ready;
      } catch (swErr) {
        console.warn('[FCM] ServiceWorker registration warning:', swErr);
      }
    }

    // 4. Retrieve FCM Device Token
    const token = await getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      return { success: false, error: 'Failed to generate FCM device token.' };
    }

    console.log('[FCM] Device Token obtained:', token);

    // 5. Store Token in Firestore (fcmTokens collection)
    const deviceInfo = getClientDeviceInfo();
    const currentUid = auth.currentUser?.uid || null;

    // Use a clean hash/identifier for document ID
    const tokenId = btoa(token).replace(/[/+=]/g, '').slice(0, 40);

    const tokenDocRef = doc(db, 'fcmTokens', tokenId);
    await setDoc(
      tokenDocRef,
      {
        token,
        userId: currentUid,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        userAgent: deviceInfo.userAgent,
        active: true,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Store in localStorage for instant UI recognition
    localStorage.setItem('dre_fcm_token', token);
    localStorage.setItem('dre_push_subscribed', 'true');

    return { success: true, token };
  } catch (err: any) {
    console.error('[FCM] Error registering FCM device:', err);
    return { success: false, error: err.message || 'Failed to register FCM device.' };
  }
}

/**
 * Setup foreground listener for when user is actively inside the web app
 */
export function setupFCMForegroundListener(
  onNotificationReceived?: (payload: MessagePayload) => void
): () => void {
  let unsubscribe = () => {};

  getFCMInstance().then((messaging) => {
    if (!messaging) return;

    unsubscribe = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground notification received:', payload);

      if (onNotificationReceived) {
        onNotificationReceived(payload);
      } else {
        // Fallback: Trigger browser notification if granted
        if (Notification.permission === 'granted') {
          const title = payload.notification?.title || payload.data?.title || 'Devi Real Estates';
          const body = payload.notification?.body || payload.data?.body || payload.data?.message || 'New update';
          new Notification(title, {
            body,
            icon: payload.notification?.icon || payload.data?.icon || '/pwa-192x192.png',
          });
        }
      }
    });
  });

  return () => unsubscribe();
}

/**
 * Fetch all registered FCM tokens from Firestore
 */
export async function getAllFCMTokens(): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, 'fcmTokens'));
    return snap.docs
      .map((d) => d.data())
      .filter((d: any) => d.active !== false && d.token)
      .map((d: any) => d.token as string);
  } catch (e) {
    console.error('[FCM] Error fetching FCM tokens:', e);
    return [];
  }
}
