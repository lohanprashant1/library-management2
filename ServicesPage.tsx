'use client';

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Settings2,
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
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
  fee: number;
  isActive: boolean;
  sortOrder: number;
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

function useServices() {
  return useQuery<Service[]>({
    queryKey: ['admin-services'],
    queryFn: () => apiFetch<Service[]>('/api/services'),
    staleTime: 10_000,
  });
}

function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Service>('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
  });
}

function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown> & { id: string }) =>
      apiFetch<Service>('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
  });
}

function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/services?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
  });
}

// ─── Form ────────────────────────────────────────────────────────────────────

interface ServiceForm {
  title: string;
  description: string;
  iconName: string;
  fee: string;
  isActive: boolean;
  sortOrder: string;
}

const emptyForm: ServiceForm = {
  title: '',
  description: '',
  iconName: '',
  fee: '0',
  isActive: true,
  sortOrder: '0',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);

  const { data: services, isLoading } = useServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const sortedServices = React.useMemo(() => {
    if (!services) return [];
    return [...services].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [services]);

  const openAdd = useCallback(() => {
    setEditingService(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((s: Service) => {
    setEditingService(s);
    setForm({
      title: s.title,
      description: s.description,
      iconName: s.iconName,
      fee: String(s.fee),
      isActive: s.isActive,
      sortOrder: String(s.sortOrder),
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) { toast.error('Service title is required'); return; }
    try {
      const payload = { ...form, fee: parseFloat(form.fee) || 0, sortOrder: parseInt(form.sortOrder) || 0 };
      if (editingService) {
        await updateMutation.mutateAsync({ id: editingService.id, ...payload });
        toast.success('Service updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Service created successfully');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save service');
    }
  }, [form, editingService, createMutation, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success('Service deleted successfully');
      setDeleteOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete service');
    }
  }, [deletingId, deleteMutation]);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4 lg:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#161922] tracking-tight">Services</h2>
          <p className="text-sm text-muted-foreground">
            {services?.length ?? 0} service{services?.length === 1 ? '' : 's'}
          </p>
        </div>
        <Button onClick={openAdd} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Service
        </Button>
      </div>

      {/* Table */}
      <Card className="border shadow-sm bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : !sortedServices.length ? (
            <div className="text-center py-12">
              <Settings2 className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-2">No services yet</p>
              <Button variant="link" size="sm" className="text-[#C62729] cursor-pointer mt-1" onClick={openAdd}>
                Add your first service
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y">
                {sortedServices.map((s) => (
                  <div key={s.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[#CB8B00]/15 flex items-center justify-center text-[#CB8B00]">
                          <Settings2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{s.title}</p>
                          <p className="text-xs text-muted-foreground max-w-[200px] truncate">{s.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={`text-xs border-0 shrink-0 ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <span>Icon: {s.iconName || '—'}</span>
                        <span className="mx-2">·</span>
                        <span className="font-semibold text-[#CB8B00]">₹{s.fee}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#C62729] hover:text-[#C62729] hover:bg-[#C62729]/10 cursor-pointer" onClick={() => openEdit(s)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer" onClick={() => { setDeletingId(s.id); setDeleteOpen(true); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-[#C62729]/5">
                      <TableHead className="text-xs">Service</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Description</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Icon</TableHead>
                      <TableHead className="text-xs text-center">Fee</TableHead>
                      <TableHead className="text-xs text-center hidden sm:table-cell">Order</TableHead>
                      <TableHead className="text-xs text-center">Active</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedServices.map((s) => (
                      <TableRow key={s.id} className="hover:bg-[#C62729]/5">
                        <TableCell className="text-xs font-medium">{s.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell max-w-[250px] truncate">{s.description || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell font-mono">{s.iconName || '—'}</TableCell>
                        <TableCell className="text-xs text-center">
                          <span className="font-semibold text-[#CB8B00]">₹{s.fee}</span>
                        </TableCell>
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="svc-title">Title *</Label>
              <Input id="svc-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Service name" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="svc-desc">Description</Label>
              <Textarea id="svc-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" rows={3} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="svc-icon">Icon Name</Label>
                <Input id="svc-icon" value={form.iconName} onChange={(e) => setForm({ ...form, iconName: e.target.value })} placeholder="e.g. BookOpen" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729] font-mono text-xs" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="svc-fee">Fee (₹)</Label>
                <Input id="svc-fee" type="number" min="0" step="0.01" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="svc-order">Sort Order</Label>
                <Input id="svc-order" type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
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
              {editingService ? 'Update' : 'Add Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
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
