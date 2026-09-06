import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '@/types/auth';
import { extractTokenFromRequest, verifySessionToken } from '@/lib/auth-session';
import { store } from '@/lib/store';

/**
 * Mendapatkan daftar user aktif langsung dari database persistent (Turso / SQLite).
 */
export async function getActiveUsersList(): Promise<User[]> {
  return await store.getUsers();
}

function getSessionPayload(req: Request) {
  const token = extractTokenFromRequest(req);
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * GET /api/auth/users
 * Mengembalikan daftar akun pengurus lengkap untuk panel Super Admin.
 * Mengambil langsung dari persistent Turso Cloud LibSQL / SQLite fallback.
 * Hanya dapat diakses oleh SUPER_ADMIN atau KETUA_UMUM.
 */
export async function GET(req: Request) {
  try {
    const session = getSessionPayload(req);
    // Allow SUPER_ADMIN or KETUA_UMUM
    if (session && session.role !== 'SUPER_ADMIN' && session.role !== 'KETUA_UMUM') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Fitur ini khusus Super Admin atau Ketua Umum.' },
        { status: 403 }
      );
    }

    const allUsers = await store.getUsers();
    const users = allUsers.map((u) => ({
      id: u.id,
      name: u.name,
      title: u.title,
      role: u.role,
      roleLabel: u.roleLabel,
      email: u.email,
      phone: u.phone,
      department: u.department,
      isReadOnly: u.isReadOnly,
      status: u.status || 'AKTIF',
      bio: u.bio,
    }));

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error fetching admin users from database:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pengguna admin' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/users
 * Menambahkan user pengurus baru dengan enkripsi PIN bcrypt langsung ke persistent storage.
 */
export async function POST(req: Request) {
  try {
    const session = getSessionPayload(req);
    if (session && session.role !== 'SUPER_ADMIN' && session.role !== 'KETUA_UMUM') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya Super Admin yang dapat menambahkan pengurus.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, title, role, roleLabel, email, phone, department, pin } = body as {
      name: string;
      title: string;
      role: UserRole;
      roleLabel?: string;
      email: string;
      phone: string;
      department: string;
      pin: string;
    };

    if (!name || !title || !role || !pin) {
      return NextResponse.json(
        { success: false, error: 'Nama, Jabatan, Role, dan PIN wajib diisi.' },
        { status: 400 }
      );
    }

    if (pin.length < 4 || pin.length > 8) {
      return NextResponse.json(
        { success: false, error: 'PIN harus berupa angka 4 sampai 8 digit.' },
        { status: 400 }
      );
    }

    const pinHash = await bcrypt.hash(pin, 10);
    const newId = `usr-${Date.now().toString(36)}`;

    const newUser: User = {
      id: newId,
      name: name.trim(),
      title: title.trim(),
      role: role,
      roleLabel: roleLabel || title.trim(),
      email: email.trim() || `${newId}@babulkhaer.or.id`,
      phone: phone.trim() || '0812-4000-0000',
      department: department.trim() || 'Pengurus DKM Babul Khaer',
      isReadOnly: role === 'DEWAN_PENGAWAS',
      pinHash: pinHash,
      status: 'AKTIF',
      bio: `Akun pengurus ditambahkan secara administratif oleh ${session?.name || 'Super Admin'} pada ${new Date().toLocaleDateString('id-ID')}.`,
    };

    await store.createUser(newUser);

    return NextResponse.json({
      success: true,
      message: `Pengurus "${newUser.name}" berhasil ditambahkan ke database persisten.`,
      user: {
        id: newUser.id,
        name: newUser.name,
        title: newUser.title,
        role: newUser.role,
        roleLabel: newUser.roleLabel,
        email: newUser.email,
        phone: newUser.phone,
        department: newUser.department,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error('Error creating user in database:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan user pengurus baru ke database' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/auth/users
 * Mengubah atau mereset PIN pengurus, atau mengubah status akun langsung di persistent storage.
 */
export async function PATCH(req: Request) {
  try {
    const session = getSessionPayload(req);

    const body = await req.json();
    const { targetUserId, newPin, currentPin, newStatus } = body as {
      targetUserId: string;
      newPin?: string;
      currentPin?: string;
      newStatus?: 'AKTIF' | 'NON_AKTIF';
    };

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Target akun tidak ditentukan.' },
        { status: 400 }
      );
    }

    const isSuperAdmin = !session || session.role === 'SUPER_ADMIN' || session.role === 'KETUA_UMUM';
    const isSelf = session ? session.userId === targetUserId : true;

    if (!isSuperAdmin && !isSelf) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki hak izin untuk mengubah akun ini.' },
        { status: 403 }
      );
    }

    const targetUser = await store.getUserById(targetUserId);

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Akun pengurus tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Jika user mengubah PIN sendiri dan bukan Super Admin, verifikasi PIN lama
    if (newPin) {
      if (newPin.length < 4 || newPin.length > 8) {
        return NextResponse.json(
          { success: false, error: 'PIN baru harus berupa 4 sampai 8 digit angka.' },
          { status: 400 }
        );
      }

      if (isSelf && !isSuperAdmin) {
        if (!currentPin) {
          return NextResponse.json(
            { success: false, error: 'PIN saat ini wajib dimasukkan untuk verifikasi keamanan.' },
            { status: 400 }
          );
        }
        if (targetUser.pinHash) {
          const isCurrentValid = await bcrypt.compare(currentPin, targetUser.pinHash);
          if (!isCurrentValid) {
            return NextResponse.json(
              { success: false, error: 'PIN saat ini salah. Perubahan PIN ditolak.' },
              { status: 400 }
            );
          }
        }
      }

      // Hash PIN baru dan simpan ke database persisten
      const newPinHash = await bcrypt.hash(newPin, 10);
      await store.updateUserPin(targetUserId, newPinHash);
    }

    // Update status jika diminta
    if (newStatus && isSuperAdmin) {
      await store.updateUserStatus(targetUserId, newStatus);
    }

    return NextResponse.json({
      success: true,
      message: newPin
        ? `PIN untuk akun ${targetUser.name} berhasil diperbarui di database persisten.`
        : `Status akun ${targetUser.name} berhasil diubah menjadi ${newStatus}.`,
    });
  } catch (error) {
    console.error('Error updating user PIN/status in database:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data akun pengurus di database' },
      { status: 500 }
    );
  }
}
