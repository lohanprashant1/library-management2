'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Undo2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeftRight,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  useTransactions,
  useBooks,
  useMembers,
  useSettings,
  useCreateTransaction,
  useReturnBook,
  type Transaction,
  type Book,
  type Member,
} from '@/hooks/useApi';

export default function TransactionsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Issue dialog
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueBookSearch, setIssueBookSearch] = useState('');
  const [issueMemberSearch, setIssueMemberSearch] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // Return dialog
  const [returnOpen, setReturnOpen] = useState(false);
  const [returningTx, setReturningTx] = useState<Transaction | null>(null);
  const [returnFine, setReturnFine] = useState(0);
  const [returnRemarks, setReturnRemarks] = useState('');

  // Member search for table filter (by member ID search)
  const { data, isLoading } = useTransactions({
    status: statusFilter,
    memberId: memberSearch || undefined,
    page,
    limit,
  });

  // For issue dialog
  const { data: allBooks } = useBooks({ search: issueBookSearch, limit: 50 });
  const { data: allMembers } = useMembers({ search: issueMemberSearch, status: 'Active', limit: 50 });
  const { data: settingsData } = useSettings();

  const createMutation = useCreateTransaction();
  const returnMutation = useReturnBook();

  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const maxLoanDays = settingsData?.maxLoanDays ?? 14;
  const finePerDay = settingsData?.finePerDay ?? 1.0;

  const resetPage = useCallback(() => setPage(1), []);
  const handleStatusFilterChange = useCallback((val: string) => { setStatusFilter(val === '__all__' ? '' : val); resetPage(); }, [resetPage]);
  const handleMemberSearchChange = useCallback((val: string) => { setMemberSearch(val); resetPage(); }, [resetPage]);

  // Default due date - computed, not via effect
  const defaultDueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + maxLoanDays);
    return d.toISOString().split('T')[0];
  }, [maxLoanDays]);

  // Filter books for issue dialog - only show available
  const availableBooks = useMemo(
    () => (allBooks?.books ?? []).filter((b: Book) => b.availableCopies > 0),
    [allBooks]
  );

  const handleIssue = useCallback(async () => {
    if (!selectedBookId) { toast.error('Please select a book'); return; }
    if (!selectedMemberId) { toast.error('Please select a member'); return; }

    try {
      await createMutation.mutateAsync({
        bookId: selectedBookId,
        memberId: selectedMemberId,
        dueDate: dueDate || undefined,
        remarks: remarks || undefined,
      });
      toast.success('Book issued successfully');
      setIssueOpen(false);
      setSelectedBookId('');
      setSelectedMemberId('');
      setIssueBookSearch('');
      setIssueMemberSearch('');
      setRemarks('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to issue book');
    }
  }, [selectedBookId, selectedMemberId, dueDate, remarks, createMutation]);

  const openReturn = useCallback((tx: Transaction) => {
    setReturningTx(tx);
    // Calculate fine
    const now = new Date();
    const due = new Date(tx.dueDate);
    if (now > due) {
      const daysOverdue = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      setReturnFine(daysOverdue * finePerDay);
    } else {
      setReturnFine(0);
    }
    setReturnRemarks('');
    setReturnOpen(true);
  }, [finePerDay]);

  const handleReturn = useCallback(async () => {
    if (!returningTx) return;
    try {
      await returnMutation.mutateAsync({
        id: returningTx.id,
        fineAmount: returnFine,
        remarks: returnRemarks || undefined,
      });
      toast.success(returnFine > 0 ? `Book returned. Fine collected: $${returnFine.toFixed(2)}` : 'Book returned successfully');
      setReturnOpen(false);
      setReturningTx(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to return book');
    }
  }, [returningTx, returnFine, returnRemarks, returnMutation]);

  return (
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#161922] tracking-tight">Transactions</h2>
          <p className="text-sm text-muted-foreground">
            {total} transaction{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={() => setIssueOpen(true)} className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" />
          Issue Book
        </Button>
      </div>

      {/* Filters */}
      <Card className="border shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by member name or ID..."
                value={memberSearch}
                onChange={(e) => handleMemberSearchChange(e.target.value)}
                className="pl-9 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Status</SelectItem>
                <SelectItem value="Issued">Issued</SelectItem>
                <SelectItem value="Returned">Returned</SelectItem>
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
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <ArrowLeftRight className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-2">No transactions found</p>
              <Button variant="link" size="sm" className="text-[#C62729] cursor-pointer mt-1" onClick={() => setIssueOpen(true)}>
                Issue your first book
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y">
                {transactions.map((tx) => {
                  const isOverdue = tx.status === 'Issued' && new Date(tx.dueDate) < new Date();
                  return (
                    <div key={tx.id} className={`p-4 space-y-2 ${isOverdue ? 'bg-[#C62729]/5' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{tx.book?.title}</p>
                          <p className="text-xs text-muted-foreground">{tx.member?.name}</p>
                        </div>
                        <Badge
                          className={
                            tx.status === 'Issued'
                              ? isOverdue
                                ? 'bg-[#C62729]/10 text-[#C62729] border-[#C62729]/20 border-0'
                                : 'bg-green-100 text-green-700 border-0'
                              : 'bg-gray-100 text-gray-600 border-0'
                          }
                        >
                          {tx.status === 'Issued' ? (isOverdue ? 'Overdue' : 'Issued') : tx.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                        <p>Due: {new Date(tx.dueDate).toLocaleDateString()}</p>
                        <p>
                          {tx.returnDate
                            ? `Returned: ${new Date(tx.returnDate).toLocaleDateString()}`
                            : '—'}
                        </p>
                      </div>
                      {tx.status === 'Issued' && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`text-xs cursor-pointer ${
                              isOverdue
                                ? 'border-[#C62729] text-[#C62729] hover:bg-[#C62729]/10'
                                : 'border-[#CB8B00] text-[#CB8B00] hover:bg-[#CB8B00]/10'
                            }`}
                            onClick={() => openReturn(tx)}
                          >
                            <Undo2 className="h-3.5 w-3.5 mr-1" />
                            Return
                          </Button>
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
                      <TableHead className="text-xs">Book</TableHead>
                      <TableHead className="text-xs">Member</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Issue Date</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Due Date</TableHead>
                      <TableHead className="text-xs hidden xl:table-cell">Return Date</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs hidden xl:table-cell text-right">Fine</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => {
                      const isOverdue = tx.status === 'Issued' && new Date(tx.dueDate) < new Date();
                      return (
                        <TableRow key={tx.id} className={`hover:bg-[#C62729]/5 ${isOverdue ? 'bg-[#C62729]/5' : ''}`}>
                          <TableCell className="text-xs font-medium max-w-[180px] truncate">{tx.book?.title}</TableCell>
                          <TableCell className="text-xs">{tx.member?.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                            {new Date(tx.issueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className={`text-xs hidden lg:table-cell ${isOverdue ? 'text-[#C62729] font-medium' : 'text-muted-foreground'}`}>
                            {new Date(tx.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden xl:table-cell">
                            {tx.returnDate ? new Date(tx.returnDate).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                tx.status === 'Issued'
                                  ? isOverdue
                                    ? 'bg-[#C62729]/10 text-[#C62729] border-0'
                                    : 'bg-green-100 text-green-700 border-0'
                                  : 'bg-gray-100 text-gray-600 border-0'
                              }
                            >
                              {tx.status === 'Issued' ? (isOverdue ? '⏰ Overdue' : 'Issued') : tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs hidden xl:table-cell text-right">
                            {tx.fineAmount > 0 ? (
                              <span className="text-[#C62729] font-medium">${tx.fineAmount.toFixed(2)}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {tx.status === 'Issued' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className={`text-xs cursor-pointer ${
                                  isOverdue
                                    ? 'border-[#C62729] text-[#C62729] hover:bg-[#C62729]/10'
                                    : 'border-[#CB8B00] text-[#CB8B00] hover:bg-[#CB8B00]/10'
                                }`}
                                onClick={() => openReturn(tx)}
                              >
                                <Undo2 className="h-3.5 w-3.5 mr-1" />
                                Return
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

      {/* Issue Book Dialog */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Book</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Select Member */}
            <div className="grid gap-2">
              <Label>Member *</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Search members..."
                  value={issueMemberSearch}
                  onChange={(e) => setIssueMemberSearch(e.target.value)}
                  className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
                <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {(allMembers?.members ?? []).map((m: Member) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({m.memberId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Select Book */}
            <div className="grid gap-2">
              <Label>Book *</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Search books..."
                  value={issueBookSearch}
                  onChange={(e) => setIssueBookSearch(e.target.value)}
                  className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
                <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select book" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBooks.map((b: Book) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.title} (Avail: {b.availableCopies})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="grid gap-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate || defaultDueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
            </div>

            {/* Remarks */}
            <div className="grid gap-2">
              <Label htmlFor="issue-remarks">Remarks</Label>
              <Textarea
                id="issue-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional remarks"
                rows={2}
                className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button
              onClick={handleIssue}
              disabled={createMutation.isPending}
              className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Issue Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Book Dialog */}
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Return Book</DialogTitle>
          </DialogHeader>
          {returningTx && (
            <div className="space-y-4 py-2">
              <div className="bg-[#F4F4F4] rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium">{returningTx.book?.title}</p>
                <p className="text-xs text-muted-foreground">
                  Borrowed by {returningTx.member?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Due: {new Date(returningTx.dueDate).toLocaleDateString()}
                </p>
              </div>

              {returnFine > 0 && (
                <div className="bg-[#C62729]/5 border border-[#C62729]/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#C62729] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[#C62729]">Overdue Fine</p>
                    <p className="text-xs text-[#C62729]/80">
                      This book is overdue. Calculated fine: <strong>${returnFine.toFixed(2)}</strong>
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="return-fine">Fine Amount ($)</Label>
                <Input
                  id="return-fine"
                  type="number"
                  step="0.01"
                  min="0"
                  value={returnFine}
                  onChange={(e) => setReturnFine(parseFloat(e.target.value) || 0)}
                  className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="return-remarks">Remarks</Label>
                <Textarea
                  id="return-remarks"
                  value={returnRemarks}
                  onChange={(e) => setReturnRemarks(e.target.value)}
                  placeholder="Optional return remarks"
                  rows={2}
                  className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button
              onClick={handleReturn}
              disabled={returnMutation.isPending}
              className="bg-[#CB8B00] hover:bg-[#B07D00] text-white cursor-pointer"
            >
              {returnMutation.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              <Undo2 className="h-4 w-4 mr-1.5" />
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
