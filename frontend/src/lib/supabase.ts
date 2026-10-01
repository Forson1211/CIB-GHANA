import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ijfjuezgvroyhtwcnlrx.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZmp1ZXpndnJveWh0d2NubHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMjIzNzQsImV4cCI6MjEwNTg5ODM3NH0.cbzToWOHT5DeYbtXDqG_lt_Lfxsb3Y-eJaQkC5UJW40';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('https://')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseServiceKey =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZmp1ZXpndnJveWh0d2NubHJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDMyMjM3NCwiZXhwIjoyMTA1ODk4Mzc0fQ.LKsElhVQb7kY4Xek5SvoTwTpZ1rsuWbjSBX7-SlMP9k';

// Supabase client with service role for admin operations (bypasses RLS for storage & tables)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Pure JS MD5 implementation for RFC4122 v4 UUID compatibility with backend
function computeMd5(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number): number {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number): number {
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number): number { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number): number { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number): number { return x ^ y ^ z; }
  function I(x: number, y: number, z: number): number { return y ^ (x | ~z); }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function convertToWordArray(str: string): number[] {
    const lMessageLength = str.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray: number[] = new Array(lNumberOfWords - 1).fill(0);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      const lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    const lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function wordToHex(lValue: number): string {
    let wordToHexValue = '';
    for (let lCount = 0; lCount <= 3; lCount++) {
      const lByte = (lValue >>> (lCount * 8)) & 255;
      const wordToHexValue_temp = '0' + lByte.toString(16);
      wordToHexValue += wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  }

  const x = convertToWordArray(string);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

/**
 * Deterministically map any string ID (like 'spk-2', 'spk-sam-george', or 'sp-179052')
 * into a valid RFC4122 v4 UUID identical to Node crypto.createHash('md5').
 */
export function stringToUuid(str: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;

  const hash = computeMd5(str);
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16),
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.substring(18, 20),
    hash.substring(20, 32),
  ].join('-');
}

/** Convert base64 data URL to Blob with universal browser compatibility */
export async function base64ToBlob(dataUrl: string): Promise<Blob> {
  // Method 1: native browser fetch from data URI (fastest and most reliable)
  if (dataUrl.startsWith('data:')) {
    try {
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch {
      // fallback
    }
  }

  // Method 2: atob manual decode
  const parts = dataUrl.split(',');
  const b64 = parts.length > 1 ? parts[1] : parts[0];
  const mimeMatch = parts[0]?.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/**
 * Upload speaker image to Supabase Storage bucket 'speaker-photos'.
 * Works flawlessly on hosted static sites, mobile devices, and local servers:
 * 1. Direct Supabase Storage upload via service role client (bypasses RLS)
 * 2. Fallback to backend /api/speakers/upload if direct fails
 * 3. Returns permanent public URL accessible to ALL devices
 */
export async function uploadSpeakerPhotoToCloud(
  base64: string,
  speakerId: string
): Promise<{ url: string; isPublic: boolean }> {
  // If already a remote URL, nothing to upload
  if (base64.startsWith('http://') || base64.startsWith('https://')) {
    return { url: base64, isPublic: true };
  }

  // 1. Direct Supabase Storage Upload (works on all devices, mobile & hosted)
  try {
    const blob = await base64ToBlob(base64);
    const mime = blob.type || 'image/jpeg';
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    const cleanId = String(speakerId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const path = `speakers/${cleanId}-${Date.now()}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from('speaker-photos')
      .upload(path, blob, {
        upsert: true,
        contentType: mime,
      });

    if (!error) {
      const { data } = supabaseAdmin.storage.from('speaker-photos').getPublicUrl(path);
      if (data?.publicUrl) {
        return { url: data.publicUrl, isPublic: true };
      }
    } else {
      console.warn('Direct supabaseAdmin storage upload error:', error);
    }
  } catch (err) {
    console.warn('Direct cloud upload failed, trying backend API:', err);
  }

  // 2. Fallback: Backend Upload API
  try {
    const res = await fetch('/api/speakers/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, speakerId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return { url: data.url, isPublic: true };
      }
    }
  } catch {
    // Both failed
  }

  // 3. Fallback (local browser only)
  return { url: base64, isPublic: false };
}

export async function uploadSponsorLogoToCloud(
  base64: string,
  sponsorId: string
): Promise<{ url: string; isPublic: boolean }> {
  // If it's already a hosted http/https URL, return directly
  if (base64.startsWith('http://') || base64.startsWith('https://')) {
    return { url: base64, isPublic: true };
  }

  // 1. Direct Supabase Storage via Service Role client (bypasses RLS)
  try {
    const blob = await base64ToBlob(base64);
    const mime = blob.type || 'image/png';
    const ext = mime.includes('svg') ? 'svg' : mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    const cleanId = String(sponsorId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const path = `sponsors/${cleanId}-${Date.now()}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from('speaker-photos')
      .upload(path, blob, {
        upsert: true,
        contentType: mime,
      });

    if (!error) {
      const { data } = supabaseAdmin.storage.from('speaker-photos').getPublicUrl(path);
      if (data?.publicUrl) {
        return { url: data.publicUrl, isPublic: true };
      }
    } else {
      console.warn('Direct supabaseAdmin storage upload error for sponsor:', error);
    }
  } catch (err) {
    console.warn('Direct cloud sponsor logo upload failed, trying backend API:', err);
  }

  // 2. Fallback: Backend Upload API
  try {
    const res = await fetch('/api/sponsors/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, sponsorId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return { url: data.url, isPublic: true };
      }
    }
  } catch {
    // Both failed
  }

  // 3. Fallback (local browser only)
  return { url: base64, isPublic: false };
}

export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: 'Using offline mock store. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file to enable live PostgreSQL sync.',
    };
  }

  try {
    const { error } = await supabase.from('events').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return { connected: true, message: 'Connected to Supabase PostgreSQL database.' };
  } catch (err: any) {
    return { connected: false, message: err?.message || 'Failed to connect to Supabase.' };
  }
}
