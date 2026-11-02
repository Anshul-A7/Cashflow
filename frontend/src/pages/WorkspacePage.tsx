import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { 
  Building2, 
  User as UserIcon, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Lock, 
  LogOut,
  Mail,
  Phone,
  MapPin,
  Save,
  Check
} from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const { user, activeBusiness, setActiveBusiness, refreshUser, logout } = useAuth();

  // User Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userProfileLoading, setUserProfileLoading] = useState(false);
  const [userProfileSuccess, setUserProfileSuccess] = useState(false);
  const [userProfileError, setUserProfileError] = useState<string | null>(null);

  // Active Workspace Form State
  const [name, setName] = useState(activeBusiness?.name || '');
  const [taxId, setTaxId] = useState(activeBusiness?.taxId || '');
  const [currency, setCurrency] = useState(activeBusiness?.currency || 'INR');
  const [phone, setPhone] = useState(activeBusiness?.phone || '');
  const [address, setAddress] = useState(activeBusiness?.address || '');
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessSuccess, setBusinessSuccess] = useState(false);
  const [businessError, setBusinessError] = useState<string | null>(null);

  // New Workspace Creation State
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTaxId, setNewTaxId] = useState('');
  const [newCurrency, setNewCurrency] = useState('INR');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
    }
  }, [user]);

  useEffect(() => {
    if (activeBusiness) {
      setName(activeBusiness.name || '');
      setTaxId(activeBusiness.taxId || '');
      setCurrency(activeBusiness.currency || 'INR');
      setPhone(activeBusiness.phone || '');
      setAddress(activeBusiness.address || '');
    }
  }, [activeBusiness]);

  // Handle Save User Profile
  const handleSaveUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfileError(null);
    setUserProfileSuccess(false);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setUserProfileError('Full name must be at least 2 characters long.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setUserProfileError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setUserProfileError('Password confirmation does not match.');
        return;
      }
    }

    setUserProfileLoading(true);
    try {
      await authApi.updateProfile({
        fullName: fullName.trim(),
        newPassword: newPassword ? newPassword : undefined,
      });

      await refreshUser();
      setUserProfileSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setUserProfileSuccess(false), 3500);
    } catch (err: any) {
      setUserProfileError(err.message || 'Failed to update user profile.');
    } finally {
      setUserProfileLoading(false);
    }
  };

  // Handle Save Business Workspace
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness) return;

    setBusinessError(null);
    setBusinessSuccess(false);

    if (!name.trim() || name.trim().length < 2) {
      setBusinessError('Business legal name must be at least 2 characters.');
      return;
    }

    if (taxId.trim() && (taxId.trim().length < 6 || taxId.trim().length > 20)) {
      setBusinessError('Tax ID / GSTIN must be between 6 and 20 alphanumeric characters.');
      return;
    }

    setBusinessLoading(true);
    try {
      await authApi.updateBusiness(activeBusiness.id, {
        name: name.trim(),
        taxId: taxId.trim() || undefined,
        currency,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });

      await refreshUser();
      setBusinessSuccess(true);
      setTimeout(() => setBusinessSuccess(false), 3500);
    } catch (err: any) {
      setBusinessError(err.message || 'Failed to update business workspace.');
    } finally {
      setBusinessLoading(false);
    }
  };

  // Handle Create New Workspace
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newName.trim() || newName.trim().length < 2) {
      setCreateError('New business name must be at least 2 characters.');
      return;
    }

    setCreateLoading(true);
    try {
      const created = await authApi.createBusiness({
        name: newName.trim(),
        taxId: newTaxId.trim() || undefined,
        currency: newCurrency,
      });

      await refreshUser();
      setIsCreatingNew(false);
      setNewName('');
      setNewTaxId('');
      setActiveBusiness(created);
      setBusinessSuccess(true);
      setTimeout(() => setBusinessSuccess(false), 3500);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create new workspace.');
    } finally {
      setCreateLoading(false);
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'CG';

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">Account & Workspace Profile</h1>
          <p className="text-xs text-zinc-500">
            Manage your personal profile, credentials, and legal business workspace settings.
          </p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center space-x-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors shadow-sm"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Grid: User Profile on Left, Business Profile on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: User Profile & Security */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-zinc-700" />
              <h2 className="text-sm font-semibold text-zinc-900">User Profile & Credentials</h2>
            </div>
            <span className="inline-flex items-center space-x-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>Owner Access</span>
            </span>
          </div>

          {userProfileSuccess && (
            <div className="flex items-center space-x-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 animate-in fade-in duration-150">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>User profile updated successfully!</span>
            </div>
          )}

          {userProfileError && (
            <div className="flex items-center space-x-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800 animate-in fade-in duration-150">
              <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span>{userProfileError}</span>
            </div>
          )}

          <div className="flex items-center space-x-3 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-950 text-white font-bold text-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 truncate">{user?.fullName}</p>
              <p className="text-[11px] text-zinc-500 font-mono truncate">{user?.email}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Role: {user?.role || 'ROLE_BUSINESS_OWNER'}</p>
            </div>
          </div>

          <form onSubmit={handleSaveUserProfile} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                value={fullName}
                maxLength={60}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                placeholder="e.g. Jeevan Kaware"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Business Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded-md border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs text-zinc-500 cursor-not-allowed font-mono"
                />
                <span className="absolute right-2.5 top-2 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Verified
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 space-y-3">
              <div className="flex items-center space-x-1 text-xs font-medium text-zinc-700">
                <Lock className="h-3 w-3 text-zinc-500" />
                <span>Security & Password (leave blank to keep unchanged)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="password"
                    placeholder="New Password (min 6 chars)"
                    value={newPassword}
                    maxLength={64}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    maxLength={64}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={userProfileLoading}
                className="inline-flex items-center space-x-1.5 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{userProfileLoading ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Active Business Workspace Profile */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-zinc-700" />
              <h2 className="text-sm font-semibold text-zinc-900">Active Business Workspace</h2>
            </div>
            <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Current Active</span>
            </span>
          </div>

          {businessSuccess && (
            <div className="flex items-center space-x-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 animate-in fade-in duration-150">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Business workspace settings saved successfully!</span>
            </div>
          )}

          {businessError && (
            <div className="flex items-center space-x-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800 animate-in fade-in duration-150">
              <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span>{businessError}</span>
            </div>
          )}

          <form onSubmit={handleSaveBusiness} className="space-y-3.5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-zinc-700">Company Legal Name *</label>
                <span className="text-[10px] text-zinc-400">{name.length}/100</span>
              </div>
              <input
                type="text"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                placeholder="e.g. Kaware Tech Pvt Ltd"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-zinc-700">GSTIN / Tax ID</label>
                  <span className="text-[10px] text-zinc-400">{taxId.length}/20</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 28BJHB7769IJNN9"
                  value={taxId}
                  maxLength={20}
                  onChange={(e) => setTaxId(e.target.value.toUpperCase().replace(/[^A-Z0-9_/-]/g, '').slice(0, 20))}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 font-mono tracking-wider focus:border-zinc-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Base Currency *</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Business Support Phone</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    maxLength={20}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Registered Address</label>
                <input
                  type="text"
                  placeholder="Street, City, State, ZIP"
                  value={address}
                  maxLength={200}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={businessLoading}
                className="inline-flex items-center space-x-1.5 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{businessLoading ? 'Saving...' : 'Save Workspace Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Section 2: Multi-Workspace Switcher */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Your Business Entities</h2>
            <p className="text-xs text-zinc-500">Switch between different businesses or create a new branch workspace.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreatingNew(!isCreatingNew)}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isCreatingNew ? 'Close Form' : 'Add Business'}</span>
          </button>
        </div>

        {createError && (
          <div className="flex items-center space-x-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
            <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            <span>{createError}</span>
          </div>
        )}

        {isCreatingNew && (
          <form onSubmit={handleCreateWorkspace} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900">Initialize New Business Workspace</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Kaware Logistics"
                  value={newName}
                  maxLength={100}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">GSTIN / Tax ID</label>
                <input
                  type="text"
                  placeholder="e.g. 28BJHB7769IJNN9"
                  value={newTaxId}
                  maxLength={20}
                  onChange={(e) => setNewTaxId(e.target.value.toUpperCase().replace(/[^A-Z0-9_/-]/g, ''))}
                  className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 font-mono focus:border-zinc-950 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">Currency</label>
                <select
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="rounded-md bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 shadow-sm"
              >
                {createLoading ? 'Creating...' : 'Create & Switch Workspace'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {user?.businesses?.map((b) => {
            const isCurrent = activeBusiness?.id === b.id;
            return (
              <div
                key={b.id}
                className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      isCurrent ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {b.currency || 'INR'}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center space-x-1 text-[10px] font-medium text-emerald-400">
                        <Check className="h-3 w-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-xs leading-snug truncate">{b.name}</p>
                  <p className={`text-[11px] truncate mt-1 ${isCurrent ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {b.taxId ? `GSTIN: ${b.taxId}` : 'Tax ID Unspecified'}
                  </p>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => setActiveBusiness(b)}
                    className="mt-3 w-full rounded-md border border-zinc-200 bg-zinc-50 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100 hover:border-zinc-300 transition-colors"
                  >
                    Switch Workspace
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
