import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  FileDown,
  Upload,
  CheckCircle2,
  X,
  ExternalLink,
  Calendar,
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EventResource } from '../../types';

export const AdminResources: React.FC = () => {
  const { events, addResourceToEvent, updateEventResource, deleteEventResource } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<{
    eventId: string;
    resource: EventResource;
  } | null>(null);

  // Form State
  const [targetEventId, setTargetEventId] = useState<string>(events[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'BROCHURE' | 'PRESENTATION' | 'REPORT' | 'PRESS'>('BROCHURE');
  const [fileType, setFileType] = useState<'PDF' | 'PPT' | 'DOC' | 'ZIP'>('PDF');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Collect all resources with event metadata
  const allResources = events.flatMap((e) =>
    (e.resources || []).map((r) => ({
      ...r,
      eventId: e.id,
      eventTitle: e.title,
      eventSlug: e.slug,
      eventDate: e.start_date,
    }))
  );

  const filteredResources = allResources.filter((res) => {
    const matchesEvent = selectedEventId === 'ALL' || res.eventId === selectedEventId;
    const matchesCat = selectedCategory === 'ALL' || res.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      searchQuery === '' ||
      res.title.toLowerCase().includes(q) ||
      res.description.toLowerCase().includes(q) ||
      res.eventTitle.toLowerCase().includes(q);

    return matchesEvent && matchesCat && matchesQuery;
  });

  const handleOpenAddModal = (defaultEvtId?: string) => {
    setEditingResource(null);
    setTargetEventId(defaultEvtId || events[0]?.id || '');
    setTitle('');
    setDescription('');
    setCategory('BROCHURE');
    setFileType('PDF');
    setFileSize('1.5 MB');
    setFileUrl('');
    setFileName('');
    setUploadNotice(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: typeof allResources[0]) => {
    setEditingResource({
      eventId: item.eventId,
      resource: {
        id: item.id,
        event_id: item.eventId,
        title: item.title,
        description: item.description,
        file_url: item.file_url,
        file_type: item.file_type,
        file_size: item.file_size,
        category: item.category,
      },
    });
    setTargetEventId(item.eventId);
    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category);
    setFileType(item.file_type);
    setFileSize(item.file_size);
    setFileUrl(item.file_url);
    setFileName(item.file_url.startsWith('data:') ? 'Uploaded Document' : item.file_url);
    setUploadNotice(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect format
    const ext = file.name.split('.').pop()?.toUpperCase() || '';
    let detectedType: 'PDF' | 'PPT' | 'DOC' | 'ZIP' = 'PDF';
    if (ext === 'PPT' || ext === 'PPTX') detectedType = 'PPT';
    else if (ext === 'DOC' || ext === 'DOCX') detectedType = 'DOC';
    else if (ext === 'ZIP' || ext === 'RAR') detectedType = 'ZIP';

    // Format file size
    const sizeInMB = file.size / (1024 * 1024);
    const formattedSize =
      sizeInMB >= 1 ? `${sizeInMB.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    setFileName(file.name);
    setFileType(detectedType);
    setFileSize(formattedSize);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileUrl(reader.result);
        setUploadNotice(`Document "${file.name}" loaded successfully (${formattedSize}).`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetEventId) return;

    const resourceData: Omit<EventResource, 'id'> = {
      event_id: targetEventId,
      title: title.trim(),
      description: description.trim() || 'Official conference material and documentation.',
      category,
      file_type: fileType,
      file_size: fileSize,
      file_url: fileUrl.trim() || '#',
    };

    if (editingResource) {
      updateEventResource(editingResource.eventId, editingResource.resource.id, resourceData);
      setSuccessMessage(`Updated "${title}" successfully.`);
    } else {
      addResourceToEvent(targetEventId, resourceData);
      setSuccessMessage(`Published "${title}" to Resources page!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDelete = (eventId: string, resourceId: string, resourceTitle: string) => {
    if (confirm(`Are you sure you want to remove "${resourceTitle}"? It will no longer appear on the Resources page.`)) {
      deleteEventResource(eventId, resourceId);
      setSuccessMessage(`Removed resource successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleDownloadTest = (res: { file_url: string; title: string; file_type: string; category: string; description: string; eventTitle: string }) => {
    if (res.file_url && res.file_url !== '#' && !res.file_url.startsWith('javascript:')) {
      const a = document.createElement('a');
      a.href = res.file_url;
      a.download = `${res.title.replace(/[^a-z0-9]/gi, '_')}.${res.file_type.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const content = `CHARTERED INSTITUTE OF BANKERS (CIB) GHANA\nOFFICIAL PUBLICATION PREVIEW\n\nTitle: ${res.title}\nCategory: ${res.category}\nEvent: ${res.eventTitle}\nFormat: ${res.file_type}\n\nDescription:\n${res.description}\n\n---\nIssued by Chartered Institute of Bankers, Ghana`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${res.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <AdminLayout
      title="Event Resources & Publications"
      subtitle="Upload, manage, and publish official conference brochures, keynote slides, reports, and documents to the public Resources page."
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/resources"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Page</span>
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenAddModal()}
          >
            Upload New Resource
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Resources
            </span>
            <span className="text-2xl font-black text-cib-charcoal-900 font-display">
              {allResources.length}
            </span>
            <span className="text-[10px] text-cib-green-700 font-semibold block">
              Active on /resources
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Linked Events
            </span>
            <span className="text-2xl font-black text-cib-charcoal-900 font-display">
              {new Set(allResources.map((r) => r.eventId)).size}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Across {events.length} programmes
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Brochures & Guides
            </span>
            <span className="text-2xl font-black text-cib-charcoal-900 font-display">
              {allResources.filter((r) => r.category === 'BROCHURE').length}
            </span>
            <span className="text-[10px] text-slate-500 block">Prospectuses & handbooks</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Reports & Slides
            </span>
            <span className="text-2xl font-black text-cib-charcoal-900 font-display">
              {allResources.filter((r) => r.category === 'REPORT' || r.category === 'PRESENTATION').length}
            </span>
            <span className="text-[10px] text-slate-500 block">Keynotes & policy summaries</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search document title, event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-cib-green-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Event Filter */}
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white max-w-[200px]"
            >
              <option value="ALL">All Events ({events.length})</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="ALL">All Formats</option>
              <option value="BROCHURE">Brochure</option>
              <option value="PRESENTATION">Presentation</option>
              <option value="REPORT">Report</option>
              <option value="PRESS">Press</option>
            </select>
          </div>
        </div>

        {/* Resources Table / List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredResources.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Resources Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {allResources.length === 0
                    ? 'No documents have been uploaded yet. Click "Upload New Resource" to add your first document.'
                    : 'No documents match your current filter settings.'}
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => handleOpenAddModal()}
              >
                Upload First Resource
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Document Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Associated Event</th>
                    <th className="py-3.5 px-4">File Specs</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredResources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 max-w-sm">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-cib-green-50 text-cib-green-800 shrink-0 border border-cib-green-100">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-cib-charcoal-900 block line-clamp-1">
                              {res.title}
                            </span>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {res.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <Badge variant="green" size="sm">
                          {res.category}
                        </Badge>
                      </td>

                      <td className="py-4 px-4">
                        <Link
                          to={`/admin/events/${res.eventId}/edit`}
                          className="font-semibold text-cib-charcoal-900 hover:text-cib-green-700 transition-colors block line-clamp-1 max-w-[200px]"
                          title="Click to edit event"
                        >
                          {res.eventTitle}
                        </Link>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {res.eventDate}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-mono text-slate-600 font-semibold block">
                          {res.file_type}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{res.file_size}</span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test Download */}
                          <button
                            type="button"
                            onClick={() => handleDownloadTest(res)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-cib-green-800 transition-colors"
                            title="Test Document Download"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(res)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-cib-green-700 transition-colors"
                            title="Edit Resource Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(res.eventId, res.id, res.title)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT RESOURCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cib-green-50 text-cib-green-800">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                    {editingResource ? 'Edit Resource' : 'Upload New Event Resource'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    This document will be displayed on the public Resources page.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveResource} className="space-y-4">
              {/* Select Target Event */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Associated Event Programme *
                </label>
                <select
                  required
                  value={targetEventId}
                  onChange={(e) => setTargetEventId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none bg-white font-medium"
                >
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.start_date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 30th National Banking Conference Brochure & Prospectus"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                />
              </div>

              {/* Category & Format */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Document Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none bg-white"
                  >
                    <option value="BROCHURE">Brochure</option>
                    <option value="PRESENTATION">Presentation</option>
                    <option value="REPORT">Report</option>
                    <option value="PRESS">Press</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    File Type *
                  </label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none bg-white"
                  >
                    <option value="PDF">PDF</option>
                    <option value="PPT">PPT / PPTX</option>
                    <option value="DOC">DOC / DOCX</option>
                    <option value="ZIP">ZIP Archive</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Summary / Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Executive summary, keynote slide topics, or document release highlights..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                />
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Document File (PDF, PPT, DOC, ZIP)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.rar"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-cib-green-500 bg-slate-50/70 hover:bg-cib-green-50/20 cursor-pointer text-center space-y-2 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center mx-auto text-cib-green-700 border border-slate-200">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-cib-charcoal-900 block">
                      Click to choose document or drag here
                    </span>
                    <span className="text-[11px] text-slate-400">
                      PDF, PowerPoint, Word, or ZIP up to 25MB
                    </span>
                  </div>
                </div>

                {uploadNotice && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold truncate">{uploadNotice}</span>
                  </div>
                )}
              </div>

              {/* Or Manual URL & File Size */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Or Document Link / URL
                  </label>
                  <input
                    type="text"
                    value={fileUrl.startsWith('data:') ? 'Document file embedded (Base64)' : fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://... or upload above"
                    disabled={fileUrl.startsWith('data:')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-cib-green-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    File Size Display
                  </label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="e.g. 3.2 MB"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-cib-green-600 focus:outline-none"
                  />
                </div>
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
                  {editingResource ? 'Save Changes' : 'Publish Resource'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
