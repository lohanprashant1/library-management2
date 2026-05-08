'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Globe, ExternalLink, Lock, Unlock, Tag, Building2 } from 'lucide-react';
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

interface EResource {
  id: string;
  name: string;
  url?: string;
  description?: string;
  category?: string;
  accessType?: string;
  publisher?: string;
  isActive?: boolean;
}

export default function EResourcesPage() {
  const [resources, setResources] = useState<EResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/eresources');
        if (res.ok) {
          const data = await res.json();
          const list = data.resources || data || [];
          setResources(list.filter((r: EResource) => r.isActive !== false));
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const q = search.toLowerCase();
  const filtered = resources.filter(
    (r) =>
      (!q ||
        r.name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.publisher?.toLowerCase().includes(q)) &&
      (category === 'all' || r.category === category)
  );

  const categories = [...new Set(resources.map((r) => r.category).filter(Boolean))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <Globe className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">E-Resources</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#161922]/50">
          Access our digital collection of online databases, journals, and electronic resources
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
            placeholder="Search e-resources..."
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
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <Globe className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No e-resources found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            {search || category !== 'all' ? 'Try a different search or filter' : 'E-resources will appear here once added'}
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
          {filtered.map((resource, i) => (
            <motion.div key={resource.id} variants={fadeUp} custom={i}>
              <Card className="group h-full border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5">
                <CardContent className="flex h-full flex-col p-5 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C62729]/10 text-[#C62729] flex-shrink-0">
                      <Globe className="h-5 w-5" />
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-medium flex-shrink-0 ${
                        resource.accessType?.toLowerCase() === 'open'
                          ? 'bg-green-50 text-green-700 hover:bg-green-50'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      {resource.accessType?.toLowerCase() === 'open' ? (
                        <><Unlock className="mr-1 h-2.5 w-2.5" /> Open Access</>
                      ) : (
                        <><Lock className="mr-1 h-2.5 w-2.5" /> {resource.accessType || 'Restricted'}</>
                      )}
                    </Badge>
                  </div>

                  {/* Name */}
                  <h3 className="mt-4 text-sm font-semibold text-[#161922] group-hover:text-[#C62729] transition-colors">
                    {resource.url ? (
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline">
                        {resource.name}
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                      </a>
                    ) : (
                      resource.name
                    )}
                  </h3>

                  {/* Description */}
                  {resource.description && (
                    <p className="mt-2 text-xs leading-relaxed text-[#161922]/50 line-clamp-3">
                      {resource.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                    {resource.category && (
                      <Badge variant="secondary" className="bg-[#161922]/5 text-[#161922]/50 text-[10px] font-medium hover:bg-[#161922]/5">
                        <Tag className="mr-1 h-2.5 w-2.5" />
                        {resource.category}
                      </Badge>
                    )}
                    {resource.publisher && (
                      <span className="flex items-center gap-1 text-[10px] text-[#161922]/40">
                        <Building2 className="h-2.5 w-2.5" />
                        {resource.publisher}
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
