import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  NotificationPreferences,
  DEFAULT_PREFERENCES,
  isPushNotificationSupported,
  getNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendTestDevicePush,
} from '@/lib/notificationService';

export const useDeviceNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('dre_notification_prefs');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const { currentUser } = useAuth();
  const { toast } = useToast();

  const checkSubscriptionStatus = useCallback(async () => {
    if (!isPushNotificationSupported()) {
      setPermission('unsupported');
      setIsSubscribed(false);
      return;
    }

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    if (currentPermission === 'granted') {
      setIsSubscribed(true);
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.pushManager) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            setIsSubscribed(true);
          }
        }
      } catch (err) {
        console.warn('Error checking push subscription:', err);
      }
    } else {
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  const enableNotifications = async () => {
    if (!isPushNotificationSupported()) {
      toast({
        title: 'Notifications Not Supported',
        description: 'Your browser or device does not support Web Push notifications.',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);
    try {
      const result = await subscribeToPushNotifications(currentUser?.uid, preferences);
      if (result.success) {
        setPermission('granted');
        setIsSubscribed(true);
        toast({
          title: '✓ Notifications Enabled',
          description: 'You will now receive property updates, visit reminders, and notifications on this device.',
        });
        return true;
      } else {
        setPermission(Notification.permission);
        if (Notification.permission === 'denied') {
          toast({
            title: 'Notifications Blocked',
            description: 'Notifications are blocked in your browser settings. Please allow notifications in site settings.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Could not enable notifications',
            description: result.error || 'Please check your browser permissions and try again.',
            variant: 'destructive',
          });
        }
        return false;
      }
    } catch (err: any) {
      console.error('Error enabling notifications:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to enable notifications.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disableNotifications = async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromPushNotifications();
      setIsSubscribed(false);
      toast({
        title: 'Notifications Disabled',
        description: 'You will no longer receive push notifications on this device.',
      });
      return true;
    } catch (err: any) {
      console.error('Error disabling notifications:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPrefs: NotificationPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem('dre_notification_prefs', JSON.stringify(newPrefs));

    if (isSubscribed) {
      // Re-sync with Firestore
      await subscribeToPushNotifications(currentUser?.uid, newPrefs);
    }

    toast({
      title: 'Preferences Updated',
      description: 'Your notification categories have been updated successfully.',
    });
  };

  const sendTestNotification = async () => {
    setIsLoading(true);
    try {
      const result = await sendTestDevicePush();
      if (result.success) {
        toast({
          title: 'Test Notification Sent',
          description: 'A test notification has been sent to your device!',
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
      setIsLoading(false);
    }
  };

  return {
    permission,
    isSubscribed,
    isLoading,
    preferences,
    showPreferencesModal,
    setShowPreferencesModal,
    enableNotifications,
    disableNotifications,
    updatePreferences,
    sendTestNotification,
  };
};
