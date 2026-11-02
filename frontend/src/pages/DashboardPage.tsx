import React, { useState, useEffect } from 'react';
import { DashboardSummaryResponse } from '../types';
import { dashboardApi, aiApi } from '../services/api';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  AlertOctagon,
  Sparkles,
  TrendingUp,
  Receipt,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

interface DashboardPageProps {
  businessId: number;
  currencySymbol: string;
  onOpenNewInvoice: () => void;
  onOpenNewExpense: () => void;
  onOpenNewPayment: () => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  businessId,
  currencySymbol,
  onOpenNewInvoice,
  onOpenNewExpense,
  onOpenNewPayment,
  onNavigateTab,
}) => {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const summary = await dashboardApi.getSummary(businessId);
      setData(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load financial dashboard telemetry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [businessId]);

  const handleRunAiDiagnostic = async () => {
    setIsDiagnosing(true);
    try {
      await aiApi.runDiagnostic(businessId);
      await loadDashboard();
    } catch (err: any) {
      alert('Diagnostic Error: ' + err.message);
    } finally {
      setIsDiagnosing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Loading Financial Telemetry...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
        <AlertOctagon className="mx-auto h-8 w-8 text-rose-600 mb-2" />
        <h3 className="text-sm font-semibold">Unable to load business telemetry</h3>
        <p className="text-xs text-rose-600 mt-1">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-4 rounded-md bg-zinc-950 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const {
    cashBalance,
    totalReceivables,
    upcomingExpenses,
    overdueInvoices,
    invoiceStatusDistribution,
    incomeVsExpenseTrend,
    forecast,
    recentInsights,
  } = data;

  const paidPct = invoiceStatusDistribution?.Paid || 0;
  const pendingPct = invoiceStatusDistribution?.Pending || 0;
  const overduePct = invoiceStatusDistribution?.Overdue || 0;

  const isBrandNewBusiness =
    cashBalance === 0 &&
    totalReceivables === 0 &&
    upcomingExpenses === 0 &&
    data.totalCustomers === 0;

  return (
    <div className="space-y-6">
      {/* Top Banner for Clean Empty State Onboarding */}
      {isBrandNewBusiness && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-semibold text-zinc-900">Workspace Initialized — Ready for Real Data</h2>
            </div>
            <p className="text-xs text-zinc-500 max-w-xl">
              CashFlow-Guardian starts completely clean. Add your actual business bank balance, register your customers, and issue your first invoice to see live cash flow forecasts and AI diagnostics.
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onNavigateTab('customers')}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
            >
              1. Add Customer
            </button>
            <button
              onClick={onOpenNewInvoice}
              className="rounded-md bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 shadow-sm"
            >
              2. Issue Invoice
            </button>
          </div>
        </div>
      )}

      {/* 4 Core Primary KPI Tiles (Aligned with Project Report Page 17) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Cash Balance */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Cash Balance</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-bold text-zinc-900 tabular-nums">
              {currencySymbol} {cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-zinc-500">
              <span className="text-zinc-600 font-mono">Runway:</span>
              <span className="ml-1 font-semibold text-zinc-800 font-mono">
                {data.estimatedRunwayDays > 365 ? '365+ days' : `${data.estimatedRunwayDays} days`}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Receivables */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Receivables</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
              {currencySymbol} {totalReceivables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-zinc-500">
              <span>Pending Invoices:</span>
              <span className="ml-1 font-semibold text-zinc-800 font-mono">{data.pendingInvoicesCount}</span>
            </div>
          </div>
        </div>

        {/* 3. Upcoming Expenses */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Upcoming Expenses</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-bold text-zinc-900 tabular-nums">
              {currencySymbol} {upcomingExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-zinc-500">
              <span>Net Month:</span>
              <span
                className={`ml-1 font-semibold font-mono tabular-nums ${
                  data.netCashFlowThisMonth >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {data.netCashFlowThisMonth >= 0 ? '+' : ''}
                {currencySymbol} {data.netCashFlowThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Overdue Invoices */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Overdue Invoices</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <AlertOctagon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-bold text-rose-700 tabular-nums">
              {currencySymbol} {overdueInvoices.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-zinc-500">
              <span>Delayed Accounts:</span>
              <span className="ml-1 font-semibold text-rose-700 font-mono">{data.overdueInvoicesCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Income vs Expense & 6-Week Cash-Flow Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense (Past 6 Months) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider font-mono">
                Income vs Expense
              </h3>
              <p className="text-[11px] text-zinc-500">Historical cash velocity (Past 6 Months)</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-zinc-900" />
                <span className="text-zinc-600 text-[11px]">Income</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-zinc-300" />
                <span className="text-zinc-600 text-[11px]">Expense</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71717A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717A' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${currencySymbol} ${Number(val).toLocaleString('en-IN')}`]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E4E4E7', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="income" fill="#18181B" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#D4D4D8" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash-Flow Forecast (Next 6 Weeks) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider font-mono">
                Cash-Flow Forecast (Next 6 Weeks)
              </h3>
              <p className="text-[11px] text-zinc-500">Predictive liquidity trajectory (W1 to W6)</p>
            </div>
            <button
              onClick={() => onNavigateTab('forecast')}
              className="text-[11px] font-medium text-zinc-900 hover:text-zinc-700 flex items-center space-x-1"
            >
              <span>Full Horizon</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast.weeklyForecast} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                <XAxis dataKey="weekLabel" tick={{ fontSize: 11, fill: '#71717A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717A' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${currencySymbol} ${Number(val).toLocaleString('en-IN')}`, 'Projected Cash']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E4E4E7', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="projectedCash"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#059669' }}
                  activeDot={{ r: 6 }}
                  name="Projected Cash"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Invoice Status Distribution & AI Financial Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Status Distribution (Progress Breakdown) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider font-mono mb-1">
            Invoice Status
          </h3>
          <p className="text-[11px] text-zinc-500 mb-4">Receivables portfolio settlement rates</p>

          <div className="space-y-4">
            {/* Visual Progress Bar */}
            <div className="h-3 w-full rounded-full bg-zinc-100 flex overflow-hidden">
              <div style={{ width: `${paidPct}%` }} className="bg-emerald-600 transition-all" title={`Paid: ${paidPct}%`} />
              <div style={{ width: `${pendingPct}%` }} className="bg-amber-400 transition-all" title={`Pending: ${pendingPct}%`} />
              <div style={{ width: `${overduePct}%` }} className="bg-rose-500 transition-all" title={`Overdue: ${overduePct}%`} />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 text-center">
              <div className="rounded-lg bg-emerald-50/50 p-2">
                <span className="block text-[10px] font-mono uppercase text-emerald-800">Paid</span>
                <span className="font-mono text-base font-bold text-emerald-700">{paidPct}%</span>
              </div>
              <div className="rounded-lg bg-amber-50/50 p-2">
                <span className="block text-[10px] font-mono uppercase text-amber-800">Pending</span>
                <span className="font-mono text-base font-bold text-amber-700">{pendingPct}%</span>
              </div>
              <div className="rounded-lg bg-rose-50/50 p-2">
                <span className="block text-[10px] font-mono uppercase text-rose-800">Overdue</span>
                <span className="font-mono text-base font-bold text-rose-700">{overduePct}%</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => onNavigateTab('invoices')}
                className="text-xs font-medium text-zinc-900 hover:underline inline-flex items-center space-x-1"
              >
                <span>Manage All Invoices</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* AI-Assisted Insights & Recommendations */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
              <div className="flex items-center space-x-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-950 text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900">AI-Assisted Financial Insights</h3>
                  <span className="text-[10px] font-mono text-zinc-500">Google Gemini & Heuristic Intelligence</span>
                </div>
              </div>
              <button
                onClick={handleRunAiDiagnostic}
                disabled={isDiagnosing}
                className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isDiagnosing ? 'Analyzing...' : 'Run Live Diagnostic'}
              </button>
            </div>

            <div className="space-y-3">
              {recentInsights && recentInsights.length > 0 ? (
                recentInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`rounded-lg border p-3 text-xs ${
                      insight.severity === 'CRITICAL'
                        ? 'border-rose-200 bg-rose-50/60'
                        : insight.severity === 'WARNING'
                        ? 'border-amber-200 bg-amber-50/60'
                        : 'border-zinc-200 bg-zinc-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-zinc-900">
                      <span>{insight.title}</span>
                      <span className="text-[10px] font-mono uppercase text-zinc-500">
                        {insight.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-600 leading-relaxed">{insight.content}</p>
                    {insight.actionableAdvice && (
                      <div className="mt-2 text-[11px] font-medium text-zinc-900 flex items-start space-x-1.5">
                        <span className="font-semibold text-zinc-500 shrink-0">Recommendation:</span>
                        <span>{insight.actionableAdvice}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-zinc-500">
                  <p>No financial diagnostic has been triggered yet.</p>
                  <button
                    onClick={handleRunAiDiagnostic}
                    className="mt-2 text-xs font-semibold text-zinc-950 underline hover:text-zinc-700"
                  >
                    Trigger initial AI liquidity analysis
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Forecasts and recommendations are derived mathematically from recorded ledgers.</span>
            <button
              onClick={() => onNavigateTab('ai')}
              className="font-medium text-zinc-900 hover:underline flex items-center space-x-1"
            >
              <span>Full AI Advisor Panel</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

