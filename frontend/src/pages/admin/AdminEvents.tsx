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
  ExternalLink,
  RefreshCw,
  FileText
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredEvents = events.filter((e) => {
    const matchesStatus = selectedStatus === 'ALL' || e.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      searchQuery === '' ||
      e.title.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
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
        >
          Add New Event
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event title, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-cib-green-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN_FOR_REGISTRATION">Open for Registration</option>
              <option value="DRAFT">Draft</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Event Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date & Location</th>
                  <th className="py-3.5 px-4">Capacity</th>
                  <th className="py-3.5 px-4">Fee</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEvents.map((evt) => {
                  const capacityPercent = Math.min(
                    100,
                    Math.round((evt.registered_count / evt.capacity) * 100)
                  );

                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          <img
                            src={evt.featured_image}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div>
                            <Link
                              to={`/admin/events/${evt.id}/edit`}
                              className="font-bold text-cib-charcoal-900 block line-clamp-1 hover:text-cib-green-700 transition-colors"
                              title="Click to edit event"
                            >
                              {evt.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {evt.is_featured && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  <Sparkles className="w-2.5 h-2.5" /> Featured
                                </span>
                              )}
                              <AttendanceTypeBadge type={evt.event_type} />
                              {evt.resources && evt.resources.length > 0 && (
                                <Link
                                  to={`/admin/events/${evt.id}/edit`}
                                  className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                                  title={`${evt.resources.length} resource document(s) uploaded`}
                                >
                                  <FileText className="w-2.5 h-2.5" /> {evt.resources.length} Docs
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-700">{evt.category}</span>
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        <p className="font-bold text-cib-charcoal-900">
                          {formatDateRange(evt.start_date, evt.end_date)}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {evt.venue}
                        </p>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1 w-28">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-bold">{evt.registered_count}</span>
                            <span className="text-slate-400">/{evt.capacity}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-cib-green-600 h-1.5 rounded-full"
                              style={{ width: `${capacityPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold text-cib-charcoal-900">
                        {formatGHS(evt.registration_fee)}
                      </td>

                      <td className="py-4 px-4">
                        <EventStatusBadge status={evt.status} />
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Publish/Draft toggle */}
                          <button
                            onClick={() => toggleEventPublish(evt.id)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                            title={evt.status === 'DRAFT' ? 'Publish Event' : 'Unpublish to Draft'}
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 ${evt.status !== 'DRAFT' ? 'text-cib-green-700' : 'text-slate-400'}`} />
                          </button>

                          {/* Feature toggle */}
                          <button
                            onClick={() => toggleEventFeatured(evt.id)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                            title="Toggle Featured Banner"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${evt.is_featured ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                          </button>

                          {/* Public View */}
                          <Link
                            to={`/events/${evt.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                            title="View Public Event Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit Event */}
                          <Link
                            to={`/admin/events/${evt.id}/edit`}
                            className="p-1.5 rounded-lg border border-cib-green-200 text-cib-green-700 hover:bg-cib-green-50 hover:border-cib-green-300 transition-colors"
                            title="Edit Event & Resources"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(evt)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                            title="Duplicate Event"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            disabled={deletingId === evt.id}
                            onClick={() => handleDelete(evt.id, evt.title)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
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
      </div>
    </AdminLayout>
  );
};
