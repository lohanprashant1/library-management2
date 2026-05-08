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
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
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

function useFAQs(params: {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
} = {}) {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.category) sp.set('category', params.category);
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));

  return useQuery<{ faqs: FAQ[]; total: number; page: number; limit: number }>({
    queryKey: ['admin-faqs', params],
    queryFn: () => apiFetch(`/api/faqs?${sp.toString()}`),
    staleTime: 10_000,
  });
}

function useCreateFAQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<FAQ>('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-faqs'] }),
  });
}

function useUpdateFAQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown> & { id: string }) =>
      apiFetch<FAQ>('/api/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-faqs'] }),
  });
}

function useDeleteFAQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/faqs?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-faqs'] }),
  });
}

function useUploadFAQsExcel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file }: { file: File }) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiFetch<{ message: string; success: number; errors: string[] }>(
        '/api/excel?type=faqs',
        { method: 'POST', body: fd },
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-faqs'] }),
  });
}

// ─── Form ────────────────────────────────────────────────────────────────────

interface FAQForm {
  question: string;
  answer: string;
  category: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: FAQForm = {
  question: '',
  answer: '',
  category: '',
  sortOrder: '0',
  isActive: true,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function FAQsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FAQForm>(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limit = 10;

  const { data, isLoading } = useFAQs({ search, category: categoryFilter, page, limit });
  const createMutation = useCreateFAQ();
  const updateMutation = useUpdateFAQ();
  const deleteMutation = useDeleteFAQ();
  const uploadMutation = useUploadFAQsExcel();

  const faqs = data?.faqs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const resetPage = useCallback(() => setPage(1), []);

  const openAdd = useCallback(() => {
    setEditingFAQ(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((faq: FAQ) => {
    setEditingFAQ(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sortOrder: String(faq.sortOrder),
      isActive: faq.isActive,
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.question.trim()) { toast.error('Question is required'); return; }
    if (!form.answer.trim()) { toast.error('Answer is required'); return; }
    try {
      const payload = { ...form, sortOrder: parseInt(form.sortOrder) || 0 };
      if (editingFAQ) {
        await updateMutation.mutateAsync({ id: editingFAQ.id, ...payload });
        toast.success('FAQ updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('FAQ created successfully');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save FAQ');
    }
  }, [form, editingFAQ, createMutation, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success('FAQ deleted successfully');
      setDeleteOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete FAQ');
    }
  }, [deletingId, deleteMutation]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadMutation.mutateAsync({ file });
      toast.success(res.message || 'FAQs imported successfully');
      if (res.errors?.length > 0) toast.info(`${res.errors.length} rows had errors`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload file');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [uploadMutation]);

  const downloadTemplate = useCallback(() => window.open('/api/excel?type=faqs-template', '_blank'), []);
  const exportAll = useCallback(() => window.open('/api/excel?type=faqs-data', '_blank'), []);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#161922] tracking-tight">FAQs</h2>
          <p className="text-sm text-muted-foreground">
            {total} FAQ{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={openAdd} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" />
          Add FAQ
        </Button>
      </div>

      {/* Filters & Actions */}
      <Card className="border shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs by question or answer..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                className="pl-9 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v === '__all__' ? '' : v); resetPage(); }}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Categories</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Membership">Membership</SelectItem>
                <SelectItem value="Borrowing">Borrowing</SelectItem>
                <SelectItem value="Events">Events</SelectItem>
                <SelectItem value="Digital">Digital Resources</SelectItem>
              </SelectContent>
            </Select>
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
          ) : faqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-2">No FAQs found</p>
              <Button variant="link" size="sm" className="text-[#C62729] cursor-pointer mt-1" onClick={openAdd}>
                Add your first FAQ
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-[#C62729]/5">
                      <TableHead className="text-xs">Question</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Category</TableHead>
                      <TableHead className="text-xs text-center hidden md:table-cell">Order</TableHead>
                      <TableHead className="text-xs text-center">Active</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => (
                      <TableRow key={faq.id} className="hover:bg-[#C62729]/5">
                        <TableCell className="text-xs font-medium max-w-[250px] truncate">{faq.question}</TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">
                          <Badge variant="secondary" className="bg-[#C62729]/10 text-[#C62729] text-xs border-0">
                            {faq.category || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-center text-muted-foreground hidden md:table-cell">{faq.sortOrder}</TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge variant="secondary" className={`text-xs border-0 ${faq.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {faq.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#C62729] hover:text-[#C62729] hover:bg-[#C62729]/10 cursor-pointer" onClick={() => openEdit(faq)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer" onClick={() => { setDeletingId(faq.id); setDeleteOpen(true); }}>
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
            <DialogTitle>{editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="faq-question">Question *</Label>
              <Textarea id="faq-question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Type the question..." rows={2} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="faq-answer">Answer *</Label>
              <Textarea id="faq-answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="Type the answer..." rows={4} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Membership">Membership</SelectItem>
                    <SelectItem value="Borrowing">Borrowing</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Digital">Digital Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="faq-order">Sort Order</Label>
                <Input id="faq-order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
              <div className="grid gap-2 flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isMutating} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
              {isMutating && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {editingFAQ ? 'Update' : 'Add FAQ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
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
