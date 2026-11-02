import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { invoiceApi } from '../services/api';
import { Plus, Search, Filter, AlertOctagon, CheckCircle2, Clock, Trash2, ArrowDownLeft } from 'lucide-react';

interface InvoicesPageProps {
  businessId: number;
  currencySymbol: string;
  onOpenCreateModal: () => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({
  businessId,
  currencySymbol,
  onOpenCreateModal,
  onOpenPaymentModal,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filter = statusFilter === 'ALL' ? undefined : (statusFilter as InvoiceStatus);
      const data = await invoiceApi.getInvoices(businessId, filter);
      setInvoices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [businessId, statusFilter]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await invoiceApi.deleteInvoice(businessId, id);
      await loadInvoices();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            <span>PAID</span>
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" />
            <span>PARTIALLY PAID</span>
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 border border-rose-200">
            <AlertOctagon className="h-3 w-3" />
            <span>OVERDUE</span>
          </span>
        );
      case 'SENT':
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-800 border border-zinc-200">
            <span>SENT</span>
          </span>
        );
      default:
        return (
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">Invoice Management (Accounts Receivable)</h1>
          <p className="text-xs text-zinc-500">Track customer billings, issue payment terms, and accelerate cash collections.</p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center space-x-1.5 rounded-md bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by invoice number or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 focus:border-zinc-900 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SENT">Sent (Awaiting Payment)</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="PAID">Paid (Settled)</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs font-medium text-zinc-900">No invoices found matching criteria.</p>
            <p className="text-[11px] text-zinc-500 mt-1">Issue an invoice to begin recording accounts receivable.</p>
            <button
              onClick={onOpenCreateModal}
              className="mt-4 rounded-md bg-zinc-950 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
            >
              + Create First Invoice
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
                <th className="px-4 py-3 text-right">Outstanding</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-zinc-900">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 font-medium text-zinc-800">{inv.customerName}</td>
                  <td className="px-4 py-3 text-zinc-500 font-mono">{inv.issueDate}</td>
                  <td className="px-4 py-3 font-mono font-medium text-zinc-700">{inv.dueDate}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-zinc-900">
                    {currencySymbol} {inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-emerald-700">
                    {currencySymbol} {inv.outstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(inv.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                        <button
                          onClick={() => onOpenPaymentModal(inv)}
                          className="inline-flex items-center space-x-1 rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 shadow-sm"
                          title="Record payment for this invoice"
                        >
                          <ArrowDownLeft className="h-3 w-3" />
                          <span>Pay</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="rounded p-1 text-zinc-400 hover:text-rose-600"
                        title="Delete invoice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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

