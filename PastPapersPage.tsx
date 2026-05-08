'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, FileText, Download, Calendar, Building2, BookMarked } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

interface PastPaper {
  id: string;
  title: string;
  course?: string;
  courseCode?: string;
  department?: string;
  year?: number;
  semester?: string;
  fileUrl?: string;
}

export default function PastPapersPage() {
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [year, setYear] = useState('all');

  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/past-papers');
        if (res.ok) {
          const data = await res.json();
          setPapers(data.papers || data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const q = search.toLowerCase();
  const filtered = papers.filter(
    (p) =>
      (!q ||
        p.title?.toLowerCase().includes(q) ||
        p.course?.toLowerCase().includes(q) ||
        p.courseCode?.toLowerCase().includes(q)) &&
      (department === 'all' || p.department === department) &&
      (year === 'all' || String(p.year) === year)
  );

  const departments = [...new Set(papers.map((p) => p.department).filter(Boolean))].sort();
  const years = [...new Set(papers.map((p) => p.year).filter(Boolean))].sort((a, b) => Number(b) - Number(a));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <FileText className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Past Examination Papers</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#161922]/50">
          Access previous examination papers organized by course and department
        </p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#161922]/30" />
          <Input
            placeholder="Search by title, course..."
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
        {departments.length > 0 && (
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-full border-slate-200 sm:w-48 focus:ring-[#C62729]/20 focus:border-[#C62729]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d!}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {years.length > 0 && (
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-full border-slate-200 sm:w-36 focus:ring-[#C62729]/20 focus:border-[#C62729]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
          <FileText className="mb-3 h-12 w-12 text-[#161922]/20" />
          <h3 className="text-sm font-medium text-[#161922]/60">No past papers found</h3>
          <p className="mt-1 text-xs text-[#161922]/40">
            {search || department !== 'all' || year !== 'all' ? 'Try a different search or filter' : 'Past papers will appear here once added'}
          </p>
          {(search || department !== 'all' || year !== 'all') && (
            <button
              onClick={() => { setSearch(''); setDepartment('all'); setYear('all'); }}
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
          {filtered.map((paper, i) => (
            <motion.div key={paper.id} variants={fadeUp} custom={i}>
              <Card className="group h-full border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C62729]/5">
                <CardContent className="flex h-full flex-col p-5 sm:p-6">
                  {/* Icon */}
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#C62729]/10 text-[#C62729]">
                    <FileText className="h-5 w-5" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-[#161922] group-hover:text-[#C62729] transition-colors line-clamp-2">
                    {paper.title}
                  </h3>

                  {/* Course Info */}
                  {(paper.course || paper.courseCode) && (
                    <p className="mt-2 text-xs text-[#161922]/50">
                      {paper.courseCode && <span className="font-medium text-[#CB8B00]">{paper.courseCode}</span>}
                      {paper.courseCode && paper.course && ' — '}
                      {paper.course}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                    {paper.department && (
                      <Badge variant="secondary" className="bg-[#161922]/5 text-[#161922]/50 text-[10px] font-medium hover:bg-[#161922]/5">
                        <Building2 className="mr-1 h-2.5 w-2.5" />
                        {paper.department}
                      </Badge>
                    )}
                    {paper.semester && (
                      <Badge variant="secondary" className="bg-[#161922]/5 text-[#161922]/50 text-[10px] font-medium hover:bg-[#161922]/5">
                        <BookMarked className="mr-1 h-2.5 w-2.5" />
                        {paper.semester}
                      </Badge>
                    )}
                    {paper.year && (
                      <span className="flex items-center gap-1 text-[10px] text-[#161922]/40">
                        <Calendar className="h-2.5 w-2.5" />
                        {paper.year}
                      </span>
                    )}
                  </div>

                  {/* Download */}
                  {paper.fileUrl && (
                    <Button asChild className="mt-4 w-full bg-[#C62729] text-white text-xs hover:bg-[#C62729]/90 transition-colors">
                      <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5">
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    </Button>
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
