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
      subscriptions: incomingSubscriptions = null,
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

    // 1. Direct single target subscription (e.g. instant test)
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

    // 2. Resolve subscriptions (either passed directly from authenticated client or queried from Firestore REST)
    let subscriptions = incomingSubscriptions;
    if (!subscriptions || !Array.isArray(subscriptions) || subscriptions.length === 0) {
      subscriptions = await fetchSubscriptionsFromFirestore({
        audience,
        targetUserId,
        targetLocation,
        type,
      });
    }

    // Normalize subscription format
    const activeSubs = (subscriptions || [])
      .map((sub) => {
        const endpoint = sub.endpoint || sub.keys?.endpoint;
        const p256dh = sub.p256dh || sub.keys?.p256dh;
        const auth = sub.auth || sub.keys?.auth;
        return {
          id: sub.id,
          endpoint,
          p256dh,
          auth,
          docPath: sub.docPath,
        };
      })
      .filter((s) => s.endpoint && s.p256dh && s.auth);

    if (activeSubs.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Notification saved. No active subscribed devices at the moment.',
        sentCount: 0,
        failedCount: 0,
        totalSubscriptions: 0,
      });
    }

    let sentCount = 0;
    let failedCount = 0;
    const failedEndpoints = [];

    // 3. Dispatch Web Push in parallel to all active subscriber devices
    await Promise.all(
      activeSubs.map(async (sub) => {
        try {
          const pushConfig = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };
          await webpush.sendNotification(pushConfig, payload, {
            TTL: 86400,
            urgency: 'high',
          });
          sentCount++;
        } catch (err) {
          failedCount++;
          console.warn(`[WebPush] Failed sending to endpoint (${err.statusCode}):`, sub.endpoint);
          if (err.statusCode === 410 || err.statusCode === 404) {
            if (sub.docPath) failedEndpoints.push(sub.docPath);
          }
        }
      })
    );

    // 4. Clean up invalid/expired subscriptions
    if (failedEndpoints.length > 0) {
      cleanupExpiredSubscriptions(failedEndpoints).catch((e) =>
        console.error('[WebPush] Cleanup error:', e)
      );
    }

    return res.status(200).json({
      success: true,
      message: `Push notification delivered to ${sentCount} device(s).`,
      sentCount,
      failedCount,
      totalSubscriptions: activeSubs.length,
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

      if (audience === 'specific_user' && targetUserId && userId !== targetUserId) {
        continue;
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
