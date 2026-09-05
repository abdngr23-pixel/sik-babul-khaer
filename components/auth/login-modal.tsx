'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types/auth';
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
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export default function LoginModal({ isOpen, onClose, onSuccessToast }: LoginModalProps) {
  const { users, currentUser, switchRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [isSwitching, setIsSwitching] = useState(false);

  if (!isOpen) return null;

  const handleSelectAndSwitch = async (role: UserRole) => {
    setIsSwitching(true);
    try {
      await switchRole(role);
      const targetUser = users.find((u) => u.role === role);
      onSuccessToast(`Berhasil beralih peran ke: ${targetUser?.title || role}`);
      onClose();
    } finally {
      setIsSwitching(false);
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
          activeBorder: 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-500/20',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'SARPRAS':
        return {
          border: 'hover:border-orange-500/80',
          activeBorder: 'border-orange-600 bg-orange-50/40 ring-2 ring-orange-500/20',
          badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
        };
      case 'KEMASJIDAN':
        return {
          border: 'hover:border-teal-500/80',
          activeBorder: 'border-teal-600 bg-teal-50/40 ring-2 ring-teal-500/20',
          badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
        };
      case 'DEWAN_PENGAWAS':
        return {
          border: 'hover:border-purple-500/80',
          activeBorder: 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-500/20',
          badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-soft-sm border border-emerald-100 flex items-center justify-center shrink-0">
              <Image
                src="/logo-babul-khaer.png"
                alt="Logo Resmi Masjid Babul Khaer"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Manajemen Hak Akses & Akun Pengurus</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sistem Keamanan DKM
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pilih profil pimpinan DKM Babul Khaer BTP Blok AE untuk mensimulasikan otentikasi & wewenang sistem.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body / Role Cards */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-900">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Simulasi Multi-Role SIK-MBH</p>
              <p className="text-emerald-800/90 mt-0.5 leading-relaxed">
                Antarmuka, filter navigasi, dan hak mutasi data akan otomatis beradaptasi secara dinamis sesuai jabatan yang Anda pilih di bawah ini.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {users.map((user) => {
              const isCurrent = currentUser.id === user.id;
              const isSelected = selectedRole === user.role;
              const theme = getRoleTheme(user.role);

              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedRole(user.role)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isCurrent
                      ? 'border-emerald-600 bg-white shadow-md ring-2 ring-emerald-500/20'
                      : isSelected
                      ? theme.activeBorder
                      : `border-slate-200 bg-white hover:shadow-sm ${theme.border}`
                  }`}
                >
                  <div>
                    {/* Top Row: Title & Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${theme.badgeBg}`}>
                            {user.roleLabel}
                          </span>
                        </div>
                      </div>
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Akun Aktif</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> PIN: 123456
                        </span>
                      )}
                    </div>

                    {/* Officer Name & Department */}
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {user.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {user.department}
                    </p>

                    {/* Bio / Scope */}
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {user.bio}
                    </p>
                  </div>

                  {/* Action button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {user.email}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAndSwitch(user.role);
                      }}
                      disabled={isCurrent || isSwitching}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 cursor-default'
                          : 'bg-slate-900 hover:bg-emerald-600 text-white shadow-xs'
                      }`}
                    >
                      <span>{isCurrent ? 'Sedang Digunakan' : 'Beralih Akun'}</span>
                      {!isCurrent && <ArrowRight className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">DKM Babul Khaer:</span>
            <span>Standar Keamanan AD/ART MBH 2020</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
}
