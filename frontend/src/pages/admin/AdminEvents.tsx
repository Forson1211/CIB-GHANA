import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
  ExternalLink,
  RefreshCw,
  FileText,
  LayoutGrid,
  List,
  Users,
  DollarSign,
  Layers,
  X,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EventStatusBadge, AttendanceTypeBadge } from '../../components/ui/Badge';
import { formatDateRange, formatGHS } from '../../lib/utils';
import { EventItem } from '../../types';

export const AdminEvents: React.FC = () => {
  const navigate = useNavigate();
  const { events, toggleEventPublish, toggleEventFeatured, deleteEvent, addEvent } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Compute metrics
  const totalEvents = events.length;
  const openEventsCount = events.filter((e) => e.status === 'OPEN_FOR_REGISTRATION').length;
  const draftEventsCount = events.filter((e) => e.status === 'DRAFT').length;
  const completedEventsCount = events.filter((e) => e.status === 'COMPLETED').length;
  const totalRegistered = events.reduce((sum, e) => sum + (e.registered_count || 0), 0);
  const totalCapacity = events.reduce((sum, e) => sum + (e.capacity || 0), 0);
  const capacityPercent = totalCapacity > 0 ? Math.round((totalRegistered / totalCapacity) * 100) : 0;
  
  // Unique categories
  const categories = Array.from(new Set(events.map((e) => e.category).filter(Boolean)));

  // Filter events
  const filteredEvents = events.filter((e) => {
    const matchesStatus = selectedStatus === 'ALL' || e.status === selectedStatus;
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      q === '' ||
      e.title.toLowerCase().includes(q) ||
      (e.venue && e.venue.toLowerCase().includes(q)) ||
      (e.category && e.category.toLowerCase().includes(q));
    return matchesStatus && matchesCategory && matchesQuery;
  });

  const handleDuplicate = (event: EventItem) => {
    const duplicated: Omit<EventItem, 'id' | 'created_at' | 'updated_at'> = {
      ...event,
      title: `${event.title} (Copy)`,
      slug: `${event.slug}-copy-${Date.now()}`,
      status: 'DRAFT',
      is_featured: false,
      registered_count: 0,
    };
    addEvent(duplicated);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This will permanently remove the event from the database.`)) {
      setDeletingId(id);
      try {
        await deleteEvent(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <AdminLayout
      title="Event Programme Management"
      subtitle="Manage, publish, schedule and feature events across the CIB Ghana platform."
      actions={
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/admin/events/create')}
          className="shadow-sm font-semibold"
        >
          Add New Event
        </Button>
      }
    >
      <div className="space-y-5 sm:space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Events</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalEvents}</span>
              <span className="text-xs text-slate-400 font-medium">{draftEventsCount} drafts</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-medium">
              Across all categories
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open for Booking</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-cib-green-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-cib-green-800">{openEventsCount}</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-medium">
              Accepting registrations
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delegates Booked</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalRegistered}</span>
              <span className="text-xs text-slate-400 font-medium">/ {totalCapacity}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, capacityPercent)}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-600">{capacityPercent}%</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{completedEventsCount}</span>
              <span className="text-xs text-slate-400 font-medium">events</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-medium">
              Archived in records
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search event title, venue, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-cib-green-600 focus:ring-1 focus:ring-cib-green-600 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters & View Mode */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:border-slate-300 focus:border-cib-green-600 focus:outline-none transition-all"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:border-slate-300 focus:border-cib-green-600 focus:outline-none transition-all"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN_FOR_REGISTRATION">Open for Registration</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DRAFT">Draft</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* View Switcher (Cards vs Table) */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    viewMode === 'grid'
                      ? 'bg-white text-cib-green-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grid Cards View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    viewMode === 'table'
                      ? 'bg-white text-cib-green-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Data Table View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-2.5 scrollbar-none">
            <span className="text-slate-400 font-semibold text-[11px] mr-1 shrink-0">Quick Filter:</span>
            {[
              { id: 'ALL', label: 'All Events', count: totalEvents },
              { id: 'OPEN_FOR_REGISTRATION', label: 'Open', count: openEventsCount },
              { id: 'DRAFT', label: 'Drafts', count: draftEventsCount },
              { id: 'COMPLETED', label: 'Completed', count: completedEventsCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-all text-[11px] flex items-center gap-1.5 ${
                  selectedStatus === tab.id
                    ? 'bg-cib-green-50 text-cib-green-800 border border-cib-green-200'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    selectedStatus === tab.id
                      ? 'bg-cib-green-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}

            {(selectedStatus !== 'ALL' || selectedCategory !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedStatus('ALL');
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
                className="ml-auto text-[11px] text-rose-600 hover:text-rose-700 font-semibold shrink-0 flex items-center gap-1 pl-2"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Content Section: Grid View vs Table View */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-10 sm:p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Calendar className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No events found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any events matching your filter criteria. Try adjusting your search query or reset your filters.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStatus('ALL');
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
              >
                Reset All Filters
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/admin/events/create')}
              >
                Create New Event
              </Button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Cards Grid View (Ultra Responsive on Mobile & Tablet) */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filteredEvents.map((evt) => {
              const capacityPercent = Math.min(
                100,
                Math.round((evt.registered_count / (evt.capacity || 1)) * 100)
              );

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
                >
                  {/* Card Media Header */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={evt.featured_image}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <EventStatusBadge status={evt.status} className="shadow-xs backdrop-blur-xs" />
                        {evt.is_featured && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-400 px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                            <Sparkles className="w-2.5 h-2.5 fill-amber-900" /> Featured
                          </span>
                        )}
                      </div>
                      <AttendanceTypeBadge
                        type={evt.event_type}
                        className="bg-white/90 backdrop-blur-xs text-slate-800 font-semibold shadow-xs"
                      />
                    </div>

                    {/* Bottom overlay: Category & Docs */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-semibold text-[11px] bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
                        {evt.category}
                      </span>
                      {evt.resources && evt.resources.length > 0 && (
                        <span className="text-[10px] font-bold bg-blue-600/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                          <FileText className="w-2.5 h-2.5" /> {evt.resources.length} Docs
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <Link
                        to={`/admin/events/${evt.id}/edit`}
                        className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-cib-green-700 transition-colors"
                        title={evt.title}
                      >
                        {evt.title}
                      </Link>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-cib-green-600 shrink-0" />
                          <span className="font-semibold truncate">
                            {formatDateRange(evt.start_date, evt.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{evt.venue || 'TBD, Ghana'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Bar */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Standard Pass</span>
                        <span className="font-black text-cib-green-800 text-sm">
                          {formatGHS(evt.registration_fee)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Capacity</span>
                          <span className="font-bold text-slate-800">
                            {evt.registered_count} <span className="text-slate-400">/ {evt.capacity}</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              capacityPercent >= 90
                                ? 'bg-rose-500'
                                : capacityPercent >= 70
                                ? 'bg-amber-500'
                                : 'bg-cib-green-600'
                            }`}
                            style={{ width: `${capacityPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions Strip */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        {/* Publish/Draft toggle */}
                        <button
                          onClick={() => toggleEventPublish(evt.id)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                            evt.status !== 'DRAFT'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                          title={evt.status === 'DRAFT' ? 'Publish Event' : 'Unpublish to Draft'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-cib-green-700" />
                          <span className="text-[11px]">{evt.status !== 'DRAFT' ? 'Published' : 'Draft'}</span>
                        </button>

                        {/* Feature toggle */}
                        <button
                          onClick={() => toggleEventFeatured(evt.id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            evt.is_featured
                              ? 'border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100'
                              : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                          }`}
                          title="Toggle Featured Banner"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${evt.is_featured ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Public View */}
                        <Link
                          to={`/events/${evt.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                          title="View Public Event Page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {/* Edit Event */}
                        <Link
                          to={`/admin/events/${evt.id}/edit`}
                          className="px-2.5 py-1.5 rounded-lg bg-cib-green-700 text-white text-xs font-bold hover:bg-cib-green-800 flex items-center gap-1 shadow-xs transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>

                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicate(evt)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                          title="Duplicate Event"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          disabled={deletingId === evt.id}
                          onClick={() => handleDelete(evt.id, evt.title)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Delete Event"
                        >
                          {deletingId === evt.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View (Resilient, Enterprise-Grade, Minimum Column Widths, No Squished Badges) */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs min-w-[1020px]">
                <thead className="bg-slate-50/90 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 min-w-[340px]">Event Details</th>
                    <th className="py-3.5 px-4 min-w-[130px]">Category</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Date & Location</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Capacity</th>
                    <th className="py-3.5 px-4 min-w-[120px]">Pricing</th>
                    <th className="py-3.5 px-4 min-w-[110px]">Status</th>
                    <th className="py-3.5 px-4 min-w-[160px] text-right sticky right-0 bg-slate-50/95 backdrop-blur-xs">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredEvents.map((evt) => {
                    const capacityPercent = Math.min(
                      100,
                      Math.round((evt.registered_count / (evt.capacity || 1)) * 100)
                    );

                    return (
                      <tr
                        key={evt.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Event Details: Image + Title + Badges */}
                        <td className="py-3.5 px-4 min-w-[340px] max-w-[400px]">
                          <div className="flex items-start gap-3">
                            <img
                              src={evt.featured_image}
                              alt=""
                              className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
                            />
                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/admin/events/${evt.id}/edit`}
                                className="font-bold text-slate-900 text-xs sm:text-sm block leading-snug line-clamp-1 hover:text-cib-green-700 transition-colors"
                                title={evt.title}
                              >
                                {evt.title}
                              </Link>
                              
                              <div className="flex items-center gap-1.5 mt-1.5 flex-nowrap overflow-hidden">
                                {evt.is_featured && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200/80 whitespace-nowrap shrink-0">
                                    <Sparkles className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Featured
                                  </span>
                                )}
                                <AttendanceTypeBadge type={evt.event_type} className="shrink-0" />
                                {evt.resources && evt.resources.length > 0 && (
                                  <Link
                                    to={`/admin/events/${evt.id}/edit`}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0"
                                    title={`${evt.resources.length} resource document(s) uploaded`}
                                  >
                                    <FileText className="w-2.5 h-2.5" /> {evt.resources.length} Docs
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 min-w-[130px]">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap">
                            <Tag className="w-3 h-3 text-slate-400" />
                            {evt.category}
                          </span>
                        </td>

                        {/* Date & Location */}
                        <td className="py-3.5 px-4 min-w-[200px] text-slate-600">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-cib-green-600 shrink-0" />
                              <span className="truncate">{formatDateRange(evt.start_date, evt.end_date)}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{evt.venue || 'Ada, Ghana'}</span>
                            </p>
                          </div>
                        </td>

                        {/* Capacity Progress */}
                        <td className="py-3.5 px-4 min-w-[160px]">
                          <div className="space-y-1.5 w-32">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-bold text-slate-900">{evt.registered_count}</span>
                              <span className="text-slate-400">/{evt.capacity} seats</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  capacityPercent >= 90
                                    ? 'bg-rose-500'
                                    : capacityPercent >= 70
                                    ? 'bg-amber-500'
                                    : 'bg-cib-green-600'
                                }`}
                                style={{ width: `${capacityPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 block font-semibold">
                              {capacityPercent}% filled
                            </span>
                          </div>
                        </td>

                        {/* Pricing */}
                        <td className="py-3.5 px-4 min-w-[120px]">
                          <span className="font-black text-slate-900 text-sm whitespace-nowrap">
                            {formatGHS(evt.registration_fee)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 min-w-[110px]">
                          <EventStatusBadge status={evt.status} />
                        </td>

                        {/* Actions (Sticky Right) */}
                        <td className="py-3.5 px-4 min-w-[160px] text-right sticky right-0 bg-white/95 group-hover:bg-slate-50/95 backdrop-blur-xs transition-colors shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.04)]">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Publish/Draft toggle */}
                            <button
                              onClick={() => toggleEventPublish(evt.id)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                              title={evt.status === 'DRAFT' ? 'Publish Event' : 'Unpublish to Draft'}
                            >
                              <CheckCircle2
                                className={`w-3.5 h-3.5 ${
                                  evt.status !== 'DRAFT' ? 'text-cib-green-600' : 'text-slate-400'
                                }`}
                              />
                            </button>

                            {/* Feature toggle */}
                            <button
                              onClick={() => toggleEventFeatured(evt.id)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                              title="Toggle Featured Banner"
                            >
                              <Sparkles
                                className={`w-3.5 h-3.5 ${
                                  evt.is_featured ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                                }`}
                              />
                            </button>

                            {/* Public View */}
                            <Link
                              to={`/events/${evt.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                              title="View Public Event Page"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            {/* Edit Event */}
                            <Link
                              to={`/admin/events/${evt.id}/edit`}
                              className="p-1.5 rounded-lg border border-cib-green-200 text-cib-green-700 bg-cib-green-50 hover:bg-cib-green-100 hover:border-cib-green-300 transition-colors"
                              title="Edit Event & Resources"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            {/* Duplicate */}
                            <button
                              onClick={() => handleDuplicate(evt)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                              title="Duplicate Event"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              disabled={deletingId === evt.id}
                              onClick={() => handleDelete(evt.id, evt.title)}
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                              title="Delete Event"
                            >
                              {deletingId === evt.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
