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
  BookOpen,
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

interface NewArrival {
  id: string;
  title: string;
  author: string;
  category: string;
  itemType: string;
  description: string;
  coverImage: string;
  arrivalDate: string;
  featured: boolean;
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

function useNewArrivals(params: {
  search?: string;
  itemType?: string;
  page?: number;
  limit?: number;
} = {}) {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.itemType) sp.set('itemType', params.itemType);
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));

  return useQuery<{ newArrivals: NewArrival[]; total: number; page: number; limit: number }>({
    queryKey: ['admin-new-arrivals', params],
    queryFn: () => apiFetch(`/api/new-arrivals?${sp.toString()}`),
    staleTime: 10_000,
  });
}

function useCreateNewArrival() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<NewArrival>('/api/new-arrivals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-new-arrivals'] }),
  });
}

function useUpdateNewArrival() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown> & { id: string }) =>
      apiFetch<NewArrival>('/api/new-arrivals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-new-arrivals'] }),
  });
}

function useDeleteNewArrival() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/new-arrivals?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-new-arrivals'] }),
  });
}

function useUploadNewArrivalsExcel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file }: { file: File }) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiFetch<{ message: string; success: number; errors: string[] }>(
        '/api/excel?type=new-arrivals',
        { method: 'POST', body: fd },
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-new-arrivals'] }),
  });
}

// ─── Form ────────────────────────────────────────────────────────────────────

interface NewArrivalForm {
  title: string;
  author: string;
  category: string;
  itemType: string;
  description: string;
  coverImage: string;
  arrivalDate: string;
  featured: boolean;
}

const emptyForm: NewArrivalForm = {
  title: '',
  author: '',
  category: '',
  itemType: '',
  description: '',
  coverImage: '',
  arrivalDate: '',
  featured: false,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function NewArrivalsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewArrival | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<NewArrivalForm>(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limit = 10;

  const { data, isLoading } = useNewArrivals({ search, itemType: typeFilter, page, limit });
  const createMutation = useCreateNewArrival();
  const updateMutation = useUpdateNewArrival();
  const deleteMutation = useDeleteNewArrival();
  const uploadMutation = useUploadNewArrivalsExcel();

  const items = data?.newArrivals ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const resetPage = useCallback(() => setPage(1), []);

  const openAdd = useCallback(() => {
    setEditingItem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((item: NewArrival) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      author: item.author,
      category: item.category,
      itemType: item.itemType,
      description: item.description,
      coverImage: item.coverImage,
      arrivalDate: item.arrivalDate ? item.arrivalDate.split('T')[0] : '',
      featured: item.featured,
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    try {
      const payload = { ...form };
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, ...payload });
        toast.success('New arrival updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('New arrival created successfully');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save new arrival');
    }
  }, [form, editingItem, createMutation, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success('New arrival deleted successfully');
      setDeleteOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete new arrival');
    }
  }, [deletingId, deleteMutation]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadMutation.mutateAsync({ file });
      toast.success(res.message || 'New arrivals imported successfully');
      if (res.errors?.length > 0) toast.info(`${res.errors.length} rows had errors`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload file');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [uploadMutation]);

  const downloadTemplate = useCallback(() => window.open('/api/excel?type=new-arrivals-template', '_blank'), []);
  const exportAll = useCallback(() => window.open('/api/excel?type=new-arrivals-data', '_blank'), []);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const typeBadgeClass = (type: string) => {
    switch (type) {
      case 'Book': return 'bg-emerald-100 text-emerald-700';
      case 'Journal': return 'bg-sky-100 text-sky-700';
      case 'Thesis': return 'bg-violet-100 text-violet-700';
      case 'Report': return 'bg-orange-100 text-orange-700';
      case 'AV': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#161922] tracking-tight">New Arrivals</h2>
          <p className="text-sm text-muted-foreground">
            {total} item{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={openAdd} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" />
          Add New Arrival
        </Button>
      </div>

      {/* Filters & Actions */}
      <Card className="border shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, category..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                className="pl-9 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === '__all__' ? '' : v); resetPage(); }}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Types</SelectItem>
                <SelectItem value="Book">Book</SelectItem>
                <SelectItem value="Journal">Journal</SelectItem>
                <SelectItem value="Thesis">Thesis</SelectItem>
                <SelectItem value="Report">Report</SelectItem>
                <SelectItem value="AV">AV Material</SelectItem>
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
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-2">No new arrivals found</p>
              <Button variant="link" size="sm" className="text-[#C62729] cursor-pointer mt-1" onClick={openAdd}>
                Add your first new arrival
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-[#C62729]/5">
                      <TableHead className="text-xs">Title</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Author</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Type</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Arrival Date</TableHead>
                      <TableHead className="text-xs text-center">Featured</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-[#C62729]/5">
                        <TableCell className="text-xs font-medium max-w-[200px] truncate">
                          <div className="flex items-center gap-2">
                            {item.coverImage && (
                              <img src={item.coverImage} alt="" className="h-8 w-6 rounded object-cover shrink-0 bg-gray-100" />
                            )}
                            <p className="truncate">{item.title}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell max-w-[160px] truncate">{item.author || '—'}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">
                          <Badge variant="secondary" className={`text-xs border-0 ${typeBadgeClass(item.itemType)}`}>
                            {item.itemType || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                          {item.arrivalDate ? new Date(item.arrivalDate).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge variant="secondary" className={`text-xs border-0 ${item.featured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                            {item.featured ? 'Featured' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#C62729] hover:text-[#C62729] hover:bg-[#C62729]/10 cursor-pointer" onClick={() => openEdit(item)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer" onClick={() => { setDeletingId(item.id); setDeleteOpen(true); }}>
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
            <DialogTitle>{editingItem ? 'Edit New Arrival' : 'Add New Arrival'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="na-title">Title *</Label>
              <Input id="na-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Item title" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="na-author">Author</Label>
                <Input id="na-author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Author name" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="na-category">Category</Label>
                <Input id="na-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Computer Science" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Item Type</Label>
                <Select value={form.itemType} onValueChange={(v) => setForm({ ...form, itemType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Book">Book</SelectItem>
                    <SelectItem value="Journal">Journal</SelectItem>
                    <SelectItem value="Thesis">Thesis</SelectItem>
                    <SelectItem value="Report">Report</SelectItem>
                    <SelectItem value="AV">AV Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="na-date">Arrival Date</Label>
                <Input id="na-date" type="date" value={form.arrivalDate} onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="na-description">Description</Label>
              <Textarea id="na-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." rows={3} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="na-cover">Cover Image URL</Label>
              <Input id="na-cover" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={(checked) => setForm({ ...form, featured: checked })} />
              <Label>Featured</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isMutating} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
              {isMutating && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {editingItem ? 'Update' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete New Arrival</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
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
