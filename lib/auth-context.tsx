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

      switch (tab) {
        // Modul Kesekretariatan & Persuratan (Hanya Sekretaris)
        case 'archive':
        case 'create':
        case 'minutes':
          return currentUser.role === 'SEKRETARIS';

        // Modul Basis Data Warga & Dakwah
        case 'jamaah':
        case 'dakwah':
          return currentUser.role === 'KEMASJIDAN';

        // Modul ZISWAF, SSS, dan Bansos (Kemasjidan & Bendahara)
        case 'mustahiq':
          return currentUser.role === 'KEMASJIDAN' || currentUser.role === 'BENDAHARA';

        // Modul Keuangan & Kas (Hanya Bendahara)
        case 'finance':
        case 'donors':
          return currentUser.role === 'BENDAHARA';

        // Modul Sarana & Prasarana (Hanya Sarpras)
        case 'assets':
          return currentUser.role === 'SARPRAS';

        // Modul Evaluasi Kinerja & LPJ (Dapat dilihat oleh semua divisi untuk laporannya)
        case 'reports':
          return true;

        // Modul Monitoring Granular 74 Program Kerja
        case 'program-kerja':
          return true;

        // Modul Rapat Terpadu (Sekretaris, Ketua Umum, Super Admin)
        case 'meetings':
          return currentUser.role === 'SEKRETARIS';

        // Modul Kepanitiaan Ad-hoc, TPA & UMKM (Dapat diakses oleh seluruh pengurus)
        case 'adhoc':
        case 'tpa':
        case 'umkm':
          return true;

        // Modul Pengesahan Satu Pintu (Eksklusif Ketua Umum & Super Admin)
        case 'approvals':
          return false;

        // Modul Super Admin (Khusus Super Admin & Ketua Umum, sudah ditangani di atas)
        case 'superadmin':
          return false;

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

      switch (tab) {
        case 'archive':
        case 'create':
        case 'minutes':
          return currentUser.role === 'SEKRETARIS';

        case 'meetings':
        case 'adhoc':
          return currentUser.role === 'SEKRETARIS';

        case 'tpa':
        case 'umkm':
        case 'jamaah':
        case 'mustahiq':
        case 'dakwah':
          return currentUser.role === 'KEMASJIDAN';

        case 'finance':
        case 'donors':
          return currentUser.role === 'BENDAHARA';

        case 'assets':
          return currentUser.role === 'SARPRAS';

        case 'program-kerja':
          return false;

        case 'approvals':
          return false;

        case 'reports':
          return currentUser.role === 'SEKRETARIS';

        case 'superadmin':
          return false;

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
