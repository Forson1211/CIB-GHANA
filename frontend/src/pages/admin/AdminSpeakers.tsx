import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import {
  Plus, Search, Building, Edit2, Trash2, X, Upload,
  Camera, Star, Link2, Globe, AtSign, Save, User,
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

      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-display">
              {speaker?.id && !speaker.id.startsWith('sp-') ? 'Edit Speaker' : 'Add Speaker'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Changes are saved and will show on the main site.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-7 py-6 space-y-6">
          {/* Photo Upload */}
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                  <User className="w-8 h-8 text-slate-300" />
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#008B2E] text-white flex items-center justify-center shadow-lg hover:bg-[#006B22] transition-colors"
              >
                {uploading ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-700 mb-1">Speaker Photo</p>
              <p className="text-xs text-slate-400 mb-3">Upload a professional headshot. Saved automatically.</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#008B2E] hover:bg-[#F0FAF4] text-xs font-bold text-slate-500 hover:text-[#008B2E] transition-all"
              >
                <Upload className="w-4 h-4" /> {uploading ? 'Uploading to cloud…' : 'Upload Photo'}
              </button>
              {uploadWarning && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#008B2E] focus:outline-none focus:ring-2 focus:ring-[#008B2E]/20"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Job Title / Position *</label>
              <input
                value={form.position ?? ''}
                onChange={(e) => set('position', e.target.value)}
                placeholder="Governor"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#008B2E] focus:outline-none focus:ring-2 focus:ring-[#008B2E]/20"
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#008B2E] focus:outline-none focus:ring-2 focus:ring-[#008B2E]/20"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Country</label>
              <input
                value={form.country ?? ''}
                onChange={(e) => set('country', e.target.value)}
                placeholder="Ghana"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#008B2E] focus:outline-none focus:ring-2 focus:ring-[#008B2E]/20"
              />
            </div>
          </div>

          {/* Keynote Toggle */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <Star className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">Keynote Speaker</p>
              <p className="text-xs text-slate-500">Mark this person as a keynote luminary</p>
            </div>
            <button
              onClick={() => set('is_keynote', !form.is_keynote)}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.is_keynote ? 'bg-[#008B2E]' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_keynote ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {/* Biography */}
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Biography</label>
            <textarea
              value={form.biography ?? ''}
              onChange={(e) => set('biography', e.target.value)}
              rows={3}
              placeholder="Brief professional biography..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#008B2E] focus:outline-none focus:ring-2 focus:ring-[#008B2E]/20 resize-none"
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
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#008B2E] focus:outline-none"
              />
              <button
                onClick={addExpertise}
                className="px-4 py-2 bg-[#008B2E] text-white rounded-xl text-sm font-bold hover:bg-[#006B22]"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(form.expertise ?? []).map((tag, i) => (
                <span key={i} className="flex items-center gap-1 px-3 py-1 bg-[#E6F5EC] text-[#008B2E] text-xs font-bold rounded-full">
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
              <input value={form.linkedin_url ?? ''} onChange={(e) => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#008B2E] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1 block"><AtSign className="w-3 h-3" /> Twitter / X</label>
              <input value={form.twitter_url ?? ''} onChange={(e) => set('twitter_url', e.target.value)} placeholder="https://x.com/..." className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#008B2E] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1 block"><Globe className="w-3 h-3" /> Website</label>
              <input value={form.website_url ?? ''} onChange={(e) => set('website_url', e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#008B2E] focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name?.trim() || uploading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#008B2E] text-white text-sm font-bold hover:bg-[#006B22] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md"
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
  const [editTarget, setEditTarget] = useState<Partial<Speaker> | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const filtered = speakers.filter(
    (s) =>
      (s.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.organization ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (updated: Partial<Speaker>) => {
    const exists = speakers.find((s) => s.id === updated.id);
    if (exists) {
      updateSpeaker(updated.id!, updated);
    } else {
      addSpeaker(updated);
    }

    // Persist to Supabase Database (both ApiClient and supabaseAdmin with service role)
    if (updated.id) {
      const uuid = stringToUuid(updated.id);
      const cleanSlug = updated.slug || (updated.name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        id: uuid,
        name: updated.name ?? '',
        slug: cleanSlug,
        position: updated.position ?? '',
        organization: updated.organization ?? '',
        country: updated.country ?? 'Ghana',
        photo_url: updated.photo_url ?? '',
        biography: updated.biography ?? '',
        expertise: updated.expertise ?? [],
        is_keynote: updated.is_keynote ?? false,
        linkedin_url: updated.linkedin_url || null,
        twitter_url: updated.twitter_url || null,
        website_url: updated.website_url || null,
      };

      // 1. Direct Supabase database upsert (service role bypasses RLS)
      try {
        await supabaseAdmin.from('speakers').upsert(payload);
      } catch (sbErr) {
        console.warn('Supabase DB save error:', sbErr);
      }

      // 2. Also notify backend API if running
      try {
        await ApiClient.saveSpeaker({ ...updated, id: uuid, slug: cleanSlug });
      } catch {
        // Backend offline / static build fallback
      }

      // Refresh from cloud so the new photo_url shows on all devices immediately
      setTimeout(() => refreshSpeakers(), 600);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this speaker?')) {
      deleteSpeaker(id);
      const uuid = stringToUuid(id);
      try {
        await supabaseAdmin.from('speakers').delete().eq('id', uuid);
      } catch (e) {
        console.warn('Supabase DB delete error:', e);
      }
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
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAdding(true)}>
          Add Speaker
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search faculty name or institution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#008B2E] focus:outline-none focus:ring-2 focus:ring-[#008B2E]/20"
            />
          </div>
          <span className="text-sm text-slate-500 font-semibold whitespace-nowrap">
            {filtered.length} Speakers Enrolled
          </span>
        </div>

        {/* Speaker Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((spk) => {
            const photo = spk.photo_url;
            return (
              <div
                key={spk.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
              >
                {/* Card Top */}
                <div className="flex items-start gap-4 p-5 pb-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {photo ? (
                      <img
                        src={photo}
                        alt={spk.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <User className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    {spk.is_keynote && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow">
                        <Star className="w-3 h-3 text-white fill-white" />
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-black text-slate-900 truncate">{spk.name}</h4>
                      {spk.is_keynote && (
                        <span className="text-[9px] font-black uppercase bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full leading-none">
                          Keynote
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
                  <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                    {spk.expertise.slice(0, 3).map((exp, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                        {exp}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
                  <div className="flex items-center gap-2">
                    {spk.linkedin_url && (
                      <a href={spk.linkedin_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                        <Link2 className="w-4 h-4" />
                      </a>
                    )}
                    {spk.website_url && (
                      <a href={spk.website_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-700 transition-colors">
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditTarget(spk)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:border-[#008B2E] hover:text-[#008B2E] transition-all shadow-sm"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(spk.id!)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-red-400 hover:border-red-300 hover:bg-red-50 transition-all shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="col-span-3 py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-base font-bold text-slate-400">No speakers found</p>
              <p className="text-sm text-slate-400 mt-1">Add a speaker or adjust your search</p>
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
