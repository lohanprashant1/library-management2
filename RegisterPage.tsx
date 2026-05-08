'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';

interface FormErrors {
  [key: string]: string;
}

export default function RegisterPage() {
  const { setCurrentPage } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<{ memberId: string } | null>(null);
  const [serverError, setServerError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'Other',
    occupation: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (serverError) setServerError('');
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    if (!form.occupation.trim()) errs.occupation = 'Occupation is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess({ memberId: data.memberId });
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(null);
    setForm({ name: '', email: '', phone: '', address: '', dateOfBirth: '', gender: 'Other', occupation: '' });
    setErrors({});
    setServerError('');
  };

  // Success State
  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-slate-100 bg-white shadow-lg">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C62729]/10">
                <CheckCircle2 className="h-8 w-8 text-[#C62729]" />
              </div>
              <h2 className="text-xl font-bold text-[#161922]">Registration Successful!</h2>
              <p className="mt-2 text-sm text-[#161922]/50">
                Your membership has been created. Please save your Member ID for future reference.
              </p>
              <div className="mt-6 rounded-xl bg-[#C62729]/5 border border-[#C62729]/10 px-8 py-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[#C62729]">Member ID</p>
                <p className="mt-1 text-2xl font-bold text-[#161922]">{success.memberId}</p>
              </div>
              <p className="mt-4 text-xs text-[#161922]/40">
                You can now borrow books from the library. Visit us with your Member ID to get started.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => setCurrentPage('catalog')}
                  className="bg-[#C62729] text-white hover:bg-[#B32023]"
                >
                  Browse Catalog
                </Button>
                <Button variant="outline" onClick={handleReset} className="border-slate-200 text-[#161922]/70 hover:bg-slate-50">
                  Register Another Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#161922] sm:text-3xl">Become a Member</h1>
          <p className="mt-1 text-sm text-[#161922]/50">
            Register for a free library membership and start borrowing books today
          </p>
        </div>

        <Card className="border-slate-100 bg-white shadow-sm border-t-4 border-t-[#C62729]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-[#161922]">
              <UserPlus className="h-5 w-5 text-[#C62729]" />
              Registration Form
            </CardTitle>
            <CardDescription className="text-[#161922]/50">
              All fields marked with * are required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {serverError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {serverError}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[#161922]">
                  Full Name <span className="text-[#C62729]">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={`border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729] ${errors.name ? 'border-red-300 focus-visible:ring-red-500/20 focus-visible:border-red-500' : ''}`}
                />
                {errors.name && <p className="text-xs text-[#C62729]">{errors.name}</p>}
              </div>

              {/* Email & Phone */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[#161922]">
                    Email <span className="text-[#C62729]">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729] ${errors.email ? 'border-red-300 focus-visible:ring-red-500/20 focus-visible:border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-xs text-[#C62729]">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-[#161922]">
                    Phone <span className="text-[#C62729]">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className={`border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729] ${errors.phone ? 'border-red-300 focus-visible:ring-red-500/20 focus-visible:border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-xs text-[#C62729]">{errors.phone}</p>}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-[#161922]">Address (optional)</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street, City"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="dob" className="text-[#161922]">
                    Date of Birth <span className="text-[#C62729]">*</span>
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729] ${errors.dateOfBirth ? 'border-red-300 focus-visible:ring-red-500/20 focus-visible:border-red-500' : ''}`}
                  />
                  {errors.dateOfBirth && <p className="text-xs text-[#C62729]">{errors.dateOfBirth}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-[#161922]">Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => updateField('gender', v)}>
                    <SelectTrigger className="border-slate-200 focus:ring-[#C62729]/20 focus:border-[#C62729]">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Occupation */}
              <div className="space-y-1.5">
                <Label htmlFor="occupation" className="text-[#161922]">
                  Occupation <span className="text-[#C62729]">*</span>
                </Label>
                <Input
                  id="occupation"
                  placeholder="Student, Teacher, Engineer, etc."
                  value={form.occupation}
                  onChange={(e) => updateField('occupation', e.target.value)}
                  className={`border-slate-200 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729] ${errors.occupation ? 'border-red-300 focus-visible:ring-red-500/20 focus-visible:border-red-500' : ''}`}
                />
                {errors.occupation && <p className="text-xs text-[#C62729]">{errors.occupation}</p>}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C62729] py-5 text-white hover:bg-[#B32023]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register for Membership
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
