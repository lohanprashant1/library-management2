'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Bell, AlertTriangle, Calendar } from 'lucide-react';
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

interface Notice {
  id: string;
  title: string;
  content?: string;
  type?: string;
  priority?: string;
  publishDate?: string;
}

function getPriorityBadge(priority?: string) {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return (
        <Badge className="bg-red-600 text-white text-[10px] font-bold">
          <AlertTriangle className="mr-1 h-2.5 w-2.5" />
          Critical
        </Badge>
      );
    case 'high':
      return (
        <Badge className="bg-red-500 text-white text-[10px] font-medium">
          <AlertTriangle className="mr-1 h-2.5 w-2.5" />
          High
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] font-medium hover:bg-slate-100">
          Normal
        </Badge>
      );
  }
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/notices');
        if (res.ok) {
          const data = await res.json();
          setNotices(data.notices || data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const q = search.toLowerCase();
  const filtered = notices.filter(
    (n) =>
      (!q ||
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q)) &&
      (type === 'all' || n.type === type)
  );

  const types = [...new Set(notices.map((n) => n.type).filter(Boolean))];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <Bell className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Notices</h1>
        <p className="mt-2 text-sm text-[#161922]/50">
          Stay updated with the latest announcements from the library
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
            placeholder="Search notices..."
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
        {types.length > 0 && (
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full border-slate-200 sm:w-48 focus:ring-[#C62729]/20 focus:border-[#C62729]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t!}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <Bell className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No notices found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            {search || type !== 'all' ? 'Try a different search or filter' : 'Notices will appear here once published'}
          </p>
          {(search || type !== 'all') && (
            <button
              onClick={() => { setSearch(''); setType('all'); }}
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
          className="space-y-4"
        >
          {filtered.map((notice, i) => (
            <motion.div key={notice.id} variants={fadeUp} custom={i}>
              <Card
                className={`group border-slate-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-[#C62729]/5 ${
                  notice.priority?.toLowerCase() === 'critical'
                    ? 'border-l-4 border-l-red-600'
                    : notice.priority?.toLowerCase() === 'high'
                      ? 'border-l-4 border-l-red-400'
                      : ''
                }`}
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {getPriorityBadge(notice.priority)}
                        {notice.type && (
                          <Badge variant="secondary" className="bg-[#161922]/5 text-[#161922]/50 text-[10px] font-medium hover:bg-[#161922]/5">
                            {notice.type}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-[#161922] group-hover:text-[#C62729] transition-colors">
                        {notice.title}
                      </h3>
                      {notice.content && (
                        <p className="mt-2 text-xs leading-relaxed text-[#161922]/50 line-clamp-3">
                          {notice.content}
                        </p>
                      )}
                    </div>
                    {notice.publishDate && (
                      <span className="flex items-center gap-1 text-[10px] text-[#161922]/40 flex-shrink-0">
                        <Calendar className="h-3 w-3" />
                        {new Date(notice.publishDate).toLocaleDateString()}
                      </span>
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
