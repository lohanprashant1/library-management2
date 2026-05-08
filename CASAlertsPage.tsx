'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, BellRing, ExternalLink, Calendar, Tag, Globe } from 'lucide-react';
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

interface CASAlert {
  id: string;
  title: string;
  description?: string;
  category?: string;
  alertDate?: string;
  source?: string;
  url?: string;
  isActive?: boolean;
}

export default function CASAlertsPage() {
  const [alerts, setAlerts] = useState<CASAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/cas-alerts');
        if (res.ok) {
          const data = await res.json();
          const list = data.alerts || data || [];
          setAlerts(list.filter((a: CASAlert) => a.isActive !== false));
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const q = search.toLowerCase();
  const filtered = alerts.filter(
    (a) =>
      (!q ||
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.source?.toLowerCase().includes(q)) &&
      (category === 'all' || a.category === category)
  );

  const categories = [...new Set(alerts.map((a) => a.category).filter(Boolean))].sort();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <BellRing className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">CAS Alerts</h1>
        <p className="mt-2 text-sm text-[#161922]/50">
          Current Awareness Service — Stay updated with the latest alerts in your field
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
            placeholder="Search alerts..."
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
        {categories.length > 0 && (
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full border-slate-200 sm:w-48 focus:ring-[#C62729]/20 focus:border-[#C62729]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c!}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <BellRing className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No alerts found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            {search || category !== 'all' ? 'Try a different search or filter' : 'CAS alerts will appear here once added'}
          </p>
          {(search || category !== 'all') && (
            <button
              onClick={() => { setSearch(''); setCategory('all'); }}
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
          className="space-y-3"
        >
          {filtered.map((alert, i) => (
            <motion.div key={alert.id} variants={fadeUp} custom={i}>
              <Card className="group border-slate-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-[#C62729]/5">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col gap-2">
                    {/* Title */}
                    <h3 className="text-sm font-semibold text-[#161922] group-hover:text-[#C62729] transition-colors">
                      {alert.url ? (
                        <a href={alert.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline">
                          {alert.title}
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                        </a>
                      ) : (
                        alert.title
                      )}
                    </h3>

                    {/* Description */}
                    {alert.description && (
                      <p className="text-xs leading-relaxed text-[#161922]/50 line-clamp-2">
                        {alert.description}
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {alert.category && (
                        <Badge variant="secondary" className="bg-[#161922]/5 text-[#161922]/50 text-[10px] font-medium hover:bg-[#161922]/5">
                          <Tag className="mr-1 h-2.5 w-2.5" />
                          {alert.category}
                        </Badge>
                      )}
                      {alert.source && (
                        <span className="flex items-center gap-1 text-[10px] text-[#161922]/40">
                          <Globe className="h-2.5 w-2.5" />
                          {alert.source}
                        </span>
                      )}
                      {alert.alertDate && (
                        <span className="flex items-center gap-1 text-[10px] text-[#161922]/40">
                          <Calendar className="h-2.5 w-2.5" />
                          {new Date(alert.alertDate).toLocaleDateString()}
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
