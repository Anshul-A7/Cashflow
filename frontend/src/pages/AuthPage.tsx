import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [currency, setCurrency] = useState('INR');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegister) {
        if (!fullName.trim() || fullName.trim().length < 2) {
          setError('Please provide your full legal name (at least 2 characters).');
          setIsLoading(false);
          return;
        }
        if (!businessName.trim() || businessName.trim().length < 2) {
          setError('Please provide your registered business name (at least 2 characters).');
          setIsLoading(false);
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          setError('Please enter a valid business email address (e.g., founder@company.com).');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setIsLoading(false);
          return;
        }
        if (taxId.trim() && (taxId.trim().length < 6 || taxId.trim().length > 20)) {
          setError('GSTIN / Tax ID must be between 6 and 20 alphanumeric characters (or leave empty if not applicable).');
          setIsLoading(false);
          return;
        }
        await register({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          businessName: businessName.trim(),
          taxId: taxId.trim() || undefined,
          currency,
        });
      } else {
        if (!email.trim()) {
          setError('Please enter your business email address.');
          setIsLoading(false);
          return;
        }
        if (!password) {
          setError('Please enter your account password.');
          setIsLoading(false);
          return;
        }
        await login(email.trim(), password);
      }
    } catch (err: any) {
      const rawMsg = err.message || '';
      if (rawMsg.includes('502') || rawMsg.includes('503') || rawMsg.includes('Bad Gateway') || rawMsg.includes('Network Error')) {
        setError('The financial service is currently synchronizing. Please try again in a few moments.');
      } else if (rawMsg.includes('401') || rawMsg.toLowerCase().includes('unauthorized') || rawMsg.toLowerCase().includes('bad credentials')) {
        setError('Invalid business email or password. Please verify your credentials or register a workspace.');
      } else {
        setError(rawMsg || 'Authentication could not be completed. Please verify your details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 p-6 selection:bg-zinc-800 selection:text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 text-white font-bold text-lg shadow-md">
            CG
          </div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">CashFlow-Guardian</h1>
          <p className="text-xs text-zinc-500">
            {isRegister
              ? 'Initialize your enterprise business workspace'
              : 'Sign in to access your business financial dashboard'}
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-start space-x-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span className="font-semibold block text-rose-900 mb-0.5">Authentication Notice</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-zinc-700">Full Name *</label>
                  <span className="text-[10px] text-zinc-400">{fullName.length}/60</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Jeevan Kaware"
                  value={fullName}
                  maxLength={60}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-zinc-700">Business Name *</label>
                  <span className="text-[10px] text-zinc-400">{businessName.length}/100</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Kaware Technologies Pvt Ltd"
                  value={businessName}
                  maxLength={100}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Currency *</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-zinc-700">GSTIN / Tax ID</label>
                    <span className="text-[10px] text-zinc-400">{taxId.length}/20</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 27ABCDE1234F1Z5"
                    value={taxId}
                    maxLength={20}
                    onChange={(e) => setTaxId(e.target.value.toUpperCase().replace(/[^A-Z0-9_/-]/g, '').slice(0, 20))}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 font-mono tracking-wider focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Business Email *</label>
            <input
              type="email"
              placeholder="owner@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Password *</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-zinc-950 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Authenticating...' : isRegister ? 'Create Business Account' : 'Sign In'}</span>
            {!isLoading && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500">
          {isRegister ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className="font-semibold text-zinc-900 underline hover:text-zinc-700"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New business owner?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className="font-semibold text-zinc-900 underline hover:text-zinc-700"
              >
                Register Workspace
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

