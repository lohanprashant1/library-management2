'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Heart, Award, Building2, Calendar, DollarSign } from 'lucide-react';
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

interface Donor {
  id: string;
  name: string;
  designation?: string;
  organization?: string;
  amount?: number;
  year?: number;
  description?: string;
  photo?: string;
  donorType?: string;
  isFeatured?: boolean;
}

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [donorType, setDonorType] = useState('all');

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/donors');
        if (res.ok) {
          const data = await res.json();
          setDonors(data.donors || data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  const q = search.toLowerCase();
  const filtered = donors.filter(
    (d) =>
      (!q ||
        d.name?.toLowerCase().includes(q) ||
        d.organization?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q)) &&
      (donorType === 'all' || d.donorType === donorType)
  );

  const donorTypes = [...new Set(donors.map((d) => d.donorType).filter(Boolean))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <Heart className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Our Donors</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#161922]/50">
          We gratefully acknowledge the generosity of our donors who support the library
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
            placeholder="Search donors..."
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
        {donorTypes.length > 0 && (
          <Select value={donorType} onValueChange={setDonorType}>
            <SelectTrigger className="w-full border-slate-200 sm:w-48 focus:ring-[#C62729]/20 focus:border-[#C62729]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {donorTypes.map((t) => (
                <SelectItem key={t} value={t!}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <Heart className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No donors found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            {search || donorType !== 'all' ? 'Try a different search or filter' : 'Donors will appear here once added'}
          </p>
          {(search || donorType !== 'all') && (
            <button
              onClick={() => { setSearch(''); setDonorType('all'); }}
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
          {filtered.map((donor, i) => (
            <motion.div key={donor.id} variants={fadeUp} custom={i}>
              <Card
                className={`group h-full border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5 ${
                  donor.isFeatured ? 'ring-2 ring-[#C62729]/20 border-[#C62729]/20' : ''
                }`}
              >
                <CardContent className="flex h-full flex-col items-center p-5 sm:p-6 text-center">
                  {/* Photo */}
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#161922]/5 text-[#161922]/20 transition-colors group-hover:bg-[#C62729]/10 group-hover:text-[#C62729]/30">
                    {donor.photo ? (
                      <img src={donor.photo} alt={donor.name} className="h-20 w-20 rounded-full object-cover" />
                    ) : (
                      <Heart className="h-14 w-14" />
                    )}
                  </div>

                  {/* Featured badge */}
                  {donor.isFeatured && (
                    <Badge className="mb-2 bg-[#C62729] text-white text-[10px] font-medium">
                      <Award className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  )}

                  {/* Name */}
                  <h3 className="text-sm font-semibold text-[#161922] sm:text-base group-hover:text-[#C62729] transition-colors">
                    {donor.name}
                  </h3>

                  {/* Designation */}
                  {donor.designation && (
                    <p className="mt-1 text-xs font-medium text-[#CB8B00]">{donor.designation}</p>
                  )}

                  {/* Organization */}
                  {donor.organization && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-[#161922]/50">
                      <Building2 className="h-3 w-3" />
                      {donor.organization}
                    </p>
                  )}

                  {/* Amount & Year */}
                  <div className="mt-3 flex items-center gap-3">
                    {donor.amount != null && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#C62729]">
                        <DollarSign className="h-3 w-3" />
                        {donor.amount.toLocaleString()}
                      </span>
                    )}
                    {donor.year && (
                      <span className="flex items-center gap-1 text-xs text-[#161922]/40">
                        <Calendar className="h-3 w-3" />
                        {donor.year}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {donor.description && (
                    <p className="mt-3 text-xs leading-relaxed text-[#161922]/50 line-clamp-2">
                      {donor.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
