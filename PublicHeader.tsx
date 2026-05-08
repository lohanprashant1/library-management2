'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, LogIn, LogOut, LayoutDashboard, Phone, Mail, ChevronDown, BookOpen, GraduationCap, Megaphone, Bell, Heart, Camera, Newspaper, MessageCircleQuestion, ArrowRightLeft, Compass, FileCheck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAppStore, type Page } from '@/store/useAppStore';
import { useSettings } from '@/hooks/useApi';

interface NavLink {
  label: string;
  page: Page;
  icon?: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  links: NavLink[];
}

const MAIN_LINKS: NavLink[] = [
  { label: 'Home', page: 'home' },
  { label: 'Catalog', page: 'catalog' },
  { label: 'Register', page: 'register' },
  { label: 'About', page: 'about' },
  { label: 'Contact', page: 'contact' },
];

const DROPDOWN_GROUPS: NavGroup[] = [
  {
    label: 'Resources',
    icon: BookOpen,
    links: [
      { label: 'E-Books', page: 'ebooks', icon: BookOpen },
      { label: 'E-Resources / Databases', page: 'eresources', icon: BookOpen },
      { label: 'New Arrivals', page: 'new-arrivals', icon: BookOpen },
      { label: 'Research Guides', page: 'research-guides', icon: Compass },
      { label: 'Faculty Publications', page: 'faculty-publications', icon: GraduationCap },
      { label: 'Past Question Papers', page: 'past-papers', icon: FileCheck },
    ],
  },
  {
    label: 'Services',
    icon: GraduationCap,
    links: [
      { label: 'All Services', page: 'services' },
      { label: 'Ask a Librarian', page: 'ask-librarian', icon: MessageCircleQuestion },
      { label: 'Inter Library Loan', page: 'ill-request', icon: ArrowRightLeft },
      { label: 'Current Awareness', page: 'cas-alerts', icon: Megaphone },
      { label: 'Suggest a Book', page: 'suggest-book' },
      { label: 'Feedback', page: 'feedback' },
    ],
  },
  {
    label: 'More',
    icon: Megaphone,
    links: [
      { label: 'Events', page: 'events' },
      { label: 'Notices', page: 'notices', icon: Bell },
      { label: 'Newsletters', page: 'newsletters', icon: Newspaper },
      { label: 'Photo Gallery', page: 'photo-gallery', icon: Camera },
      { label: 'Donors', page: 'donors', icon: Heart },
      { label: 'FAQs', page: 'faqs' },
      { label: 'Staff', page: 'staff' },
      { label: 'Committee', page: 'committee' },
      { label: 'Library Rules', page: 'library-rules', icon: ShieldCheck },
    ],
  },
];

// All links flat for mobile nav
const ALL_LINKS: NavLink[] = [
  { label: 'Home', page: 'home' },
  { label: 'Browse Catalog', page: 'catalog' },
  { label: 'E-Books', page: 'ebooks' },
  { label: 'E-Resources', page: 'eresources' },
  { label: 'New Arrivals', page: 'new-arrivals' },
  { label: 'Ask a Librarian', page: 'ask-librarian' },
  { label: 'Research Guides', page: 'research-guides' },
  { label: 'Faculty Publications', page: 'faculty-publications' },
  { label: 'Past Papers', page: 'past-papers' },
  { label: 'Events', page: 'events' },
  { label: 'Notices', page: 'notices' },
  { label: 'Services', page: 'services' },
  { label: 'Newsletters', page: 'newsletters' },
  { label: 'Photo Gallery', page: 'photo-gallery' },
  { label: 'Donors', page: 'donors' },
  { label: 'FAQs', page: 'faqs' },
  { label: 'Staff', page: 'staff' },
  { label: 'Committee', page: 'committee' },
  { label: 'Library Rules', page: 'library-rules' },
  { label: 'Register', page: 'register' },
  { label: 'About', page: 'about' },
  { label: 'Contact', page: 'contact' },
];

