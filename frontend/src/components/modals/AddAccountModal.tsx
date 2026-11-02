import React, { useState } from 'react';
import { cashAccountApi } from '../../services/api';
import { AccountType } from '../../types';
import { X, AlertCircle } from 'lucide-react';

interface AddAccountModalProps {
  businessId: number;
  currencySymbol: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  businessId,
  currencySymbol,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('BANK_CHECKING');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [initialBalance, setInitialBalance] = useState<number | ''>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!accountName.trim()) {
      errs.accountName = 'Account name is required.';
    } else if (accountName.trim().length < 2) {
      errs.accountName = 'Account name must be at least 2 characters.';
    } else if (accountName.trim().length > 60) {
      errs.accountName = 'Account name cannot exceed 60 characters.';
    }

    if (accountNumber.trim()) {
      const cleanNum = accountNumber.replace(/\D/g, '');
      if (cleanNum.length < 9 || cleanNum.length > 18) {
        errs.accountNumber = `Account number must be between 9 and 18 digits (currently ${cleanNum.length} digits).`;
      }
    }

    if (initialBalance === '' || isNaN(Number(initialBalance))) {
      errs.initialBalance = 'Initial opening balance is required.';
    } else if (Number(initialBalance) < 0) {
      errs.initialBalance = 'Opening balance cannot be negative.';
    } else if (Number(initialBalance) > 9999999999.99) {
      errs.initialBalance = 'Opening balance exceeds maximum permitted amount.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAccountNumberChange = (val: string) => {
    // Only numbers, strictly max 18 digits
    const digits = val.replace(/\D/g, '').slice(0, 18);
    setAccountNumber(digits);
    if (fieldErrors.accountNumber) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.accountNumber;
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await cashAccountApi.createAccount(businessId, {
        accountName: accountName.trim(),
        accountType,
        bankName: bankName.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        initialBalance: initialBalance === '' ? 0 : Number(initialBalance),
      });
      // Reset form
      setAccountName('');
      setBankName('');
      setAccountNumber('');
      setInitialBalance(0);
      setFieldErrors({});
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create cash account');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Add Cash / Bank Account</h2>
            <p className="text-xs text-zinc-500">Record liquid bank balances, petty cash, or digital payment gateways.</p>
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
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-zinc-700">Account Name *</label>
              <span className="text-[10px] text-zinc-400">{accountName.length}/60</span>
            </div>
            <input
              type="text"
              placeholder="e.g. HDFC Operating Current Account"
              value={accountName}
              maxLength={60}
              onChange={(e) => {
                setAccountName(e.target.value);
                if (fieldErrors.accountName) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.accountName;
                    return next;
                  });
                }
              }}
              className={`w-full rounded-md border px-3 py-2 text-xs text-zinc-900 focus:outline-none ${
                fieldErrors.accountName ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-zinc-300 bg-white focus:border-zinc-900'
              }`}
              required
            />
            {fieldErrors.accountName && (
              <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.accountName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Account Type *</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as AccountType)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
              >
                <option value="BANK_CHECKING">Bank Current Account</option>
                <option value="BANK_SAVINGS">Bank Savings Account</option>
                <option value="PETTY_CASH">Petty Cash / Cash Drawer</option>
                <option value="PAYMENT_GATEWAY">Payment Gateway (Razorpay/Stripe)</option>
                <option value="DIGITAL_WALLET">Digital Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Opening Balance ({currencySymbol}) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="9999999999.99"
                placeholder="0.00"
                value={initialBalance}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                  setInitialBalance(val);
                  if (fieldErrors.initialBalance) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.initialBalance;
                      return next;
                    });
                  }
                }}
                className={`w-full rounded-md border px-3 py-2 text-xs text-zinc-900 font-mono focus:outline-none ${
                  fieldErrors.initialBalance ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-zinc-300 bg-white focus:border-zinc-900'
                }`}
                required
              />
              {fieldErrors.initialBalance && (
                <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.initialBalance}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank, SBI, ICICI"
                value={bankName}
                maxLength={100}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-zinc-700">Account Number</label>
                <span className="text-[10px] text-zinc-400">{accountNumber.length}/18</span>
              </div>
              <input
                type="text"
                placeholder="9 to 18 digits"
                value={accountNumber}
                maxLength={18}
                onChange={(e) => handleAccountNumberChange(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-xs text-zinc-900 font-mono focus:outline-none ${
                  fieldErrors.accountNumber ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-zinc-300 bg-white focus:border-zinc-900'
                }`}
              />
              {fieldErrors.accountNumber ? (
                <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.accountNumber}</p>
              ) : (
                <p className="mt-1 text-[10px] text-zinc-400">9-18 digits (numbers only)</p>
              )}
            </div>
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
              {isLoading ? 'Saving...' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
