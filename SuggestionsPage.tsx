'use client';

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquarePlus,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Suggestion {
  id: string;
  memberName: string;
  memberEmail: string;
  bookTitle: string;
  author: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNote: string;
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

function useSuggestions(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
} = {}) {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.status) sp.set('status', params.status);
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));

  return useQuery<{ suggestions: Suggestion[]; total: number; page: number; limit: number }>({
    queryKey: ['admin-suggestions', params],
    queryFn: () => apiFetch(`/api/suggestions?${sp.toString()}`),
    staleTime: 10_000,
  });
}

function useUpdateSuggestionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; status: string; adminNote?: string }) =>
      apiFetch<Suggestion>('/api/suggestions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-suggestions'] }),
  });
}

// ─── Status Colors ───────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  Pending: 'bg-[#CB8B00]/15 text-[#CB8B00] border-0',
  Approved: 'bg-green-100 text-green-700 border-0',
  Rejected: 'bg-red-100 text-red-600 border-0',
};

const statusIcons: Record<string, typeof Clock> = {
  Pending: Clock,
  Approved: CheckCircle2,
  Rejected: XCircle,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SuggestionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const limit = 10;

  const { data, isLoading } = useSuggestions({ search, status: statusFilter, page, limit });
  const updateMutation = useUpdateSuggestionStatus();

  const suggestions = data?.suggestions ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const resetPage = useCallback(() => setPage(1), []);

  const openStatusDialog = useCallback((suggestion: Suggestion, status: string) => {
    setSelectedSuggestion(suggestion);
    setNewStatus(status);
    setAdminNote(suggestion.adminNote || '');
    setStatusDialogOpen(true);
  }, []);

  const handleStatusUpdate = useCallback(async () => {
    if (!selectedSuggestion) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedSuggestion.id,
        status: newStatus,
        adminNote: adminNote.trim() || undefined,
      });
      toast.success(`Suggestion ${newStatus.toLowerCase()} successfully`);
      setStatusDialogOpen(false);
      setSelectedSuggestion(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  }, [selectedSuggestion, newStatus, adminNote, updateMutation]);

  return (
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#161922] tracking-tight">Book Suggestions</h2>
          <p className="text-sm text-muted-foreground">
            {total} suggestion{total !== 1 ? 's' : ''} total · Submitted by members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-[#CB8B00]/15 text-[#CB8B00] text-xs border-0">
            {suggestions.filter((s) => s.status === 'Pending').length} pending
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="border shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by book title, author, member..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                className="pl-9 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === '__all__' ? '' : v); resetPage(); }}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
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
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquarePlus className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-2">No suggestions found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Suggestions appear here when members submit book requests
              </p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y">
                {suggestions.map((s) => {
                  const StatusIcon = statusIcons[s.status] || Clock;
                  return (
                    <div key={s.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">{s.bookTitle}</p>
                          <p className="text-xs text-muted-foreground">{s.author}</p>
                        </div>
                        <Badge variant="secondary" className={`text-xs border-0 shrink-0 ${statusColors[s.status] ?? ''}`}>
                          {s.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>Suggested by <span className="font-medium text-foreground">{s.memberName}</span> ({s.memberEmail})</p>
                        {s.reason && <p className="mt-0.5 italic">&quot;{s.reason}&quot;</p>}
                      </div>
                      {s.status === 'Pending' && (
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                            onClick={() => openStatusDialog(s, 'Approved')}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50 cursor-pointer"
                            onClick={() => openStatusDialog(s, 'Rejected')}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {s.adminNote && (
                        <div className="text-xs bg-gray-50 rounded px-2 py-1.5 mt-1">
                          <span className="font-medium text-muted-foreground">Note: </span>
                          {s.adminNote}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-[#C62729]/5">
                      <TableHead className="text-xs">Book Title</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Author</TableHead>
                      <TableHead className="text-xs hidden xl:table-cell">Member</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Reason</TableHead>
                      <TableHead className="text-xs text-center">Status</TableHead>
                      <TableHead className="text-xs text-center">Date</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suggestions.map((s) => (
                      <TableRow key={s.id} className="hover:bg-[#C62729]/5">
                        <TableCell className="text-xs font-medium">{s.bookTitle}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{s.author || '—'}</TableCell>
                        <TableCell className="text-xs hidden xl:table-cell">
                          <div>
                            <p className="font-medium">{s.memberName}</p>
                            <p className="text-muted-foreground text-[11px]">{s.memberEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">
                          {s.reason || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge variant="secondary" className={`text-xs ${statusColors[s.status] ?? ''}`}>
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-center text-muted-foreground">
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {s.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
                                onClick={() => openStatusDialog(s, 'Approved')}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                onClick={() => openStatusDialog(s, 'Rejected')}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {s.adminNote ? `Note: ${s.adminNote.slice(0, 30)}${s.adminNote.length > 30 ? '...' : ''}` : '—'}
                            </span>
                          )}
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

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {newStatus === 'Approved' ? 'Approve Suggestion' : 'Reject Suggestion'}
            </DialogTitle>
          </DialogHeader>
          {selectedSuggestion && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                <p className="text-sm font-medium">{selectedSuggestion.bookTitle}</p>
                <p className="text-xs text-muted-foreground">{selectedSuggestion.author}</p>
                <p className="text-xs text-muted-foreground">
                  Suggested by {selectedSuggestion.memberName} ({selectedSuggestion.memberEmail})
                </p>
              </div>
              {selectedSuggestion.reason && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Reason: </span>
                  <span className="italic">{selectedSuggestion.reason}</span>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="admin-note">Admin Note (optional)</Label>
                <Textarea
                  id="admin-note"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={newStatus === 'Approved' ? 'Add a note for the member...' : 'Reason for rejection...'}
                  rows={3}
                  className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={updateMutation.isPending}
              className={`cursor-pointer text-white ${
                newStatus === 'Approved'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {newStatus === 'Approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
