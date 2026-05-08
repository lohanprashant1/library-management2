'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Camera, Calendar, CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

interface Photo {
  id: string;
  title?: string;
  event?: string;
  date?: string;
  image?: string;
}

export default function PhotoGalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [event, setEvent] = useState('all');

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/photo-gallery');
        if (res.ok) {
          const data = await res.json();
          setPhotos(data.photos || data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  const q = search.toLowerCase();
  const filtered = photos.filter(
    (p) =>
      (!q ||
        p.title?.toLowerCase().includes(q) ||
        p.event?.toLowerCase().includes(q)) &&
      (event === 'all' || p.event === event)
  );

  const events = [...new Set(photos.map((p) => p.event).filter(Boolean))].sort();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <Camera className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Photo Gallery</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#161922]/50">
          Explore moments captured from our library events and activities
        </p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#161922]/30" />
          <Input
            placeholder="Search photos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#161922]/30 hover:text-[#C62729]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {events.length > 0 && (
          <Select value={event} onValueChange={setEvent}>
            <SelectTrigger className="w-full border-slate-200 sm:w-48 focus:ring-[#C62729]/20 focus:border-[#C62729]">
              <SelectValue placeholder="Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((e) => (
                <SelectItem key={e} value={e!}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <Camera className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No photos found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            {search || event !== 'all' ? 'Try a different search or filter' : 'Photos will appear here once added'}
          </p>
          {(search || event !== 'all') && (
            <button
              onClick={() => { setSearch(''); setEvent('all'); }}
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
          className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        >
          {filtered.map((photo, i) => (
            <motion.div key={photo.id} variants={fadeUp} custom={i}>
              <Card className="group h-full overflow-hidden border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5">
                <CardContent className="flex h-full flex-col p-0">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-[#161922]/5">
                    {photo.image ? (
                      <img
                        src={photo.image}
                        alt={photo.title || 'Gallery photo'}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Camera className="h-16 w-16 text-[#161922]/10 group-hover:text-[#C62729]/20 transition-colors" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col gap-1.5">
                    {photo.title && (
                      <h3 className="text-xs font-semibold text-[#161922] group-hover:text-[#C62729] transition-colors line-clamp-2">
                        {photo.title}
                      </h3>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      {photo.event && (
                        <Badge variant="secondary" className="bg-[#161922]/5 text-[#161922]/50 text-[9px] font-medium hover:bg-[#161922]/5">
                          <CalendarDays className="mr-1 h-2 w-2" />
                          {photo.event}
                        </Badge>
                      )}
                      {photo.date && (
                        <span className="flex items-center gap-1 text-[9px] text-[#161922]/40">
                          <Calendar className="h-2 w-2" />
                          {new Date(photo.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
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
