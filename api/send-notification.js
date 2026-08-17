import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || 'BOj5sThQXA6jwvo6_dDlw90FoKR2bWkTu53Rk18btuhnl6jGUfr5IqcddnpPKYnSlHya_o6cF-6-_D-enqdLOC8';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'kL1rqmwIbHlUxziiMFDfBhqZmGg3yDagw3WNeV8f6_A';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:info.devirealestates@gmail.com';

const FIRESTORE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'devirealestates-a550f';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents`;

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.error('[WebPush] Error setting VAPID details:', e);
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      title = 'Devi Real Estates',
      message = 'You have a new update from Devi Real Estates.',
      body,
      url = '/',
      type = 'general',
      audience = 'all',
      targetUserId = null,
      targetLocation = null,
      targetSubscription = null,
      icon = '/pwa-192x192.png',
      badge = '/favicon.png',
      tag = 'dre-push-' + Date.now(),
    } = req.body || {};

    const notificationBody = body || message;
    const payload = JSON.stringify({
      title,
      body: notificationBody,
      icon,
      badge,
      data: {
        url,
        type,
        timestamp: Date.now(),
      },
      tag,
    });

    // 1. If a single target subscription is passed directly (e.g. instant test)
    if (targetSubscription && targetSubscription.endpoint) {
      try {
        await webpush.sendNotification(targetSubscription, payload);
        return res.status(200).json({
          success: true,
          message: 'Direct push notification sent successfully',
          sentCount: 1,
          failedCount: 0,
        });
      } catch (err) {
        console.error('[WebPush] Direct push failed:', err);
        return res.status(500).json({
          success: false,
          error: err.message || 'Direct push failed',
          statusCode: err.statusCode,
        });
      }
    }

    // 2. Query active subscriptions from Firestore
    const subscriptions = await fetchSubscriptionsFromFirestore({
      audience,
      targetUserId,
      targetLocation,
      type,
    });

    if (!subscriptions || subscriptions.length === 0) {
      // Save notification to in-app history even if no push subscribers yet
      await saveNotificationToFirestore({
        title,
        message: notificationBody,
        url,
        type,
        targetUserId,
        createdAt: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        message: 'No active device subscriptions matched. Notification saved to in-app history.',
        sentCount: 0,
        failedCount: 0,
        totalSubscriptions: 0,
      });
    }

    let sentCount = 0;
    let failedCount = 0;
    const failedEndpoints = [];

    // 3. Dispatch Web Push to all matching subscriptions
    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          const pushConfig = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };
          await webpush.sendNotification(pushConfig, payload);
          sentCount++;
        } catch (err) {
          failedCount++;
          console.warn(`[WebPush] Failed sending to endpoint (${err.statusCode}):`, sub.id);
          // If subscription is expired (410 Gone / 404 Not Found), track for cleanup
          if (err.statusCode === 410 || err.statusCode === 404) {
            failedEndpoints.push(sub.docPath);
          }
        }
      })
    );

    // 4. Clean up invalid/expired subscriptions in Firestore asynchronously
    if (failedEndpoints.length > 0) {
      cleanupExpiredSubscriptions(failedEndpoints).catch((e) =>
        console.error('[WebPush] Cleanup error:', e)
      );
    }

    // 5. Save notification to in-app history
    await saveNotificationToFirestore({
      title,
      message: notificationBody,
      url,
      type,
      targetUserId,
      sentCount,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: `Push notifications sent to ${sentCount} devices.`,
      sentCount,
      failedCount,
      totalSubscriptions: subscriptions.length,
    });
  } catch (error) {
    console.error('[WebPush API Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while sending notification',
    });
  }
}

async function fetchSubscriptionsFromFirestore({ audience, targetUserId, type }) {
  try {
    const url = `${FIRESTORE_BASE_URL}/pushSubscriptions`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn('[WebPush] Firestore fetch failed:', response.statusText);
      return [];
    }

    const data = await response.json();
    const documents = data.documents || [];

    const parsedSubscriptions = [];

    for (const doc of documents) {
      const fields = doc.fields || {};
      const active = fields.active?.booleanValue !== false;
      if (!active) continue;

      const endpoint = fields.endpoint?.stringValue;
      const p256dh = fields.p256dh?.stringValue || fields.keys?.mapValue?.fields?.p256dh?.stringValue;
      const auth = fields.auth?.stringValue || fields.keys?.mapValue?.fields?.auth?.stringValue;
      const userId = fields.userId?.stringValue || null;

      if (!endpoint || !p256dh || !auth) continue;

      // Filter by specific user if requested
      if (audience === 'specific_user' && targetUserId && userId !== targetUserId) {
        continue;
      }

      // Check category preferences if present
      const prefs = fields.preferences?.mapValue?.fields;
      if (prefs) {
        if (type === 'property' && prefs.propertyUpdates?.booleanValue === false) continue;
        if (type === 'price' && prefs.priceChanges?.booleanValue === false) continue;
        if (type === 'visit' && prefs.siteVisitReminders?.booleanValue === false) continue;
        if (type === 'enquiry' && prefs.enquiryUpdates?.booleanValue === false) continue;
        if (type === 'offer' && prefs.offers?.booleanValue === false) continue;
      }

      parsedSubscriptions.push({
        id: doc.name.split('/').pop(),
        docPath: doc.name,
        endpoint,
        p256dh,
        auth,
        userId,
      });
    }

    return parsedSubscriptions;
  } catch (err) {
    console.error('[WebPush] Error fetching subscriptions from Firestore:', err);
    return [];
  }
}

async function saveNotificationToFirestore(notification) {
  try {
    const url = `${FIRESTORE_BASE_URL}/notifications`;
    const payload = {
      fields: {
        title: { stringValue: notification.title || '' },
        message: { stringValue: notification.message || '' },
        url: { stringValue: notification.url || '/' },
        type: { stringValue: notification.type || 'general' },
        targetUserId: { stringValue: notification.targetUserId || '' },
        read: { booleanValue: false },
        createdAt: { stringValue: notification.createdAt || new Date().toISOString() },
        sentCount: { integerValue: String(notification.sentCount || 0) },
      },
    };

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[WebPush] Error saving notification to Firestore:', err);
  }
}

async function cleanupExpiredSubscriptions(docPaths) {
  for (const path of docPaths) {
    try {
      const url = `https://firestore.googleapis.com/v1/${path}`;
      await fetch(url, { method: 'DELETE' });
    } catch (e) {
      console.warn('[WebPush] Failed deleting expired subscription:', path);
    }
  }
}
