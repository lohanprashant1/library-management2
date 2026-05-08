'use client';

import React, { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Newsletter {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  issue: string;
  date: string;
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

function useNewsletters(params: {
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));

  return useQuery<{ newsletters: Newsletter[]; total: number; page: number; limit: number }>({
    queryKey: ['admin-newsletters', params],
    queryFn: () => apiFetch(`/api/newsletters?${sp.toString()}`),
    staleTime: 10_000,
  });
}

function useCreateNewsletter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Newsletter>('/api/newsletters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-newsletters'] }),
  });
}

function useUpdateNewsletter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown> & { id: string }) =>
      apiFetch<Newsletter>('/api/newsletters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-newsletters'] }),
  });
}

function useDeleteNewsletter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/newsletters?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-newsletters'] }),
  });
}

function useUploadNewslettersExcel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file }: { file: File }) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiFetch<{ message: string; success: number; errors: string[] }>(
        '/api/excel?type=newsletters',
        { method: 'POST', body: fd },
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-newsletters'] }),
  });
}

// ─── Form ────────────────────────────────────────────────────────────────────

interface NewsletterForm {
  title: string;
  description: string;
  fileUrl: string;
  issue: string;
  date: string;
}

const emptyForm: NewsletterForm = {
  title: '',
  description: '',
  fileUrl: '',
  issue: '',
  date: '',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function NewslettersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Newsletter | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<NewsletterForm>(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limit = 10;

  const { data, isLoading } = useNewsletters({ search, page, limit });
  const createMutation = useCreateNewsletter();
  const updateMutation = useUpdateNewsletter();
  const deleteMutation = useDeleteNewsletter();
  const uploadMutation = useUploadNewslettersExcel();

  const newsletters = data?.newsletters ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const resetPage = useCallback(() => setPage(1), []);

  const openAdd = useCallback(() => {
    setEditingItem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((newsletter: Newsletter) => {
    setEditingItem(newsletter);
    setForm({
      title: newsletter.title,
      description: newsletter.description,
      fileUrl: newsletter.fileUrl,
      issue: newsletter.issue,
      date: newsletter.date ? newsletter.date.split('T')[0] : '',
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, ...form });
        toast.success('Newsletter updated successfully');
      } else {
        await createMutation.mutateAsync(form);
        toast.success('Newsletter created successfully');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save newsletter');
    }
  }, [form, editingItem, createMutation, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success('Newsletter deleted successfully');
      setDeleteOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete newsletter');
    }
  }, [deletingId, deleteMutation]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadMutation.mutateAsync({ file });
      toast.success(res.message || 'Newsletters imported successfully');
      if (res.errors?.length > 0) toast.info(`${res.errors.length} rows had errors`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload file');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [uploadMutation]);

  const downloadTemplate = useCallback(() => window.open('/api/excel?type=newsletters-template', '_blank'), []);
  const exportAll = useCallback(() => window.open('/api/excel?type=newsletters-data', '_blank'), []);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#161922] tracking-tight">Newsletters</h2>
          <p className="text-sm text-muted-foreground">
            {total} newsletter{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={openAdd} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Newsletter
        </Button>
      </div>

      {/* Filters & Actions */}
      <Card className="border shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search newsletters by title or issue..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                className="pl-9 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
            </div>
          </div>

          {/* Excel actions */}
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="cursor-pointer border-[#C62729] text-[#C62729] hover:bg-[#C62729]/10">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="cursor-pointer border-[#C62729] text-[#C62729] hover:bg-[#C62729]/10">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload Excel
            </Button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUpload} />
            <Button variant="outline" size="sm" onClick={exportAll} className="cursor-pointer border-[#C62729] text-[#C62729] hover:bg-[#C62729]/10">
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
              Export Data
            </Button>
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
          ) : newsletters.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-2">No newsletters found</p>
              <Button variant="link" size="sm" className="text-[#C62729] cursor-pointer mt-1" onClick={openAdd}>
                Add your first newsletter
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-[#C62729]/5">
                      <TableHead className="text-xs">Title</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Issue</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">File</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsletters.map((newsletter) => (
                      <TableRow key={newsletter.id} className="hover:bg-[#C62729]/5">
                        <TableCell className="text-xs font-medium max-w-[250px] truncate">{newsletter.title}</TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">
                          <Badge variant="secondary" className="bg-[#C62729]/10 text-[#C62729] text-xs border-0">
                            {newsletter.issue || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                          {newsletter.date ? new Date(newsletter.date).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">
                          {newsletter.fileUrl ? (
                            <a href={newsletter.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[#C62729] hover:underline">
                              View File
                            </a>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#C62729] hover:text-[#C62729] hover:bg-[#C62729]/10 cursor-pointer" onClick={() => openEdit(newsletter)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer" onClick={() => { setDeletingId(newsletter.id); setDeleteOpen(true); }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Newsletter' : 'Add New Newsletter'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="newsletter-title">Title *</Label>
              <Input id="newsletter-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter newsletter title..." className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newsletter-description">Description</Label>
              <Textarea id="newsletter-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Enter description..." rows={3} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="newsletter-issue">Issue</Label>
                <Input id="newsletter-issue" value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} placeholder="e.g., Vol. 1, Issue 1" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newsletter-date">Date</Label>
                <Input id="newsletter-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newsletter-file">File URL</Label>
              <Input id="newsletter-file" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="Enter file URL (PDF, etc.)..." className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isMutating} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
              {isMutating && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {editingItem ? 'Update' : 'Add Newsletter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Newsletter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this newsletter? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
