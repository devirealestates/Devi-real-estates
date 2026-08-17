import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // 1. Check if already running in installed standalone mode
    const checkInstalled = () => {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      setIsInstalled(Boolean(isStandalone));
      return isStandalone;
    };

    checkInstalled();

    // 2. Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Check dismissal state from localStorage
    const dismissedUntil = localStorage.getItem('dre_pwa_banner_dismissed');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      setIsDismissed(true);
    }

    // 4. Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // 5. Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('Devi Real Estates PWA was installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return false;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
        }
        setDeferredPrompt(null);
        return choiceResult.outcome === 'accepted';
      } catch (err) {
        console.error('Error triggering PWA installation:', err);
      }
    } else {
      // Fallback instruction for browsers without direct prompt
      toast({
        title: "Install Devi Real Estates",
        description: "Tap the browser menu (⋮ or Share) and select 'Install app' or 'Add to Home screen'.",
      });
    }
    return false;
  };

  const dismissBanner = () => {
    setIsDismissed(true);
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('dre_pwa_banner_dismissed', nextWeek.toString());
  };

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    canInstall: !isInstalled,
    isIOS,
    isDismissed,
    showIOSModal,
    setShowIOSModal,
    promptInstall,
    dismissBanner,
  };
};
