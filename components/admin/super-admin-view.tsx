'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Users,
  ShieldCheck,
  KeyRound,
  Download,
  Upload,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle2,
  Lock,
  Server,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { User, UserRole } from '@/types/auth';

interface SuperAdminViewProps {
  onOpenAuditLogs?: () => void;
  onOpenBackupModal?: () => void;
}

export default function SuperAdminView({
  onOpenAuditLogs,
  onOpenBackupModal,
}: SuperAdminViewProps) {
  const { currentUser, logAction } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'turso' | 'backup' | 'audit'>('users');

  // Users State
  const [userList, setUserList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [resetPinTarget, setResetPinTarget] = useState<User | null>(null);
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinModalError, setPinModalError] = useState('');

  // Self Change PIN State
  const [selfCurrentPin, setSelfCurrentPin] = useState('');
  const [selfNewPin, setSelfNewPin] = useState('');
  const [selfConfirmPin, setSelfConfirmPin] = useState('');
  const [selfPinMessage, setSelfPinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New User Form State
  const [newUserData, setNewUserData] = useState({
    name: '',
    role: 'SARPRAS' as UserRole,
    title: '',
    phone: '',
    pin: '123456',
  });
  const [addUserError, setAddUserError] = useState('');

  // Turso & Backup State
  const [dbEngine, setDbEngine] = useState<string>('local_sqlite');
  const [isSyncingTurso, setIsSyncingTurso] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const [alertNotification, setAlertNotification] = useState<string | null>(null);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setUserList(data.users);
        }
      }
    } catch {
      console.warn('Gagal memuat data pengguna dari /api/auth/users');
    }
  }, []);

  // Fetch DB Engine
  const fetchDbStats = useCallback(async () => {
    try {
      const res = await fetch('/api/database/backup?type=stats');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.stats) {
          setDbEngine(json.stats.engine || 'local_sqlite');
        }
      }
    } catch {
      setDbEngine('local_sqlite');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const [resUsers, resStats] = await Promise.allSettled([
          fetch('/api/auth/users'),
          fetch('/api/database/backup?type=stats'),
        ]);

        if (isMounted && resUsers.status === 'fulfilled' && resUsers.value.ok) {
          const data = await resUsers.value.json();
          if (data.success && Array.isArray(data.users)) {
            setUserList(data.users);
          }
        }

        if (isMounted && resStats.status === 'fulfilled' && resStats.value.ok) {
          const json = await resStats.value.json();
          if (json.success && json.stats) {
            setDbEngine(json.stats.engine || 'local_sqlite');
          }
        }
      } catch (err) {
        console.warn('Gagal memuat data super admin', err);
      }
    };

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handler Ganti / Reset PIN Akun Pengurus
  const handleResetPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPinTarget) return;

    if (newPinInput !== confirmPinInput) {
      setPinModalError('PIN baru dan konfirmasi PIN tidak sama!');
      return;
    }

    if (newPinInput.length < 4 || newPinInput.length > 8) {
      setPinModalError('PIN harus berupa 4 sampai 8 digit angka.');
      return;
    }

    try {
      const res = await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: resetPinTarget.id,
          newPin: newPinInput,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAlertNotification(`Alhamdulillah! PIN untuk ${resetPinTarget.name} berhasil diubah.`);
        setResetPinTarget(null);
        setNewPinInput('');
        setConfirmPinInput('');
        setPinModalError('');
        fetchUsers();
        setTimeout(() => setAlertNotification(null), 4000);

        await logAction(
          'RESET_PIN',
          'Reset PIN Pengurus',
          'AUTENTIKASI',
          `Super Admin mereset PIN untuk akun ${resetPinTarget.name} (${resetPinTarget.role})`
        );
      } else {
        setPinModalError(data.error || 'Gagal mengubah PIN pengguna.');
      }
    } catch {
      setPinModalError('Terjadi kendala jaringan saat memperbarui PIN.');
    }
  };

  // Handler Ubah PIN Saya Sendiri
  const handleSelfChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSelfPinMessage(null);

    if (selfNewPin !== selfConfirmPin) {
      setSelfPinMessage({ type: 'error', text: 'PIN baru dan konfirmasi PIN tidak cocok!' });
      return;
    }

    if (selfNewPin.length < 4 || selfNewPin.length > 8) {
      setSelfPinMessage({ type: 'error', text: 'PIN baru harus 4 s.d 8 digit angka.' });
      return;
    }

    try {
      const res = await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: currentUser.id,
          currentPin: selfCurrentPin,
          newPin: selfNewPin,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelfPinMessage({ type: 'success', text: 'PIN Anda berhasil diperbarui!' });
        setSelfCurrentPin('');
        setSelfNewPin('');
        setSelfConfirmPin('');
        setTimeout(() => setSelfPinMessage(null), 4000);

        await logAction(
          'CHANGE_PIN',
          'Ganti PIN Mandiri',
          'AUTENTIKASI',
          `${currentUser.name} memperbarui PIN login akun pribadinya.`
        );
      } else {
        setSelfPinMessage({ type: 'error', text: data.error || 'Gagal memperbarui PIN.' });
      }
    } catch {
      setSelfPinMessage({ type: 'error', text: 'Gagal menghubungi server.' });
    }
  };

  // Handler Tambah Pengurus Baru
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');

    if (!newUserData.name || !newUserData.title || !newUserData.pin) {
      setAddUserError('Nama lengkap, jabatan, dan PIN awal wajib diisi.');
      return;
    }

    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setAlertNotification(`Pengurus baru "${data.user.name}" berhasil didaftarkan ke sistem!`);
        setIsAddUserOpen(false);
        setNewUserData({
          name: '',
          title: '',
          role: 'SARPRAS',
          phone: '',
          pin: '123456',
        });
        fetchUsers();
        setTimeout(() => setAlertNotification(null), 4000);

        await logAction(
          'CREATE_USER',
          'Pendaftaran Akun Pengurus Baru',
          'AUTENTIKASI',
          `Super Admin mendaftarkan akun ${data.user.name} (${data.user.role})`
        );
      } else {
        setAddUserError(data.error || 'Gagal mendaftarkan pengurus baru.');
      }
    } catch {
      setAddUserError('Terjadi kesalahan jaringan saat mendaftarkan pengurus.');
    }
  };

  // Handler Manual Sync Turso
  const handleManualSyncTurso = async () => {
    setIsSyncingTurso(true);
    setSyncStatusMessage(null);
    try {
      const res = await fetch('/api/backup/auto', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncStatusMessage('Alhamdulillah! Sinkronisasi data cloud Turso & snapshot SQLite berhasil.');
        fetchDbStats();
        setTimeout(() => setSyncStatusMessage(null), 5000);

        await logAction(
          'SYNC_TURSO',
          'Sinkronisasi Cloud Turso',
          'SISTEM',
          'Super Admin memicu sinkronisasi manual database Turso LibSQL.'
        );
      } else {
        setSyncStatusMessage(`Pemberitahuan: ${data.message || 'Sinkronisasi selesai.'}`);
      }
    } catch {
      setSyncStatusMessage('Gagal menghubungi backend sinkronisasi.');
    } finally {
      setIsSyncingTurso(false);
    }
  };

  const filteredUsers = userList.filter((u) => {
    const matchQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
    const matchRole = filterRole === 'ALL' ? true : u.role === filterRole;
    return matchQuery && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Notifikasi Global */}
      {alertNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-soft-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{alertNotification}</span>
        </div>
      )}

      {/* Header Banner Super Admin */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-soft-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-teal-300 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Pusat Data & Infrastruktur TI — Akses Otoritas Super Admin</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Panel Kendali Super Administrator
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Pusat manajemen database cloud <strong>Turso LibSQL</strong>, pencadangan dan pemulihan data (*backup/restore*),
            manajemen pengguna pengurus DKM, serta reset dan pembaruan PIN keamanan.
          </p>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-4 text-xs text-teal-200 font-medium flex-wrap">
            <span>Login: <strong>{currentUser.name}</strong></span>
            <span>•</span>
            <span>Peran: <strong className="text-teal-300">SUPER_ADMIN</strong></span>
            <span>•</span>
            <span>Database: <strong>{dbEngine === 'turso_cloud' ? 'Turso Cloud LibSQL (Aktif)' : 'Local SQLite Persistent'}</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Database Engine</span>
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Database className="w-4 h-4" />
            </span>
          </div>
          <p className="text-base font-extrabold text-slate-900 mt-2">
            {dbEngine === 'turso_cloud' ? 'Turso Cloud LibSQL' : 'SQLite Local File'}
          </p>
          <p className="text-[11px] text-teal-700 font-semibold mt-1">
            {dbEngine === 'turso_cloud' ? 'AWS Tokyo Persisten' : 'Fallback Mode Aktif'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Pengurus</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2">{userList.length} Akun</p>
          <p className="text-[11px] text-blue-700 font-semibold mt-1">
            {userList.filter((u) => u.status !== 'NON_AKTIF').length} Akun Berstatus Aktif
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pencadangan Data</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Server className="w-4 h-4" />
            </span>
          </div>
          <p className="text-base font-extrabold text-slate-900 mt-2">Auto-Snapshot</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            SQLite .db & JSON Export Ready
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Keamanan Akses</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <KeyRound className="w-4 h-4" />
            </span>
          </div>
          <p className="text-base font-extrabold text-slate-900 mt-2">Bcrypt Hash Encrypted</p>
          <p className="text-[11px] text-purple-700 font-semibold mt-1">
            PIN Login Rate-Limited (5x fail)
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { id: 'users', label: 'Manajemen Pengguna & PIN', icon: Users, badge: userList.length },
            { id: 'turso', label: 'Database Cloud Turso', icon: Database },
            { id: 'backup', label: 'Cadangkan & Pulihkan (Backup)', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as 'users' | 'turso' | 'backup' | 'audit')}
                className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-slate-900 text-slate-900 bg-slate-100 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {onOpenAuditLogs && (
          <button
            onClick={onOpenAuditLogs}
            className="px-3.5 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
            title="Buka Rekaman Aktivitas & Mutasi Sistem"
          >
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <span>Rekaman Log Audit</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: MANAJEMEN PENGGUNA & PIN                                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'users' && (
        <div className="space-y-5">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-soft-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Daftar Akun Pengurus DKM & Otorisasi PIN
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola akun resmi seluruh pengurus, ubah/reset PIN, atau tambahkan staf divisi baru.
              </p>
            </div>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-soft-sm transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-teal-400" />
              <span>Tambah Pengurus Baru</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari nama pengurus, jabatan, email, atau nomor telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3.5 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Divisi:</span>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-hidden"
              >
                <option value="ALL">Semua Peran / Divisi</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="KETUA_UMUM">Ketua Umum</option>
                <option value="SEKRETARIS">Sekretaris Umum</option>
                <option value="BENDAHARA">Bendahara Umum</option>
                <option value="SARPRAS">Koordinator Sarpras</option>
                <option value="KEMASJIDAN">Peribadatan & Dakwah</option>
                <option value="DEWAN_PENGAWAS">Dewan Pengawas</option>
              </select>
            </div>
          </div>

          {/* Tabel Pengguna */}
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-soft-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Nama & Jabatan</th>
                  <th className="px-4 py-3">Peran / Role</th>
                  <th className="px-4 py-3">Departemen</th>
                  <th className="px-4 py-3">Kontak</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Aksi Keamanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 text-xs">{u.name}</div>
                      <div className="text-[11px] text-teal-800 font-semibold mt-0.5">{u.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {u.id}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                      {u.department}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-800 font-medium">{u.phone}</div>
                      <div className="text-slate-400 text-[10px]">{u.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          u.status !== 'NON_AKTIF'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {u.status || 'AKTIF'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setResetPinTarget(u);
                          setNewPinInput('');
                          setConfirmPinInput('');
                          setPinModalError('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-900 text-xs font-bold border border-slate-200 flex items-center gap-1.5 ml-auto transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                        <span>Ganti / Reset PIN</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card Khusus: Ubah PIN Akun Saya Sendiri */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Ubah PIN Keamanan Saya</h4>
                <p className="text-[11px] text-slate-500">
                  Perbarui PIN otentikasi login akun aktif ({currentUser.name}) secara mandiri.
                </p>
              </div>
            </div>

            {selfPinMessage && (
              <div
                className={`p-3 rounded-xl mb-3 text-xs font-semibold flex items-center gap-2 ${
                  selfPinMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border border-rose-300'
                }`}
              >
                {selfPinMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{selfPinMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSelfChangePin} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  PIN Saat Ini
                </label>
                <input
                  type="password"
                  required
                  placeholder="PIN lama (123456)"
                  value={selfCurrentPin}
                  onChange={(e) => setSelfCurrentPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  PIN Baru (4-8 Digit)
                </label>
                <input
                  type="password"
                  required
                  placeholder="PIN baru"
                  value={selfNewPin}
                  onChange={(e) => setSelfNewPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Konfirmasi PIN Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi PIN baru"
                  value={selfConfirmPin}
                  onChange={(e) => setSelfConfirmPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Simpan PIN Baru
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: DATABASE CLOUD TURSO                                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'turso' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Status Sinkronisasi Turso Cloud LibSQL
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      dbEngine === 'turso_cloud'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {dbEngine === 'turso_cloud' ? 'TERKONEKSI CLOUD' : 'LOCAL SQLITE'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Arsitektur Dual-Engine: Data tersimpan persisten di LibSQL Turso dan di-cache lokal untuk kecepatan rendering instan.
                </p>
              </div>

              <button
                onClick={handleManualSyncTurso}
                disabled={isSyncingTurso}
                className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-soft-sm transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncingTurso ? 'animate-spin' : ''}`} />
                <span>{isSyncingTurso ? 'Menyinkronkan...' : 'Sinkronisasi Sekarang'}</span>
              </button>
            </div>

            {syncStatusMessage && (
              <div className="mt-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{syncStatusMessage}</span>
              </div>
            )}
          </div>

          {/* Rincian Konfigurasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Informasi Endpoint Database
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500">Driver Engine:</span>
                  <strong className="text-slate-900 font-mono">@libsql/client (v0.18)</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500">Status Kredensial URL:</span>
                  <span className="font-bold text-emerald-700">Tersedia di Environment (.env)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500">Mode Write-Through:</span>
                  <span className="font-bold text-teal-800">In-Memory TTL + Cloud LibSQL</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tabel Basis Data Yang Dikelola (19 Tabel)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs max-h-[220px] overflow-y-auto pr-1">
                {[
                  'letters', 'minutes', 'jamaah', 'transactions', 'donors', 'assets',
                  'approvals', 'field_kpis', 'audit_logs', 'meta_kv', 'khatib_database', 'friday_schedules',
                  'ramadhan_schedules', 'kajian_schedules', 'physical_projects', 'sss_cans', 'sss_records', 'ziswaf_aids',
                  'users'
                ].map((tbl) => (
                  <div key={tbl} className="p-2 rounded-xl bg-slate-50 flex items-center gap-1.5 font-mono text-[11px] text-slate-700 font-semibold border border-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{tbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: CADANGKAN & PULIHKAN (BACKUP & RESTORE)                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'backup' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm">
            <h3 className="text-base font-bold text-slate-900">
              Pusat Pencadangan & Pemulihan Basis Data (Backup & Restore)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Khusus Super Admin: Unduh berkas snapshot database berkala untuk arsip offline, atau pulihkan data jika terjadi kendala server.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 flex-wrap">
              <a
                href="/api/database/backup?format=sqlite"
                download="sik_mbh_backup.sqlite"
                className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Snapshot SQLite (.db)</span>
              </a>

              <a
                href="/api/database/backup?format=json"
                download="sik_mbh_data_full.json"
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-teal-700" />
                <span>Unduh Snapshot Lengkap JSON</span>
              </a>

              {onOpenBackupModal && (
                <button
                  onClick={onOpenBackupModal}
                  className="px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-purple-700" />
                  <span>Buka Dialog Pemulihan (Restore)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET / GANTI PIN PENGURUS                                         */}
      {/* ========================================================================= */}
      {resetPinTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-pin-modal-title"
          className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/70 backdrop-blur-xs p-0 md:p-4 overflow-hidden animate-in fade-in"
        >
          <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl shadow-soft-xl border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] animate-slide-up md:animate-none">
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

            <div className="px-4 md:px-6 py-4 md:py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-white/10 border border-white/20 shrink-0">
                  <KeyRound className="w-5 h-5 text-teal-300" />
                </div>
                <div className="min-w-0">
                  <h3 id="reset-pin-modal-title" className="text-sm md:text-base font-bold truncate">Ubah / Reset PIN Pengurus</h3>
                  <p className="text-xs text-slate-300 truncate">Akun: {resetPinTarget.name}</p>
                </div>
              </div>
              <button
                onClick={() => setResetPinTarget(null)}
                aria-label="Tutup modal reset PIN"
                className="p-2 md:p-1 rounded-lg text-slate-400 hover:text-white shrink-0 ml-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPinSubmit} className="p-4 md:p-6 space-y-4 flex-1 overflow-y-auto overscroll-contain">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span>Jabatan: <strong>{resetPinTarget.title}</strong></span>
                <br />
                <span>User ID: <strong>{resetPinTarget.id}</strong></span>
              </div>

              {pinModalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{pinModalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PIN Baru (4-8 Digit Angka)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Contoh: 123456"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-mono focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Konfirmasi PIN Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi PIN baru"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-mono focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse md:flex-row items-center justify-end gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => setResetPinTarget(null)}
                  className="w-full md:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-xs font-bold text-slate-600 text-center flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold text-center flex items-center justify-center cursor-pointer transition-colors shadow-soft-sm"
                >
                  Simpan Perubahan PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH PENGURUS BARU                                               */}
      {/* ========================================================================= */}
      {isAddUserOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="add-user-modal-title" className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/70 backdrop-blur-xs p-0 md:p-4 overflow-hidden animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-2xl shadow-soft-xl border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] animate-slide-up md:animate-none">
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

            <div className="px-4 md:px-6 py-4 md:py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-white/10 border border-white/20 shrink-0">
                  <Users className="w-5 h-5 text-teal-300" />
                </div>
                <div className="min-w-0">
                  <h3 id="add-user-modal-title" className="text-sm md:text-base font-bold truncate">Pendaftaran Akun Pengurus Baru</h3>
                  <p className="text-xs text-slate-300 truncate">Penambahan pengurus DKM Babul Khaer</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-2 md:p-1 rounded-lg text-slate-400 hover:text-white shrink-0 ml-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-4 md:p-6 space-y-3.5 flex-1 overflow-y-auto overscroll-contain">
              {addUserError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{addUserError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: H. Amiruddin, S.Ag."
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan Resmi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Staf Humas & IT"
                    value={newUserData.title}
                    onChange={(e) => setNewUserData({ ...newUserData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Peran / Hak Akses <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) =>
                      setNewUserData({
                        ...newUserData,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="SARPRAS">SARPRAS (Sarana & Prasarana)</option>
                    <option value="KEMASJIDAN">KEMASJIDAN (Dakwah & Jamaah)</option>
                    <option value="BENDAHARA">BENDAHARA (Keuangan & Kas)</option>
                    <option value="SEKRETARIS">SEKRETARIS (Persuratan & Notulensi)</option>
                    <option value="KETUA_UMUM">KETUA_UMUM (Eksekutif)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Pusat Data IT)</option>
                    <option value="DEWAN_PENGAWAS">DEWAN_PENGAWAS (Read-Only)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIN Awal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="123456"
                    value={newUserData.pin}
                    onChange={(e) => setNewUserData({ ...newUserData, pin: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse md:flex-row items-center justify-end gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="w-full md:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-xs font-bold text-slate-600 text-center flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center flex items-center justify-center cursor-pointer transition-colors shadow-soft-sm"
                >
                  Daftarkan Pengurus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
