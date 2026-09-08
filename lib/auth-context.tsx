'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SafeUser, UserRole, RolePermission, AuditActionType, AuditModule } from '@/types/auth';
import { ROLE_PERMISSIONS, getSafeOfficials } from '@/lib/mock-auth';
import { AppNavTab } from '@/components/layout/sidebar';

interface AuthContextType {
  currentUser: SafeUser;
  users: SafeUser[];
  permissions: RolePermission;
  isReadOnly: boolean;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => Promise<void>;
  loginUser: (userId: string) => Promise<void>;
  loginWithPin: (userId: string, pin: string) => Promise<{ success: boolean; error?: string; remainingAttempts?: number; remainingSeconds?: number }>;
  logout: () => Promise<void>;
  canAccessTab: (tab: AppNavTab) => boolean;
  canMutateTab: (tab: AppNavTab) => boolean;
  logAction: (
    action: AuditActionType,
    actionLabel: string,
    module: AuditModule,
    description: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'sik_mbh_active_user_id';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<SafeUser[]>(() => getSafeOfficials());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedId = localStorage.getItem(LOCAL_STORAGE_KEY);
        return Boolean(storedId);
      } catch {
        return false;
      }
    }
    return false;
  });

  const [currentUser, setCurrentUser] = useState<SafeUser>(() => {
    const defaultUsers = getSafeOfficials();
    if (typeof window !== 'undefined') {
      try {
        const storedId = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedId) {
          const found = defaultUsers.find((u) => u.id === storedId);
          if (found) return found;
        }
      } catch {
        // Ignore localStorage errors
      }
    }
    return defaultUsers[0]; // Default to Ketua Umum jika ada
  });

  // Sinkronkan daftar akun aman dari /api/auth dan cek sesi aktif dari /api/auth/me saat awal render
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        // 1. Ambil daftar user aman dari server
        const resUsers = await fetch('/api/auth');
        if (resUsers.ok) {
          const data = await resUsers.json();
          if (data.success && Array.isArray(data.users) && isMounted) {
            setUsers(data.users);
          }
        }

        // 2. Periksa sesi aktif (cookie httpOnly)
        const resMe = await fetch('/api/auth/me');
        if (resMe.ok) {
          const dataMe = await resMe.json();
          if (dataMe.success && dataMe.user && isMounted) {
            setCurrentUser(dataMe.user);
            setIsAuthenticated(true);
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, dataMe.user.id);
            } catch {
              // Ignore storage errors
            }
          }
        } else if (resMe.status === 401 && isMounted) {
          // Tidak ada sesi cookie aktif
          setIsAuthenticated(false);
          try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          } catch {
            // Ignore
          }
        }
      } catch (err) {
        console.warn('Gagal menginisialisasi sesi auth:', err);
      }
    }

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const permissions = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.KETUA_UMUM;
  const isReadOnly = currentUser.isReadOnly || permissions.isReadOnly;

  const logAction = useCallback(
    async (
      action: AuditActionType,
      actionLabel: string,
      module: AuditModule,
      description: string
    ) => {
      try {
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            userRoleLabel: currentUser.roleLabel,
            action,
            actionLabel,
            module,
            description,
            status: 'SUCCESS',
          }),
        });
      } catch (err) {
        console.warn('Failed to log audit entry:', err);
      }
    },
    [currentUser]
  );

  /**
   * Login aman dengan verifikasi PIN di backend (/api/auth)
   */
  const loginWithPin = useCallback(
    async (userId: string, pin: string) => {
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, pin, action: 'LOGIN' }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          return {
            success: false,
            error: data.error || 'PIN otentikasi tidak valid',
            remainingAttempts: data.remainingAttempts,
            remainingSeconds: data.remainingSeconds,
          };
        }

        if (data.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, data.user.id);
          } catch {
            // Ignore
          }
        }

        return { success: true };
      } catch (err) {
        console.error('Error saat login PIN:', err);
        return { success: false, error: 'Koneksi ke server gagal' };
      }
    },
    []
  );

  /**
   * Keluar sesi (hapus cookie dan reset state)
   */
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    const defaultUser = users[0] || getSafeOfficials()[0];
    setCurrentUser(defaultUser);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, [users]);

  const switchRole = useCallback(
    async (role: UserRole) => {
      const targetUser = users.find((u) => u.role === role);
      if (!targetUser) return;

      setCurrentUser(targetUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, targetUser.id);
      } catch {
        // Ignore storage error
      }

      await logAction(
        'SWITCH_ROLE',
        'Beralih Peran Pengurus',
        'AUTENTIKASI',
        `Pengguna beralih peran ke ${targetUser.title} (${targetUser.name})`
      );
    },
    [users, logAction]
  );

  const loginUser = useCallback(
    async (userId: string) => {
      const targetUser = users.find((u) => u.id === userId);
      if (!targetUser) return;

      setCurrentUser(targetUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, targetUser.id);
      } catch {
        // Ignore storage error
      }

      await logAction(
        'LOGIN',
        'Masuk Akun Pengurus',
        'AUTENTIKASI',
        `Masuk sebagai ${targetUser.title} (${targetUser.name})`
      );
    },
    [users, logAction]
  );

  const canAccessTab = useCallback(
    (tab: AppNavTab): boolean => {
      // Menu utama Dashboard selalu dapat diakses oleh semua peran yang login
      if (tab === 'dashboard') {
        return true;
      }

      // Super Admin dan Ketua Umum memiliki akses administratif penuh ke seluruh modul
      if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'KETUA_UMUM') {
        return true;
      }

      // Dewan Pengawas hanya memiliki hak akses pengawasan evaluasi kinerja (Laporan & LPJ)
      if (currentUser.role === 'DEWAN_PENGAWAS') {
        return tab === 'reports';
      }

      const p = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.KETUA_UMUM;

      switch (tab) {
        // Modul Kesekretariatan & Persuratan
        case 'archive':
          return p.canAccessArchive;
        case 'create':
          return p.canCreateLetter;
        case 'minutes':
          return p.canAccessMinutes;

        // Modul Basis Data Warga
        case 'jamaah':
          return p.canAccessJamaah;

        // Modul Peribadatan & Dakwah
        case 'dakwah':
          return p.canAccessDakwah;

        // Modul Mustahiq, ZISWAF, SSS
        case 'mustahiq':
          return p.canAccessZiswaf;

        // Modul Lelang Infaq Barakah
        case 'lelang':
          return p.canAccessLelang;

        // Modul TPA & Remaja Masjid
        case 'tpa':
          return p.canAccessTPA;

        // Modul UMKM & Gerai Muslimah
        case 'umkm':
          return p.canAccessUMKM;

        // Modul Keuangan & Kas & Donatur
        case 'finance':
        case 'donors':
          return p.canAccessFinance;

        // Modul Sarana Prasarana & Proyek Fisik
        case 'assets':
          return p.canAccessAssets || p.canAccessProjects;

        // Modul Evaluasi Kinerja & LPJ
        case 'reports':
          return p.canAccessReports;

        // Modul Monitoring Granular 74 Program Kerja
        case 'program-kerja':
          return true;

        // Modul Rapat Terpadu (Sekretariat & Pimpinan)
        case 'meetings':
          return p.canAccessMinutes;

        // Modul Galeri Dokumentasi Kegiatan
        case 'gallery':
          return p.canAccessGallery;

        // Modul Kepanitiaan Ad-hoc
        case 'adhoc':
          return true;

        // Modul Pengesahan Satu Pintu (Eksklusif Ketua Umum & Super Admin)
        case 'approvals':
          return p.canAccessApprovals;

        // Modul Super Admin
        case 'superadmin':
          return Boolean(p.canAccessSuperAdmin);

        default:
          return false;
      }
    },
    [currentUser.role]
  );

  const canMutateTab = useCallback(
    (tab: AppNavTab): boolean => {
      // Dewan Pengawas is STRICTLY read-only
      if (currentUser.isReadOnly) {
        return false;
      }

      // Super Admin dan Ketua Umum memiliki kontrol mutasi penuh
      if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'KETUA_UMUM') {
        return true;
      }

      // Ketua I & Ketua II: pengawasan bidang, tanpa mutasi operasional langsung
      if (currentUser.role === 'KETUA_I' || currentUser.role === 'KETUA_II') {
        return false;
      }

      const p = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.KETUA_UMUM;

      switch (tab) {
        case 'archive':
        case 'create':
          return p.canCreateLetter;

        case 'minutes':
        case 'meetings':
          return p.canAccessMinutes && (currentUser.role === 'SEKRETARIS' || currentUser.role === 'WAKIL_SEKRETARIS');

        case 'adhoc':
          return currentUser.role === 'SEKRETARIS' || currentUser.role === 'WAKIL_SEKRETARIS';

        case 'jamaah':
          return p.canMutateJamaah;

        case 'dakwah':
          return p.canMutateDakwah;

        case 'mustahiq':
          return p.canMutateZiswaf;

        case 'tpa':
          return p.canMutateTPA;

        case 'umkm':
          return p.canMutateUMKM;

        case 'lelang':
          return p.canMutateLelang;

        case 'gallery':
          return p.canMutateGallery;

        case 'finance':
        case 'donors':
          return p.canMutateFinance;

        case 'assets':
          return p.canMutateAssets || p.canMutateProjects;

        case 'program-kerja':
          return currentUser.role === 'SEKRETARIS' || currentUser.role === 'WAKIL_SEKRETARIS';

        case 'approvals':
          return p.canExecuteDispositions;

        case 'reports':
          return currentUser.role === 'SEKRETARIS' || currentUser.role === 'WAKIL_SEKRETARIS';

        case 'superadmin':
          return Boolean(p.canAccessSuperAdmin);

        default:
          return false;
      }
    },
    [currentUser]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        permissions,
        isReadOnly,
        isAuthenticated,
        switchRole,
        loginUser,
        loginWithPin,
        logout,
        canAccessTab,
        canMutateTab,
        logAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
