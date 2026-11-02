import React, { useState, useEffect } from 'react';
import { CashAccount, ExpenseCategory } from '../../types';
import { expenseApi, cashAccountApi } from '../../services/api';
import { X, AlertCircle } from 'lucide-react';

interface AddExpenseModalProps {
  businessId: number;
  currencySymbol: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  businessId,
  currencySymbol,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [category, setCategory] = useState<ExpenseCategory>('RENT');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [isPaid, setIsPaid] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('MONTHLY');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen, businessId]);

  const loadAccounts = async () => {
    try {
      const list = await cashAccountApi.getAccounts(businessId);
      setAccounts(list);
      if (list.length > 0) {
        setSelectedAccountId(list[0].id);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!payee.trim()) {
      errs.payee = 'Payee / vendor name is required.';
    } else if (payee.trim().length < 2) {
      errs.payee = 'Payee name must be at least 2 characters.';
    } else if (payee.trim().length > 100) {
      errs.payee = 'Payee name cannot exceed 100 characters.';
    }

    if (amount === '' || isNaN(Number(amount)) || Number(amount) <= 0) {
      errs.amount = 'Expense amount must be greater than zero.';
    } else if (Number(amount) > 99999999.99) {
      errs.amount = 'Expense amount exceeds maximum permitted limit.';
    }

    if (!expenseDate) {
      errs.expenseDate = 'Expense date is required.';
    }

    if (dueDate && expenseDate && dueDate < expenseDate) {
      errs.dueDate = 'Due date cannot be earlier than expense date.';
    }

    if (isPaid && !selectedAccountId) {
      errs.account = 'Please select a cash/bank account for immediate payment.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await expenseApi.createExpense(businessId, {
        category,
        payee: payee.trim(),
        amount: Number(amount),
        expenseDate,
        dueDate: dueDate || undefined,
        isPaid,
        cashAccountId: isPaid && selectedAccountId ? Number(selectedAccountId) : undefined,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
        description: description.trim() || undefined,
      });
      // Reset form
      setPayee('');
      setAmount('');
      setDueDate('');
      setDescription('');
      setFieldErrors({});
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record expense');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Record Business Expense</h2>
            <p className="text-xs text-zinc-500">Track operating disbursements, rent, utilities, and payables.</p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start space-x-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Category & Payee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Expense Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
              >
                <option value="RENT">Rent & Facilities</option>
                <option value="SALARIES">Employee Salaries & Wages</option>
                <option value="ELECTRICITY_AND_UTILITIES">Electricity & Utilities</option>
                <option value="OFFICE_SUPPLIES">Office Supplies & Stationery</option>
                <option value="MARKETING_AND_ADS">Marketing & Growth</option>
                <option value="TAXES_AND_DUTIES">Taxes, GST & Government Fees</option>
                <option value="SOFTWARE_AND_SUBSCRIPTIONS">Software, Cloud & SaaS</option>
                <option value="RAW_MATERIALS_AND_INVENTORY">Raw Materials & Inventory</option>
                <option value="TRAVEL_AND_LOGISTICS">Travel & Logistics</option>
                <option value="MAINTENANCE_AND_REPAIRS">Maintenance & Repairs</option>
                <option value="LEGAL_AND_PROFESSIONAL">Legal & Accounting</option>
                <option value="OTHER">Other Expense</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-zinc-700">Payee / Vendor *</label>
                <span className="text-[10px] text-zinc-400">{payee.length}/100</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Office Landlord, Power Corp"
                value={payee}
                maxLength={100}
                onChange={(e) => {
                  setPayee(e.target.value);
                  if (fieldErrors.payee) {
                    setFieldErrors((prev) => {
                      const n = { ...prev };
                      delete n.payee;
                      return n;
                    });
                  }
                }}
                className={`w-full rounded-md border px-3 py-2 text-xs text-zinc-900 focus:outline-none ${
                  fieldErrors.payee ? 'border-rose-400 bg-rose-50/30' : 'border-zinc-300 bg-white focus:border-zinc-900'
                }`}
                required
              />
              {fieldErrors.payee && (
                <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.payee}</p>
              )}
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Amount ({currencySymbol}) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="99999999.99"
                placeholder="25000"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                  setAmount(val);
                  if (fieldErrors.amount) {
                    setFieldErrors((prev) => {
                      const n = { ...prev };
                      delete n.amount;
                      return n;
                    });
                  }
                }}
                className={`w-full rounded-md border px-3 py-2 text-xs text-zinc-900 font-mono focus:outline-none ${
                  fieldErrors.amount ? 'border-rose-400 bg-rose-50/30' : 'border-zinc-300 bg-white focus:border-zinc-900'
                }`}
                required
              />
              {fieldErrors.amount && (
                <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Expense Date *</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Payment Status & Cash Account Selection */}
          <div className="p-3 bg-zinc-50 rounded-lg space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPaidExpense"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="rounded border-zinc-300 text-zinc-950 focus:ring-0"
              />
              <label htmlFor="isPaidExpense" className="text-xs font-medium text-zinc-800">
                Disburse payment immediately (Deducts balance from account)
              </label>
            </div>

            {isPaid ? (
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Deduct from Cash Account *</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => {
                    setSelectedAccountId(Number(e.target.value));
                    if (fieldErrors.account) {
                      setFieldErrors((prev) => {
                        const n = { ...prev };
                        delete n.account;
                        return n;
                      });
                    }
                  }}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} ({currencySymbol} {acc.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
                {fieldErrors.account && (
                  <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.account}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Payment Due Date (Unpaid Bill)</label>
                <input
                  type="date"
                  value={dueDate}
                  min={expenseDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    if (fieldErrors.dueDate) {
                      setFieldErrors((prev) => {
                        const n = { ...prev };
                        delete n.dueDate;
                        return n;
                      });
                    }
                  }}
                  className={`w-full rounded-md border px-3 py-2 text-xs text-zinc-900 focus:outline-none ${
                    fieldErrors.dueDate ? 'border-rose-400 bg-rose-50/30' : 'border-zinc-300 bg-white focus:border-zinc-900'
                  }`}
                />
                {fieldErrors.dueDate && (
                  <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.dueDate}</p>
                )}
              </div>
            )}
          </div>

          {/* Recurring */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded border-zinc-300 text-zinc-950 focus:ring-0"
              />
              <label htmlFor="isRecurring" className="text-xs font-medium text-zinc-700">
                Recurring Expense
              </label>
            </div>

            {isRecurring && (
              <select
                value={recurringFrequency}
                onChange={(e) => setRecurringFrequency(e.target.value)}
                className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUALLY">Annually</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-zinc-700">Expense Memo / Description</label>
              <span className="text-[10px] text-zinc-400">{description.length}/500</span>
            </div>
            <textarea
              rows={2}
              placeholder="e.g. Monthly corporate office rent for Block B, floor 4"
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-zinc-950 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 shadow-sm"
            >
              {isLoading ? 'Recording...' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
