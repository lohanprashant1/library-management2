'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Newspaper, Download, Calendar, Hash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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

interface Newsletter {
  id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  issue?: string;
  date?: string;
}

export default function NewslettersPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchNewsletters = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/newsletters');
        if (res.ok) {
          const data = await res.json();
          setNewsletters(data.newsletters || data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchNewsletters();
  }, []);

  const q = search.toLowerCase();
  const filtered = newsletters.filter(
    (n) =>
      !q ||
      n.title?.toLowerCase().includes(q) ||
      n.description?.toLowerCase().includes(q) ||
      n.issue?.toLowerCase().includes(q)
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <Newspaper className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Newsletters</h1>
        <p className="mt-2 text-sm text-[#161922]/50">
          Stay informed with our latest library news, updates, and announcements
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#161922]/30" />
          <Input
            placeholder="Search newsletters..."
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
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <Newspaper className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No newsletters found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            {search ? 'Try a different search term' : 'Newsletters will appear here once published'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-4 rounded-md border border-[#C62729] px-4 py-2 text-xs font-medium text-[#C62729] transition-colors hover:bg-[#C62729] hover:text-white"
            >
              Clear Search
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
          {filtered.map((newsletter, i) => (
            <motion.div key={newsletter.id} variants={fadeUp} custom={i}>
              <Card className="group border-slate-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-[#C62729]/5">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Icon */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C62729]/10 text-[#C62729] flex-shrink-0">
                        <Newspaper className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#161922] group-hover:text-[#C62729] transition-colors">
                          {newsletter.title}
                        </h3>
                        {newsletter.description && (
                          <p className="mt-1.5 text-xs leading-relaxed text-[#161922]/50 line-clamp-2">
                            {newsletter.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          {newsletter.issue && (
                            <span className="flex items-center gap-1 text-[10px] text-[#161922]/40">
                              <Hash className="h-2.5 w-2.5" />
                              Issue: {newsletter.issue}
                            </span>
                          )}
                          {newsletter.date && (
                            <span className="flex items-center gap-1 text-[10px] text-[#161922]/40">
                              <Calendar className="h-2.5 w-2.5" />
                              {new Date(newsletter.date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Download */}
                    {newsletter.fileUrl && (
                      <Button asChild className="flex-shrink-0 bg-[#C62729] text-white text-xs hover:bg-[#C62729]/90 transition-colors">
                        <a href={newsletter.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </Button>
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
