import React, { useState, useEffect } from 'react';
import { dashboardApi, expenseApi, invoiceApi, paymentApi } from '../services/api';
import { DashboardSummaryResponse, ExpenseCategoryPoint, Invoice, Payment } from '../types';
import { FileSpreadsheet, Printer, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ReportsPageProps {
  businessId: number;
  currencySymbol: string;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ businessId, currencySymbol }) => {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [categories, setCategories] = useState<ExpenseCategoryPoint[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [businessId]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, catRes, invRes, payRes] = await Promise.all([
        dashboardApi.getSummary(businessId),
        expenseApi.getCategoryBreakdown(businessId),
        invoiceApi.getInvoices(businessId),
        paymentApi.getPayments(businessId),
      ]);
      setSummary(sumRes);
      setCategories(catRes);
      setInvoices(invRes);
      setPayments(payRes);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCollectedRevenue = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalOperatingExpenses = categories.reduce((acc, c) => acc + (Number(c.totalAmount) || 0), 0);
  const netOperatingMargin = totalCollectedRevenue - totalOperatingExpenses;

  // Receivables Aging Analysis
  const today = new Date();
  let agingCurrent = 0;
  let aging1to30 = 0;
  let aging31to60 = 0;
  let aging60Plus = 0;

  invoices.forEach((inv) => {
    if (inv.status !== 'PAID' && inv.status !== 'CANCELLED') {
      const due = new Date(inv.dueDate);
      const diffDays = Math.floor((today.getTime() - due.getTime()) / (1000 * 3600 * 24));
      const bal = Number(inv.outstandingBalance) || 0;

      if (diffDays <= 0) {
        agingCurrent += bal;
      } else if (diffDays <= 30) {
        aging1to30 += bal;
      } else if (diffDays <= 60) {
        aging31to60 += bal;
      } else {
        aging60Plus += bal;
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">Financial Reports & Statements</h1>
          <p className="text-xs text-zinc-500">Official P&L statement, accounts receivable aging, and expenditure breakdowns.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center space-x-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 shadow-sm"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* P&L Statement Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Profit & Loss Summary (Cash Basis)</h2>
            <p className="text-[11px] text-zinc-500">Cumulative collected revenue vs total settled disbursements</p>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">All-Time Cumulative</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-zinc-50 p-4 border border-zinc-200">
            <span className="block text-xs font-mono uppercase text-zinc-500">Total Collected Revenue</span>
            <div className="mt-2 font-mono text-xl font-bold text-emerald-700 tabular-nums">
              {currencySymbol} {totalCollectedRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 block">From verified payment deposits</span>
          </div>

          <div className="rounded-lg bg-zinc-50 p-4 border border-zinc-200">
            <span className="block text-xs font-mono uppercase text-zinc-500">Total Operating Expenses</span>
            <div className="mt-2 font-mono text-xl font-bold text-zinc-900 tabular-nums">
              {currencySymbol} {totalOperatingExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 block">Rent, payroll, utilities, vendor bills</span>
          </div>

          <div className="rounded-lg bg-zinc-50 p-4 border border-zinc-200">
            <span className="block text-xs font-mono uppercase text-zinc-500">Net Operating Profit</span>
            <div
              className={`mt-2 font-mono text-xl font-bold tabular-nums ${
                netOperatingMargin >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {netOperatingMargin >= 0 ? '+' : ''}
              {currencySymbol} {netOperatingMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 block">
              {netOperatingMargin >= 0 ? 'Positive Operating Cash Margin' : 'Negative Operating Cash Burn'}
            </span>
          </div>
        </div>
      </div>

      {/* Accounts Receivable (AR) Aging Schedule */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Accounts Receivable (AR) Aging Schedule</h2>
          <p className="text-[11px] text-zinc-500">Outstanding invoice balances grouped by payment delinquency windows</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
            <span className="block text-[10px] font-mono uppercase text-emerald-800">Current (Not Due Yet)</span>
            <span className="mt-1 block font-mono text-sm font-bold text-emerald-700 tabular-nums">
              {currencySymbol} {agingCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
            <span className="block text-[10px] font-mono uppercase text-amber-800">1 - 30 Days Overdue</span>
            <span className="mt-1 block font-mono text-sm font-bold text-amber-700 tabular-nums">
              {currencySymbol} {aging1to30.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-3">
            <span className="block text-[10px] font-mono uppercase text-orange-800">31 - 60 Days Overdue</span>
            <span className="mt-1 block font-mono text-sm font-bold text-orange-700 tabular-nums">
              {currencySymbol} {aging31to60.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
            <span className="block text-[10px] font-mono uppercase text-rose-800">60+ Days Overdue (Critical)</span>
            <span className="mt-1 block font-mono text-sm font-bold text-rose-700 tabular-nums">
              {currencySymbol} {aging60Plus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Expense Category Breakdown Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="px-5 py-3 border-b border-zinc-200 bg-zinc-50">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider font-mono">
            Operating Expenditure Category Breakdown
          </h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Expense Category</th>
              <th className="px-4 py-3 text-right">Total Outflow</th>
              <th className="px-4 py-3 text-right">Percentage Allocation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                  No expenses recorded in ledger.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.category} className="hover:bg-zinc-50/70">
                  <td className="px-4 py-3 font-medium text-zinc-900">{c.categoryLabel}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-900">
                    {currencySymbol} {c.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-600">{c.percentage}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
