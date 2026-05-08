'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/useApi';

export default function ContactPage() {
  const { data: settings, isLoading } = useSettings();

  const libraryName = settings?.libraryName || 'OSGU Central Library';
  const address = settings?.address || '';
  const phone = settings?.phone || '';
  const email = settings?.email || '';
  const openingHours = settings?.openingHours || 'Mon-Sat: 9:00 AM - 8:00 PM';

  const contactItems = [
    {
      icon: MapPin,
      label: 'Address',
      value: address,
      emptyText: 'No address available',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: phone,
      emptyText: 'No phone available',
      href: phone ? `tel:${phone}` : undefined,
    },
    {
      icon: Mail,
      label: 'Email',
      value: email,
      emptyText: 'No email available',
      href: email ? `mailto:${email}` : undefined,
    },
    {
      icon: Clock,
      label: 'Opening Hours',
      value: openingHours,
      emptyText: 'No hours available',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Contact Us</h1>
        <p className="mt-1 text-sm text-[#161922]/50">
          Get in touch with {libraryName}
        </p>
      </motion.div>

      {/* Contact Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {contactItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            {item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                <Card className="group h-full border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C62729]/10 text-[#C62729] transition-colors group-hover:bg-[#C62729] group-hover:text-white">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#161922]/40">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-[#161922]">{item.value || item.emptyText}</p>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#C62729] opacity-0 transition-opacity group-hover:opacity-100">
                        <ExternalLink className="h-3 w-3" />
                        Open
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ) : (
              <Card className="h-full border-slate-100 bg-white shadow-sm">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C62729]/10 text-[#C62729]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-[#161922]/40">{item.label}</p>
                    {isLoading ? (
                      <Skeleton className="mt-2 h-4 w-40" />
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-[#161922]">{item.value || item.emptyText}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <Card className="border-[#C62729]/10 bg-[#F4F4F4] shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C62729]/10 text-[#C62729]">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#161922]">Need Help?</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#161922]/60">
                  If you have questions about membership, book availability, or any other library services,
                  please don&apos;t hesitate to reach out using the contact information above. Our staff is happy to assist you
                  during our regular opening hours.
                </p>
                <p className="mt-2 text-xs text-[#161922]/40">
                  We aim to respond to all inquiries within one business day.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
