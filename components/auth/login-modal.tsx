'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { SafeUser, UserRole } from '@/types/auth';
import {
  X,
  Shield,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  FileText,
  Wallet,
  Wrench,
  Users,
  Eye,
  KeyRound,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  Database,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export default function LoginModal({ isOpen, onClose, onSuccessToast }: LoginModalProps) {
  const { users, currentUser, loginWithPin } = useAuth();
  const [selectedUser, setSelectedUser] = useState<SafeUser | null>(null);
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOpenPinForm = (user: SafeUser) => {
    setSelectedUser(user);
    setPin('');
    setErrorMessage(null);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setPin('');
    setErrorMessage(null);
  };

  const handleSubmitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!pin || pin.length < 6) {
      setErrorMessage('PIN harus terdiri dari 6 digit angka');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const result = await loginWithPin(selectedUser.id, pin);

      if (!result.success) {
        setErrorMessage(result.error || 'PIN otentikasi tidak sesuai.');
        setPin('');
        return;
      }

      onSuccessToast(`Berhasil masuk sebagai: ${selectedUser.title} (${selectedUser.name})`);
      onClose();
      setSelectedUser(null);
      setPin('');
    } catch {
      setErrorMessage('Terjadi kesalahan jaringan saat verifikasi PIN.');
    } finally {
      setIsVerifying(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'KETUA_UMUM':
        return <Shield className="w-5 h-5 text-indigo-500" />;
      case 'SEKRETARIS':
        return <FileText className="w-5 h-5 text-emerald-500" />;
      case 'BENDAHARA':
        return <Wallet className="w-5 h-5 text-amber-500" />;
      case 'SARPRAS':
        return <Wrench className="w-5 h-5 text-orange-500" />;
      case 'KEMASJIDAN':
        return <Users className="w-5 h-5 text-teal-500" />;
      case 'DEWAN_PENGAWAS':
        return <Eye className="w-5 h-5 text-purple-500" />;
      case 'SUPER_ADMIN':
        return <Database className="w-5 h-5 text-teal-500" />;
      default:
        return <Shield className="w-5 h-5 text-slate-500" />;
    }
  };

  const getRoleTheme = (role: UserRole) => {
    switch (role) {
      case 'KETUA_UMUM':
        return {
          border: 'hover:border-indigo-500/80',
          activeBorder: 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20',
          badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      case 'SEKRETARIS':
        return {
          border: 'hover:border-emerald-500/80',
          activeBorder: 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'BENDAHARA':
        return {
          border: 'hover:border-amber-500/80',
          activeBorder: 'border-amber-600 bg-amber-50/40 dark:bg-amber-950/40 ring-2 ring-amber-500/20',
          badgeBg: 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
      case 'SARPRAS':
        return {
          border: 'hover:border-orange-500/80',
          activeBorder: 'border-orange-600 bg-orange-50/40 dark:bg-orange-950/40 ring-2 ring-orange-500/20',
          badgeBg: 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        };
      case 'KEMASJIDAN':
        return {
          border: 'hover:border-teal-500/80',
          activeBorder: 'border-teal-600 bg-teal-50/40 dark:bg-teal-950/40 ring-2 ring-teal-500/20',
          badgeBg: 'bg-teal-100 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        };
      case 'DEWAN_PENGAWAS':
        return {
          border: 'hover:border-purple-500/80',
          activeBorder: 'border-purple-600 bg-purple-50/40 dark:bg-purple-950/40 ring-2 ring-purple-500/20',
          badgeBg: 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        };
      case 'SUPER_ADMIN':
        return {
          border: 'hover:border-slate-800/80',
          activeBorder: 'border-slate-900 dark:border-slate-700 bg-slate-900 text-teal-300 ring-2 ring-teal-500/20',
          badgeBg: 'bg-slate-900 dark:bg-slate-800 text-teal-300 border-slate-700',
        };
      default:
        return {
          border: 'hover:border-slate-400',
          activeBorder: 'border-slate-600 bg-slate-50 dark:bg-slate-800',
          badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-hidden"
    >
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl border-t md:border border-slate-200 dark:border-slate-800 w-full md:max-w-3xl h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[90dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 md:zoom-in-95">
        {/* Drag Handle Bar (Mobile Only) */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white p-1 shadow-soft-sm border border-emerald-100 flex items-center justify-center shrink-0">
              <Image
                src="/logo-babul-khaer.png"
                alt="Logo Resmi Masjid Babul Khaer"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h3 id="login-modal-title" className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 sm:gap-2 leading-tight truncate">
                <span className="truncate">Hak Akses Pengurus</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  PIN Aman
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-tight truncate">
                Pilih profil pimpinan DKM Babul Khaer dan masukkan PIN 6 digit resmi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {selectedUser ? (
          /* Sub-Form: Masukkan PIN 6 Digit untuk User Terpilih */
          <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50 dark:bg-slate-950/40">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Pengurus</span>
            </button>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-md mx-auto">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Verifikasi PIN Pengurus</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Masukkan PIN 6 digit resmi untuk mengakses wewenang:
                </p>
                <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedUser.title} — {selectedUser.name}
                </div>
              </div>

              {errorMessage && (
                <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmitPin} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 text-center">
                    PIN Keamanan (6 Digit Angka)
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPin(val);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••"
                    className="w-full text-center text-2xl tracking-[0.4em] font-mono py-3 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-700 transition-all"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-2">
                    PIN dienkripsi dengan Bcrypt & dilindungi batas 5 kali percobaan per 15 menit.
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    disabled={isVerifying}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying || pin.length !== 6}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Masuk Sesi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Daftar Akun Pengurus */
          <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Otentikasi Multi-Role Resmi SIK-MBH</p>
                <p className="text-emerald-800/90 dark:text-emerald-400/90 mt-0.5 leading-relaxed">
                  Pilih akun pimpinan di bawah ini untuk beralih peran. Setiap jabatan kini dilindungi PIN 6 digit unik dan session cookie httpOnly yang aman.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {users.map((user) => {
                const isCurrent = currentUser.id === user.id;
                const theme = getRoleTheme(user.role);

                return (
                  <div
                    key={user.id}
                    onClick={() => !isCurrent && handleOpenPinForm(user)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isCurrent
                        ? 'border-emerald-600 bg-white dark:bg-slate-800 shadow-md ring-2 ring-emerald-500/20'
                        : `border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:shadow-sm ${theme.border}`
                    }`}
                  >
                    <div>
                      {/* Top Row: Title & Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {getRoleIcon(user.role)}
                          </div>
                          <div>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${theme.badgeBg}`}>
                              {user.roleLabel}
                            </span>
                          </div>
                        </div>
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Akun Aktif</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Terlindungi PIN
                          </span>
                        )}
                      </div>

                      {/* Officer Name & Department */}
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                        {user.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {user.department}
                      </p>

                      {/* Bio / Scope */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {user.bio}
                      </p>
                    </div>

                    {/* Action button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {user.role === 'DEWAN_PENGAWAS' ? 'Wewenang Read-Only' : 'Wewenang Eksekutif'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isCurrent) handleOpenPinForm(user);
                        }}
                        disabled={isCurrent}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default'
                            : 'bg-slate-900 dark:bg-slate-700 hover:bg-emerald-600 text-white shadow-xs'
                        }`}
                      >
                        <span>{isCurrent ? 'Sedang Digunakan' : 'Pilih Akun'}</span>
                        {!isCurrent && <ArrowRight className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100/80 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">DKM Babul Khaer:</span>
            <span className="truncate">Standar Keamanan AD/ART MBH 2020</span>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
}
