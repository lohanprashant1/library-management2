'use client';

import React from 'react';
import { BookOpen, MapPin, Phone, Mail, Clock, Heart, GraduationCap, Megaphone, MessageCircleQuestion, FileCheck, Compass, Camera, Newspaper, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { useSettings } from '@/hooks/useApi';
import { useAppStore, type Page } from '@/store/useAppStore';

const QUICK_LINKS: { label: string; page: Page }[] = [
  { label: 'Browse Catalog', page: 'catalog' },
  { label: 'E-Books', page: 'ebooks' },
  { label: 'E-Resources', page: 'eresources' },
  { label: 'New Arrivals', page: 'new-arrivals' },
  { label: 'Services', page: 'services' },
  { label: 'Events', page: 'events' },
  { label: 'FAQs', page: 'faqs' },
  { label: 'Become a Member', page: 'register' },
];

const ACADEMIC_LINKS: { label: string; page: Page }[] = [
  { label: 'Research Guides', page: 'research-guides' },
  { label: 'Faculty Publications', page: 'faculty-publications' },
  { label: 'Past Question Papers', page: 'past-papers' },
  { label: 'Current Awareness (CAS)', page: 'cas-alerts' },
  { label: 'Ask a Librarian', page: 'ask-librarian' },
  { label: 'Inter Library Loan', page: 'ill-request' },
  { label: 'Library Rules', page: 'library-rules' },
  { label: 'Committee', page: 'committee' },
];

const MORE_LINKS: { label: string; page: Page }[] = [
  { label: 'Notices', page: 'notices' },
  { label: 'Newsletters', page: 'newsletters' },
  { label: 'Photo Gallery', page: 'photo-gallery' },
  { label: 'Donors', page: 'donors' },
  { label: 'Staff', page: 'staff' },
  { label: 'About Us', page: 'about' },
  { label: 'Contact Us', page: 'contact' },
  { label: 'Feedback', page: 'feedback' },
];

export default function PublicFooter() {
  const { data: settings } = useSettings();
  const { setCurrentPage } = useAppStore();

  const libraryName = settings?.libraryName || 'OSGU Central Library';

  const handleNav = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto bg-[#161922]">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* About Library */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <img src="/osgu-logo.png" alt="OSGU" className="h-9 w-9 rounded object-contain" />
              <span className="text-sm font-bold text-white">{libraryName}</span>
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              {settings?.aboutText || 'The library is the hub of knowledge, providing access to a vast collection of academic resources.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#CB8B00]">
              <BookOpen className="h-4 w-4" /> Library
            </h3>
            <nav className="flex flex-col gap-2">
              {QUICK_LINKS.map((link) => (
                <button key={link.page} onClick={() => handleNav(link.page)} className="w-fit text-left text-sm text-white/60 hover:text-[#C62729]">{link.label}</button>
              ))}
            </nav>
          </div>

          {/* Academic Links */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#CB8B00]">
              <GraduationCap className="h-4 w-4" /> Academic
            </h3>
            <nav className="flex flex-col gap-2">
              {ACADEMIC_LINKS.map((link) => (
                <button key={link.page} onClick={() => handleNav(link.page)} className="w-fit text-left text-sm text-white/60 hover:text-[#C62729]">{link.label}</button>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#CB8B00]">
              <Phone className="h-4 w-4" /> Contact
            </h3>
            <div className="flex flex-col gap-3">
              {settings?.address && (
                <div className="flex items-start gap-2.5 text-sm text-white/60">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C62729]" />
                  <span>{settings.address}</span>
                </div>
              )}
              {settings?.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white">
                  <Phone className="h-4 w-4 shrink-0 text-[#C62729]" />
                  <span>{settings.phone}</span>
                </a>
              )}
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white">
                  <Mail className="h-4 w-4 shrink-0 text-[#C62729]" />
                  <span>{settings.email}</span>
                </a>
              )}
              <div className="flex items-start gap-2.5 text-sm text-white/60">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#C62729]" />
                <span>{settings?.openingHours || 'Mon-Sat: 9:00 AM - 8:00 PM'}</span>
              </div>
            </div>
          </div>

          {/* More Links */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#CB8B00]">
              <Megaphone className="h-4 w-4" /> More
            </h3>
            <nav className="flex flex-col gap-2">
              {MORE_LINKS.map((link) => (
                <button key={link.page} onClick={() => handleNav(link.page)} className="w-fit text-left text-sm text-white/60 hover:text-[#C62729]">{link.label}</button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 bg-[#1E2028]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} {libraryName}. All rights reserved.</p>
          <p className="text-xs text-white/30">Om Sterling Global University</p>
        </div>
      </div>
    </footer>
  );
}
