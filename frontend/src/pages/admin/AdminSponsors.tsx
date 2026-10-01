import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
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

export const AdminSponsors: React.FC = () => {
  const { sponsors, addSponsor, updateSponsor, deleteSponsor } = useApp();

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
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const corporateMembersCount = sponsors.filter(
    (s) => s.type === 'CORPORATE_MEMBER' || (s.type as any) === 'PARTNER'
  ).length;
  const sponsorsCount = sponsors.filter((s) => s.type === 'SPONSOR').length;

  const filtered = sponsors.filter((s) => {
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
  });

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Partial<Sponsor> = {
      name: name.trim(),
      type,
      categoryOrRole:
        categoryOrRole.trim() ||
        (type === 'CORPORATE_MEMBER' ? 'Licensed Commercial Bank' : 'Corporate Sponsor'),
      logo_url: logoUrl.trim(),
      website_url: websiteUrl.trim(),
      description: description.trim(),
    };

    if (editingId) {
      updateSponsor(editingId, payload);
      setSuccessNotice(`Updated "${name}" successfully.`);
    } else {
      addSponsor(payload);
      setSuccessNotice(
        type === 'CORPORATE_MEMBER'
          ? `Added "${name}" to Corporate Members (will show in homepage moving marquee)!`
          : `Added "${name}" to Corporate Sponsors (will show on Sponsors page)!`
      );
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleDelete = (id: string, entityName: string) => {
    if (confirm(`Are you sure you want to remove "${entityName}"? This will remove it from the site.`)) {
      deleteSponsor(id);
      setSuccessNotice(`Removed "${entityName}".`);
      setTimeout(() => setSuccessNotice(null), 3000);
    }
  };

  const renderCardLogo = (sp: Sponsor) => {
    if (sp.logo_url && sp.logo_url.trim()) {
      return (
        <img
          src={sp.logo_url}
          alt={sp.name}
          className="max-h-full max-w-full object-contain"
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
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {/* Corporate Members & Sponsors Tabs */}
          <div className="flex flex-wrap sm:inline-flex p-1 bg-slate-100 rounded-xl w-full sm:w-auto gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-white text-cib-charcoal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Entities ({sponsors.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CORPORATE_MEMBER')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-cib-green-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Informative Guidance Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1B7E3E] shrink-0" />
            <span>
              <strong>Corporate Members</strong> appear on the <strong>Homepage Moving Marquee</strong> (sliding to the right). <strong>Sponsors</strong> appear on the <strong>Sponsors Page</strong>.
            </span>
          </div>
          <div className="flex items-center gap-3 font-semibold shrink-0">
            <span className="inline-flex items-center gap-1 text-[#1B7E3E]">
              <span className="w-2 h-2 rounded-full bg-[#1B7E3E]" />
              {corporateMembersCount} on Home Marquee
            </span>
            <span className="inline-flex items-center gap-1 text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {sponsorsCount} on Sponsors Page
            </span>
          </div>
        </div>

        {/* Entities Grid */}
        {filtered.length === 0 ? (
          <div className="py-16 px-6 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
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
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-cib-green-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Badge & External Link Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                            isMember
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-900 border-amber-200'
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
                    <div className="h-20 flex items-center justify-center bg-slate-50/80 rounded-xl p-3 border border-slate-100 overflow-hidden">
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-cib-green-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(sp.id, sp.name)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
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
            className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl border border-slate-200 my-4 sm:my-8 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-cib-green-50 text-cib-green-800">
                  {type === 'CORPORATE_MEMBER' ? <Building className="w-5 h-5 text-[#1B7E3E]" /> : <Award className="w-5 h-5 text-amber-600" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                    {editingId ? 'Edit Entity' : 'Add Entity'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {type === 'CORPORATE_MEMBER'
                      ? 'Corporate Members appear in the moving marquee on the homepage.'
                      : 'Corporate Sponsors appear on the public Sponsors page.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
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
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      type === 'CORPORATE_MEMBER'
                        ? 'border-[#1B7E3E] bg-emerald-50 text-emerald-950 ring-2 ring-emerald-300 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      type === 'SPONSOR'
                        ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-300 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
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
                  >
                    Upload Logo from Device
                  </Button>
                  {fileName && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {fileName}
                    </span>
                  )}
                </div>

                {/* Logo Preview */}
                {logoUrl && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center h-20">
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-cib-green-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
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
