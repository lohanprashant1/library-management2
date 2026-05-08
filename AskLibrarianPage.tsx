'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, MessageCircleQuestion, Send, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface QA {
  id: string;
  question: string;
  answer: string;
  status?: string;
  createdAt?: string;
}

export default function AskLibrarianPage() {
  const [qas, setQas] = useState<QA[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchQA = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/ask-librarian?status=Answered');
        if (res.ok) {
          const data = await res.json();
          setQas(data.qas || data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchQA();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/ask-librarian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, question }),
      });
      if (res.ok) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setQuestion('');
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  const q = search.toLowerCase();
  const filtered = qas.filter(
    (qa) =>
      !q ||
      qa.question?.toLowerCase().includes(q) ||
      qa.answer?.toLowerCase().includes(q)
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <MessageCircleQuestion className="mx-auto mb-3 h-10 w-10 text-[#C62729]" />
        <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Ask a Librarian</h1>
        <p className="mt-2 text-sm text-[#161922]/50">
          Submit your questions and browse previously answered queries
        </p>
      </motion.div>

      {/* Submit Question Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-10"
      >
        <Card className="border-slate-100 bg-white shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-bold text-[#161922] flex items-center gap-2">
              <Send className="h-4 w-4 text-[#C62729]" />
              Submit a Question
            </h2>

            {submitted && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs font-medium text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                Your question has been submitted successfully! We will respond shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="qa-name" className="text-xs font-medium text-[#161922]/70">
                    Your Name <span className="text-[#161922]/30">(optional)</span>
                  </Label>
                  <Input
                    id="qa-name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qa-email" className="text-xs font-medium text-[#161922]/70">
                    Email <span className="text-[#161922]/30">(optional)</span>
                  </Label>
                  <Input
                    id="qa-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qa-question" className="text-xs font-medium text-[#161922]/70">
                  Your Question <span className="text-[#C62729]">*</span>
                </Label>
                <Textarea
                  id="qa-question"
                  placeholder="Type your question here..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                  required
                  className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729] resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting || !question.trim()}
                className="bg-[#C62729] text-white hover:bg-[#C62729]/90 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Question'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Previously Answered Questions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h2 className="mb-4 text-sm font-bold text-[#161922] flex items-center gap-2">
          <MessageCircleQuestion className="h-4 w-4 text-[#C62729]" />
          Previously Answered Questions
        </h2>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#161922]/30" />
          <Input
            placeholder="Search answered questions..."
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

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-12">
            <MessageCircleQuestion className="mb-3 h-12 w-12 text-[#161922]/20" />
            <h3 className="text-sm font-medium text-[#161922]/60">No answered questions found</h3>
            <p className="mt-1 text-xs text-[#161922]/40">
              {search ? 'Try a different search term' : 'Answered questions will appear here'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 rounded-md border border-[#C62729] px-4 py-2 text-xs font-medium text-[#C62729] transition-colors hover:bg-[#C62729] hover:text-white"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {filtered.map((qa, idx) => (
              <AccordionItem
                key={qa.id}
                value={`qa-${qa.id}-${idx}`}
                className="rounded-lg border border-slate-100 bg-white px-4 shadow-sm transition-shadow data-[state=open]:shadow-md data-[state=open]:border-[#C62729]/20"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-[#161922] hover:no-underline hover:text-[#C62729] data-[state=open]:text-[#C62729] py-4">
                  {qa.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-[#161922]/60 pb-4">
                  {qa.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </motion.div>
    </div>
  );
}
