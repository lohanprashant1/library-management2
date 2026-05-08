'use client';

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Save,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Building,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/useAppStore';
import {
  useSettings,
  useUpdateSettings,
  useChangePassword,
  type Settings,
} from '@/hooks/useApi';

function SettingsForm({ settings }: { settings: Settings }) {
  const adminUser = useAppStore((s) => s.adminUser);
  const updateMutation = useUpdateSettings();
  const changePasswordMutation = useChangePassword();

  // Initialize form from settings props (useState initializer runs once per mount)
  const [libName, setLibName] = useState(settings.libraryName || '');
  const [address, setAddress] = useState(settings.address || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [email, setEmail] = useState(settings.email || '');
  const [aboutText, setAboutText] = useState(settings.aboutText || '');
  const [maxBooksPerMember, setMaxBooksPerMember] = useState(String(settings.maxBooksPerMember ?? 5));
  const [maxLoanDays, setMaxLoanDays] = useState(String(settings.maxLoanDays ?? 14));
  const [finePerDay, setFinePerDay] = useState(String(settings.finePerDay ?? 1));
  const [openingHours, setOpeningHours] = useState(settings.openingHours || '');
  const [membershipFee, setMembershipFee] = useState(String(settings.membershipFee ?? 0));

  // Password form — ALWAYS starts blank
  const [username, setUsername] = useState(adminUser?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleSaveSettings = useCallback(async () => {
    if (!libName.trim()) { toast.error('Library name is required'); return; }
    try {
      await updateMutation.mutateAsync({
        libraryName: libName,
        address,
        phone,
        email,
        aboutText,
        maxBooksPerMember: parseInt(maxBooksPerMember) || 5,
        maxLoanDays: parseInt(maxLoanDays) || 14,
        finePerDay: parseFloat(finePerDay) || 1,
        openingHours,
        membershipFee: parseFloat(membershipFee) || 0,
      });
      toast.success('Library settings saved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings');
    }
  }, [libName, address, phone, email, aboutText, maxBooksPerMember, maxLoanDays, finePerDay, openingHours, membershipFee, updateMutation]);

  const handleChangePassword = useCallback(async () => {
    if (!username.trim()) { toast.error('Username is required'); return; }
    if (!currentPassword) { toast.error('Current password is required'); return; }
    if (!newPassword) { toast.error('New password is required'); return; }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return; }

    try {
      await changePasswordMutation.mutateAsync({
        username,
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPw(false);
      setShowNewPw(false);
      setShowConfirmPw(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    }
  }, [username, currentPassword, newPassword, confirmPassword, changePasswordMutation]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-[#161922] tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your library settings and account</p>
      </div>

      {/* Library Settings */}
      <Card className="border shadow-sm border-t-4 border-t-[#C62729] bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-[#C62729]" />
            <div>
              <CardTitle className="text-base">Library Settings</CardTitle>
              <CardDescription className="text-xs">General library information and policies</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="lib-name">Library Name *</Label>
            <Input id="lib-name" value={libName} onChange={(e) => setLibName(e.target.value)} placeholder="Library name" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lib-address">Address</Label>
            <Input id="lib-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Library address" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lib-phone">Phone</Label>
              <Input id="lib-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lib-email">Email</Label>
              <Input id="lib-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Library email" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lib-about">About Text</Label>
            <Textarea id="lib-about" value={aboutText} onChange={(e) => setAboutText(e.target.value)} placeholder="About your library..." rows={4} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
          </div>

          <Separator />

          <div>
            <p className="text-sm font-semibold text-[#161922] mb-3">Loan Policies</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="max-books">Max Books per Member</Label>
                <Input id="max-books" type="number" value={maxBooksPerMember} onChange={(e) => setMaxBooksPerMember(e.target.value)} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max-days">Max Loan Days</Label>
                <Input id="max-days" type="number" value={maxLoanDays} onChange={(e) => setMaxLoanDays(e.target.value)} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fine-per-day">Fine per Day ($)</Label>
                <Input id="fine-per-day" type="number" step="0.01" value={finePerDay} onChange={(e) => setFinePerDay(e.target.value)} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="membership-fee">Membership Fee ($)</Label>
                <Input id="membership-fee" type="number" step="0.01" value={membershipFee} onChange={(e) => setMembershipFee(e.target.value)} className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="opening-hours">Opening Hours</Label>
            <Input id="opening-hours" value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} placeholder="e.g. Mon-Sat: 9:00 AM - 8:00 PM" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveSettings}
              disabled={updateMutation.isPending}
              className="bg-[#C62729] hover:bg-[#B32023] text-white cursor-pointer"
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              <Save className="h-4 w-4 mr-1.5" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="border shadow-sm border-t-4 border-t-[#CB8B00] bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#CB8B00]" />
            <div>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription className="text-xs">Update your admin account password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="pw-username">Username</Label>
            <Input id="pw-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Admin username" className="focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pw-current">Current Password *</Label>
            <div className="relative">
              <Input
                id="pw-current"
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="pr-10 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
              >
                {showCurrentPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pw-new">New Password *</Label>
              <div className="relative">
                <Input
                  id="pw-new"
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="pr-10 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setShowNewPw(!showNewPw)}
                >
                  {showNewPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pw-confirm">Confirm New Password *</Label>
              <div className="relative">
                <Input
                  id="pw-confirm"
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pr-10 focus-visible:ring-[#C62729]/20 focus-visible:border-[#C62729]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                >
                  {showConfirmPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>

          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-[#C62729]">Passwords do not match</p>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
              className="bg-[#CB8B00] hover:bg-[#B07D00] text-white cursor-pointer"
            >
              {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              <Lock className="h-4 w-4 mr-1.5" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();

  if (isLoading || !settings) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  // Use key to remount form when settings update after save
  return <SettingsForm key={settings.updatedAt} settings={settings} />;
}
