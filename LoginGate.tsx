'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import Image from 'next/image';

export default function LoginGate({ children }: { children: React.ReactNode }) {
  const { isAdmin, setIsAdmin, setAdminUser, setAdminToken, setCurrentPage, adminUser } = useAppStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('adminSession');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session.token && session.user) {
          setAdminUser(session.user);
          setAdminToken(session.token);
          setIsAdmin(true);
          setCurrentPage('admin-dashboard');
        }
      } catch {
        localStorage.removeItem('adminSession');
      }
    }
  }, [setAdminUser, setAdminToken, setIsAdmin, setCurrentPage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setAdminUser(data.admin);
      setAdminToken(data.token);
      setIsAdmin(true);
      setCurrentPage('admin-dashboard');

      // Persist session
      localStorage.setItem('adminSession', JSON.stringify({ token: data.token, user: data.admin }));

      toast.success(`Welcome, ${data.admin.name}!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Show admin panel if logged in
  if (isAdmin) {
    return <>{children}</>;
  }

  // Login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#161922] p-4 relative overflow-hidden">
      {/* Subtle red gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#C62729]/10 via-transparent to-[#C62729]/5 pointer-events-none" />

      <Card className="w-full max-w-md border-0 shadow-2xl bg-white relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/osgu-logo.png"
                alt="OSGU Logo"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <CardTitle className="text-xl text-[#161922]">Library Admin</CardTitle>
          <CardDescription className="text-muted-foreground">Sign in to access the management panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="login-username">Username</Label>
              <Input
                id="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="pr-10 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-[#C62729] cursor-pointer"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
