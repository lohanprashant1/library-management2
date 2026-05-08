'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, BookOpen, Star, Tag, Calendar } from 'lucide-react';
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

interface NewArrival {
  id: string;
  title: string;
  author?: string;
  category?: string;
  itemType?: string;
  arrivalDate?: string;
  coverImage?: string;
  isFeatured?: boolean;
}

export default function NewArrivalsPage() {
  const [items, setItems] = useState<NewArrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [itemType, setItemType] = useState('all');

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/new-arrivals');
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const q = search.toLowerCase();
  const filtered = items.filter(
    (item) =>
      (!q ||
        item.title?.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)) &&
      (category === 'all' || item.category === category) &&
      (itemType === 'all' || item.itemType === itemType)
  );

  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];
  const itemTypes = [...new Set(items.map((i) => i.itemType).filter(Boolean))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <BookOpen className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">New Arrivals</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#161922]/50">
          Discover the latest additions to our library collection
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
            placeholder="Search titles, authors..."
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
        {itemTypes.length > 0 && (
          <Select value={itemType} onValueChange={setItemType}>
            <SelectTrigger className="w-full border-slate-200 sm:w-48 focus:ring-[#C62729]/20 focus:border-[#C62729]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {itemTypes.map((t) => (
                <SelectItem key={t} value={t!}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <BookOpen className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No arrivals found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            {search || category !== 'all' || itemType !== 'all' ? 'Try a different search or filter' : 'New arrivals will appear here'}
          </p>
          {(search || category !== 'all' || itemType !== 'all') && (
            <button
              onClick={() => { setSearch(''); setCategory('all'); setItemType('all'); }}
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
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((item, i) => (
            <motion.div key={item.id} variants={fadeUp} custom={i}>
              <Card
                className={`group h-full border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5 ${
                  item.isFeatured ? 'ring-2 ring-[#C62729]/20 border-[#C62729]/20' : ''
                }`}
              >
                <CardContent className="flex h-full flex-col p-4">
                  {/* Cover Image */}
                  <div className="mb-4 flex h-48 items-center justify-center rounded-lg bg-[#161922]/5 overflow-hidden">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <BookOpen className="h-16 w-16 text-[#161922]/15 group-hover:text-[#C62729]/30 transition-colors" />
                    )}
                  </div>

                  {/* Featured badge */}
                  {item.isFeatured && (
                    <Badge className="mb-2 w-fit bg-[#C62729] text-white text-[10px] font-medium">
                      <Star className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  )}

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-[#161922] group-hover:text-[#C62729] transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Author */}
                  {item.author && (
                    <p className="mt-1 text-xs text-[#161922]/50">{item.author}</p>
                  )}

                  {/* Tags */}
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    {item.category && (
                      <Badge variant="secondary" className="bg-[#161922]/5 text-[#161922]/50 text-[10px] font-medium hover:bg-[#161922]/5">
                        <Tag className="mr-1 h-2.5 w-2.5" />
                        {item.category}
                      </Badge>
                    )}
                    {item.itemType && (
                      <Badge variant="secondary" className="bg-[#CB8B00]/10 text-[#CB8B00] text-[10px] font-medium hover:bg-[#CB8B00]/10">
                        {item.itemType}
                      </Badge>
                    )}
                    {item.arrivalDate && (
                      <span className="flex items-center gap-1 text-[10px] text-[#161922]/40 ml-auto">
                        <Calendar className="h-2.5 w-2.5" />
                        {new Date(item.arrivalDate).toLocaleDateString()}
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
