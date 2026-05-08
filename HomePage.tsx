'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  Layers,
  PenTool,
  Search,
  UserPlus,
  ArrowRight,
  BookMarked,
  Library,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings, useBooks, useCategories, useAuthors, useMembers } from '@/hooks/useApi';
import { useAppStore } from '@/store/useAppStore';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function HomePage() {
  const { data: settings } = useSettings();
  const { data: booksData, isLoading: booksLoading } = useBooks();
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: authors } = useAuthors();
  const { data: membersData } = useMembers();
  const { setCurrentPage } = useAppStore();

  const libraryName = settings?.libraryName || 'OSGU Central Library';
  const aboutText = settings?.aboutText || '';

  const books = booksData?.books || [];
  const recentBooks = books.slice(0, 6);

  const stats = [
    { icon: BookMarked, label: 'Books', value: booksData?.total || 0 },
    { icon: Users, label: 'Members', value: membersData?.total || 0 },
    { icon: Layers, label: 'Categories', value: categories?.length || 0 },
    { icon: PenTool, label: 'Authors', value: authors?.length || 0 },
  ];

  const steps = [
    { num: '01', title: 'Browse Catalog', desc: 'Explore our vast collection of books across multiple categories and authors.', icon: Search },
    { num: '02', title: 'Register', desc: 'Sign up for a free membership to borrow books and access exclusive resources.', icon: UserPlus },
    { num: '03', title: 'Start Reading', desc: 'Visit the library to borrow your favorite books and enjoy unlimited reading.', icon: Library },
  ];

  const categoryIcons = ['📚', '🔬', '🎨', '💼', '📖', '🎭', '🌍', '💻', '🏥', '🎵'];

  return (
    <div className="flex flex-col">
      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#161922]">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#161922]/95 via-[#161922]/85 to-[#C62729]/40" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge className="mb-5 border-[#CB8B00]/30 bg-[#CB8B00]/15 text-sm font-medium text-[#CB8B00]">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Welcome to the Library
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {libraryName}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              {aboutText || 'Discover a world of knowledge. Browse thousands of books, become a member, and start your reading journey today.'}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => setCurrentPage('catalog')}
                className="w-full bg-[#C62729] px-8 text-white shadow-lg hover:bg-[#B32023] sm:w-auto"
              >
                <Search className="mr-2 h-4 w-4" />
                Browse Catalog
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setCurrentPage('register')}
                className="w-full border-white/30 bg-transparent px-8 text-white backdrop-blur-sm hover:bg-white/10 sm:w-auto"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Register Now
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Bottom wave/angle */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="#C62729" />
          </svg>
        </div>
      </section>

      {/* ─── Statistics Counter Bar ───────────────────────────────── */}
      <section className="bg-[#C62729] py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 gap-6 lg:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i} className="text-center">
                <stat.icon className="mx-auto mb-2 h-6 w-6 text-white/60" />
                <p className="text-3xl font-extrabold text-[#CB8B00] sm:text-4xl">
                  {stat.value.toLocaleString()}
                </p>
                <p className="mt-1 text-sm font-medium text-white/80">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Featured Categories ──────────────────────────────────── */}
      {categories && categories.length > 0 && (
        <section className="bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-10 text-center"
            >
              <Badge className="mb-3 border-[#C62729]/20 bg-[#C62729]/10 text-[#C62729]">
                <Layers className="mr-1 h-3 w-3" />
                Explore
              </Badge>
              <h2 className="text-2xl font-bold text-[#161922] sm:text-3xl">Featured Categories</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#161922]/50">
                Browse books across a wide variety of genres and disciplines
              </p>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4"
            >
              {catLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                  ))
                : categories.slice(0, 8).map((cat, i) => (
                    <motion.div key={cat.id} variants={fadeUp} custom={i}>
                      <Card
                        className="group cursor-pointer border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5"
                        onClick={() => setCurrentPage('catalog')}
                      >
                        <CardContent className="flex items-center gap-3 p-4 sm:p-5">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#C62729]/10 text-lg transition-colors group-hover:bg-[#C62729] group-hover:text-white">
                            {categoryIcons[i % categoryIcons.length]}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#161922] group-hover:text-[#C62729] transition-colors">
                              {cat.name}
                            </p>
                            <p className="text-xs text-[#161922]/40">
                              {cat._count?.books || 0} book{(cat._count?.books || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
            </motion.div>
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => setCurrentPage('catalog')}
                className="border-[#C62729] text-[#C62729] hover:bg-[#C62729] hover:text-white"
              >
                View All Categories
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ─── Recent Books ─────────────────────────────────────────── */}
      <section className="bg-[#F4F4F4] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center"
          >
            <Badge className="mb-3 border-[#CB8B00]/20 bg-[#CB8B00]/10 text-[#CB8B00]">
              <BookMarked className="mr-1 h-3 w-3" />
              New Arrivals
            </Badge>
            <h2 className="text-2xl font-bold text-[#161922] sm:text-3xl">Recently Added Books</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#161922]/50">
              Check out the latest additions to our collection
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {booksLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-52 rounded-xl" />
                ))
              : recentBooks.map((book, i) => (
                  <motion.div key={book.id} variants={fadeUp} custom={i}>
                    <Card className="group h-full border-slate-200/50 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5">
                      <CardContent className="flex h-full flex-col p-4 sm:p-5">
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-1 text-sm font-semibold text-[#161922] sm:text-base group-hover:text-[#C62729] transition-colors">
                              {book.title}
                            </h3>
                            <p className="mt-0.5 text-xs text-[#161922]/50">{book.author.name}</p>
                          </div>
                          <Badge
                            className={`shrink-0 text-[10px] font-medium ${
                              book.availableCopies > 0
                                ? 'bg-[#C62729]/10 text-[#C62729] hover:bg-[#C62729]/10'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                          <Badge variant="secondary" className="bg-[#CB8B00]/10 text-[#CB8B00] text-[10px] font-medium hover:bg-[#CB8B00]/10">
                            {book.category.name}
                          </Badge>
                          {book.publisher && <span className="text-[11px] text-[#161922]/40">{book.publisher}</span>}
                        </div>
                        {book.description && (
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#161922]/40">
                            {book.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
          </motion.div>
          {books.length > 6 && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => setCurrentPage('catalog')}
                className="border-[#C62729] text-[#C62729] hover:bg-[#C62729] hover:text-white"
              >
                Browse Full Catalog
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ─── How to Join ──────────────────────────────────────────── */}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <Badge className="mb-3 border-[#C62729]/20 bg-[#C62729]/10 text-[#C62729]">
              <UserPlus className="mr-1 h-3 w-3" />
              Get Started
            </Badge>
            <h2 className="text-2xl font-bold text-[#161922] sm:text-3xl">How to Join</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#161922]/50">
              Getting started is easy — just follow these simple steps
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid gap-6 sm:grid-cols-3"
          >
            {steps.map((step, i) => (
              <motion.div key={step.num} variants={fadeUp} custom={i}>
                <Card className="relative overflow-hidden border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                  {/* Red top accent line */}
                  <div className="absolute left-0 top-0 h-1 w-full bg-[#C62729]" />
                  <CardContent className="p-6 sm:p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#C62729] bg-[#C62729]/10 text-[#C62729] font-bold text-lg">
                      {step.num}
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-[#161922]">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-[#161922]/50">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-10 text-center">
            <Button
              size="lg"
              onClick={() => setCurrentPage('register')}
              className="bg-[#C62729] px-8 text-white shadow-lg hover:bg-[#B32023]"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Join Now — It&apos;s Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
