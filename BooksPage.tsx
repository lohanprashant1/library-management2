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
  X,
  Loader2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  useBooks,
  useCategories,
  useAuthors,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
  useUploadExcel,
  type Book,
} from '@/hooks/useApi';

interface BookForm {
  title: string;
  isbn: string;
  description: string;
  publisher: string;
  publishYear: string;
  totalCopies: string;
  categoryId: string;
  authorId: string;
  shelfLocation: string;
}

const emptyForm: BookForm = {
  title: '',
  isbn: '',
  description: '',
  publisher: '',
  publishYear: new Date().getFullYear().toString(),
  totalCopies: '1',
  categoryId: '',
  authorId: '',
  shelfLocation: '',
};

export default function BooksPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<BookForm>(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limit = 10;

  const { data, isLoading } = useBooks({ search, categoryId, authorId, page, limit });
  const { data: categories } = useCategories();
  const { data: authors } = useAuthors();
  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook();
  const deleteMutation = useDeleteBook();
  const uploadMutation = useUploadExcel();

  const books = data?.books ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const resetPage = useCallback(() => setPage(1), []);
  const handleSearchChange = useCallback((val: string) => { setSearch(val); resetPage(); }, [resetPage]);
  const handleCategoryChange = useCallback((val: string) => { setCategoryId(val === '__all__' ? '' : val); resetPage(); }, [resetPage]);
  const handleAuthorChange = useCallback((val: string) => { setAuthorId(val === '__all__' ? '' : val); resetPage(); }, [resetPage]);

  const openAdd = useCallback(() => {
    setEditingBook(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      isbn: book.isbn,
      description: book.description,
      publisher: book.publisher,
      publishYear: String(book.publishYear),
      totalCopies: String(book.totalCopies),
      categoryId: book.categoryId,
      authorId: book.authorId,
      shelfLocation: book.shelfLocation,
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) {
      toast.error('Book title is required');
      return;
    }
    if (!form.categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (!form.authorId) {
      toast.error('Please select an author');
      return;
    }

    const payload = {
      ...form,
      publishYear: parseInt(form.publishYear) || new Date().getFullYear(),
      totalCopies: parseInt(form.totalCopies) || 1,
    };

    try {
      if (editingBook) {
        await updateMutation.mutateAsync({ id: editingBook.id, ...payload });
        toast.success('Book updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Book added successfully');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save book');
    }
  }, [form, editingBook, createMutation, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success('Book deleted successfully');
      setDeleteOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete book');
    }
  }, [deletingId, deleteMutation]);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const res = await uploadMutation.mutateAsync({ type: 'books', file });
        toast.success(res.message || 'Books imported successfully');
        if (res.errors?.length > 0) {
          toast.info(`${res.errors.length} rows had errors`);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to upload file');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [uploadMutation]
  );

  const downloadTemplate = useCallback(() => {
    window.open('/api/excel?type=books-template', '_blank');
  }, []);

  const exportAll = useCallback(() => {
    window.open('/api/excel?type=books-data', '_blank');
  }, []);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#161922] tracking-tight">Books</h2>
          <p className="text-sm text-muted-foreground">
            {total} book{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Book
        </Button>
      </div>

      {/* Filters & Actions */}
      <Card className="border shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search books by title, ISBN, publisher..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
            </div>
            <Select value={categoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Categories</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={authorId} onValueChange={handleAuthorChange}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="All Authors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Authors</SelectItem>
                {authors?.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Excel actions */}
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="cursor-pointer border-[#C62729] text-[#C62729] hover:bg-[#C62729]/10">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="cursor-pointer border-[#C62729] text-[#C62729] hover:bg-[#C62729]/10">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload Excel
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleUpload}
            />
            <Button variant="outline" size="sm" onClick={exportAll} className="cursor-pointer border-[#C62729] text-[#C62729] hover:bg-[#C62729]/10">
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
              Export All
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
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-2">No books found</p>
              <Button variant="link" size="sm" className="text-[#C62729] cursor-pointer mt-1" onClick={openAdd}>
                Add your first book
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
                      <TableHead className="text-xs hidden md:table-cell">Category</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">ISBN</TableHead>
                      <TableHead className="text-xs text-center">Copies</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Shelf</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id} className="hover:bg-[#C62729]/5">
                        <TableCell className="text-xs font-medium max-w-[200px] truncate">
                          {book.title}
                        </TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">
                          {book.author?.name || '—'}
                        </TableCell>
                        <TableCell className="text-xs hidden md:table-cell">
                          <Badge variant="secondary" className="bg-[#C62729]/10 text-[#C62729] text-xs border-0">
                            {book.category?.name || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                          {book.isbn || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <span className="text-[#C62729] font-semibold">{book.availableCopies}</span>
                          <span className="text-muted-foreground">/{book.totalCopies}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                          {book.shelfLocation || '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#C62729] hover:text-[#C62729] hover:bg-[#C62729]/10 cursor-pointer"
                              onClick={() => openEdit(book)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                              onClick={() => {
                                setDeletingId(book.id);
                                setDeleteOpen(true);
                              }}
                            >
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
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
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
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
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
            <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="book-title">Title *</Label>
              <Input
                id="book-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Book title"
                className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="book-isbn">ISBN</Label>
                <Input
                  id="book-isbn"
                  value={form.isbn}
                  onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                  placeholder="ISBN"
                  className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="book-publisher">Publisher</Label>
                <Input
                  id="book-publisher"
                  value={form.publisher}
                  onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                  placeholder="Publisher"
                  className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="book-year">Publish Year</Label>
                <Input
                  id="book-year"
                  type="number"
                  value={form.publishYear}
                  onChange={(e) => setForm({ ...form, publishYear: e.target.value })}
                  className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="book-copies">Total Copies *</Label>
                <Input
                  id="book-copies"
                  type="number"
                  value={form.totalCopies}
                  onChange={(e) => setForm({ ...form, totalCopies: e.target.value })}
                  className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Category *</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Author *</Label>
              <Select value={form.authorId} onValueChange={(v) => setForm({ ...form, authorId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  {authors?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-shelf">Shelf Location</Label>
              <Input
                id="book-shelf"
                value={form.shelfLocation}
                onChange={(e) => setForm({ ...form, shelfLocation: e.target.value })}
                placeholder="e.g. A-12-3"
                className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-desc">Description</Label>
              <Textarea
                id="book-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Book description"
                rows={3}
                className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isMutating}
              className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer"
            >
              {isMutating && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {editingBook ? 'Update' : 'Add Book'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this book? This action cannot be undone. Books with active
              transactions cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
