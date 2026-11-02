import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationApi, dashboardApi } from '../services/api';
import { NotificationDto, DashboardSummaryResponse } from '../types';
import { 
  Building2, 
  Bell, 
  LogOut, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Plus,
  FileText,
  ArrowDownLeft,
  Receipt,
  User,
  Shield,
  Clock,
  Check,
  Landmark
} from 'lucide-react';

interface HeaderProps {
  cashBalance?: number;
  totalReceivables?: number;
  healthScore?: number;
  refreshKey?: number;
  onOpenNewInvoice: () => void;
  onOpenNewExpense: () => void;
  onOpenNewPayment: () => void;
  onNavigateToWorkspace?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cashBalance: propCashBalance,
  totalReceivables: propReceivables,
  healthScore: propHealthScore,
  refreshKey,
  onOpenNewInvoice,
  onOpenNewExpense,
  onOpenNewPayment,
  onNavigateToWorkspace,
}) => {
  const { user, activeBusiness, setActiveBusiness, logout } = useAuth();
  
  // Telemetry state (auto-synced with live dashboard API)
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  
  // Dropdown states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isBusinessMenuOpen, setIsBusinessMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileActionOpen, setIsMobileActionOpen] = useState(false);

  // Refs for click-outside detection
  const notifRef = useRef<HTMLDivElement>(null);
  const businessRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const mobileActionRef = useRef<HTMLDivElement>(null);

  const currencySymbol = activeBusiness?.currency === 'USD' ? '$' : '₹';

  // Load live telemetry data
  const loadTelemetry = async () => {
    if (!activeBusiness) return;
    try {
      const data = await dashboardApi.getSummary(activeBusiness.id);
      setSummary(data);
    } catch {
      // Offline fallback
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    if (!activeBusiness) return;
    try {
      const count = await notificationApi.getUnreadCount(activeBusiness.id);
      setUnreadCount(count);
      const list = await notificationApi.getNotifications(activeBusiness.id);
      setNotifications(list.slice(0, 8));
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    loadTelemetry();
    loadNotifications();
    const interval = setInterval(() => {
      loadTelemetry();
      loadNotifications();
    }, 20000);
    return () => clearInterval(interval);
  }, [activeBusiness, refreshKey]);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (businessRef.current && !businessRef.current.contains(e.target as Node)) {
        setIsBusinessMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (mobileActionRef.current && !mobileActionRef.current.contains(e.target as Node)) {
        setIsMobileActionOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotifOpen(false);
        setIsBusinessMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsMobileActionOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleMarkAsRead = async (id: number) => {
    if (!activeBusiness) return;
    try {
      await notificationApi.markAsRead(activeBusiness.id, id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!activeBusiness || notifications.length === 0) return;
    try {
      for (const n of notifications.filter(item => !item.isRead)) {
        await notificationApi.markAsRead(activeBusiness.id, n.id);
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  // Resolve active metrics
  const activeCash = propCashBalance ?? summary?.cashBalance ?? 0;
  const activeReceivables = propReceivables ?? summary?.totalReceivables ?? 0;
  const activeOverdue = summary?.overdueInvoices ?? 0;
  const activeRunwayDays = summary?.estimatedRunwayDays ?? 90;
  const activeHealthScore = propHealthScore ?? (summary ? (summary.overdueInvoices > 0 ? 74 : 92) : 85);

  // User initials
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      
      {/* 1. LEFT ZONE: Brand Mark & Workspace Selector */}
      <div className="flex items-center space-x-3 md:space-x-4 shrink-0">
        {/* Brand Lockup */}
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white font-bold text-xs tracking-wider shadow-sm">
            CG
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <span className="font-semibold text-zinc-950 tracking-tight text-sm">CashFlow-Guardian</span>
            <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live</span>
            </span>
          </div>
        </div>

        <div className="hidden md:block h-4 w-px bg-zinc-200" />

        {/* Business Workspace Selector */}
        {user?.businesses && user.businesses.length > 0 && (
          <div className="relative" ref={businessRef}>
            <button
              onClick={() => setIsBusinessMenuOpen(!isBusinessMenuOpen)}
              className="flex items-center space-x-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm"
              title="Switch business workspace"
            >
              <Building2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <span className="max-w-[130px] truncate font-semibold text-zinc-900 text-xs">
                {activeBusiness?.name || 'Workspace'}
              </span>
              <span className="rounded bg-zinc-100 px-1 py-0.2 text-[10px] font-mono text-zinc-500">
                {activeBusiness?.currency || 'INR'}
              </span>
              <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform ${isBusinessMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Workspace Menu Dropdown */}
            {isBusinessMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl border border-zinc-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 mb-1">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                    Active Businesses
                  </span>
                  <span className="text-[10px] text-zinc-500">{user.businesses.length} Workspaces</span>
                </div>
                
                <div className="space-y-1">
                  {user.businesses.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setActiveBusiness(b);
                        setIsBusinessMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors ${
                        activeBusiness?.id === b.id
                          ? 'bg-zinc-950 text-white font-medium'
                          : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${
                          activeBusiness?.id === b.id ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          <Building2 className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-xs leading-none">{b.name}</p>
                          <p className={`text-[10px] truncate mt-1 ${activeBusiness?.id === b.id ? 'text-zinc-400' : 'text-zinc-400'}`}>
                            {b.taxId ? `GSTIN: ${b.taxId}` : `${b.currency || 'INR'} Ledger`}
                          </p>
                        </div>
                      </div>
                      {activeBusiness?.id === b.id && (
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. CENTER ZONE: Clean, High-Contrast Financial Telemetry Strip */}
      <div className="hidden xl:flex items-center space-x-5 px-4 py-1">
        {/* Metric 1: Available Cash */}
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Landmark className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-medium leading-none mb-1">Available Cash</span>
            <span className="font-mono text-xs font-bold text-zinc-950 tabular-nums leading-none">
              {currencySymbol} {activeCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-zinc-200" />

        {/* Metric 2: Receivables Pipeline */}
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
            <Receipt className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 mb-1 leading-none">
              <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Receivables (AR)</span>
              {activeOverdue > 0 && (
                <span className="rounded bg-rose-50 px-1 py-0.2 text-[9px] font-mono text-rose-700 font-semibold border border-rose-200">
                  {currencySymbol}{activeOverdue.toLocaleString('en-IN')} Due
                </span>
              )}
            </div>
            <span className="font-mono text-xs font-bold text-zinc-950 tabular-nums leading-none">
              {currencySymbol} {activeReceivables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-zinc-200" />

        {/* Metric 3: Liquidity Runway & Health Index */}
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
            <Sparkles className="h-3.5 w-3.5 text-zinc-600" />
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-medium leading-none mb-1">Runway & Health</span>
            <div className="flex items-center space-x-1.5 leading-none">
              <span className="font-mono text-xs font-bold text-zinc-900 tabular-nums">
                {activeRunwayDays}d Runway
              </span>
              <span className={`inline-flex items-center space-x-0.5 rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold ${
                activeHealthScore >= 80 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : activeHealthScore >= 60 
                  ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                <span>{activeHealthScore}/100</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIGHT ZONE: Harmonious Actions, Notifications & Profile */}
      <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
        
        {/* Desktop Quick Action Buttons (Harmonious Rhythm) */}
        <div className="hidden lg:flex items-center space-x-1.5">
          {/* Create Invoice Button (Primary solid black) */}
          <button
            onClick={onOpenNewInvoice}
            className="flex items-center space-x-1.5 rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>+ Invoice</span>
          </button>

          {/* Record Payment Button (Refined secondary with subtle emerald accent) */}
          <button
            onClick={onOpenNewPayment}
            className="flex items-center space-x-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-sm"
          >
            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
            <span>+ Payment</span>
          </button>

          {/* Add Expense Button (Refined tertiary) */}
          <button
            onClick={onOpenNewExpense}
            className="flex items-center space-x-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-sm"
          >
            <Receipt className="h-3.5 w-3.5 text-zinc-500" />
            <span>+ Expense</span>
          </button>
        </div>

        {/* Mobile / Tablet Single Action Menu */}
        <div className="lg:hidden relative" ref={mobileActionRef}>
          <button
            onClick={() => setIsMobileActionOpen(!isMobileActionOpen)}
            className="flex items-center space-x-1 rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Action</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {isMobileActionOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => {
                  setIsMobileActionOpen(false);
                  onOpenNewInvoice();
                }}
                className="flex w-full items-center space-x-2 px-3 py-2 text-xs font-medium text-zinc-800 rounded-lg hover:bg-zinc-50"
              >
                <FileText className="h-3.5 w-3.5 text-zinc-600" />
                <span>Create Invoice</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileActionOpen(false);
                  onOpenNewPayment();
                }}
                className="flex w-full items-center space-x-2 px-3 py-2 text-xs font-medium text-emerald-700 rounded-lg hover:bg-emerald-50"
              >
                <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                <span>Record Payment</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileActionOpen(false);
                  onOpenNewExpense();
                }}
                className="flex w-full items-center space-x-2 px-3 py-2 text-xs font-medium text-zinc-800 rounded-lg hover:bg-zinc-50"
              >
                <Receipt className="h-3.5 w-3.5 text-zinc-600" />
                <span>Record Expense</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors shadow-sm"
            title="View financial notifications"
          >
            <Bell className="h-3.5 w-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 rounded-xl border border-zinc-200 bg-white p-3 shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-zinc-950">Financial Alerts</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-rose-700">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-zinc-100 max-h-72 overflow-y-auto mt-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-zinc-300" />
                    <p className="mt-2 text-xs font-medium text-zinc-900">All alerts cleared</p>
                    <p className="text-[11px] text-zinc-400">No pending liquidity or overdue invoice warnings.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                        n.isRead ? 'opacity-60 bg-white hover:bg-zinc-50' : 'bg-zinc-50/70 hover:bg-zinc-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${n.isRead ? 'bg-zinc-300' : 'bg-emerald-500'}`} />
                          <span className="text-xs font-semibold text-zinc-900">{n.title}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-600 pl-4 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu (Clean, Integrated Pill) */}
        <div className="relative pl-0.5" ref={userRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 rounded-lg border border-zinc-200 bg-white px-2 py-1 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm cursor-pointer group"
            title="Account & Profile Settings"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-950 text-white font-mono text-xs font-bold">
              {initials}
            </div>
            <span className="hidden md:block text-xs font-semibold text-zinc-900 max-w-[100px] truncate">
              {user?.fullName || 'Account'}
            </span>
            <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform ${isUserMenuOpen ? 'rotate-180 text-zinc-800' : ''}`} />
          </button>

          {/* User Details Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Profile Card */}
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-white font-bold text-sm">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-zinc-950">{user?.fullName}</p>
                  <p className="truncate text-[11px] text-zinc-400 font-mono">{user?.email}</p>
                  <span className="mt-1 inline-flex items-center space-x-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-medium text-zinc-700">
                    <Shield className="h-3 w-3 text-emerald-600" />
                    <span>Business Owner</span>
                  </span>
                </div>
              </div>

              {/* Business Context */}
              <div className="py-2.5 text-xs text-zinc-600 space-y-1.5 border-b border-zinc-100">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Workspace:</span>
                  <span className="font-medium text-zinc-900 truncate max-w-[130px]">{activeBusiness?.name}</span>
                </div>
                {activeBusiness?.taxId && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">GSTIN:</span>
                    <span className="font-mono text-zinc-900">{activeBusiness.taxId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-400">Currency:</span>
                  <span className="font-mono font-medium text-zinc-900">{activeBusiness?.currency || 'INR'}</span>
                </div>
              </div>

              {/* Navigation & Logout Action */}
              <div className="pt-2 space-y-1">
                {onNavigateToWorkspace && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigateToWorkspace();
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Workspace & Profile Settings</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center justify-center space-x-2 rounded-lg py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
