import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getSupabase } from '../config/supabase.js';

const router = Router();

function stringToUuid(str: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;

  const hash = crypto.createHash('md5').update(str).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16),
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.substring(18, 20),
    hash.substring(20, 32),
  ].join('-');
}

// 1. Upload speaker photo to Supabase Storage bucket 'speaker-photos'
router.post('/upload', async (req: Request, res: Response) => {
  try {
    const { image, speakerId = 'spk' } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'Image data is required' });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase storage is not configured' });
    }

    // Parse base64
    let buffer: Buffer;
    let mimeType = 'image/jpeg';
    let ext = 'jpg';

    if (image.startsWith('data:')) {
      const parts = image.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) mimeType = match[1];
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('gif')) ext = 'gif';
      buffer = Buffer.from(parts[1], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const cleanId = String(speakerId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const path = `speakers/${cleanId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('speaker-photos')
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return res.status(500).json({ success: false, message: uploadError.message });
    }

    const { data: pubData } = supabase.storage.from('speaker-photos').getPublicUrl(path);
    return res.json({
      success: true,
      url: pubData.publicUrl,
      path,
    });
  } catch (error: any) {
    console.error('Speaker photo upload error:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Upload failed' });
  }
});

// 2. Get all speakers
router.get('/', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from('speakers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to fetch speakers' });
  }
});

// 3. Upsert a speaker
router.post('/', async (req: Request, res: Response) => {
  try {
    const speaker = req.body;
    if (!speaker || !speaker.name) {
      return res.status(400).json({ success: false, message: 'Speaker name is required' });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client not available' });
    }

    const rawId = speaker.id || `sp-${Date.now()}`;
    const uuid = stringToUuid(rawId);
    const slug = speaker.slug || speaker.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const row = {
      id: uuid,
      name: speaker.name,
      slug,
      position: speaker.position || '',
      organization: speaker.organization || '',
      country: speaker.country || 'Ghana',
      photo_url: speaker.photo_url || '',
      biography: speaker.biography || '',
      expertise: Array.isArray(speaker.expertise) ? speaker.expertise : [],
      is_keynote: Boolean(speaker.is_keynote),
      linkedin_url: speaker.linkedin_url || null,
      twitter_url: speaker.twitter_url || null,
      website_url: speaker.website_url || null,
    };

    const { data, error } = await supabase.from('speakers').upsert(row).select().single();

    if (error) {
      console.error('Supabase speaker upsert error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to save speaker' });
  }
});

// 4. Delete speaker
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client not available' });
    }

    const uuid = stringToUuid(id);
    const { error } = await supabase.from('speakers').delete().eq('id', uuid);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.json({ success: true, message: 'Speaker deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to delete speaker' });
  }
});

export default router;
