'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  Library,
  Heart,
  BookMarked,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/useApi';
import { useAppStore } from '@/store/useAppStore';

export default function AboutPage() {
  const { data: settings, isLoading } = useSettings();
  const { setCurrentPage } = useAppStore();

  const libraryName = settings?.libraryName || 'OSGU Central Library';
  const aboutText = settings?.aboutText || 'Welcome to our library. We offer a wide range of books and resources for all ages.';
  const address = settings?.address || '';
  const phone = settings?.phone || '';
  const email = settings?.email || '';
  const openingHours = settings?.openingHours || 'Mon-Sat: 9:00 AM - 8:00 PM';
  const maxBooks = settings?.maxBooksPerMember || 5;
  const maxLoanDays = settings?.maxLoanDays || 14;
  const finePerDay = settings?.finePerDay || 1.0;
  const membershipFee = settings?.membershipFee || 0;

  const highlights = [
    { icon: BookMarked, title: 'Vast Collection', desc: 'Thousands of books across multiple genres and categories' },
    { icon: Users, title: 'Community Hub', desc: 'A welcoming space for readers, students, and lifelong learners' },
    { icon: Award, title: 'Expert Staff', desc: 'Friendly librarians ready to help you find the perfect book' },
    { icon: Heart, title: 'Free Membership', desc: membershipFee > 0 ? `Join for only $${membershipFee.toFixed(2)}` : 'Join for free and start borrowing today' },
  ];

  const policies = [
    { label: 'Max Books per Member', value: maxBooks },
    { label: 'Loan Duration', value: `${maxLoanDays} days` },
    { label: 'Fine per Day', value: `$${finePerDay.toFixed(2)}` },
    { label: 'Membership Fee', value: membershipFee > 0 ? `$${membershipFee.toFixed(2)}` : 'Free' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <Badge className="mb-3 border-[#C62729]/20 bg-[#C62729]/10 text-[#C62729]">
          <Library className="mr-1 h-3.5 w-3.5" />
          About Us
        </Badge>
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl lg:text-4xl">{libraryName}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#161922]/50 sm:text-base">
          {aboutText}
        </p>
      </motion.div>

      {/* Highlights Grid */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="border-slate-100 bg-white shadow-sm h-full transition-shadow hover:shadow-md">
              <CardContent className="p-5 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#C62729]/10 text-[#C62729]">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-[#161922]">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#161922]/50">{item.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* About & Info Columns */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="border-slate-100 bg-white shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#161922]">
                <BookOpen className="h-5 w-5 text-[#C62729]" />
                Our Story
              </h2>
              {isLoading ? (
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : (
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-[#161922]/60">
                  <p>{aboutText}</p>
                  <p>
                    Our library is committed to providing a welcoming and inclusive environment for all community members. Whether you are a student looking for research materials, a professional seeking industry knowledge, or simply someone who loves to read, we have something for everyone.
                  </p>
                  <p>
                    We continuously update our collection to include the latest titles, bestsellers, and timeless classics. Our knowledgeable staff is always available to help you find the perfect book or resource for your needs.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Library Policies */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-slate-100 bg-[#161922] shadow-sm h-full">
            <CardContent className="p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <Award className="h-5 w-5 text-[#CB8B00]" />
                Library Policies
              </h2>
              <div className="mt-4 space-y-4">
                {policies.map((policy) => (
                  <div key={policy.label} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0">
                    <span className="text-sm text-white/50">{policy.label}</span>
                    <span className="text-sm font-semibold text-[#CB8B00]">{policy.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Contact Quick Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <Card className="border-[#C62729]/10 bg-[#F4F4F4] shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <h2 className="mb-4 text-lg font-bold text-[#161922]">Visit Us</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {address && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C62729]" />
                  <div>
                    <p className="text-xs font-medium text-[#161922]">Address</p>
                    <p className="text-xs text-[#161922]/50">{address}</p>
                  </div>
                </div>
              )}
              {phone && (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#C62729]" />
                  <div>
                    <p className="text-xs font-medium text-[#161922]">Phone</p>
                    <p className="text-xs text-[#161922]/50">{phone}</p>
                  </div>
                </div>
              )}
              {email && (
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#C62729]" />
                  <div>
                    <p className="text-xs font-medium text-[#161922]">Email</p>
                    <p className="text-xs text-[#161922]/50">{email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#C62729]" />
                <div>
                  <p className="text-xs font-medium text-[#161922]">Hours</p>
                  <p className="text-xs text-[#161922]/50">{openingHours}</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setCurrentPage('contact')}
                className="flex items-center gap-1 text-sm font-medium text-[#C62729] transition-colors hover:text-[#B32023]"
              >
                View full contact details
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
