'use client';

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquare,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Feedback {
  id: string;
  memberName: string;
  memberEmail: string;
  rating: number;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── API Helpers ─────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useFeedback(params: {
  search?: string;
  isRead?: string;
  page?: number;
  limit?: number;
} = {}) {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.isRead !== undefined && params.isRead !== '') sp.set('isRead', params.isRead);
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));

  return useQuery<{ feedback: Feedback[]; total: number; page: number; limit: number }>({
    queryKey: ['admin-feedback', params],
    queryFn: () => apiFetch(`/api/feedback?${sp.toString()}`),
    staleTime: 10_000,
  });
}

function useToggleFeedbackRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; isRead: boolean }) =>
      apiFetch<Feedback>('/api/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-feedback'] }),
  });
}

// ─── Rating Stars ────────────────────────────────────────────────────────────

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? 'fill-[#CB8B00] text-[#CB8B00]'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1 font-medium">{rating}.0</span>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [page, setPage] = useState(1);

  const limit = 10;

  const { data, isLoading } = useFeedback({ search, isRead: readFilter, page, limit });
  const toggleMutation = useToggleFeedbackRead();

  const feedbackList = data?.feedback ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const resetPage = useCallback(() => setPage(1), []);

  const handleToggleRead = useCallback(async (id: string, currentIsRead: boolean) => {
    try {
      await toggleMutation.mutateAsync({ id, isRead: !currentIsRead });
      toast.success(currentIsRead ? 'Marked as unread' : 'Marked as read');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    }
  }, [toggleMutation]);

  const avgRating = React.useMemo(() => {
    if (!feedbackList.length) return 0;
    const sum = feedbackList.reduce((acc, f) => acc + f.rating, 0);
    return (sum / feedbackList.length).toFixed(1);
  }, [feedbackList]);

  const unreadCount = React.useMemo(
    () => feedbackList.filter((f) => !f.isRead).length,
    [feedbackList],
  );

  return (
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#161922] tracking-tight">Feedback</h2>
          <p className="text-sm text-muted-foreground">
            {total} feedback entr{total !== 1 ? 'ies' : 'y'} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {feedbackList.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-[#CB8B00] text-[#CB8B00]" />
                <span className="text-sm font-semibold text-[#161922]">{avgRating}</span>
                <span className="text-xs text-muted-foreground">avg</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <Badge variant="secondary" className="bg-[#C62729]/10 text-[#C62729] text-xs border-0">
                {unreadCount} unread
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="border shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by subject, message, member..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                className="pl-9 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
            </div>
            <Select value={readFilter} onValueChange={(v) => { setReadFilter(v === '__all__' ? '' : v); resetPage(); }}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border shadow-sm bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-2">No feedback found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Feedback appears here when members submit their reviews
              </p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y">
                {feedbackList.map((f) => (
                  <div key={f.id} className={`p-4 space-y-2 ${!f.isRead ? 'bg-[#C62729]/3' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {!f.isRead && (
                            <div className="h-2 w-2 rounded-full bg-[#C62729] shrink-0" />
                          )}
                          <p className="text-sm font-medium truncate">{f.subject}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <RatingStars rating={f.rating} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 cursor-pointer ${
                            f.isRead
                              ? 'text-muted-foreground hover:text-foreground'
                              : 'text-[#C62729] hover:text-[#C62729]'
                          }`}
                          onClick={() => handleToggleRead(f.id, f.isRead)}
                          disabled={toggleMutation.isPending}
                        >
                          {f.isRead ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{f.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{f.memberName}</span> · {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '—'}
                      </p>
                      <Badge variant="secondary" className={`text-[10px] border-0 ${f.isRead ? 'bg-gray-100 text-gray-500' : 'bg-[#C62729]/10 text-[#C62729]'}`}>
                        {f.isRead ? 'Read' : 'Unread'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-[#C62729]/5">
                      <TableHead className="text-xs w-8"></TableHead>
                      <TableHead className="text-xs">Subject</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Member</TableHead>
                      <TableHead className="text-xs text-center hidden sm:table-cell">Rating</TableHead>
                      <TableHead className="text-xs hidden xl:table-cell">Message</TableHead>
                      <TableHead className="text-xs text-center hidden lg:table-cell">Date</TableHead>
                      <TableHead className="text-xs text-center">Status</TableHead>
                      <TableHead className="text-xs text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbackList.map((f) => (
                      <TableRow key={f.id} className={`hover:bg-[#C62729]/5 ${!f.isRead ? 'bg-[#C62729]/3' : ''}`}>
                        <TableCell className="text-xs">
                          {!f.isRead && (
                            <div className="h-2 w-2 rounded-full bg-[#C62729]" title="Unread" />
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-medium max-w-[200px] truncate">{f.subject}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">
                          <div>
                            <p className="font-medium">{f.memberName}</p>
                            <p className="text-muted-foreground text-[11px]">{f.memberEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-center hidden sm:table-cell">
                          <div className="flex justify-center">
                            <RatingStars rating={f.rating} />
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden xl:table-cell max-w-[250px] truncate">
                          {f.message}
                        </TableCell>
                        <TableCell className="text-xs text-center text-muted-foreground hidden lg:table-cell">
                          {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge variant="secondary" className={`text-xs border-0 ${f.isRead ? 'bg-gray-100 text-gray-500' : 'bg-[#C62729]/10 text-[#C62729]'}`}>
                            {f.isRead ? 'Read' : 'Unread'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 cursor-pointer ${
                              f.isRead
                                ? 'text-muted-foreground hover:text-foreground'
                                : 'text-[#C62729] hover:text-[#C62729] hover:bg-[#C62729]/10'
                            }`}
                            onClick={() => handleToggleRead(f.id, f.isRead)}
                            disabled={toggleMutation.isPending}
                            title={f.isRead ? 'Mark as unread' : 'Mark as read'}
                          >
                            {f.isRead ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'default' : 'outline'}
                        size="icon"
                        className={`h-8 w-8 text-xs ${pageNum === page ? 'bg-[#C62729] hover:bg-[#B32023] text-white' : ''}`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
