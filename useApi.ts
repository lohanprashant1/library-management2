'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Book {
  id: string;
  title: string;
  isbn: string;
  description: string;
  publisher: string;
  publishYear: number;
  totalCopies: number;
  availableCopies: number;
  categoryId: string;
  authorId: string;
  coverImage: string;
  shelfLocation: string;
  addedAt: string;
  updatedAt: string;
  category: { id: string; name: string };
  author: { id: string; name: string };
}

export interface Member {
  id: string;
  memberId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  occupation: string;
  photo: string;
  status: string;
  membershipDate: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count?: { books: number };
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
  _count?: { books: number };
}

export interface Transaction {
  id: string;
  bookId: string;
  memberId: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
  fineAmount: number;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  book: Book;
  member: Member;
}

export interface Settings {
  id: string;
  libraryName: string;
  address: string;
  phone: string;
  email: string;
  aboutText: string;
  maxBooksPerMember: number;
  maxLoanDays: number;
  finePerDay: number;
  openingHours: string;
  membershipFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items?: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  // Handle file download (blob)
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('spreadsheet')) {
    const blob = await res.blob();
    return blob as unknown as T;
  }
  return res.json();
}

// ─── Settings ────────────────────────────────────────────────────────────────

export function useSettings() {
  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => apiFetch<Settings>('/api/settings'),
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Settings>) =>
      apiFetch<Settings>('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { username: string; currentPassword: string; newPassword: string }) =>
      apiFetch<{ success: boolean; message: string }>('/api/settings/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  });
}

// ─── Books ───────────────────────────────────────────────────────────────────

export function useBooks(params: {
  search?: string;
  categoryId?: string;
  authorId?: string;
  page?: number;
  limit?: number;
} = {}) {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.categoryId) sp.set('categoryId', params.categoryId);
  if (params.authorId) sp.set('authorId', params.authorId);
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));

  return useQuery<{ books: Book[]; total: number; page: number; limit: number }>({
    queryKey: ['books', params],
    queryFn: () => apiFetch(`/api/books?${sp.toString()}`),
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Book>('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown> & { id: string }) =>
      apiFetch<Book>('/api/books', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/books?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── Members ─────────────────────────────────────────────────────────────────

export function useMembers(params: {
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

  return useQuery<{ members: Member[]; total: number; page: number; limit: number }>({
    queryKey: ['members', params],
    queryFn: () => apiFetch(`/api/members?${sp.toString()}`),
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Member>('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown> & { id: string }) =>
      apiFetch<Member>('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/members?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── Categories ──────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Category[]>('/api/categories'),
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      apiFetch<Category>('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; name: string; description?: string }) =>
      apiFetch<Category>('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/categories?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ─── Authors ─────────────────────────────────────────────────────────────────

export function useAuthors() {
  return useQuery<Author[]>({
    queryKey: ['authors'],
    queryFn: () => apiFetch<Author[]>('/api/authors'),
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}

export function useCreateAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; bio?: string }) =>
      apiFetch<Author>('/api/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['authors'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; name: string; bio?: string }) =>
      apiFetch<Author>('/api/authors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['authors'] });
    },
  });
}

export function useDeleteAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/authors?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['authors'] });
    },
  });
}

// ─── Transactions ────────────────────────────────────────────────────────────

export function useTransactions(params: {
  status?: string;
  memberId?: string;
  page?: number;
  limit?: number;
} = {}) {
  const sp = new URLSearchParams();
  if (params.status) sp.set('status', params.status);
  if (params.memberId) sp.set('memberId', params.memberId);
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));

  return useQuery<{ transactions: Transaction[]; total: number; page: number; limit: number }>({
    queryKey: ['transactions', params],
    queryFn: () => apiFetch(`/api/transactions?${sp.toString()}`),
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { bookId: string; memberId: string; dueDate?: string; remarks?: string }) =>
      apiFetch<Transaction>('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useReturnBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; returnDate?: string; fineAmount?: number; remarks?: string }) =>
      apiFetch<Transaction>('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── Excel helpers ───────────────────────────────────────────────────────────

export function useUploadExcel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, file }: { type: 'books' | 'members'; file: File }) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiFetch<{ message: string; success: number; errors: string[] }>(
        `/api/excel?type=${type}`,
        { method: 'POST', body: fd }
      );
    },
    onSuccess: (_, variables) => {
      if (variables.type === 'books') {
        qc.invalidateQueries({ queryKey: ['books'] });
      } else {
        qc.invalidateQueries({ queryKey: ['members'] });
      }
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
