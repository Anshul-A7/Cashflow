import React, { useState, useEffect } from 'react';
import { Payment } from '../types';
import { paymentApi } from '../services/api';
import { Plus, ArrowDownLeft, CheckCircle2 } from 'lucide-react';

interface PaymentsPageProps {
  businessId: number;
  currencySymbol: string;
  onOpenRecordModal: () => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  businessId,
  currencySymbol,
  onOpenRecordModal,
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await paymentApi.getPayments(businessId);
      setPayments(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [businessId]);

  const totalCollected = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">Payment Collections & Inflow</h1>
          <p className="text-xs text-zinc-500">Record customer settlements, bank deposits, and reconcile invoice receivables.</p>
        </div>
        <button
          onClick={onOpenRecordModal}
          className="inline-flex items-center space-x-1.5 rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Record Received Payment</span>
        </button>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500">Loading payment ledger...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs font-medium text-zinc-900">No customer payments recorded yet.</p>
            <p className="text-[11px] text-zinc-500 mt-1">When customers pay your invoices, record them here to credit your cash account.</p>
            <button
              onClick={onOpenRecordModal}
              className="mt-4 rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 shadow-sm"
            >
              + Record Payment
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Matched Invoice</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Deposited Account</th>
                <th className="px-4 py-3">Reference / UTR</th>
                <th className="px-4 py-3 text-right">Amount Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono text-zinc-500">{p.paymentDate}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900">{p.customerName}</td>
                  <td className="px-4 py-3 font-mono font-medium text-zinc-700">
                    {p.invoiceNumber ? (
                      <span className="text-zinc-900 font-semibold">{p.invoiceNumber}</span>
                    ) : (
                      <span className="text-zinc-400 italic">Direct on Account</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-800">
                      {p.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 text-[11px]">{p.cashAccountName}</td>
                  <td className="px-4 py-3 font-mono text-zinc-500 text-[11px]">{p.referenceNumber || '—'}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-emerald-700">
                    + {currencySymbol} {p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-zinc-200 bg-zinc-50 font-semibold text-zinc-900">
              <tr>
                <td colSpan={6} className="px-4 py-3 text-right uppercase font-mono text-[11px] text-zinc-500">
                  Total Collected Inflows:
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-emerald-700">
                  {currencySymbol} {totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
};

