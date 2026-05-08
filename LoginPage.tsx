'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Loader2, AlertCircle, ShieldCheck, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';

export default function LoginPage() {
  const { setIsAdmin, setAdminUser, setAdminToken, setCurrentPage } = useAppStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
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
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      setAdminUser(data.admin);
      setAdminToken(data.token);
      setCurrentPage('admin-dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#F4F4F4] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-200/50 bg-[#161922] text-white shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C62729] text-white">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl text-white">Admin Login</CardTitle>
            <CardDescription className="text-white/50">
              Sign in to access the library administration panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-white/70">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <Input
                    id="username"
                    placeholder="Enter admin username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError('');
                    }}
                    className="pl-9 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-[#C62729]/30 focus-visible:border-[#C62729]"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-white/70">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    className="pl-9 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-[#C62729]/30 focus-visible:border-[#C62729]"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C62729] py-5 text-white shadow-lg hover:bg-[#B32023]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setCurrentPage('home')}
                className="text-xs text-white/40 transition-colors hover:text-[#CB8B00]"
              >
                &larr; Back to homepage
              </button>
            </div>

            {/* University branding */}
            <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/10 pt-4">
              <img src="/osgu-logo.png" alt="OSGU" className="h-6 w-6 rounded object-contain" />
              <span className="text-[11px] text-white/30">Om Sterling Global University</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
