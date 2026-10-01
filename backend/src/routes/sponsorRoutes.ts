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

// 1. Upload sponsor logo to Supabase Storage bucket 'speaker-photos'
router.post('/upload', async (req: Request, res: Response) => {
  try {
    const { image, sponsorId = 'sp' } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'Image data is required' });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase storage is not configured' });
    }

    let buffer: Buffer;
    let mimeType = 'image/png';
    let ext = 'png';

    if (image.startsWith('data:')) {
      const parts = image.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) mimeType = match[1];
      if (mimeType.includes('svg')) ext = 'svg';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
      buffer = Buffer.from(parts[1], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const cleanId = String(sponsorId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const path = `sponsors/${cleanId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('speaker-photos')
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase sponsor logo storage upload error:', uploadError);
      return res.status(500).json({ success: false, message: uploadError.message });
    }

    const { data: pubData } = supabase.storage.from('speaker-photos').getPublicUrl(path);
    return res.json({
      success: true,
      url: pubData.publicUrl,
      path,
    });
  } catch (error: any) {
    console.error('Sponsor logo upload error:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Upload failed' });
  }
});

// 2. Get all sponsors
router.get('/', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const mapped = (data || []).map((row: any) => {
      let meta: any = {};
      try {
        if (row.description && row.description.startsWith('{')) {
          meta = JSON.parse(row.description);
        }
      } catch {}
      const isMember = row.tier === 'PARTNER' || meta.type === 'CORPORATE_MEMBER';
      const cleanLogo = row.logo_url && !row.logo_url.includes('unsplash.com') ? row.logo_url.trim() : '';
      return {
        id: meta.originalId || row.id,
        dbId: row.id,
        name: row.name,
        logo_url: cleanLogo,
        website_url: row.website_url || '',
        tier: isMember ? 'CORPORATE_MEMBER' : row.tier,
        type: isMember ? 'CORPORATE_MEMBER' : 'SPONSOR',
        categoryOrRole: meta.role || (row.description && !row.description.startsWith('{') ? row.description : '') || (isMember ? 'Licensed Commercial Bank' : 'Corporate Sponsor'),
        description: meta.desc || (row.description && !row.description.startsWith('{') ? row.description : ''),
      };
    });

    return res.json({ success: true, data: mapped });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to fetch sponsors' });
  }
});

// 3. Upsert a sponsor
router.post('/', async (req: Request, res: Response) => {
  try {
    const sponsor = req.body;
    if (!sponsor || !sponsor.name) {
      return res.status(400).json({ success: false, message: 'Entity name is required' });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client not available' });
    }

    const rawId = sponsor.id || `sp-${Date.now()}`;
    const uuid = stringToUuid(rawId);
    const isMember = sponsor.type === 'CORPORATE_MEMBER';
    const validTiers = ['PARTNER', 'PLATINUM', 'GOLD', 'SILVER', 'ACADEMIC'];
    const dbTier = isMember ? 'PARTNER' : (validTiers.includes(sponsor.tier) ? sponsor.tier : 'PLATINUM');
    const descJson = JSON.stringify({
      role: sponsor.categoryOrRole || '',
      desc: sponsor.description || '',
      type: sponsor.type,
      originalId: rawId,
    });

    const row = {
      id: uuid,
      name: sponsor.name,
      logo_url: sponsor.logo_url || '',
      website_url: sponsor.website_url || null,
      tier: dbTier,
      description: descJson,
    };

    const { data, error } = await supabase.from('sponsors').upsert(row).select().single();

    if (error) {
      console.error('Supabase sponsor upsert error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to save sponsor' });
  }
});

// 4. Delete a sponsor
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client not available' });
    }

    const uuid = stringToUuid(id);
    const { error } = await supabase.from('sponsors').delete().eq('id', uuid);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.json({ success: true, message: 'Sponsor deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to delete sponsor' });
  }
});

export default router;
