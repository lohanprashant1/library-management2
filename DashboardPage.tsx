'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  ArrowLeftRight,
  AlertTriangle,
  FolderTree,
  PenTool,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { useBooks, useMembers, useCategories, useAuthors, useTransactions } from '@/hooks/useApi';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

function StatCard({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number | undefined;
  delay: number;
}) {
  return (
    <motion.div
      custom={delay}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <Card className="border-t-4 border-t-[#C62729] shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C62729]">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#C62729]">{value ?? '—'}</p>
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);

  const { data: booksData, isLoading: booksLoading } = useBooks({ limit: 1 });
  const { data: membersData, isLoading: membersLoading } = useMembers({ limit: 1 });
  const { data: categoriesData, isLoading: catsLoading } = useCategories();
  const { data: authorsData, isLoading: authsLoading } = useAuthors();
  const { data: transactionsData, isLoading: txLoading } = useTransactions({ limit: 50 });

  const totalBooks = booksData?.total ?? 0;
  const totalMembers = membersData?.total ?? 0;
  const totalCategories = categoriesData?.length ?? 0;
  const totalAuthors = authorsData?.length ?? 0;
  const allTx = transactionsData?.transactions ?? [];
  const activeIssues = allTx.filter((t) => t.status === 'Issued').length;
  const overdueReturns = allTx.filter(
    (t) => t.status === 'Issued' && new Date(t.dueDate) < new Date()
  ).length;

  const recentTransactions = allTx.slice(0, 10);

  const isLoading = booksLoading || membersLoading || catsLoading || authsLoading || txLoading;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-[#161922] tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Overview of your library management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-t-4 border-t-[#C62729]">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard icon={BookOpen} label="Total Books" value={totalBooks} delay={0} />
            <StatCard icon={Users} label="Total Members" value={totalMembers} delay={1} />
            <StatCard icon={TrendingUp} label="Active Issues" value={activeIssues} delay={2} />
            <StatCard icon={AlertTriangle} label="Overdue Returns" value={overdueReturns} delay={3} />
            <StatCard icon={FolderTree} label="Categories" value={totalCategories} delay={4} />
            <StatCard icon={PenTool} label="Authors" value={totalAuthors} delay={5} />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <motion.div
        custom={6}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <Card className="border shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <h3 className="text-sm font-semibold text-[#161922] mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer"
                onClick={() => setCurrentPage('admin-books')}
              >
                <BookOpen className="h-4 w-4 mr-1.5" />
                Add Book
              </Button>
              <Button
                size="sm"
                className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer"
                onClick={() => setCurrentPage('admin-members')}
              >
                <Users className="h-4 w-4 mr-1.5" />
                Add Member
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#C62729] text-[#C62729] hover:bg-[#C62729]/10 cursor-pointer"
                onClick={() => setCurrentPage('admin-transactions')}
              >
                <ArrowLeftRight className="h-4 w-4 mr-1.5" />
                Issue Book
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#CB8B00] text-[#CB8B00] hover:bg-[#CB8B00]/10 cursor-pointer"
                onClick={() => setCurrentPage('admin-categories')}
              >
                <FolderTree className="h-4 w-4 mr-1.5" />
                Categories
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        custom={7}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <Card className="border shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#161922]">Recent Transactions</h3>
                <p className="text-xs text-muted-foreground">Last 10 transactions</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#C62729] hover:text-[#B32023] hover:bg-[#C62729]/10 cursor-pointer"
                onClick={() => setCurrentPage('admin-transactions')}
              >
                View All
              </Button>
            </div>

            {txLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-10 w-10 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-[#C62729]/5">
                      <TableHead className="text-xs">Book</TableHead>
                      <TableHead className="text-xs">Member</TableHead>
                      <TableHead className="text-xs">Issue Date</TableHead>
                      <TableHead className="text-xs">Due Date</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((tx) => {
                      const isOverdue = tx.status === 'Issued' && new Date(tx.dueDate) < new Date();
                      return (
                        <TableRow key={tx.id} className={`hover:bg-[#C62729]/5 ${isOverdue ? 'bg-red-50' : ''}`}>
                          <TableCell className="text-xs font-medium">{tx.book?.title || '—'}</TableCell>
                          <TableCell className="text-xs">{tx.member?.name || '—'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(tx.issueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className={`text-xs ${isOverdue ? 'text-[#C62729] font-medium' : 'text-muted-foreground'}`}>
                            {new Date(tx.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                tx.status === 'Issued'
                                  ? isOverdue
                                    ? 'bg-[#C62729]/10 text-[#C62729] border-[#C62729]/20'
                                    : 'bg-green-100 text-green-700 border-0'
                                  : 'bg-gray-100 text-gray-600 border-0'
                              }
                            >
                              {tx.status === 'Issued' ? (isOverdue ? 'Overdue' : 'Issued') : tx.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
