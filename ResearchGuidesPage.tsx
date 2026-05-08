'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, BookOpenText, Download, Tag, User, FileDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

interface ResearchGuide {
  id: string;
  title: string;
  description?: string;
  category?: string;
  content?: string;
  author?: string;
  fileUrl?: string;
}

export default function ResearchGuidesPage() {
  const [guides, setGuides] = useState<ResearchGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/research-guides');
        if (res.ok) {
          const data = await res.json();
          setGuides(data.guides || data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  const q = search.toLowerCase();
  const filtered = guides.filter(
    (g) =>
      (!q ||
        g.title?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.author?.toLowerCase().includes(q) ||
        g.content?.toLowerCase().includes(q)) &&
      (category === 'all' || g.category === category)
  );

  const categories = [...new Set(guides.map((g) => g.category).filter(Boolean))].sort();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <BookOpenText className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Research Guides</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#161922]/50">
          Explore curated research guides to support your academic work and information discovery
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
            placeholder="Search guides..."
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <BookOpenText className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No research guides found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            {search || category !== 'all' ? 'Try a different search or filter' : 'Research guides will appear here once added'}
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
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((guide, i) => (
            <motion.div key={guide.id} variants={fadeUp} custom={i}>
              <Card className="group h-full border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5">
                <CardContent className="flex h-full flex-col p-5 sm:p-6">
                  {/* Icon */}
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#C62729]/10 text-[#C62729]">
                    <BookOpenText className="h-5 w-5" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-[#161922] group-hover:text-[#C62729] transition-colors line-clamp-2">
                    {guide.title}
                  </h3>

                  {/* Author */}
                  {guide.author && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-[#161922]/50">
                      <User className="h-3 w-3" />
                      {guide.author}
                    </p>
                  )}

                  {/* Content (truncated) */}
                  {guide.content && (
                    <p className="mt-2 text-xs leading-relaxed text-[#161922]/50 line-clamp-3">
                      {guide.content}
                    </p>
                  )}

                  {/* Description (fallback if no content) */}
                  {!guide.content && guide.description && (
                    <p className="mt-2 text-xs leading-relaxed text-[#161922]/50 line-clamp-3">
                      {guide.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                    {guide.category && (
                      <Badge variant="secondary" className="bg-[#161922]/5 text-[#161922]/50 text-[10px] font-medium hover:bg-[#161922]/5">
                        <Tag className="mr-1 h-2.5 w-2.5" />
                        {guide.category}
                      </Badge>
                    )}
                    {guide.fileUrl && (
                      <Button asChild className="ml-auto bg-[#C62729] text-white text-[10px] hover:bg-[#C62729]/90 transition-colors h-7 px-3">
                        <a href={guide.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                          <FileDown className="h-3 w-3" />
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
