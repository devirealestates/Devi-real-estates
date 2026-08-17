import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PWAInstallBanner: React.FC = () => {
  const { isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissedThisSession, setIsDismissedThisSession] = useState(false);
  const location = useLocation();

  // ONLY show on Home Page ('/') - do not show on other pages
  const isHomePage = location.pathname === '/';

  // If not on Home page, already installed, or dismissed for this page session
  if (!isHomePage || isInstalled || isDismissedThisSession) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      await promptInstall();
    }
  };

  const handleDismiss = () => {
    setIsDismissedThisSession(true);
  };

  return (
    <>
      {/* Floating App Install Notification Banner - Home Page Only */}
      <aside 
        aria-label="App installation notification"
        className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 p-1.5 border border-slate-700 flex-shrink-0 flex items-center justify-center shadow-sm">
            <img 
              src="/pwa-192x192.png" 
              alt="Devi Real Estates App" 
              className="w-9 h-9 object-contain rounded-lg"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="text-sm font-bold text-slate-900 truncate font-display">
                Install Devi Real Estates
              </h4>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-600 p-1 -mr-1 rounded-full transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              Install our app for faster property search and instant updates.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-1.5 h-8 text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Install App</span>
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl px-3 py-1.5 h-8 text-xs font-medium"
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* iOS Add to Home Screen Modal Guide */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 p-1 flex items-center justify-center border border-slate-800">
                  <img src="/pwa-192x192.png" alt="Devi Real Estates" className="w-8 h-8 object-contain rounded-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-display">Install App on iOS</h3>
                  <p className="text-xs text-slate-500">Devi Real Estates</p>
                </div>
              </div>
              <button 
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 my-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  1
                </div>
                <p>
                  Tap the <span className="inline-flex items-center font-semibold text-slate-900 gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-200"><Share className="w-3.5 h-3.5 text-blue-500 inline" /> Share</span> icon at the bottom of Safari.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  2
                </div>
                <p>
                  Scroll down and tap <span className="inline-flex items-center font-semibold text-slate-900 gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-200"><PlusSquare className="w-3.5 h-3.5 text-slate-700 inline" /> Add to Home Screen</span>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  3
                </div>
                <p>
                  Tap <span className="font-semibold text-slate-900">Add</span> in the top right to install the standalone app on your home screen.
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setShowIOSModal(false);
                handleDismiss();
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2 text-xs font-semibold"
            >
              Got it!
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
