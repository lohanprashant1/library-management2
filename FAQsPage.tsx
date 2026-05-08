'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, HelpCircle, MessageCircleQuestion } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order?: number;
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFAQs = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/faqs?isActive=true');
        if (res.ok) {
          const data = await res.json();
          setFaqs(data.faqs || data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const q = search.toLowerCase();
  const filtered = faqs.filter(
    (f) =>
      !q ||
      f.question?.toLowerCase().includes(q) ||
      f.answer?.toLowerCase().includes(q) ||
      f.category?.toLowerCase().includes(q)
  );

  // Group by category
  const grouped = filtered.reduce<Record<string, FAQ[]>>((acc, faq) => {
    const cat = faq.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  const categoryNames = Object.keys(grouped).sort();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <MessageCircleQuestion className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-sm text-[#161922]/50">
          Find answers to common questions about our library services
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
            placeholder="Search FAQs..."
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
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <HelpCircle className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No FAQs found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            {search ? 'Try a different search term' : 'FAQs will appear here once added'}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-8"
        >
          {categoryNames.map((cat) => (
            <div key={cat}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#161922]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#C62729]" />
                {cat}
                <span className="text-xs font-normal text-[#161922]/40">
                  ({grouped[cat].length})
                </span>
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {grouped[cat].map((faq, idx) => (
                  <AccordionItem
                    key={faq.id}
                    value={`${cat}-${faq.id}-${idx}`}
                    className="rounded-lg border border-slate-100 bg-white px-4 shadow-sm transition-shadow data-[state=open]:shadow-md data-[state=open]:border-[#C62729]/20"
                  >
                    <AccordionTrigger className="text-left text-sm font-medium text-[#161922] hover:no-underline hover:text-[#C62729] data-[state=open]:text-[#C62729] py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-[#161922]/60 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
