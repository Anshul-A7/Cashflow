import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategoryPoint } from '../types';
import { expenseApi } from '../services/api';
import { Plus, Trash2, CheckCircle2, Clock, PieChart } from 'lucide-react';

interface ExpensesPageProps {
  businessId: number;
  currencySymbol: string;
  onOpenAddModal: () => void;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  businessId,
  currencySymbol,
  onOpenAddModal,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [expList, catBreakdown] = await Promise.all([
        expenseApi.getExpenses(businessId),
        expenseApi.getCategoryBreakdown(businessId),
      ]);
      setExpenses(expList);
      setCategories(catBreakdown);
    } catch (err: any) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [businessId]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this expense? If marked as paid, the amount will be restored to your cash account.')) return;
    try {
      await expenseApi.deleteExpense(businessId, id);
      await loadExpenses();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">Expense Tracking & Payables</h1>
          <p className="text-xs text-zinc-500">Log operational disbursements, vendor liabilities, rent, and recurring expenses.</p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center space-x-1.5 rounded-md bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Category Breakdown Tiles */}
      {categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <div key={cat.category} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
              <span className="block text-[10px] font-mono uppercase text-zinc-500 truncate" title={cat.categoryLabel}>
                {cat.categoryLabel}
              </span>
              <div className="mt-1 font-mono text-xs font-bold text-zinc-900 tabular-nums">
                {currencySymbol} {cat.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
                <span>{cat.percentage}% of total</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expenses Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500">Loading expense ledger...</div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs font-medium text-zinc-900">No expenses recorded yet.</p>
            <p className="text-[11px] text-zinc-500 mt-1">Record your first business expense to track cash outflows.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 rounded-md bg-zinc-950 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
            >
              + Record Expense
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Expense Date</th>
                <th className="px-4 py-3">Payee / Vendor</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Payment Source</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Settlement</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono text-zinc-500">{exp.expenseDate}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900">{exp.payee}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-800">
                      {exp.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 text-[11px]">
                    {exp.cashAccountName || 'Direct Payable / Accrual'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-zinc-900">
                    {currencySymbol} {exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {exp.isPaid ? (
                      <span className="inline-flex items-center space-x-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>PAID</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
                        <Clock className="h-3 w-3" />
                        <span>DUE: {exp.dueDate || 'Pending'}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="rounded p-1 text-zinc-400 hover:text-rose-600"
                      title="Delete expense"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-zinc-200 bg-zinc-50 font-semibold text-zinc-900">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right uppercase font-mono text-[11px] text-zinc-500">
                  Total Cumulative Outflows:
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  {currencySymbol} {totalExpenseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
};

