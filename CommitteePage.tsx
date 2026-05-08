'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Users, Mail, Phone, Crown, UserCircle, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

interface CommitteeMember {
  id: string;
  name: string;
  designation?: string;
  department?: string;
  role?: string;
  email?: string;
  phone?: string;
  photo?: string;
  sortOrder?: number;
}

export default function CommitteePage() {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCommittee = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/committee');
        if (res.ok) {
          const data = await res.json();
          const list = data.members || data.committee || data || [];
          setMembers(list.sort((a: CommitteeMember, b: CommitteeMember) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchCommittee();
  }, []);

  const q = search.toLowerCase();
  const filtered = members.filter(
    (m) =>
      !q ||
      m.name?.toLowerCase().includes(q) ||
      m.designation?.toLowerCase().includes(q) ||
      m.department?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <Users className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Library Committee</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#161922]/50">
          Meet the members of our library committee who guide library policy and development
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#161922]/30" />
          <Input
            placeholder="Search committee members..."
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <Users className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No committee members found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            {search ? 'Try a different search term' : 'Committee members will appear here once added'}
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
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((member, i) => (
            <motion.div key={member.id} variants={fadeUp} custom={i}>
              <Card
                className={`group h-full border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5 ${
                  member.role?.toLowerCase() === 'chairperson' ? 'ring-2 ring-[#C62729]/20 border-[#C62729]/20' : ''
                }`}
              >
                <CardContent className="flex h-full flex-col items-center p-5 sm:p-6 text-center">
                  {/* Photo */}
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#161922]/5 text-[#161922]/20 transition-colors group-hover:bg-[#C62729]/10 group-hover:text-[#C62729]/30">
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} className="h-20 w-20 rounded-full object-cover" />
                    ) : (
                      <UserCircle className="h-14 w-14" />
                    )}
                  </div>

                  {/* Chairperson badge */}
                  {member.role?.toLowerCase() === 'chairperson' && (
                    <Badge className="mb-2 bg-[#C62729] text-white text-[10px] font-medium">
                      <Crown className="mr-1 h-3 w-3" />
                      Chairperson
                    </Badge>
                  )}

                  {/* Name */}
                  <h3 className="text-sm font-semibold text-[#161922] sm:text-base group-hover:text-[#C62729] transition-colors">
                    {member.name}
                  </h3>

                  {/* Designation */}
                  {member.designation && (
                    <p className="mt-1 text-xs font-medium text-[#CB8B00]">{member.designation}</p>
                  )}

                  {/* Department */}
                  {member.department && (
                    <Badge
                      variant="secondary"
                      className="mt-2 bg-[#161922]/5 text-[#161922]/50 text-[10px] font-medium hover:bg-[#161922]/5"
                    >
                      <Building2 className="mr-1 h-2.5 w-2.5" />
                      {member.department}
                    </Badge>
                  )}

                  {/* Role (if not chairperson) */}
                  {member.role && member.role.toLowerCase() !== 'chairperson' && (
                    <Badge variant="secondary" className="mt-2 bg-[#C62729]/5 text-[#C62729]/70 text-[10px] font-medium hover:bg-[#C62729]/5">
                      {member.role}
                    </Badge>
                  )}

                  {/* Contact info */}
                  <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-slate-100 w-full">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center justify-center gap-1.5 text-xs text-[#161922]/50 transition-colors hover:text-[#C62729]"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{member.email}</span>
                      </a>
                    )}
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center justify-center gap-1.5 text-xs text-[#161922]/50 transition-colors hover:text-[#C62729]"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>{member.phone}</span>
                      </a>
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
