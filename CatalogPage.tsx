'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, BookOpen, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [authorId, setAuthorId] = useState('all');
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const limit = 9;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch books
  useEffect(() => {
    let cancelled = false;
    const sp = new URLSearchParams();
    if (debouncedSearch) sp.set('search', debouncedSearch);
    if (categoryId !== 'all') sp.set('categoryId', categoryId);
    if (authorId !== 'all') sp.set('authorId', authorId);
    sp.set('page', String(page));
    sp.set('limit', String(limit));

    fetch(`/api/books?${sp.toString()}`)
      .then(res => res.json())
      .then(data => { if (!cancelled) { setBooks(data.books || []); setTotal(data.total || 0); setLoading(false); } })
      .catch(() => { if (!cancelled) { setBooks([]); setTotal(0); setLoading(false); } });

    return () => { cancelled = true; };
  }, [debouncedSearch, categoryId, authorId, page]);

  // Fetch categories & authors
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
    fetch('/api/authors').then(r => r.json()).then(d => setAuthors(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const totalPages = Math.ceil(total / limit);
  const hasFilters = debouncedSearch || categoryId !== 'all' || authorId !== 'all';

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategoryId('all');
    setAuthorId('all');
    setPage(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Book Catalog</h1>
        <p className="mt-1 text-sm text-[#161922]/50">
          Browse our complete collection of {total} books
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
            placeholder="Search by title, author, ISBN, publisher, category..."
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
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="hidden h-4 w-4 text-[#161922]/30 sm:block" />
          <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setPage(1); }}>
            <SelectTrigger className="w-full border-slate-200 sm:w-[180px] focus:ring-[#C62729]/20 focus:border-[#C62729]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={authorId} onValueChange={(v) => { setAuthorId(v); setPage(1); }}>
            <SelectTrigger className="w-full border-slate-200 sm:w-[180px] focus:ring-[#C62729]/20 focus:border-[#C62729]">
              <SelectValue placeholder="All Authors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Authors</SelectItem>
              {authors.map((auth) => (
                <SelectItem key={auth.id} value={auth.id}>{auth.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[#161922]/50 hover:text-[#C62729]">
              <X className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </motion.div>

      {/* Results info */}
      <p className="mb-4 text-xs text-[#161922]/40">
        Showing {books.length} of {total} books
        {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
      </p>

      {/* Book Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <BookOpen className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No books found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">Try adjusting your search or filters</p>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 border-[#C62729] text-[#C62729] hover:bg-[#C62729] hover:text-white">
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book: any, i: number) => (
            <motion.div key={book.id} variants={fadeUp} custom={i}>
              <Card className="group h-full border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5">
                <CardContent className="flex h-full flex-col p-4 sm:p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-semibold text-[#161922] sm:text-base group-hover:text-[#C62729] transition-colors">
                        {book.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#161922]/50">by {book.author?.name || 'Unknown'}</p>
                    </div>
                    <Badge className={`shrink-0 text-[10px] font-medium ${book.availableCopies > 0 ? 'bg-[#C62729] text-white hover:bg-[#C62729]' : 'bg-slate-100 text-slate-500 hover:bg-slate-100'}`}>
                      {book.availableCopies > 0 ? `${book.availableCopies} avail.` : 'Unavailable'}
                    </Badge>
                  </div>
                  {book.description && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-[#161922]/40">{book.description}</p>
                  )}
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    <Badge variant="secondary" className="bg-[#CB8B00]/10 text-[#CB8B00] text-[10px] font-medium hover:bg-[#CB8B00]/10">
                      {book.category?.name || 'Uncategorized'}
                    </Badge>
                    {book.publisher && <span className="text-[11px] text-[#161922]/40">{book.publisher}</span>}
                    {book.publishYear && <span className="text-[11px] text-[#161922]/40">({book.publishYear})</span>}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-[#161922]/40">
                    <span>ISBN: {book.isbn || 'N/A'}</span>
                    <span>·</span>
                    <span>Total: {book.totalCopies}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}
            className="border-slate-200 text-[#161922]/60 hover:border-[#C62729] hover:bg-[#C62729] hover:text-white disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, idx) => {
              let p: number;
              if (totalPages <= 7) p = idx + 1;
              else if (page <= 4) p = idx + 1;
              else if (page >= totalPages - 3) p = totalPages - 6 + idx;
              else p = page - 3 + idx;
              return (
                <Button key={p} variant="outline" size="sm" onClick={() => handlePageChange(p)}
                  className={`h-8 w-8 p-0 ${page === p ? 'bg-[#C62729] text-white border-[#C62729]' : 'border-slate-200 text-[#161922]/60 hover:border-[#C62729] hover:bg-[#C62729] hover:text-white'}`}>
                  {p}
                </Button>
              );
            })}
          </div>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}
            className="border-slate-200 text-[#161922]/60 hover:border-[#C62729] hover:bg-[#C62729] hover:text-white disabled:opacity-40">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
