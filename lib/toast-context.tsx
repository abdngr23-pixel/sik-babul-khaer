'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  timestamp: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  toast: {
    success: (message: string, description?: string) => void;
    error: (message: string, description?: string) => void;
    warning: (message: string, description?: string) => void;
    info: (message: string, description?: string) => void;
    custom: (type: ToastType, message: string, description?: string) => void;
  };
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = {
      id,
      type,
      message,
      description,
      timestamp: Date.now(),
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 4));

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  }, [dismissToast]);

  const toastMethods = {
    success: (message: string, description?: string) => addToast('success', message, description),
    error: (message: string, description?: string) => addToast('error', message, description),
    warning: (message: string, description?: string) => addToast('warning', message, description),
    info: (message: string, description?: string) => addToast('info', message, description),
    custom: addToast,
  };

  return (
    <ToastContext.Provider value={{ toasts, toast: toastMethods, dismissToast }}>
      {children}

      {/* Floating Toasts Viewport */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let badgeColor = 'bg-slate-900 border-slate-700 text-white';
          let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;

          if (t.type === 'error') {
            badgeColor = 'bg-rose-950/95 border-rose-800 text-white';
            icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
          } else if (t.type === 'warning') {
            badgeColor = 'bg-amber-950/95 border-amber-800 text-white';
            icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
          } else if (t.type === 'info') {
            badgeColor = 'bg-indigo-950/95 border-indigo-800 text-white';
            icon = <Info className="w-4 h-4 text-indigo-400 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              role="alert"
              className={`${badgeColor} pointer-events-auto p-3.5 rounded-2xl shadow-xl border backdrop-blur-md flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 transition-all`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-xs font-bold leading-snug">{t.message}</p>
                {t.description && (
                  <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="opacity-60 hover:opacity-100 p-0.5 rounded-md hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                aria-label="Tutup notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
