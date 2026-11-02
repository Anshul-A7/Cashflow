import React, { useState, useEffect } from 'react';
import { CashAccount } from '../types';
import { cashAccountApi } from '../services/api';
import { Plus, Landmark, Wallet, Trash2, ArrowUpRight } from 'lucide-react';

interface CashAccountsPageProps {
  businessId: number;
  currencySymbol: string;
  onOpenAddModal: () => void;
}

export const CashAccountsPage: React.FC<CashAccountsPageProps> = ({
  businessId,
  currencySymbol,
  onOpenAddModal,
}) => {
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await cashAccountApi.getAccounts(businessId);
      setAccounts(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load cash accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [businessId]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this cash account?')) return;
    try {
      await cashAccountApi.deleteAccount(businessId, id);
      await loadAccounts();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const totalBalance = accounts.reduce((acc, a) => acc + (Number(a.currentBalance) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">Cash & Bank Accounts</h1>
          <p className="text-xs text-zinc-500">Monitor multi-bank operating liquidity, checking reserves, and petty cash.</p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center space-x-1.5 rounded-md bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Aggregated Total Banner */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center justify-between">
        <div>
          <span className="block text-xs font-mono uppercase tracking-wider text-zinc-500">
            Total Consolidated Cash Reserves
          </span>
          <div className="mt-1 font-mono text-3xl font-bold text-zinc-900 tabular-nums">
            {currencySymbol} {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="text-right text-xs text-zinc-500">
          <span>Active Accounts: </span>
          <span className="font-mono font-bold text-zinc-900">{accounts.length}</span>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-xs text-zinc-500">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-zinc-300 p-12 text-center">
            <Landmark className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
            <p className="text-xs font-medium text-zinc-900">No cash or bank accounts registered.</p>
            <p className="text-[11px] text-zinc-500 mt-1">Add your operating bank account or cash drawer to track balances.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 rounded-md bg-zinc-950 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
            >
              + Add Bank Account
            </button>
          </div>
        ) : (
          accounts.map((acc) => (
            <div key={acc.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800">
                    {acc.accountType === 'PETTY_CASH' ? <Wallet className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}
                  </div>
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-600">
                    {acc.accountType.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-zinc-900">{acc.accountName}</h3>
                  <p className="text-xs text-zinc-500">{acc.bankName || 'Direct Cash Fund'}</p>
                  {acc.accountNumber && (
                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">Acc: {acc.accountNumber}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-mono uppercase text-zinc-400">Current Balance</span>
                  <span className="font-mono text-lg font-bold text-zinc-900 tabular-nums">
                    {currencySymbol} {acc.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(acc.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                  title="Remove account"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

