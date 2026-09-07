'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';

const SESSION_STORAGE_KEY = 'sik_splash_seen';

function subscribe() {
  return () => {};
}

function getSnapshot(): boolean {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
  } catch {
    return true;
  }
}

function getServerSnapshot(): boolean {
  return true; // Pada SSR / server, jangan render splash agar tidak flash
}

export default function SplashScreen() {
  const alreadySeen = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [phase, setPhase] = useState<'showing' | 'fading' | 'hidden'>('showing');

  useEffect(() => {
    if (alreadySeen) return;

    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    } catch {
      // Fallback jika sessionStorage dibatasi
    }

    // Mulai transisi fade-out setelah 2 detik
    const fadeTimer = setTimeout(() => {
      setPhase('fading');
    }, 2000);

    // Hapus total dari DOM (unmount) setelah transisi fade-out selesai (durasi transisi 700ms > minimal 500ms)
    const unmountTimer = setTimeout(() => {
      setPhase('hidden');
    }, 2750);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [alreadySeen]);

  if (alreadySeen || phase === 'hidden') {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Splash Screen Masjid Babul Khaer"
      aria-live="polite"
      className={`fixed inset-0 z-[9999] w-screen h-screen bg-white flex items-center justify-center overflow-hidden transition-opacity duration-700 ease-out select-none ${
        phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        src="/splash.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
}
