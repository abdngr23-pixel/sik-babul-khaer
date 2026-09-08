/**
 * Helper verifikasi token sesi Web Crypto API yang kompatibel dengan Edge Runtime / Proxy Next.js 16.
 * Bekerja tanpa ketergantungan modul Node.js 'crypto'.
 */

export interface EdgeSessionPayload {
  userId: string;
  name: string;
  role: string;
  roleLabel: string;
  iat: number;
  exp: number;
}

/**
 * Mendapatkan auth secret dari environment.
 */
export function getRuntimeAuthSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.TURSO_AUTH_TOKEN ||
    'sik-babul-khaer-fallback-secret-2026'
  );
}

/**
 * Mengonversi Base64URL string ke Uint8Array.
 */
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Memverifikasi token sesi HMAC-SHA256 menggunakan Web Crypto API standar.
 */
export async function verifySessionTokenEdge(
  token: string,
  secret = getRuntimeAuthSecret()
): Promise<EdgeSessionPayload | null> {
  try {
    if (!token || !token.includes('.')) return null;

    const [payloadBase64, signatureBase64] = token.split('.');
    if (!payloadBase64 || !signatureBase64) return null;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64UrlToUint8Array(signatureBase64);
    const dataBytes = encoder.encode(payloadBase64);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBytes as unknown as BufferSource,
      dataBytes as unknown as BufferSource
    );

    if (!isValid) return null;

    // Decode payload
    const payloadBytes = base64UrlToUint8Array(payloadBase64);
    const decoder = new TextDecoder();
    const payloadJson = decoder.decode(payloadBytes);
    const payload = JSON.parse(payloadJson) as EdgeSessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}
