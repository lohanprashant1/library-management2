'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Users, UserCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface StaffMember {
  id: string;
  name: string;
  designation: string;
  department?: string;
  email?: string;
  phone?: string;
  photo?: string;
  isActive: boolean;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/staff?isActive=true');
        if (res.ok) {
          const data = await res.json();
          setStaff(data.staff || data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const activeStaff = staff.filter((s) => s.isActive !== false);

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
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Our Staff</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#161922]/50">
          Meet our dedicated team of library professionals committed to serving you
        </p>
      </motion.div>

      {/* Staff Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : activeStaff.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <UserCircle className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No staff members listed</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            Staff information will appear here once added
          </p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {activeStaff.map((member, i) => (
            <motion.div key={member.id} variants={fadeUp} custom={i}>
              <Card className="group h-full border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5">
                <CardContent className="flex h-full flex-col items-center p-5 sm:p-6 text-center">
                  {/* Photo placeholder */}
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#161922]/5 text-[#161922]/20 transition-colors group-hover:bg-[#C62729]/10 group-hover:text-[#C62729]/30">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-14 w-14" />
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-semibold text-[#161922] sm:text-base group-hover:text-[#C62729] transition-colors">
                    {member.name}
                  </h3>

                  {/* Designation */}
                  <p className="mt-1 text-xs font-medium text-[#CB8B00]">
                    {member.designation}
                  </p>

                  {/* Department */}
                  {member.department && (
                    <Badge
                      variant="secondary"
                      className="mt-2 bg-[#161922]/5 text-[#161922]/50 text-[10px] font-medium hover:bg-[#161922]/5"
                    >
                      {member.department}
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
