'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookCopy, Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ILLRequestPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [journal, setJournal] = useState('');
  const [year, setYear] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !requesterName.trim() || !requesterEmail.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/ill-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          author,
          journal,
          year,
          requesterName,
          requesterEmail,
          department,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTitle('');
        setAuthor('');
        setJournal('');
        setYear('');
        setRequesterName('');
        setRequesterEmail('');
        setDepartment('');
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <BookCopy className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Inter-Library Loan Request</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[#161922]/50">
          Request materials not available in our library through our inter-library loan service
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-slate-100 bg-white shadow-sm">
          <CardContent className="p-5 sm:p-8">
            {submitted && (
              <div className="mb-6 flex items-center gap-3 rounded-lg bg-green-50 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Request Submitted Successfully!</p>
                  <p className="mt-0.5 text-xs text-green-600">
                    We have received your inter-library loan request. You will be notified about the status.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Material Details */}
              <div>
                <h2 className="mb-4 text-sm font-bold text-[#161922] flex items-center gap-2">
                  <BookCopy className="h-4 w-4 text-[#C62729]" />
                  Material Details
                </h2>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ill-title" className="text-xs font-medium text-[#161922]/70">
                      Title <span className="text-[#C62729]">*</span>
                    </Label>
                    <Input
                      id="ill-title"
                      placeholder="Title of the book, article, or resource"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="ill-author" className="text-xs font-medium text-[#161922]/70">
                        Author <span className="text-[#161922]/30">(optional)</span>
                      </Label>
                      <Input
                        id="ill-author"
                        placeholder="Author name"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ill-journal" className="text-xs font-medium text-[#161922]/70">
                        Journal <span className="text-[#161922]/30">(optional)</span>
                      </Label>
                      <Input
                        id="ill-journal"
                        placeholder="Journal name"
                        value={journal}
                        onChange={(e) => setJournal(e.target.value)}
                        className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ill-year" className="text-xs font-medium text-[#161922]/70">
                      Year <span className="text-[#161922]/30">(optional)</span>
                    </Label>
                    <Input
                      id="ill-year"
                      placeholder="Publication year"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729] sm:max-w-[200px]"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Requester Information */}
              <div>
                <h2 className="mb-4 text-sm font-bold text-[#161922] flex items-center gap-2">
                  <Send className="h-4 w-4 text-[#C62729]" />
                  Your Information
                </h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="ill-name" className="text-xs font-medium text-[#161922]/70">
                        Full Name <span className="text-[#C62729]">*</span>
                      </Label>
                      <Input
                        id="ill-name"
                        placeholder="Your full name"
                        value={requesterName}
                        onChange={(e) => setRequesterName(e.target.value)}
                        required
                        className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ill-email" className="text-xs font-medium text-[#161922]/70">
                        Email <span className="text-[#C62729]">*</span>
                      </Label>
                      <Input
                        id="ill-email"
                        type="email"
                        placeholder="Your email address"
                        value={requesterEmail}
                        onChange={(e) => setRequesterEmail(e.target.value)}
                        required
                        className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ill-dept" className="text-xs font-medium text-[#161922]/70">
                      Department <span className="text-[#161922]/30">(optional)</span>
                    </Label>
                    <Input
                      id="ill-dept"
                      placeholder="Your department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729] sm:max-w-[300px]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting || !title.trim() || !requesterName.trim() || !requesterEmail.trim()}
                  className="w-full bg-[#C62729] text-white hover:bg-[#C62729]/90 transition-colors sm:w-auto"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
