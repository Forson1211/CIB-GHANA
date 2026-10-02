import React, { useState, useRef } from 'react';
import { useApp, sortSponsors } from '../../context/AppContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  X,
  Building,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Sponsor, SponsorType } from '../../types';
import { renderBrandLogo } from '../PartnersSponsors';
import { supabaseAdmin, stringToUuid, uploadSponsorLogoToCloud } from '../../lib/supabase';
import { ApiClient } from '../../lib/api';

export const AdminSponsors: React.FC = () => {
  const { sponsors, addSponsor, updateSponsor, deleteSponsor, refreshSponsors } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'CORPORATE_MEMBER' | 'SPONSOR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState<SponsorType>('CORPORATE_MEMBER');
  const [categoryOrRole, setCategoryOrRole] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const corporateMembersCount = sponsors.filter(
    (s) => s.type === 'CORPORATE_MEMBER' || (s.type as any) === 'PARTNER'
  ).length;
  const sponsorsCount = sponsors.filter((s) => s.type === 'SPONSOR').length;

  const filtered = sortSponsors(
    sponsors.filter((s) => {
      const isMember = s.type === 'CORPORATE_MEMBER' || (s.type as any) === 'PARTNER';
      const matchesTab =
        activeTab === 'ALL' ||
        (activeTab === 'CORPORATE_MEMBER' ? isMember : s.type === 'SPONSOR');

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        searchQuery === '' ||
        s.name.toLowerCase().includes(q) ||
        (s.categoryOrRole || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    })
  );

  const handleOpenAddModal = (defaultType?: SponsorType) => {
    setEditingId(null);
    setName('');
    setType(defaultType || (activeTab === 'SPONSOR' ? 'SPONSOR' : 'CORPORATE_MEMBER'));
    setCategoryOrRole('');
    setLogoUrl('');
    setWebsiteUrl('');
    setDescription('');
    setFileName('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sp: Sponsor) => {
    const isMember = sp.type === 'CORPORATE_MEMBER' || (sp.type as any) === 'PARTNER';
    setEditingId(sp.id);
    setName(sp.name);
    setType(isMember ? 'CORPORATE_MEMBER' : 'SPONSOR');
    setCategoryOrRole(sp.categoryOrRole || sp.description || '');
    setLogoUrl(sp.logo_url || '');
    setWebsiteUrl(sp.website_url || '');
    setDescription(sp.description || '');
    setFileName(sp.logo_url?.startsWith('data:') ? 'Custom Uploaded Logo' : '');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setFileName(file.name);
    setIsUploading(true);

    try {
      // Read file as base64
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      // Show instant preview
      setLogoUrl(base64);

      // Upload to Supabase cloud storage
      const tempId = editingId || `sp-${Date.now()}`;
      const { url, isPublic } = await uploadSponsorLogoToCloud(base64, tempId);
      if (isPublic && url.startsWith('http')) {
        setLogoUrl(url);
      }
    } catch (err) {
      console.warn('Logo upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalLogoUrl = logoUrl.trim();
    if (finalLogoUrl.startsWith('data:')) {
      try {
        const tempId = editingId || `sp-${Date.now()}`;
        const { url, isPublic } = await uploadSponsorLogoToCloud(finalLogoUrl, tempId);
        if (isPublic && url.startsWith('http')) {
          finalLogoUrl = url;
        }
      } catch {}
    }

    const payload: Partial<Sponsor> = {
      name: name.trim(),
      type,
      categoryOrRole:
        categoryOrRole.trim() ||
        (type === 'CORPORATE_MEMBER' ? 'Licensed Commercial Bank' : 'Corporate Sponsor'),
      logo_url: finalLogoUrl,
      website_url: websiteUrl.trim(),
      description: description.trim(),
    };

    const targetId = editingId || `sp-${Date.now()}`;
    const uuid = stringToUuid(targetId);
    const isMember = type === 'CORPORATE_MEMBER';
    const validTiers = ['PARTNER', 'PLATINUM', 'GOLD', 'SILVER', 'ACADEMIC'];
    const dbTier = isMember ? 'PARTNER' : (validTiers.includes(payload.tier as any) ? payload.tier : 'PLATINUM');
    const descJson = JSON.stringify({
      role: payload.categoryOrRole,
      desc: payload.description,
      type: payload.type,
      originalId: targetId,
    });

    const existingSponsor = editingId ? sponsors.find((s) => s.id === editingId) : null;
    const targetUuid = existingSponsor?.dbId || uuid;

    if (editingId) {
      updateSponsor(editingId, { ...payload, dbId: targetUuid });
      setSuccessNotice(`Updated "${name}" successfully in live database.`);
    } else {
      addSponsor({ ...payload, id: targetId, dbId: targetUuid });
      setSuccessNotice(
        type === 'CORPORATE_MEMBER'
          ? `Added "${name}" to Corporate Members (syncing live across all devices)!`
          : `Added "${name}" to Corporate Sponsors (syncing live across all devices)!`
      );
    }

    // Direct Supabase upsert with service role to guarantee immediate live persistence
    try {
      await supabaseAdmin.from('sponsors').upsert({
        id: targetUuid,
        name: payload.name,
        logo_url: payload.logo_url || '',
        website_url: payload.website_url || null,
        tier: dbTier,
        description: descJson,
      });
      if (existingSponsor?.name && existingSponsor.name !== payload.name) {
        await supabaseAdmin.from('sponsors').update({
          name: payload.name,
          logo_url: payload.logo_url || '',
          website_url: payload.website_url || null,
          tier: dbTier,
          description: descJson,
        }).ilike('name', existingSponsor.name);
      }
    } catch (sbErr) {
      console.warn('Supabase sponsors upsert failed:', sbErr);
    }

    // Also notify backend API if running
    try {
      await ApiClient.saveSponsor({ ...payload, id: targetUuid });
    } catch {}

    setIsModalOpen(false);
    // Refresh immediately to show updated logo and entity data without delay
    await refreshSponsors();
    setTimeout(() => {
      refreshSponsors();
      setSuccessNotice(null);
    }, 1000);
  };

  const handleDelete = async (id: string, entityName: string) => {
    if (confirm(`Are you sure you want to remove "${entityName}"? This will remove it from the live site across all devices.`)) {
      const sponsor = sponsors.find(
        (s) => s.id === id || s.dbId === id || s.name.toLowerCase() === entityName.toLowerCase()
      );
      const logoUrl = sponsor?.logo_url ?? '';
      const dbId = sponsor?.dbId;
      const uuid = stringToUuid(id);

      await deleteSponsor(id, entityName);
      setSuccessNotice(`Removed "${entityName}" from live database and all devices.`);

      // Extra guarantee direct deletion from Supabase across all matching identifiers
      try {
        if (dbId) {
          await supabaseAdmin.from('sponsors').delete().eq('id', dbId);
        }
        await supabaseAdmin.from('sponsors').delete().eq('id', id);
        await supabaseAdmin.from('sponsors').delete().eq('id', uuid);
        await supabaseAdmin.from('sponsors').delete().ilike('name', entityName);
        if (sponsor?.name) {
          await supabaseAdmin.from('sponsors').delete().ilike('name', sponsor.name);
        }
      } catch (sbErr) {
        console.warn('Supabase sponsors delete failed:', sbErr);
      }

      // Delete logo from Supabase Storage if hosted
      if (logoUrl && logoUrl.includes('/storage/v1/object/public/speaker-photos/')) {
        try {
          const storagePath = logoUrl.split('/storage/v1/object/public/speaker-photos/')[1];
          if (storagePath) {
            await supabaseAdmin.storage.from('speaker-photos').remove([storagePath]);
          }
        } catch {}
      }

      try {
        if (dbId) await ApiClient.deleteSponsor(dbId);
        await ApiClient.deleteSponsor(uuid);
      } catch {}

      await refreshSponsors();
      setTimeout(() => {
        refreshSponsors();
        setSuccessNotice(null);
      }, 1000);
    }
  };

  const renderCardLogo = (sp: Sponsor) => {
    if (sp.logo_url && sp.logo_url.trim() && !sp.logo_url.includes('unsplash.com')) {
      return (
        <img
          src={sp.logo_url}
          alt={sp.name}
          className="max-h-full max-w-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    return renderBrandLogo(sp.id, sp.name);
  };

  return (
    <AdminLayout
      title="Corporate Members & Sponsors"
      subtitle="Manage corporate members (commercial banks displayed on the homepage moving marquee) and official sponsors (displayed on the sponsors page)."
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/sponsors"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Sponsors Page</span>
            <span className="sm:hidden">Sponsors</span>
          </Link>
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Homepage Marquee</span>
            <span className="sm:hidden">Home</span>
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenAddModal()}
            className="px-2.5 sm:px-3 text-xs"
          >
            <span className="hidden sm:inline">Add Entity</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Success Notice */}
        {successNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-600 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab & Search Bar */}
        <div className="bg-white p-4 rounded-none shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {/* Corporate Members & Sponsors Tabs */}
          <div className="flex flex-wrap sm:inline-flex p-1 bg-slate-100 rounded-none w-full sm:w-auto gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-none text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Entities ({sponsors.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CORPORATE_MEMBER')}
              className={`px-4 py-2 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'CORPORATE_MEMBER'
                  ? 'bg-[#1B7E3E] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Corporate Members ({corporateMembersCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('SPONSOR')}
              className={`px-4 py-2 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'SPONSOR'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Sponsors ({sponsorsCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, bank or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-none bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7E3E] shadow-inner"
            />
          </div>
        </div>

        {/* Informative Guidance Banner */}
        <div className="p-4 rounded-none bg-slate-50 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1B7E3E] shrink-0" />
            <span>
              <strong>Corporate Members</strong> appear on the <strong>Homepage Moving Marquee</strong> (sliding to the right). <strong>Sponsors</strong> appear on the <strong>Sponsors Page</strong>.
            </span>
          </div>
          <div className="flex items-center gap-3 font-semibold shrink-0">
            <span className="inline-flex items-center gap-1 text-[#1B7E3E]">
              <span className="w-2 h-2 rounded-none bg-[#1B7E3E]" />
              {corporateMembersCount} on Home Marquee
            </span>
            <span className="inline-flex items-center gap-1 text-amber-600">
              <span className="w-2 h-2 rounded-none bg-amber-500" />
              {sponsorsCount} on Sponsors Page
            </span>
          </div>
        </div>

        {/* Entities Grid */}
        {filtered.length === 0 ? (
          <div className="py-16 px-6 text-center bg-white rounded-none shadow-md space-y-4">
            <div className="w-14 h-14 rounded-none bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Building className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No Entities Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No corporate members or sponsors match your current filter. Click below to add one.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => handleOpenAddModal()}
              className="rounded-none"
            >
              Add New Entity
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((sp) => {
              const isMember = sp.type === 'CORPORATE_MEMBER' || (sp.type as any) === 'PARTNER';

              return (
                <div
                  key={sp.id}
                  className="bg-white p-6 rounded-none shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Badge & External Link Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                            isMember
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {isMember ? (
                            <>
                              <Building className="w-3 h-3 text-emerald-700" />
                              <span>CORPORATE MEMBER</span>
                            </>
                          ) : (
                            <>
                              <Award className="w-3 h-3 text-amber-700" />
                              <span>SPONSOR</span>
                            </>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                          {isMember ? '• Home Marquee' : '• Sponsors Page'}
                        </span>
                      </div>

                      {sp.website_url && (
                        <a
                          href={sp.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-cib-green-700 p-1"
                          title="Visit official website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {/* Logo Display Container */}
                    <div className="h-20 flex items-center justify-center bg-slate-50 rounded-none p-3 shadow-inner overflow-hidden">
                      {renderCardLogo(sp)}
                    </div>

                    {/* Information */}
                    <div>
                      <h4 className="text-base font-bold text-cib-charcoal-900 font-display line-clamp-1">
                        {sp.name}
                      </h4>
                      <p className="text-xs font-semibold text-cib-green-700 mt-0.5 line-clamp-1">
                        {sp.categoryOrRole || (isMember ? 'Licensed Commercial Bank' : 'Corporate Sponsor')}
                      </p>
                      {sp.description && sp.description !== sp.categoryOrRole && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {sp.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(sp)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-none bg-slate-100 text-slate-700 hover:bg-[#1B7E3E] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(sp.id, sp.name)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-none bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div
            className="bg-white rounded-none max-w-lg w-full p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl my-4 sm:my-8 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-[#005C20]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-none bg-white/10">
                  {type === 'CORPORATE_MEMBER' ? <Building className="w-5 h-5 text-white" /> : <Award className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    {editingId ? 'Edit Entity' : 'Add Entity'}
                  </h3>
                  <p className="text-xs text-white/70">
                    {type === 'CORPORATE_MEMBER'
                      ? 'Corporate Members appear in the moving marquee on the homepage.'
                      : 'Corporate Sponsors appear on the public Sponsors page.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-none text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* Type Switcher: Corporate Member vs Sponsor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Entity Classification *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('CORPORATE_MEMBER')}
                    className={`p-3 rounded-none text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      type === 'CORPORATE_MEMBER'
                        ? 'bg-emerald-100 text-emerald-950 shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-sm text-[#1B7E3E]">
                      <Building className="w-4 h-4" />
                      <span>Corporate Member</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Shows in Homepage Marquee
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('SPONSOR')}
                    className={`p-3 rounded-none text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      type === 'SPONSOR'
                        ? 'bg-amber-100 text-amber-950 shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-sm text-amber-700">
                      <Award className="w-4 h-4" />
                      <span>Corporate Sponsor</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Shows on Sponsors Page
                    </span>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institution / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Stanbic Bank, Ecobank, or Bank of Ghana"
                  className="w-full px-3.5 py-2.5 rounded-none bg-slate-100 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7E3E]"
                />
              </div>

              {/* Role / Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role / Designation / Category
                </label>
                <input
                  type="text"
                  value={categoryOrRole}
                  onChange={(e) => setCategoryOrRole(e.target.value)}
                  placeholder={
                    type === 'CORPORATE_MEMBER'
                      ? 'e.g. Licensed Commercial Bank, Central Bank Regulator'
                      : 'e.g. Platinum Sponsor, Gold Sponsor, Fintech Partner'
                  }
                  className="w-full px-3.5 py-2.5 rounded-none bg-slate-100 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7E3E]"
                />
              </div>

              {/* Logo Upload Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brand Logo (PNG / SVG / JPEG)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Upload className="w-4 h-4" />}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-none border-none bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Upload Logo from Device
                  </Button>
                  {fileName && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {fileName}
                    </span>
                  )}
                </div>

                {/* Logo Preview + uploading indicator */}
                {isUploading && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-none flex items-center justify-center h-20 gap-2 text-xs text-slate-500">
                    <span className="w-4 h-4 border-2 border-[#008B2E] border-t-transparent rounded-full animate-spin inline-block" />
                    Uploading logo to cloud…
                  </div>
                )}
                {!isUploading && logoUrl && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-none flex items-center justify-center h-20 shadow-inner">
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Or Manual URL */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Or Logo Image URL
                </label>
                <input
                  type="url"
                  value={logoUrl.startsWith('data:') ? 'Custom image uploaded from device' : logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  disabled={logoUrl.startsWith('data:')}
                  placeholder="https://... or upload above"
                  className="w-full px-3 py-2 rounded-none bg-slate-100 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7E3E] disabled:bg-slate-200 disabled:text-slate-500"
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Website URL
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com.gh"
                  className="w-full px-3.5 py-2.5 rounded-none bg-slate-100 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7E3E]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brief Overview / Notes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional institutional background or notes..."
                  className="w-full px-3.5 py-2.5 rounded-none bg-slate-100 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7E3E] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-none"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  className="rounded-none shadow-md"
                >
                  {editingId ? 'Save Changes' : (type === 'CORPORATE_MEMBER' ? 'Add Corporate Member' : 'Add Sponsor')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
