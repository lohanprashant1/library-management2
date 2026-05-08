'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookPlus, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function SuggestBookPage() {
  const [form, setForm] = useState({
    bookTitle: '',
    authorName: '',
    reason: '',
    yourName: '',
    email: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bookTitle || !form.yourName || !form.email) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ bookTitle: '', authorName: '', reason: '', yourName: '', email: '', phone: '' });
      } else {
        setError('Failed to submit suggestion. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h2 className="text-xl font-bold text-[#161922] sm:text-2xl">Suggestion Submitted!</h2>
          <p className="mt-2 max-w-sm text-center text-sm text-[#161922]/50">
            Thank you for suggesting a book. Our team will review your suggestion and get back to you.
          </p>
          <Button
            onClick={() => setSuccess(false)}
            className="mt-6 bg-[#C62729] text-white shadow-sm hover:bg-[#B32023]"
          >
            Suggest Another Book
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <BookPlus className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Suggest a Book</h1>
        <p className="mt-2 text-sm text-[#161922]/50">
          Help us grow our collection by suggesting books you&apos;d like to see in the library
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Book Title */}
              <div className="space-y-2">
                <Label htmlFor="bookTitle" className="text-sm font-medium text-[#161922]">
                  Book Title <span className="text-[#C62729]">*</span>
                </Label>
                <Input
                  id="bookTitle"
                  name="bookTitle"
                  value={form.bookTitle}
                  onChange={handleChange}
                  placeholder="Enter the book title"
                  required
                  className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
              </div>

              {/* Author Name */}
              <div className="space-y-2">
                <Label htmlFor="authorName" className="text-sm font-medium text-[#161922]">
                  Author Name
                </Label>
                <Input
                  id="authorName"
                  name="authorName"
                  value={form.authorName}
                  onChange={handleChange}
                  placeholder="Enter the author's name"
                  className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium text-[#161922]">
                  Reason for Suggestion
                </Label>
                <Textarea
                  id="reason"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="Tell us why you think this book should be in our library..."
                  rows={3}
                  className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729] resize-none"
                />
              </div>

              {/* Your Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="yourName" className="text-sm font-medium text-[#161922]">
                    Your Name <span className="text-[#C62729]">*</span>
                  </Label>
                  <Input
                    id="yourName"
                    name="yourName"
                    value={form.yourName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-[#161922]">
                    Email <span className="text-[#C62729]">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-[#161922]">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-[#C62729]">{error}</p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C62729] text-white shadow-sm hover:bg-[#B32023] disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Suggestion
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
