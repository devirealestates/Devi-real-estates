import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    return (typeof window !== 'undefined' && (window as any).__deferredPwaPrompt) || null;
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isInstallable, setIsInstallable] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Boolean((window as any).__deferredPwaPrompt);
  });
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

    // 4. If window already captured deferred prompt before React mounted
    if ((window as any).__deferredPwaPrompt) {
      setDeferredPrompt((window as any).__deferredPwaPrompt);
      setIsInstallable(true);
    }

    // 5. Listen for beforeinstallprompt & custom early prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__deferredPwaPrompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handlePromptAvailable = (e: any) => {
      if (e.detail) {
        setDeferredPrompt(e.detail);
        setIsInstallable(true);
      }
    };

    // 6. Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      (window as any).__deferredPwaPrompt = null;
      console.log('[PWA] Installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-available', handlePromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-installed', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-available', handlePromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-installed', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return false;
    }

    const promptToUse = deferredPrompt || (typeof window !== 'undefined' ? (window as any).__deferredPwaPrompt : null);

    if (promptToUse) {
      try {
        await promptToUse.prompt();
        const choiceResult = await promptToUse.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
        }
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') {
          (window as any).__deferredPwaPrompt = null;
        }
        return choiceResult.outcome === 'accepted';
      } catch (err) {
        console.error('Error triggering native PWA prompt:', err);
      }
    } else {
      // Fallback instruction only if native prompt event was not provided by browser
      toast({
        title: "Install Devi Real Estates",
        description: "Tap your browser menu (⋮ or Share) and choose 'Install app' or 'Add to Home screen'.",
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
