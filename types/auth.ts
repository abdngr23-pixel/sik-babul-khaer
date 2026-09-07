export type UserRole =
  | 'SUPER_ADMIN'
  | 'KETUA_UMUM'
  | 'KETUA_I'
  | 'KETUA_II'
  | 'SEKRETARIS'
  | 'WAKIL_SEKRETARIS'
  | 'BENDAHARA'
  | 'WAKIL_BENDAHARA'
  | 'SEKSI_PERIBADATAN_DAKWAH'
  | 'SEKSI_ORGANISASI_PENDIDIKAN_REMAJA'
  | 'SEKSI_HUMAS_SOSIAL'
  | 'SEKSI_PEMBERDAYAAN_PEREMPUAN'
  | 'SEKSI_PEMBANGUNAN'
  | 'SEKSI_SARPRAS'
  | 'SEKSI_KEAMANAN_KEBERSIHAN'
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
  pinHash?: string;
  bio?: string;
  status?: 'AKTIF' | 'NON_AKTIF';
}

/**
 * Data publik pengguna yang aman dikirim ke client (tanpa pinHash, email, atau nomor HP)
 */
export type SafeUser = Pick<
  User,
  'id' | 'name' | 'title' | 'role' | 'roleLabel' | 'avatarUrl' | 'department' | 'isReadOnly' | 'bio' | 'status'
>;

export interface AuthSessionPayload {
  userId: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  iat: number;
  exp: number;
}

export type AuditActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'SWITCH_ROLE'
  | 'CHANGE_PIN'
  | 'RESET_PIN'
  | 'CREATE_USER'
  | 'UPDATE_USER'
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
  | 'RESTORE_DATABASE'
  | 'SYNC_TURSO';

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
  canAccessSuperAdmin?: boolean;
  canAccessAtmBeras?: boolean;
  canMutateAtmBeras?: boolean;
  canAccessZiswaf: boolean;
  canMutateZiswaf: boolean;
  canAccessDakwah: boolean;
  canMutateDakwah: boolean;
  canAccessTPA: boolean;
  canMutateTPA: boolean;
  canAccessUMKM: boolean;
  canMutateUMKM: boolean;
  canAccessProjects: boolean;
  canMutateProjects: boolean;
  canAccessLelang: boolean;
  canMutateLelang: boolean;
  canAccessGallery: boolean;
  canMutateGallery: boolean;
  canAccessKeamananKebersihan: boolean;
  isReadOnly: boolean;
}

export interface LoginCredentials {
  role?: UserRole;
  email?: string;
  pin?: string;
}
