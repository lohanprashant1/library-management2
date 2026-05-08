'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookCopy,
  Wifi,
  Printer,
  Monitor,
  Headphones,
  Coffee,
  DollarSign,
  Layers,
  Building,
} from 'lucide-react';
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

interface Service {
  id: string;
  name: string;
  description: string;
  icon?: string;
  fee?: number;
  isActive: boolean;
}

const defaultIcons = [
  BookCopy, Wifi, Printer, Monitor, Headphones, Coffee, Layers, Building,
];

const getRandomIcon = (index: number) => defaultIcons[index % defaultIcons.length];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/services?isActive=true');
        if (res.ok) {
          const data = await res.json();
          setServices(data.services || data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const activeServices = services.filter((s) => s.isActive !== false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <Layers className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Our Services</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#161922]/50">
          Explore the wide range of services offered by our library to support your academic and research needs
        </p>
      </motion.div>

      {/* Service Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : activeServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <Building className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No services available</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            Services will appear here once added by the library
          </p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {activeServices.map((service, i) => {
            const IconComponent = getRandomIcon(i);
            return (
              <motion.div key={service.id} variants={fadeUp} custom={i}>
                <Card className="group h-full border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5">
                  <CardContent className="flex h-full flex-col p-5 sm:p-6">
                    {/* Icon */}
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#C62729]/10 text-[#C62729] transition-colors group-hover:bg-[#C62729] group-hover:text-white">
                      <IconComponent className="h-6 w-6" />
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-[#161922] sm:text-base group-hover:text-[#C62729] transition-colors">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-[#161922]/50">
                      {service.description}
                    </p>

                    {/* Fee */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      {service.fee !== undefined && service.fee > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-[#CB8B00]" />
                          <span className="text-sm font-semibold text-[#CB8B00]">
                            {service.fee.toFixed(2)}
                          </span>
                          <span className="text-xs text-[#161922]/40">fee applies</span>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px] font-medium hover:bg-emerald-50">
                          Free Service
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
