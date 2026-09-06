'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // 0. Purge legacy caches on client side if present
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key.includes('v1')) {
            console.log('[PWA] Client-side purged legacy cache:', key);
            caches.delete(key);
          }
        });
      });
    }

    // 1. Register Service Worker with aggressive update detection
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope);

            // Check if there is already a waiting worker
            if (registration.waiting) {
              setUpdateAvailable(true);
            }

            // Immediately check for updates
            registration.update().catch(() => {});

            // Listen for waiting service worker
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (!newWorker) return;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New version available, triggering reload or notice...');
                  setUpdateAvailable(true);
                  // Give users 1 second or auto-reload if in standalone
                  setTimeout(() => window.location.reload(), 1200);
                }
              });
            });
          })
          .catch((error) => {
            console.warn('[PWA] Service Worker registration failed:', error);
          });
      };

      // Listen for controller changes (when new SW claims the page)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Controller changed, auto-reloading to apply latest changes...');
        window.location.reload();
      });

      // Listen for message from sw.js
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATED') {
          console.log('[PWA] Received SW_UPDATED message, reloading...');
          setUpdateAvailable(true);
          setTimeout(() => window.location.reload(), 800);
        }
      });

      // Register SW
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }

      // Recheck for updates when app gains focus or becomes visible
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          navigator.serviceWorker.getRegistration().then((reg) => reg?.update());
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleVisibilityChange);
    }

    // 2. Check if already running in standalone mode (PWA installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 3. Listen for BeforeInstallPrompt event (Chrome / Edge / Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);

      // Check if user previously dismissed prompt in this session
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        // Show after a polite delay (4 seconds)
        const timer = setTimeout(() => setShowBanner(true), 4000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setInstallPrompt(null);
      console.log('[PWA] Aplikasi berhasil diinstal ke perangkat');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
      }
    } catch (err) {
      console.error('[PWA] Install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <>
      {/* Update Available Banner (Works in both browser and installed PWA) */}
      {updateAvailable && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-top-4 duration-300"
        >
          <div className="bg-emerald-900 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-400/50 flex items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-100 truncate">Pembaruan Sistem Siap</p>
                <p className="text-[10px] text-emerald-300/90 truncate">Ketuk untuk memuat versi mobile terbaru</p>
              </div>
            </div>
            <button
              onClick={() => {
                try {
                  if (typeof caches !== 'undefined') {
                    caches.keys().then((k) => Promise.all(k.map((name) => caches.delete(name)))).finally(() => {
                      window.location.reload();
                    });
                  } else {
                    window.location.reload();
                  }
                } catch {
                  window.location.reload();
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-900 text-xs font-bold hover:bg-emerald-50 active:scale-95 transition-all shrink-0 shadow-xs cursor-pointer"
            >
              Muat Ulang
            </button>
          </div>
        </aside>
      )}

      {/* Install Prompt Banner */}
      {!isInstalled && showBanner && installPrompt && (
        <aside
          role="region"
          aria-label="Notifikasi Pasang Aplikasi"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-start gap-3">
            <div className="p-2.5 bg-emerald-700/80 rounded-xl shrink-0 text-white shadow-inner">
              <Download className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-sm font-bold text-emerald-300 leading-tight">
                Install Aplikasi SIK-MBH
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Pasang SIK-MBH di Layar Utama HP / Desktop untuk akses lebih cepat &amp; praktis.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Pasang Sekarang
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Tutup notifikasi pasang aplikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
