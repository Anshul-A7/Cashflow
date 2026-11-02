import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  ArrowDownLeft,
  Landmark,
  Users2,
  LineChart,
  Bot,
  FileSpreadsheet,
  Building2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'invoices'
  | 'expenses'
  | 'payments'
  | 'accounts'
  | 'customers'
  | 'forecast'
  | 'ai'
  | 'reports'
  | 'workspace';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user, activeBusiness } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'invoices', label: 'Invoices (AR)', icon: <Receipt className="h-4 w-4" /> },
    { id: 'expenses', label: 'Expenses (AP)', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'payments', label: 'Payments Inflow', icon: <ArrowDownLeft className="h-4 w-4" /> },
    { id: 'accounts', label: 'Cash & Banks', icon: <Landmark className="h-4 w-4" /> },
    { id: 'customers', label: 'Customer CPBI', icon: <Users2 className="h-4 w-4" />, badge: 'AI Risk' },
    { id: 'forecast', label: 'Cash Flow Horizon', icon: <LineChart className="h-4 w-4" />, badge: '6-Wk' },
    { id: 'ai', label: 'AI Advisor', icon: <Bot className="h-4 w-4" />, badge: 'Gemini' },
    { id: 'reports', label: 'Financial Reports', icon: <FileSpreadsheet className="h-4 w-4" /> },
  ];

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'CG';

  return (
    <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col justify-between py-6 px-4 select-none shrink-0">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold mb-2">
            Operations & Liquidity
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-zinc-950 text-white shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? 'text-white' : 'text-zinc-500'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-zinc-800 text-zinc-200'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Customer-Friendly Workspace & Account Quick Bar (NO CODE/DEV JARGON) */}
      <div className="border-t border-zinc-100 pt-3">
        <button
          onClick={() => onSelectTab('workspace')}
          className={`flex w-full items-center space-x-2.5 p-2 rounded-xl border text-left transition-all ${
            currentTab === 'workspace'
              ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm'
              : 'border-zinc-200 bg-zinc-50/70 hover:bg-white hover:border-zinc-300 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
          }`}
          title="Open Workspace & Account Settings"
        >
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
            currentTab === 'workspace' ? 'bg-zinc-800 text-white' : 'bg-zinc-950 text-white'
          }`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold leading-tight">
              {activeBusiness?.name || 'My Workspace'}
            </p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className={`text-[10px] truncate ${currentTab === 'workspace' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {user?.fullName || 'Business Owner'}
              </span>
            </div>
          </div>
          <ChevronRight className={`h-4 w-4 shrink-0 ${currentTab === 'workspace' ? 'text-zinc-400' : 'text-zinc-400'}`} />
        </button>

        <div className="mt-2.5 flex items-center justify-between px-1 text-[10px] text-zinc-400 font-medium">
          <span className="flex items-center space-x-1 text-zinc-500">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span>256-Bit Cloud Encryption</span>
          </span>
          <span className="text-emerald-700 font-semibold">● Active</span>
        </div>
      </div>
    </aside>
  );
};
