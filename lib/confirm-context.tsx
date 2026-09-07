'use client';

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, X } from 'lucide-react';
import { useModalBackHandler } from '@/lib/back-button-handler';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
  }>({
    isOpen: false,
    options: {
      title: '',
      message: '',
      confirmText: 'Lanjutkan',
      cancelText: 'Batal',
      variant: 'primary',
    },
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialogState({
        isOpen: true,
        options: {
          confirmText: 'Lanjutkan',
          cancelText: 'Batal',
          variant: 'primary',
          ...options,
        },
      });
    });
  }, []);

  const handleClose = (result: boolean) => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  };

  const { options, isOpen } = dialogState;

  // Mobile Hardware Back Button handler for confirm dialog (dismisses with false)
  useModalBackHandler(isOpen, () => handleClose(false), 'global-confirm-dialog');

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Confirmation Modal Backdrop & Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    options.variant === 'danger'
                      ? 'bg-rose-100 text-rose-600 border border-rose-200'
                      : options.variant === 'warning'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {options.variant === 'danger' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : options.variant === 'warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <HelpCircle className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    id="confirm-dialog-title"
                    className="text-base font-bold text-slate-900 leading-snug"
                  >
                    {options.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {options.message}
                  </p>
                </div>

                <button
                  onClick={() => handleClose(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Batal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {options.cancelText || 'Batal'}
                </button>

                <button
                  type="button"
                  onClick={() => handleClose(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                    options.variant === 'danger'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                      : options.variant === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                  }`}
                >
                  {options.confirmText || 'Lanjutkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
