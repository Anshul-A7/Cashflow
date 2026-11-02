import React, { useState, useEffect } from 'react';
import { CustomerBehaviorDto } from '../types';
import { customerApi } from '../services/api';
import { Plus, Users2, ShieldAlert, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface CustomersPageProps {
  businessId: number;
  currencySymbol: string;
  onOpenAddModal: () => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  businessId,
  currencySymbol,
  onOpenAddModal,
}) => {
  const [behaviorMatrix, setBehaviorMatrix] = useState<CustomerBehaviorDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await customerApi.getCustomerBehavior(businessId);
      setBehaviorMatrix(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load customer behavior matrix');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

  const getRiskBadge = (tier: string) => {
    switch (tier) {
      case 'LOW_RISK':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            <span>EXCELLENT / LOW RISK</span>
          </span>
        );
      case 'MODERATE_RISK':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
            <Clock className="h-3 w-3" />
            <span>MODERATE RISK</span>
          </span>
        );
      case 'CHRONIC_LATE':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-800 border border-orange-200">
            <AlertTriangle className="h-3 w-3" />
            <span>CHRONIC LATE PAYER</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-800 border border-rose-200">
            <ShieldAlert className="h-3 w-3" />
            <span>CRITICAL DEFAULT RISK</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
            Customer Payment Behaviour Intelligence (CPBI)
          </h1>
          <p className="text-xs text-zinc-500">
            Analyzes customer payment records to identify chronic late payers and minimize accounts receivable defaults.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center space-x-1.5 rounded-md bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Register Customer</span>
        </button>
      </div>

      {/* Intelligence Cards / Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500">Calculating behavior metrics...</div>
        ) : behaviorMatrix.length === 0 ? (
          <div className="p-12 text-center">
            <Users2 className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
            <p className="text-xs font-medium text-zinc-900">No customers registered yet.</p>
            <p className="text-[11px] text-zinc-500 mt-1">Register customers and issue invoices to observe live payment behavior analytics.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 rounded-md bg-zinc-950 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
            >
              + Register Customer
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-center">Reliability Score</th>
                <th className="px-4 py-3 text-center">Avg Days Late</th>
                <th className="px-4 py-3 text-center">Risk Tier</th>
                <th className="px-4 py-3 text-right">Invoices (Paid / Total)</th>
                <th className="px-4 py-3 text-right">Outstanding Balance</th>
                <th className="px-4 py-3">Recommended Collection Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {behaviorMatrix.map((item) => (
                <tr key={item.customerId} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <span className="block font-semibold text-zinc-900">{item.customerName}</span>
                    <span className="block text-[11px] text-zinc-500">{item.email || 'No email registered'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center space-x-1.5 font-mono font-bold text-zinc-900">
                      <div className="w-12 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            item.reliabilityScore >= 80
                              ? 'bg-emerald-600'
                              : item.reliabilityScore >= 55
                              ? 'bg-amber-500'
                              : 'bg-rose-600'
                          }`}
                          style={{ width: `${item.reliabilityScore}%` }}
                        />
                      </div>
                      <span>{item.reliabilityScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-zinc-700 font-medium">
                    {item.averageDaysLate > 0 ? `+${item.averageDaysLate} days` : '0 days (On Time)'}
                  </td>
                  <td className="px-4 py-3 text-center">{getRiskBadge(item.riskTier)}</td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-700">
                    <span className="font-semibold text-emerald-700">{item.totalInvoicesPaid}</span> / {item.totalInvoicesIssued}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-zinc-900">
                    {currencySymbol} {item.currentOutstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-zinc-600 leading-snug">
                    <span className="font-medium text-zinc-900">{item.recommendedCollectionAction}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

