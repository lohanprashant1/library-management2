'use client';

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, PenTool } from 'lucide-react';
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
import {
  useAuthors,
  useCreateAuthor,
  useUpdateAuthor,
  useDeleteAuthor,
  type Author,
} from '@/hooks/useApi';

interface AuthorForm {
  name: string;
  bio: string;
}

const emptyForm: AuthorForm = { name: '', bio: '' };

export default function AuthorsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<AuthorForm>(emptyForm);

  const { data: authors, isLoading } = useAuthors();
  const createMutation = useCreateAuthor();
  const updateMutation = useUpdateAuthor();
  const deleteMutation = useDeleteAuthor();

  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((author: Author) => {
    setEditing(author);
    setForm({ name: author.name, bio: author.bio });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) { toast.error('Author name is required'); return; }
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...form });
        toast.success('Author updated successfully');
      } else {
        await createMutation.mutateAsync(form);
        toast.success('Author added successfully');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save author');
    }
  }, [form, editing, createMutation, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success('Author deleted successfully');
      setDeleteOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete author');
    }
  }, [deletingId, deleteMutation]);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4 lg:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#161922] tracking-tight">Authors</h2>
          <p className="text-sm text-muted-foreground">
            {authors?.length ?? 0} author{authors?.length === 1 ? '' : 's'}
          </p>
        </div>
        <Button onClick={openAdd} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Author
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
          ) : !authors?.length ? (
            <div className="text-center py-12">
              <PenTool className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-2">No authors yet</p>
              <Button variant="link" size="sm" className="text-[#C62729] cursor-pointer mt-1" onClick={openAdd}>
                Add your first author
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y">
                {authors.map((author) => (
                  <div key={author.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{author.name}</p>
                        {author.bio && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{author.bio}</p>
                        )}
                      </div>
                      <span className="text-xs font-medium text-[#C62729] bg-[#C62729]/10 px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {author._count?.books ?? 0} books
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#C62729] hover:text-[#C62729] hover:bg-[#C62729]/10 cursor-pointer" onClick={() => openEdit(author)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer" onClick={() => { setDeletingId(author.id); setDeleteOpen(true); }}>
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
                      <TableHead className="text-xs">Bio</TableHead>
                      <TableHead className="text-xs text-center">Books</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authors.map((author) => (
                      <TableRow key={author.id} className="hover:bg-[#C62729]/5">
                        <TableCell className="text-xs font-medium">{author.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                          {author.bio || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] rounded-full bg-[#C62729]/10 text-[#C62729] text-xs font-medium px-2">
                            {author._count?.books ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#C62729] hover:text-[#C62729] hover:bg-[#C62729]/10 cursor-pointer" onClick={() => openEdit(author)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer" onClick={() => { setDeletingId(author.id); setDeleteOpen(true); }}>
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
            <DialogTitle>{editing ? 'Edit Author' : 'Add New Author'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="author-name">Name *</Label>
              <Input id="author-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Author name" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="author-bio">Bio</Label>
              <Textarea id="author-bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Author biography" rows={4} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isMutating} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
              {isMutating && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {editing ? 'Update' : 'Add Author'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Author</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this author? Authors with books assigned cannot be deleted.
              This action cannot be undone.
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
