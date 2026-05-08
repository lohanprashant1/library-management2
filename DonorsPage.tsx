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
  Heart,
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

interface Donor {
  id: string;
  name: string;
  designation: string;
  organization: string;
  amount: number;
  year: number;
  description: string;
  photo: string;
  donorType: string;
  isFeatured: boolean;
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

function useDonors(params: {
  search?: string;
  donorType?: string;
  page?: number;
  limit?: number;
} = {}) {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.donorType) sp.set('donorType', params.donorType);
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));

  return useQuery<{ donors: Donor[]; total: number; page: number; limit: number }>({
    queryKey: ['admin-donors', params],
    queryFn: () => apiFetch(`/api/donors?${sp.toString()}`),
    staleTime: 10_000,
  });
}

function useCreateDonor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Donor>('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-donors'] }),
  });
}

function useUpdateDonor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown> & { id: string }) =>
      apiFetch<Donor>('/api/donors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-donors'] }),
  });
}

function useDeleteDonor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/donors?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-donors'] }),
  });
}

function useUploadDonorsExcel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file }: { file: File }) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiFetch<{ message: string; success: number; errors: string[] }>(
        '/api/excel?type=donors',
        { method: 'POST', body: fd },
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-donors'] }),
  });
}

// ─── Form ────────────────────────────────────────────────────────────────────

interface DonorForm {
  name: string;
  designation: string;
  organization: string;
  amount: string;
  year: string;
  description: string;
  photo: string;
  donorType: string;
  isFeatured: boolean;
}

const emptyForm: DonorForm = {
  name: '',
  designation: '',
  organization: '',
  amount: '',
  year: '',
  description: '',
  photo: '',
  donorType: '',
  isFeatured: false,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function DonorsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<DonorForm>(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limit = 10;

  const { data, isLoading } = useDonors({ search, donorType: typeFilter, page, limit });
  const createMutation = useCreateDonor();
  const updateMutation = useUpdateDonor();
  const deleteMutation = useDeleteDonor();
  const uploadMutation = useUploadDonorsExcel();

  const donors = data?.donors ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const resetPage = useCallback(() => setPage(1), []);

  const openAdd = useCallback(() => {
    setEditingDonor(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((d: Donor) => {
    setEditingDonor(d);
    setForm({
      name: d.name,
      designation: d.designation,
      organization: d.organization,
      amount: String(d.amount),
      year: String(d.year),
      description: d.description,
      photo: d.photo,
      donorType: d.donorType,
      isFeatured: d.isFeatured,
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) { toast.error('Donor name is required'); return; }
    try {
      const payload = { ...form, amount: parseFloat(form.amount) || 0, year: parseInt(form.year) || 0 };
      if (editingDonor) {
        await updateMutation.mutateAsync({ id: editingDonor.id, ...payload });
        toast.success('Donor updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Donor created successfully');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save donor');
    }
  }, [form, editingDonor, createMutation, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success('Donor deleted successfully');
      setDeleteOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete donor');
    }
  }, [deletingId, deleteMutation]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadMutation.mutateAsync({ file });
      toast.success(res.message || 'Donors imported successfully');
      if (res.errors?.length > 0) toast.info(`${res.errors.length} rows had errors`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload file');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [uploadMutation]);

  const downloadTemplate = useCallback(() => window.open('/api/excel?type=donors-template', '_blank'), []);
  const exportAll = useCallback(() => window.open('/api/excel?type=donors-data', '_blank'), []);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const typeBadgeClass = (type: string) => {
    switch (type) {
      case 'Individual': return 'bg-blue-100 text-blue-700';
      case 'Corporate': return 'bg-purple-100 text-purple-700';
      case 'Alumni': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#161922] tracking-tight">Donors</h2>
          <p className="text-sm text-muted-foreground">
            {total} donor{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={openAdd} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Donor
        </Button>
      </div>

      {/* Filters & Actions */}
      <Card className="border shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donors by name, organization..."
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
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
                <SelectItem value="Alumni">Alumni</SelectItem>
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
          ) : donors.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-2">No donors found</p>
              <Button variant="link" size="sm" className="text-[#C62729] cursor-pointer mt-1" onClick={openAdd}>
                Add your first donor
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-[#C62729]/5">
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Type</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Organization</TableHead>
                      <TableHead className="text-xs text-center hidden lg:table-cell">Amount</TableHead>
                      <TableHead className="text-xs text-center hidden lg:table-cell">Year</TableHead>
                      <TableHead className="text-xs text-center">Featured</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donors.map((d) => (
                      <TableRow key={d.id} className="hover:bg-[#C62729]/5">
                        <TableCell className="text-xs font-medium max-w-[200px] truncate">
                          <div>
                            <p className="font-medium truncate">{d.name}</p>
                            {d.designation && <p className="text-[11px] text-muted-foreground truncate">{d.designation}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">
                          <Badge variant="secondary" className={`text-xs border-0 ${typeBadgeClass(d.donorType)}`}>
                            {d.donorType || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[180px] truncate">{d.organization || '—'}</TableCell>
                        <TableCell className="text-xs text-center text-muted-foreground hidden lg:table-cell">
                          {d.amount ? `$${d.amount.toLocaleString()}` : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-center text-muted-foreground hidden lg:table-cell">{d.year || '—'}</TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge variant="secondary" className={`text-xs border-0 ${d.isFeatured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                            {d.isFeatured ? 'Featured' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#C62729] hover:text-[#C62729] hover:bg-[#C62729]/10 cursor-pointer" onClick={() => openEdit(d)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer" onClick={() => { setDeletingId(d.id); setDeleteOpen(true); }}>
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
            <DialogTitle>{editingDonor ? 'Edit Donor' : 'Add New Donor'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="donor-name">Name *</Label>
                <Input id="donor-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Donor name" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="donor-type">Donor Type</Label>
                <Select value={form.donorType} onValueChange={(v) => setForm({ ...form, donorType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Alumni">Alumni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="donor-designation">Designation</Label>
                <Input id="donor-designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. CEO, Professor" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="donor-organization">Organization</Label>
                <Input id="donor-organization" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Organization name" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="donor-amount">Amount ($)</Label>
                <Input id="donor-amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="donor-year">Year</Label>
                <Input id="donor-year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="donor-description">Description</Label>
              <Textarea id="donor-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." rows={3} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="donor-photo">Photo URL</Label>
              <Input id="donor-photo" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="https://..." className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isFeatured} onCheckedChange={(checked) => setForm({ ...form, isFeatured: checked })} />
              <Label>Featured</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isMutating} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
              {isMutating && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {editingDonor ? 'Update' : 'Add Donor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Donor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this donor? This action cannot be undone.
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
