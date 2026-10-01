import React, { useRef, useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import {
  Plus, Search, Building, Edit2, Trash2, X, Upload,
  Camera, Star, Link2, Globe, AtSign, Save, User, Users,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Speaker } from '../../types';
import { ImageCropModal } from '../../components/ui/ImageCropModal';
import { supabase, supabaseAdmin, uploadSpeakerPhotoToCloud, stringToUuid } from '../../lib/supabase';
import { ApiClient } from '../../lib/api';

/* ─── Helpers ─── */

/** Convert a File to a base64 data URL so it persists in localStorage */
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/* ─── Empty speaker template ─── */
const emptySpeaker = (): Partial<Speaker> => ({
  id: `sp-${Date.now()}`,
  name: '',
  slug: '',
  position: '',
  organization: '',
  country: 'Ghana',
  photo_url: '',
  biography: '',
  expertise: [],
  is_keynote: false,
  speaker_type: 'PANEL',
  linkedin_url: '',
  twitter_url: '',
  website_url: '',
});

/* ─── Edit / Add Modal ─── */
const SpeakerModal: React.FC<{
  speaker: Partial<Speaker> | null;
  onClose: () => void;
  onSave: (s: Partial<Speaker>) => void;
}> = ({ speaker, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Speaker>>(speaker ?? emptySpeaker());
  const [expertiseInput, setExpertiseInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>(speaker?.photo_url ?? '');
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null); // pre-crop
  const [showCrop, setShowCrop] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof Speaker, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    setUploadWarning(null);
    try {
      const base64 = await fileToBase64(file);
      setRawImageSrc(base64);
      setShowCrop(true);
    } catch (err) {
      console.error('Image read failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCropComplete = async (croppedBase64: string) => {
    setShowCrop(false);
    setRawImageSrc(null);
    setUploading(true);
    setUploadWarning(null);
    try {
      const speakerId = form.id ?? `sp-${Date.now()}`;
      const { url, isPublic } = await uploadSpeakerPhotoToCloud(croppedBase64, speakerId);
      setPreviewUrl(url);
      set('photo_url', url);
      if (!isPublic) {
        setUploadWarning('⚠️ Cloud storage upload failed. Image saved locally on this browser.');
      }
    } catch (err) {
      setPreviewUrl(croppedBase64);
      set('photo_url', croppedBase64);
      setUploadWarning('⚠️ Cloud upload failed. Photo saved locally for this browser.');
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCrop(false);
    setRawImageSrc(null);
  };


  const addExpertise = () => {
    const tag = expertiseInput.trim();
    if (!tag) return;
    set('expertise', [...(form.expertise ?? []), tag]);
    setExpertiseInput('');
  };

  const removeExpertise = (i: number) => {
    set('expertise', (form.expertise ?? []).filter((_, idx) => idx !== i));
  };

  const handleSave = () => {
    if (!form.name?.trim()) return;
    const slug = form.name.toLowerCase().replace(/\s+/g, '-');
    onSave({ ...form, slug, photo_url: previewUrl || form.photo_url });
    onClose();
  };

  return (
    <>
      {/* Crop modal renders above the speaker modal */}
      {showCrop && rawImageSrc && (
        <ImageCropModal
          imageSrc={rawImageSrc}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
        />
      )}

      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-none shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-7 py-3.5 sm:py-5 sticky top-0 bg-[#005C20] z-10">
          <div>
            <h2 className="text-xl font-black text-white font-display">
              {speaker?.id && !speaker.id.startsWith('sp-') ? 'Edit Speaker' : 'Add Speaker'}
            </h2>
            <p className="text-xs text-white/70 mt-0.5">Changes are saved and will show on the main site.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-none hover:bg-white/10 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-7 py-6 space-y-6">
          {/* Photo Upload */}
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0 w-24 h-24">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="w-24 h-24 rounded-none object-cover shadow-sm" />
              ) : (
                <div className="w-24 h-24 rounded-none bg-slate-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-300" />
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
              >
                {uploading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white drop-shadow" />
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-700 mb-1">Speaker Photo</p>
              <p className="text-xs text-slate-400 mb-3">Upload a professional headshot. Saved automatically.</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-none bg-slate-100 hover:bg-[#F0FAF4] text-xs font-bold text-slate-600 hover:text-[#008B2E] transition-all"
              >
                <Upload className="w-4 h-4" /> {uploading ? 'Uploading to cloud…' : 'Upload Photo'}
              </button>
              {uploadWarning && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-none px-3 py-2 leading-relaxed">
                  {uploadWarning}
                </p>
              )}
            </div>
          </div>

          {/* Name & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Full Name *</label>
              <input
                value={form.name ?? ''}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Dr. Ernest Addison"
                className="w-full px-4 py-2.5 rounded-none bg-slate-100 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008B2E]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Job Title / Position *</label>
              <input
                value={form.position ?? ''}
                onChange={(e) => set('position', e.target.value)}
                placeholder="Governor"
                className="w-full px-4 py-2.5 rounded-none bg-slate-100 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008B2E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Organisation / Institution *</label>
              <input
                value={form.organization ?? ''}
                onChange={(e) => set('organization', e.target.value)}
                placeholder="Bank of Ghana"
                className="w-full px-4 py-2.5 rounded-none bg-slate-100 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008B2E]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Country</label>
              <input
                value={form.country ?? ''}
                onChange={(e) => set('country', e.target.value)}
                placeholder="Ghana"
                className="w-full px-4 py-2.5 rounded-none bg-slate-100 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008B2E]"
              />
            </div>
          </div>

          {/* Speaker Category / Designation */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Speaker Category / Designation *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Keynote Speaker */}
              <button
                type="button"
                onClick={() => {
                  set('is_keynote', true);
                  set('speaker_type', 'KEYNOTE');
                }}
                className={`flex items-start gap-3.5 p-4 rounded-none text-left transition-all cursor-pointer ${
                  (form.speaker_type === 'KEYNOTE' || form.is_keynote)
                    ? 'bg-amber-100 text-amber-950 shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 transition-colors ${
                  (form.speaker_type === 'KEYNOTE' || form.is_keynote)
                    ? 'bg-amber-500 text-white shadow'
                    : 'bg-white text-slate-400'
                }`}>
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-extrabold text-slate-900">Keynote Speaker</span>
                    {(form.speaker_type === 'KEYNOTE' || form.is_keynote) && (
                      <span className="text-[10px] font-black uppercase bg-amber-500 text-white px-2 py-0.5 rounded-none">Selected</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">
                    Featured luminary, plenary address &amp; distinguished keynote
                  </p>
                </div>
              </button>

              {/* Option 2: Panels */}
              <button
                type="button"
                onClick={() => {
                  set('is_keynote', false);
                  set('speaker_type', 'PANEL');
                }}
                className={`flex items-start gap-3.5 p-4 rounded-none text-left transition-all cursor-pointer ${
                  (form.speaker_type === 'PANEL' || (!form.is_keynote && form.speaker_type !== 'KEYNOTE'))
                    ? 'bg-emerald-100 text-emerald-950 shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 transition-colors ${
                  (form.speaker_type === 'PANEL' || (!form.is_keynote && form.speaker_type !== 'KEYNOTE'))
                    ? 'bg-[#008B2E] text-white shadow'
                    : 'bg-white text-slate-400'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-extrabold text-slate-900">Panels</span>
                    {(form.speaker_type === 'PANEL' || (!form.is_keynote && form.speaker_type !== 'KEYNOTE')) && (
                      <span className="text-[10px] font-black uppercase bg-[#008B2E] text-white px-2 py-0.5 rounded-none">Selected</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">
                    Panel moderator, panelist &amp; breakout session faculty
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Biography */}
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Biography</label>
            <textarea
              value={form.biography ?? ''}
              onChange={(e) => set('biography', e.target.value)}
              rows={3}
              placeholder="Brief professional biography..."
              className="w-full px-4 py-2.5 rounded-none bg-slate-100 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008B2E] resize-none"
            />
          </div>

          {/* Expertise Tags */}
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Areas of Expertise</label>
            <div className="flex gap-2 mb-2">
              <input
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                placeholder="e.g. Central Banking"
                className="flex-1 px-4 py-2 rounded-none bg-slate-100 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008B2E]"
              />
              <button
                onClick={addExpertise}
                className="px-4 py-2 bg-[#008B2E] text-white rounded-none text-sm font-bold hover:bg-[#006B22]"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(form.expertise ?? []).map((tag, i) => (
                <span key={i} className="flex items-center gap-1 px-3 py-1 bg-[#E6F5EC] text-[#008B2E] text-xs font-bold rounded-none">
                  {tag}
                  <button onClick={() => removeExpertise(i)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1 block"><Link2 className="w-3 h-3" /> LinkedIn</label>
              <input value={form.linkedin_url ?? ''} onChange={(e) => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full px-3 py-2 rounded-none bg-slate-100 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008B2E]" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1 block"><AtSign className="w-3 h-3" /> Twitter / X</label>
              <input value={form.twitter_url ?? ''} onChange={(e) => set('twitter_url', e.target.value)} placeholder="https://x.com/..." className="w-full px-3 py-2 rounded-none bg-slate-100 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008B2E]" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1 block"><Globe className="w-3 h-3" /> Website</label>
              <input value={form.website_url ?? ''} onChange={(e) => set('website_url', e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-none bg-slate-100 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008B2E]" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-5 py-2.5 rounded-none bg-slate-100 text-sm font-bold text-slate-600 hover:bg-slate-200">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name?.trim() || uploading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-none bg-[#008B2E] text-white text-sm font-bold hover:bg-[#006B22] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Save className="w-4 h-4" /> Save Speaker
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

/* ─── Main Page ─── */
export const AdminSpeakers: React.FC = () => {
  const { speakers, addSpeaker, updateSpeaker, deleteSpeaker, refreshSpeakers } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'KEYNOTE' | 'PANEL'>('ALL');
  const [editTarget, setEditTarget] = useState<Partial<Speaker> | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const isKeynoteSpeaker = (s: Speaker) => s.speaker_type === 'KEYNOTE' || Boolean(s.is_keynote);

  const keynoteCount = useMemo(
    () => speakers.filter(isKeynoteSpeaker).length,
    [speakers]
  );
  const panelCount = useMemo(
    () => speakers.filter((s) => !isKeynoteSpeaker(s)).length,
    [speakers]
  );

  const filtered = useMemo(() => {
    return speakers.filter((s) => {
      const isKeynote = isKeynoteSpeaker(s);
      if (categoryFilter === 'KEYNOTE' && !isKeynote) return false;
      if (categoryFilter === 'PANEL' && isKeynote) return false;

      const q = searchQuery.toLowerCase();
      return (
        (s.name ?? '').toLowerCase().includes(q) ||
        (s.organization ?? '').toLowerCase().includes(q) ||
        (s.position ?? '').toLowerCase().includes(q)
      );
    });
  }, [speakers, categoryFilter, searchQuery]);

  const handleSave = async (updated: Partial<Speaker>) => {
    const isKeynote = updated.speaker_type === 'KEYNOTE' || Boolean(updated.is_keynote);
    const speakerType: 'KEYNOTE' | 'PANEL' = isKeynote ? 'KEYNOTE' : 'PANEL';
    const normalized: Partial<Speaker> = {
      ...updated,
      is_keynote: isKeynote,
      speaker_type: speakerType,
    };

    const exists = speakers.find((s) => s.id === normalized.id);
    if (exists) {
      updateSpeaker(normalized.id!, normalized);
    } else {
      addSpeaker(normalized);
    }

    // Persist to Supabase Database (both ApiClient and supabaseAdmin with service role)
    if (normalized.id) {
      const uuid = stringToUuid(normalized.id);
      const cleanSlug = normalized.slug || (normalized.name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        id: uuid,
        name: normalized.name ?? '',
        slug: cleanSlug,
        position: normalized.position ?? '',
        organization: normalized.organization ?? '',
        country: normalized.country ?? 'Ghana',
        photo_url: normalized.photo_url ?? '',
        biography: normalized.biography ?? '',
        expertise: normalized.expertise ?? [],
        is_keynote: isKeynote,
        linkedin_url: normalized.linkedin_url || null,
        twitter_url: normalized.twitter_url || null,
        website_url: normalized.website_url || null,
      };

      // 1. Direct Supabase database upsert (service role bypasses RLS)
      try {
        await supabaseAdmin.from('speakers').upsert(payload);
      } catch (sbErr) {
        console.warn('Supabase DB save error:', sbErr);
      }

      // 2. Also notify backend API if running
      try {
        await ApiClient.saveSpeaker({ ...normalized, id: uuid, slug: cleanSlug });
      } catch {
        // Backend offline / static build fallback
      }

      // Refresh from cloud so the new photo_url shows on all devices immediately
      setTimeout(() => refreshSpeakers(), 600);
    }
  };

  const handleToggleRole = (spk: Speaker) => {
    const isKeynote = isKeynoteSpeaker(spk);
    const nextKeynote = !isKeynote;
    handleSave({
      ...spk,
      is_keynote: nextKeynote,
      speaker_type: nextKeynote ? 'KEYNOTE' : 'PANEL',
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this speaker?')) {
      // Capture photo URL before removing from local state
      const speaker = speakers.find((s) => s.id === id);
      const photoUrl = speaker?.photo_url ?? '';

      deleteSpeaker(id);
      const uuid = stringToUuid(id);

      // 1. Delete DB row
      try {
        await supabaseAdmin.from('speakers').delete().eq('id', uuid);
      } catch (e) {
        console.warn('Supabase DB delete error:', e);
      }

      // 2. Delete image from Supabase Storage (only cloud-hosted photos)
      if (photoUrl && photoUrl.includes('/storage/v1/object/public/speaker-photos/')) {
        try {
          const storagePath = photoUrl.split('/storage/v1/object/public/speaker-photos/')[1];
          if (storagePath) {
            const { error: storageError } = await supabaseAdmin.storage
              .from('speaker-photos')
              .remove([storagePath]);
            if (storageError) {
              console.warn('Storage image delete error:', storageError);
            }
          }
        } catch (e) {
          console.warn('Failed to delete speaker photo from storage:', e);
        }
      }

      // 3. Fallback API delete
      try {
        await ApiClient.deleteSpeaker(uuid);
      } catch {
        // ignore
      }
    }
  };

  return (
    <AdminLayout
      title="Conference Faculty & Speakers"
      subtitle="Manage keynote luminaries, panel moderators, and guest resource persons."
      actions={
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAdding(true)} className="rounded-none">
          Add Speaker
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Category Filter Tabs & Search Controls */}
        <div className="bg-white p-4 rounded-none shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="inline-flex rounded-none bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setCategoryFilter('ALL')}
                className={`px-4 py-2 rounded-none text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  categoryFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                All Speakers ({speakers.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('KEYNOTE')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-none text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  categoryFilter === 'KEYNOTE'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-amber-700 hover:text-amber-900 hover:bg-white/60'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                Keynote Speakers ({keynoteCount})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('PANEL')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-none text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  categoryFilter === 'PANEL'
                    ? 'bg-[#008B2E] text-white shadow-sm'
                    : 'text-[#006B22] hover:text-[#005018] hover:bg-white/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Panels ({panelCount})
              </button>
            </div>

            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
              Showing {filtered.length} of {speakers.length} Speakers
            </span>
          </div>

          {/* Search bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by speaker name, job position, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-none bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008B2E] shadow-inner"
            />
          </div>
        </div>

        {/* Speaker Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((spk) => {
            const photo = spk.photo_url;
            const isKeynote = isKeynoteSpeaker(spk);

            return (
              <div
                key={spk.id}
                className="bg-white rounded-none shadow-md hover:shadow-xl transition-all group flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top */}
                <div className="p-5 pb-3">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {photo ? (
                        <img
                          src={photo}
                          alt={spk.name}
                          className="w-16 h-16 rounded-none object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-none bg-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      {isKeynote ? (
                        <span
                          className="absolute top-0 right-0 w-5 h-5 bg-amber-500 rounded-none flex items-center justify-center shadow-sm"
                          title="Keynote Speaker"
                        >
                          <Star className="w-3 h-3 text-white fill-white" />
                        </span>
                      ) : (
                        <span
                          className="absolute top-0 right-0 w-5 h-5 bg-[#008B2E] rounded-none flex items-center justify-center shadow-sm"
                          title="Panels"
                        >
                          <Users className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-black text-slate-900 truncate">{spk.name}</h4>
                        {isKeynote ? (
                          <span className="text-[9px] font-extrabold uppercase bg-amber-500 text-white px-2 py-0.5 rounded-none leading-none inline-flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Keynote Speaker
                          </span>
                        ) : (
                          <span className="text-[9px] font-extrabold uppercase bg-[#008B2E] text-white px-2 py-0.5 rounded-none leading-none inline-flex items-center gap-1">
                            <Users className="w-2.5 h-2.5" />
                            Panels
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-[#008B2E] truncate mt-0.5">{spk.position}</p>
                      <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 flex-shrink-0" /> {spk.organization}
                      </p>
                    </div>
                  </div>

                  {/* Expertise Tags */}
                  {spk.expertise && spk.expertise.length > 0 && (
                    <div className="pt-3 flex flex-wrap gap-1.5">
                      {spk.expertise.slice(0, 3).map((exp, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-none font-semibold">
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/70 rounded-none">
                  {/* 1-Click Role Switcher */}
                  <button
                    type="button"
                    onClick={() => handleToggleRole(spk)}
                    title={`Click to switch designation to ${isKeynote ? 'Panels' : 'Keynote Speaker'}`}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-none transition-all cursor-pointer flex items-center gap-1.5 ${
                      isKeynote
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        : 'bg-emerald-100 text-[#006B22] hover:bg-emerald-200'
                    }`}
                  >
                    {isKeynote ? (
                      <>
                        <Star className="w-3 h-3 fill-current text-amber-500" />
                        <span>Keynote Speaker</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-3 h-3 text-[#008B2E]" />
                        <span>Panels</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditTarget(spk)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-none bg-slate-200 text-xs font-bold text-slate-700 hover:bg-[#008B2E] hover:text-white transition-all shadow-xs"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(spk.id!)}
                      className="p-1.5 rounded-none bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="col-span-3 py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-none bg-slate-100 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-base font-bold text-slate-700">No speakers found</p>
              <p className="text-sm text-slate-400 mt-1">Add a speaker or adjust your search filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <SpeakerModal speaker={editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} />
      )}

      {/* Add Modal */}
      {isAdding && (
        <SpeakerModal speaker={emptySpeaker()} onClose={() => setIsAdding(false)} onSave={handleSave} />
      )}
    </AdminLayout>
  );
};
