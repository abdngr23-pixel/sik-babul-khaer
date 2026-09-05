'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { User, UserRole, RolePermission, AuditActionType, AuditModule } from '@/types/auth';
import { OFFICIAL_USERS, ROLE_PERMISSIONS } from '@/lib/mock-auth';
import { AppNavTab } from '@/components/layout/sidebar';

interface AuthContextType {
  currentUser: User;
  users: User[];
  permissions: RolePermission;
  isReadOnly: boolean;
  switchRole: (role: UserRole) => Promise<void>;
  loginUser: (userId: string) => Promise<void>;
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
  const [users] = useState<User[]>(OFFICIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedId = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedId) {
          const found = OFFICIAL_USERS.find((u) => u.id === storedId);
          if (found) return found;
        }
      } catch {
        // Ignore localStorage errors
      }
    }
    return OFFICIAL_USERS[0]; // Default to Ketua Umum
  });

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

  const switchRole = useCallback(
    async (role: UserRole) => {
      const targetUser = users.find((u) => u.role === role);
      if (!targetUser) return;

      setCurrentUser(targetUser);
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
      // Ketua Umum and Dewan Pengawas have visual oversight of all modules
      if (currentUser.role === 'KETUA_UMUM' || currentUser.role === 'DEWAN_PENGAWAS') {
        return true;
      }

      switch (tab) {
        case 'archive':
        case 'create':
        case 'minutes':
          return currentUser.role === 'SEKRETARIS';

        case 'jamaah':
        case 'mustahiq':
          return (
            currentUser.role === 'KEMASJIDAN' ||
            currentUser.role === 'SEKRETARIS' ||
            currentUser.role === 'BENDAHARA'
          );

        case 'finance':
        case 'donors':
          return (
            currentUser.role === 'BENDAHARA' ||
            currentUser.role === 'SEKRETARIS' ||
            currentUser.role === 'KEMASJIDAN'
          );

        case 'assets':
          return (
            currentUser.role === 'SARPRAS' ||
            currentUser.role === 'SEKRETARIS' ||
            currentUser.role === 'BENDAHARA'
          );

        case 'reports':
          return true; // All roles can see high-level reports & evaluation

        case 'approvals':
          return false; // Ketua Umum dan Dewan Pengawas sudah ditangani pada pengecekan awal di atas

        default:
          return true;
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

      // Ketua Umum has master administrative control over all modules
      if (currentUser.role === 'KETUA_UMUM') {
        return true;
      }

      switch (tab) {
        case 'archive':
        case 'create':
        case 'minutes':
          return currentUser.role === 'SEKRETARIS';

        case 'jamaah':
        case 'mustahiq':
          return currentUser.role === 'KEMASJIDAN';

        case 'finance':
        case 'donors':
          return currentUser.role === 'BENDAHARA';

        case 'assets':
          return currentUser.role === 'SARPRAS';

        case 'approvals':
          return false; // Khusus Ketua Umum, sudah ditangani pada pengecekan awal di atas

        case 'reports':
          return currentUser.role === 'SEKRETARIS';

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
        switchRole,
        loginUser,
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
