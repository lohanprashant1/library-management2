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
  Users,
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

interface Staff {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  photo: string;
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

function useStaff(params: {
  search?: string;
  department?: string;
  page?: number;
  limit?: number;
} = {}) {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.department) sp.set('department', params.department);
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));

  return useQuery<{ staff: Staff[]; total: number; page: number; limit: number }>({
    queryKey: ['admin-staff', params],
    queryFn: () => apiFetch(`/api/staff?${sp.toString()}`),
    staleTime: 10_000,
  });
}

function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Staff>('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-staff'] }),
  });
}

function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown> & { id: string }) =>
      apiFetch<Staff>('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-staff'] }),
  });
}

function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/staff?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-staff'] }),
  });
}

function useUploadStaffExcel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file }: { file: File }) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiFetch<{ message: string; success: number; errors: string[] }>(
        '/api/excel?type=staff',
        { method: 'POST', body: fd },
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-staff'] }),
  });
}

// ─── Form ────────────────────────────────────────────────────────────────────

interface StaffForm {
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  photo: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: StaffForm = {
  name: '',
  designation: '',
  department: '',
  email: '',
  phone: '',
  photo: '',
  sortOrder: '0',
  isActive: true,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function StaffPage() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limit = 10;

  const { data, isLoading } = useStaff({ search, department: deptFilter, page, limit });
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const deleteMutation = useDeleteStaff();
  const uploadMutation = useUploadStaffExcel();

  const staffList = data?.staff ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const resetPage = useCallback(() => setPage(1), []);

  const openAdd = useCallback(() => {
    setEditingStaff(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((s: Staff) => {
    setEditingStaff(s);
    setForm({
      name: s.name,
      designation: s.designation,
      department: s.department,
      email: s.email,
      phone: s.phone,
      photo: s.photo,
      sortOrder: String(s.sortOrder),
      isActive: s.isActive,
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) { toast.error('Staff name is required'); return; }
    if (!form.designation.trim()) { toast.error('Designation is required'); return; }
    try {
      const payload = { ...form, sortOrder: parseInt(form.sortOrder) || 0 };
      if (editingStaff) {
        await updateMutation.mutateAsync({ id: editingStaff.id, ...payload });
        toast.success('Staff member updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Staff member created successfully');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save staff member');
    }
  }, [form, editingStaff, createMutation, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success('Staff member deleted successfully');
      setDeleteOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete staff member');
    }
  }, [deletingId, deleteMutation]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadMutation.mutateAsync({ file });
      toast.success(res.message || 'Staff imported successfully');
      if (res.errors?.length > 0) toast.info(`${res.errors.length} rows had errors`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload file');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [uploadMutation]);

  const downloadTemplate = useCallback(() => window.open('/api/excel?type=staff-template', '_blank'), []);
  const exportAll = useCallback(() => window.open('/api/excel?type=staff-data', '_blank'), []);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#161922] tracking-tight">Staff</h2>
          <p className="text-sm text-muted-foreground">
            {total} staff member{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={openAdd} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Staff
        </Button>
      </div>

      {/* Filters & Actions */}
      <Card className="border shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff by name, designation, department..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                className="pl-9 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
            </div>
            <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v === '__all__' ? '' : v); resetPage(); }}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Departments</SelectItem>
                <SelectItem value="Library">Library</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Digital Services">Digital Services</SelectItem>
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
          ) : staffList.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-2">No staff members found</p>
              <Button variant="link" size="sm" className="text-[#C62729] cursor-pointer mt-1" onClick={openAdd}>
                Add your first staff member
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y">
                {staffList.map((s) => (
                  <div key={s.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#C62729]/10 flex items-center justify-center text-[#C62729] font-semibold text-sm">
                          {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.designation}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={`text-xs border-0 ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>{s.department}{s.email ? ` · ${s.email}` : ''}</p>
                      {s.phone && <p>{s.phone}</p>}
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#C62729] hover:text-[#C62729] hover:bg-[#C62729]/10 cursor-pointer" onClick={() => openEdit(s)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer" onClick={() => { setDeletingId(s.id); setDeleteOpen(true); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-[#C62729]/5">
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Department</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Email</TableHead>
                      <TableHead className="text-xs hidden xl:table-cell">Phone</TableHead>
                      <TableHead className="text-xs text-center hidden sm:table-cell">Order</TableHead>
                      <TableHead className="text-xs text-center">Active</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffList.map((s) => (
                      <TableRow key={s.id} className="hover:bg-[#C62729]/5">
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-[#C62729]/10 flex items-center justify-center text-[#C62729] font-semibold text-xs shrink-0">
                              {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{s.name}</p>
                              <p className="text-muted-foreground text-[11px] truncate">{s.designation}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">
                          <Badge variant="secondary" className="bg-[#C62729]/10 text-[#C62729] text-xs border-0">
                            {s.department || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell max-w-[180px] truncate">{s.email || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden xl:table-cell">{s.phone || '—'}</TableCell>
                        <TableCell className="text-xs text-center text-muted-foreground hidden sm:table-cell">{s.sortOrder}</TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge variant="secondary" className={`text-xs border-0 ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {s.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#C62729] hover:text-[#C62729] hover:bg-[#C62729]/10 cursor-pointer" onClick={() => openEdit(s)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer" onClick={() => { setDeletingId(s.id); setDeleteOpen(true); }}>
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
            <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="st-name">Name *</Label>
                <Input id="st-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="st-designation">Designation *</Label>
                <Input id="st-designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Librarian" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="st-dept">Department</Label>
              <Input id="st-dept" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Department" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="st-email">Email</Label>
                <Input id="st-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="st-phone">Phone</Label>
                <Input id="st-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="st-photo">Photo URL</Label>
                <Input id="st-photo" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="https://..." className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="st-order">Sort Order</Label>
                <Input id="st-order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isMutating} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
              {isMutating && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {editingStaff ? 'Update' : 'Add Staff'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this staff member? This action cannot be undone.
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
