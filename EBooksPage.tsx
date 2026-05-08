'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, FileText, BookOpen, Download, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

interface EBook {
  id: string;
  title: string;
  author: string;
  category: string;
  format: string;
  accessLevel: string;
  description?: string;
}

const formatIcon = (format: string) => {
  switch (format?.toUpperCase()) {
    case 'PDF':
      return <FileText className="h-4 w-4" />;
    case 'EPUB':
      return <BookOpen className="h-4 w-4" />;
    case 'DOC':
      return <Download className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const formatColor = (format: string) => {
  switch (format?.toUpperCase()) {
    case 'PDF':
      return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50';
    case 'EPUB':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50';
    case 'DOC':
      return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50';
  }
};

const accessColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'open':
      return 'bg-[#CB8B00]/10 text-[#CB8B00] border-[#CB8B00]/20 hover:bg-[#CB8B00]/10';
    case 'restricted':
      return 'bg-[#C62729]/10 text-[#C62729] border-[#C62729]/20 hover:bg-[#C62729]/10';
    case 'premium':
      return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50';
  }
};

export default function EBooksPage() {
  const [ebooks, setEbooks] = useState<EBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [format, setFormat] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchEBooks = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/ebooks');
        if (res.ok) {
          const data = await res.json();
          setEbooks(data.ebooks || data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchEBooks();
  }, []);

  // Extract unique categories
  useEffect(() => {
    if (ebooks.length > 0) {
      const cats = [...new Set(ebooks.map((e) => e.category).filter(Boolean))] as string[];
      setCategories(cats);
    }
  }, [ebooks]);

  const filtered = ebooks.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.title?.toLowerCase().includes(q) ||
      e.author?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q);
    const matchCategory = category === 'all' || e.category === category;
    const matchFormat = format === 'all' || e.format?.toUpperCase() === format.toUpperCase();
    return matchSearch && matchCategory && matchFormat;
  });

  const hasFilters = search || category !== 'all' || format !== 'all';
  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setFormat('all');
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
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">E-Book Collection</h1>
        <p className="mt-1 text-sm text-[#161922]/50">
          Browse our digital library of {ebooks.length} e-books
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#161922]/30" />
          <Input
            placeholder="Search by title, author, or category..."
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
        <div className="flex flex-wrap items-center gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full border-slate-200 sm:w-[170px] focus:ring-[#C62729]/20 focus:border-[#C62729]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-full border-slate-200 sm:w-[140px] focus:ring-[#C62729]/20 focus:border-[#C62729]">
              <SelectValue placeholder="All Formats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="PDF">PDF</SelectItem>
              <SelectItem value="EPUB">EPUB</SelectItem>
              <SelectItem value="DOC">DOC</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <button
              onClick={clearFilters}
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
          Showing {filtered.length} of {ebooks.length} e-books
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <BookOpen className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No e-books found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            Try adjusting your search or filters
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
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
          {filtered.map((ebook, i) => (
            <motion.div key={ebook.id} variants={fadeUp} custom={i}>
              <Card className="group h-full border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5">
                <CardContent className="flex h-full flex-col p-4 sm:p-5">
                  {/* Top: title + format badge */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-semibold text-[#161922] sm:text-base group-hover:text-[#C62729] transition-colors">
                        {ebook.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#161922]/50">by {ebook.author}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] font-medium ${formatColor(ebook.format)}`}
                    >
                      <span className="mr-1">{formatIcon(ebook.format)}</span>
                      {ebook.format?.toUpperCase() || 'PDF'}
                    </Badge>
                  </div>

                  {/* Description */}
                  {ebook.description && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-[#161922]/40">
                      {ebook.description}
                    </p>
                  )}

                  {/* Bottom badges */}
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    {ebook.category && (
                      <Badge variant="secondary" className="bg-[#CB8B00]/10 text-[#CB8B00] text-[10px] font-medium hover:bg-[#CB8B00]/10">
                        {ebook.category}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium ${accessColor(ebook.accessLevel)}`}
                    >
                      <Shield className="mr-1 h-3 w-3" />
                      {ebook.accessLevel || 'Open'}
                    </Badge>
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
