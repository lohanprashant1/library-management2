'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Megaphone,
  Wrench,
  X,
  Filter,
  CalendarDays,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

interface LibraryEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  venue: string;
  type: string;
  status: string;
}

const typeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'announcement':
      return <Megaphone className="h-4 w-4" />;
    case 'workshop':
      return <Wrench className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

const typeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'announcement':
      return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50';
    case 'workshop':
      return 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-50';
    default:
      return 'bg-[#C62729]/10 text-[#C62729] border-[#C62729]/20 hover:bg-[#C62729]/10';
  }
};

const statusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'upcoming':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50';
    case 'ongoing':
      return 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50';
    case 'completed':
      return 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-50';
  }
};

export default function EventsPage() {
  const [events, setEvents] = useState<LibraryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/events?type=Upcoming');
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = events.filter((e) => {
    const matchType = typeFilter === 'all' || e.type?.toLowerCase() === typeFilter.toLowerCase();
    const matchStatus = statusFilter === 'all' || e.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchType && matchStatus;
  });

  const hasFilters = typeFilter !== 'all' || statusFilter !== 'all';

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 border-l-4 border-[#C62729] pl-4"
      >
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Events & Activities</h1>
        <p className="mt-1 text-sm text-[#161922]/50">
          Stay updated with our latest library events, workshops, and announcements
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="hidden h-4 w-4 text-[#161922]/30 sm:block" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full border-slate-200 sm:w-[170px] focus:ring-[#C62729]/20 focus:border-[#C62729]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full border-slate-200 sm:w-[170px] focus:ring-[#C62729]/20 focus:border-[#C62729]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <button
              onClick={() => { setTypeFilter('all'); setStatusFilter('all'); }}
              className="flex items-center gap-1 text-xs text-[#161922]/50 hover:text-[#C62729]"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Results info */}
      {!loading && (
        <p className="mb-4 text-xs text-[#161922]/40">
          Showing {filtered.length} of {events.length} events
        </p>
      )}

      {/* Event Cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <CalendarDays className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No events found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            Check back later for upcoming events
          </p>
          {hasFilters && (
            <button
              onClick={() => { setTypeFilter('all'); setStatusFilter('all'); }}
              className="mt-4 rounded-md border border-[#C62729] px-4 py-2 text-xs font-medium text-[#C62729] transition-colors hover:bg-[#C62729] hover:text-white"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((event, i) => (
            <motion.div key={event.id} variants={fadeUp} custom={i}>
              <Card className="group h-full border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5">
                <CardContent className="flex h-full flex-col p-4 sm:p-5">
                  {/* Badges row */}
                  <div className="mb-3 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium ${typeColor(event.type)}`}
                    >
                      <span className="mr-1">{typeIcon(event.type)}</span>
                      {event.type || 'Event'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium ${statusColor(event.status)}`}
                    >
                      {event.status || 'Upcoming'}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="line-clamp-2 text-sm font-semibold text-[#161922] sm:text-base group-hover:text-[#C62729] transition-colors">
                    {event.title}
                  </h3>

                  {/* Description */}
                  {event.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#161922]/40">
                      {event.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="mt-auto flex flex-col gap-2 pt-3 border-t border-slate-100">
                    {event.date && (
                      <div className="flex items-center gap-2 text-xs text-[#161922]/50">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-[#C62729]" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                    )}
                    {event.time && (
                      <div className="flex items-center gap-2 text-xs text-[#161922]/50">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-[#CB8B00]" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-center gap-2 text-xs text-[#161922]/50">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#161922]/40" />
                        <span>{event.venue}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