function DropdownMenu({ group, currentPage, onNavigate }: { group: NavGroup; currentPage: Page; onNavigate: (p: Page) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasActive = group.links.some((l) => l.page === currentPage);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          hasActive ? 'bg-[#C62729]/10 text-[#C62729]' : 'text-[#161922]/70 hover:bg-slate-50 hover:text-[#161922]'
        }`}
      >
        {group.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-60 rounded-lg border bg-white shadow-lg py-1 animate-in fade-in-0 slide-in-from-top-2">
          {group.links.map((link) => (
            <button
              key={link.page}
              onClick={() => { onNavigate(link.page); setOpen(false); }}
              className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm transition-colors ${
                currentPage === link.page
                  ? 'bg-[#C62729]/10 text-[#C62729] font-medium'
                  : 'text-[#161922]/70 hover:bg-slate-50 hover:text-[#161922]'
              }`}
            >
              {link.icon && <link.icon className="h-4 w-4 shrink-0" />}
              {link.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PublicHeader() {
  const { currentPage, setCurrentPage, isAdmin, logout } = useAppStore();
  const { data: settings } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const libraryName = settings?.libraryName || 'OSGU Central Library';
  const phone = settings?.phone || '+91 12345 67890';
  const email = settings?.email || 'library@osgu.ac.in';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (page: Page) => {
    setCurrentPage(page);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Utility Bar */}
      <div className="hidden bg-[#161922] text-white sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 text-xs">
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 text-white/80 hover:text-[#CB8B00]">
              <Phone className="h-3 w-3" /><span>{phone}</span>
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-1.5 text-white/80 hover:text-[#CB8B00]">
              <Mail className="h-3 w-3" /><span>{email}</span>
            </a>
          </div>
          <div>
            {!isAdmin ? (
              <Button variant="ghost" size="sm" onClick={() => handleNav('login')} className="h-7 gap-1.5 rounded-sm px-3 text-xs font-medium text-[#CB8B00] hover:bg-[#CB8B00]/10">
                <LogIn className="h-3 w-3" /> Admin Login
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleNav('admin-dashboard')} className="h-7 gap-1.5 rounded-sm px-3 text-xs font-medium text-white hover:bg-white/10">
                  <LayoutDashboard className="h-3 w-3" /> Admin Panel
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { logout(); setMobileOpen(false); }} className="h-7 gap-1.5 rounded-sm px-3 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white">
                  <LogOut className="h-3 w-3" /> Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={`border-b bg-white transition-shadow duration-200 ${scrolled ? 'shadow-md' : 'border-slate-100'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/osgu-logo.png" alt="OSGU Logo" className="h-10 w-10 rounded object-contain sm:h-11 sm:w-11" />
            <div className="hidden sm:block">
              <span className="block text-base font-bold tracking-tight text-[#161922]">{libraryName}</span>
            </div>
            <span className="text-base font-bold text-[#161922] sm:hidden">
              {libraryName.length > 18 ? libraryName.slice(0, 16) + '…' : libraryName}
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {MAIN_LINKS.map((link) => (
              <button key={link.page} onClick={() => handleNav(link.page)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === link.page ? 'bg-[#C62729]/10 text-[#C62729]' : 'text-[#161922]/70 hover:bg-slate-50 hover:text-[#161922]'
                }`}
              >
                {link.label}
              </button>
            ))}
            {DROPDOWN_GROUPS.map((group) => (
              <DropdownMenu key={group.label} group={group} currentPage={currentPage} onNavigate={handleNav} />
            ))}
          </nav>

          {/* Desktop Admin */}
          <div className="hidden items-center gap-2 md:flex">
            {isAdmin ? (
              <>
                <Button size="sm" onClick={() => handleNav('admin-dashboard')} className="bg-[#C62729] text-white shadow-sm hover:bg-[#B32023]">
                  <LayoutDashboard className="mr-1.5 h-4 w-4" /> Admin Panel
                </Button>
                <Button variant="outline" size="sm" onClick={() => logout()} className="border-slate-200 text-[#161922]/70 hover:bg-slate-50">
                  <LogOut className="mr-1.5 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => handleNav('login')} className="bg-[#C62729] text-white shadow-sm hover:bg-[#B32023]">
                <LogIn className="mr-1.5 h-4 w-4" /> Admin Login
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#161922]">
                  <Menu className="h-5 w-5" /><span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-[#161922]">
                    <img src="/osgu-logo.png" alt="OSGU" className="h-8 w-8 rounded object-contain" />
                    {libraryName}
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-0.5">
                  {ALL_LINKS.map((link) => (
                    <button key={link.page} onClick={() => handleNav(link.page)}
                      className={`rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        currentPage === link.page ? 'bg-[#C62729]/10 text-[#C62729]' : 'text-[#161922]/70 hover:bg-slate-50 hover:text-[#161922]'
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                  <div className="my-2 border-t border-slate-100" />
                  {isAdmin ? (
                    <>
                      <button onClick={() => handleNav('admin-dashboard')} className="flex items-center gap-2 rounded-md bg-[#C62729]/10 px-3 py-2.5 text-left text-sm font-medium text-[#C62729] hover:bg-[#C62729]/20">
                        <LayoutDashboard className="h-4 w-4" /> Admin Panel
                      </button>
                      <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-[#161922]/50 hover:bg-red-50 hover:text-[#C62729]">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleNav('login')} className="flex items-center gap-2 rounded-md bg-[#CB8B00]/10 px-3 py-2.5 text-left text-sm font-medium text-[#CB8B00] hover:bg-[#CB8B00]/20">
                      <LogIn className="h-4 w-4" /> Admin Login
                    </button>
                  )}
                </nav>
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <div className="flex flex-col gap-2 text-xs text-[#161922]/50">
                    <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-[#C62729]"><Phone className="h-3 w-3" />{phone}</a>
                    <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-[#C62729]"><Mail className="h-3 w-3" />{email}</a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
