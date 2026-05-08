'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, BookOpen, ScrollText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface LibraryRule {
  id: string;
  title: string;
  content: string;
  category?: string;
  order?: number;
}

export default function LibraryRulesPage() {
  const [rules, setRules] = useState<LibraryRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/library-rules');
        if (res.ok) {
          const data = await res.json();
          setRules(data.rules || data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const q = search.toLowerCase();
  const filtered = rules
    .filter(
      (r) =>
        (!q ||
          r.title?.toLowerCase().includes(q) ||
          r.content?.toLowerCase().includes(q)) &&
        (category === 'all' || r.category === category)
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const categories = [...new Set(rules.map((r) => r.category).filter(Boolean))].sort();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <ScrollText className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Library Rules & Regulations</h1>
        <p className="mt-2 text-sm text-[#161922]/50">
          Please familiarize yourself with our library policies and guidelines
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
            placeholder="Search rules..."
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
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <BookOpen className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No rules found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            {search || category !== 'all' ? 'Try a different search or filter' : 'Library rules will appear here once added'}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-2">
            {filtered.map((rule, idx) => (
              <AccordionItem
                key={rule.id}
                value={`rule-${rule.id}-${idx}`}
                className="rounded-lg border border-slate-100 bg-white px-4 shadow-sm transition-shadow data-[state=open]:shadow-md data-[state=open]:border-[#C62729]/20"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-[#161922] hover:no-underline hover:text-[#C62729] data-[state=open]:text-[#C62729] py-4">
                  <div className="flex items-center gap-3">
                    {rule.category && (
                      <span className="rounded bg-[#161922]/5 px-2 py-0.5 text-[10px] font-medium text-[#161922]/40 flex-shrink-0">
                        {rule.category}
                      </span>
                    )}
                    {rule.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-[#161922]/60 pb-4 whitespace-pre-line">
                  {rule.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      )}
    </div>
  );
}
