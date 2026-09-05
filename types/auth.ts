export type UserRole =
  | 'KETUA_UMUM'
  | 'SEKRETARIS'
  | 'BENDAHARA'
  | 'SARPRAS'
  | 'KEMASJIDAN'
  | 'DEWAN_PENGAWAS';

export interface User {
  id: string;
  name: string;
  title: string;
  role: UserRole;
  roleLabel: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  department: string;
  isReadOnly: boolean;
  pin: string;
  bio?: string;
}

export type AuditActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'SWITCH_ROLE'
  | 'CREATE_LETTER'
  | 'UPDATE_LETTER'
  | 'EXTRACT_MINUTES'
  | 'CREATE_JAMAAH'
  | 'UPDATE_JAMAAH'
  | 'IMPORT_JAMAAH_EXCEL'
  | 'CREATE_TRANSACTION'
  | 'UPDATE_TRANSACTION'
  | 'CREATE_ASSET'
  | 'UPDATE_ASSET'
  | 'SERVICE_ASSET'
  | 'GENERATE_LPJ'
  | 'APPROVE_DISPOSITION'
  | 'REJECT_DISPOSITION'
  | 'CREATE_DONOR'
  | 'UPDATE_DONOR'
  | 'DELETE_DONOR'
  | 'BACKUP_DATABASE'
  | 'RESTORE_DATABASE';

export type AuditModule =
  | 'AUTENTIKASI'
  | 'KESEKRETARIATAN'
  | 'JAMAAH'
  | 'KEUANGAN'
  | 'SARPRAS'
  | 'EKSEKUTIF'
  | 'SISTEM';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userRoleLabel: string;
  action: AuditActionType;
  actionLabel: string;
  module: AuditModule;
  description: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface RolePermission {
  canAccessArchive: boolean;
  canCreateLetter: boolean;
  canAccessMinutes: boolean;
  canAccessJamaah: boolean;
  canMutateJamaah: boolean;
  canAccessFinance: boolean;
  canMutateFinance: boolean;
  canAccessAssets: boolean;
  canMutateAssets: boolean;
  canAccessReports: boolean;
  canAccessApprovals: boolean;
  canExecuteDispositions: boolean;
  canViewAuditLogs: boolean;
  isReadOnly: boolean;
}

export interface LoginCredentials {
  role?: UserRole;
  email?: string;
  pin?: string;
}
