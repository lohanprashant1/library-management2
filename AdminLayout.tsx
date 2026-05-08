'use client';

import React, { useState } from 'react';
import { useAppStore, type Page } from '@/store/useAppStore';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FolderTree,
  PenTool,
  ArrowLeftRight,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  FileText,
  HelpCircle,
  UserCog,
  Wrench,
  MessageSquarePlus,
  MessageCircle,
  Rocket,
  Heart,
  Sparkles,
  Database,
  Bell,
  MessageCircleQuestion,
  GraduationCap,
  FileCheck,
  ShieldCheck,
  Camera,
  Newspaper,
  UsersRound,
  Compass,
  Megaphone,
  ArrowRightLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface NavItem {
  label: string;
  page: Page;
  icon: React.ElementType;
  group?: string;
}

const navItems: NavItem[] = [
  // Core
  { label: 'Dashboard', page: 'admin-dashboard', icon: LayoutDashboard, group: 'core' },
  { label: 'Books', page: 'admin-books', icon: BookOpen, group: 'core' },
  { label: 'Members', page: 'admin-members', icon: Users, group: 'core' },
  { label: 'Categories', page: 'admin-categories', icon: FolderTree, group: 'core' },
  { label: 'Authors', page: 'admin-authors', icon: PenTool, group: 'core' },
  { label: 'Transactions', page: 'admin-transactions', icon: ArrowLeftRight, group: 'core' },
  // Digital
  { label: 'E-Books', page: 'admin-ebooks', icon: FileText, group: 'digital' },
  { label: 'E-Resources', page: 'admin-eresources', icon: Database, group: 'digital' },
  { label: 'New Arrivals', page: 'admin-new-arrivals', icon: Sparkles, group: 'digital' },
  // Academic
  { label: 'Research Guides', page: 'admin-research-guides', icon: Compass, group: 'academic' },
  { label: 'Faculty Publications', page: 'admin-faculty-publications', icon: GraduationCap, group: 'academic' },
  { label: 'Past Papers', page: 'admin-past-papers', icon: FileCheck, group: 'academic' },
  { label: 'CAS Alerts', page: 'admin-cas-alerts', icon: Megaphone, group: 'academic' },
  // Community
  { label: 'Events', page: 'admin-events', icon: Calendar, group: 'community' },
  { label: 'Notices', page: 'admin-notices', icon: Bell, group: 'community' },
  { label: 'Newsletters', page: 'admin-newsletters', icon: Newspaper, group: 'community' },
  { label: 'Photo Gallery', page: 'admin-photo-gallery', icon: Camera, group: 'community' },
  { label: 'Donors', page: 'admin-donors', icon: Heart, group: 'community' },
  // Services
  { label: 'Ask Librarian', page: 'admin-ask-librarian', icon: MessageCircleQuestion, group: 'services' },
  { label: 'ILL Requests', page: 'admin-ill-requests', icon: ArrowRightLeft, group: 'services' },
  { label: 'FAQs', page: 'admin-faqs', icon: HelpCircle, group: 'services' },
  { label: 'Services', page: 'admin-services', icon: Wrench, group: 'services' },
  { label: 'Staff', page: 'admin-staff', icon: UserCog, group: 'services' },
  { label: 'Committee', page: 'admin-committee', icon: UsersRound, group: 'services' },
  { label: 'Library Rules', page: 'admin-library-rules', icon: ShieldCheck, group: 'services' },
  // User
  { label: 'Suggestions', page: 'admin-suggestions', icon: MessageSquarePlus, group: 'user' },
  { label: 'Feedback', page: 'admin-feedback', icon: MessageCircle, group: 'user' },
  // System
  { label: 'Settings', page: 'admin-settings', icon: Settings, group: 'system' },
  { label: 'Deploy', page: 'admin-deploy', icon: Rocket, group: 'system' },
];

const groupLabels: Record<string, string> = {
  core: 'Core Library',
  digital: 'Digital Resources',
  academic: 'Academic',
  community: 'Community',
  services: 'Services',
  user: 'User Input',
  system: 'System',
};

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { currentPage, setCurrentPage, adminUser, logout } = useAppStore();

  return (
    <div className="flex flex-col h-full bg-[#161922]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="relative h-9 w-9 rounded-lg overflow-hidden flex-shrink-0">
          <Image src="/osgu-logo.png" alt="OSGU" fill className="object-cover" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">Library Admin</h1>
          <p className="text-xs text-gray-400">Management Panel</p>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item, idx) => {
            const isActive = currentPage === item.page;
            const prevGroup = idx > 0 ? navItems[idx - 1].group : null;
            const showGroup = item.group !== prevGroup;
            return (
              <React.Fragment key={item.page}>
                {showGroup && item.group && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-3 mb-1 px-3 first:mt-0">
                    {groupLabels[item.group] || item.group}
                  </p>
                )}
                <button
                  onClick={() => { setCurrentPage(item.page); onNavigate?.(); }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 w-full text-left cursor-pointer',
                    isActive
                      ? 'bg-[#C62729] text-white shadow-sm'
                      : 'text-gray-300 hover:bg-[#C62729]/10 hover:text-white'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-white/10" />

      {/* Admin Info & Logout */}
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C62729] text-white text-xs font-bold">
            {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{adminUser?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400 truncate">{adminUser?.username || 'admin'}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-[#C62729] hover:text-[#C62729] hover:bg-[#C62729]/10 border-[#C62729]/40 cursor-pointer bg-transparent"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F4F4]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r border-[#161922] shrink-0">
        <SidebarNav />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-3 left-3 z-50 bg-white shadow-md border rounded-lg cursor-pointer">
            <Menu className="h-5 w-5 text-[#161922]" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-[#161922] border-[#161922]">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white/90 backdrop-blur-sm px-4 lg:px-6 shadow-sm">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-7" />
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <div className="relative h-7 w-7 rounded overflow-hidden flex-shrink-0">
              <Image src="/osgu-logo.png" alt="OSGU" fill className="object-cover" />
            </div>
            <span className="text-sm font-bold text-[#161922]">OSGU Library</span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <div className="relative h-7 w-7 rounded overflow-hidden flex-shrink-0">
              <Image src="/osgu-logo.png" alt="OSGU" fill className="object-cover" />
            </div>
            <span className="text-sm font-bold text-[#161922]">OSGU Library Management</span>
          </div>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="lg:hidden text-[#C62729] hover:text-[#C62729] hover:bg-[#C62729]/10 cursor-pointer" onClick={() => useAppStore.getState().logout()}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
