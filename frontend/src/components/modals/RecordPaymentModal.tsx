import React, { useState, useEffect } from 'react';
import { Customer, Invoice, CashAccount, PaymentMethod } from '../../types';
import { paymentApi, customerApi, invoiceApi, cashAccountApi } from '../../services/api';
import { X, AlertCircle } from 'lucide-react';

interface RecordPaymentModalProps {
  businessId: number;
  currencySymbol: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedInvoice?: Invoice | null;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  businessId,
  currencySymbol,
  isOpen,
  onClose,
  onSuccess,
  preselectedInvoice,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [accounts, setAccounts] = useState<CashAccount[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | ''>('');
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen, businessId]);

  const loadFormData = async () => {
    try {
      const [custList, invList, accList] = await Promise.all([
        customerApi.getCustomers(businessId),
        invoiceApi.getInvoices(businessId),
        cashAccountApi.getAccounts(businessId),
      ]);

      setCustomers(custList);
      setInvoices(invList);
      setAccounts(accList);

      if (accList.length > 0) {
        setSelectedAccountId(accList[0].id);
      }

      if (preselectedInvoice) {
        setSelectedCustomerId(preselectedInvoice.customerId);
        setSelectedInvoiceId(preselectedInvoice.id);
        setAmount(preselectedInvoice.outstandingBalance);
      } else if (custList.length > 0) {
        setSelectedCustomerId(custList[0].id);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Filter invoices for selected customer
  const customerInvoices = invoices.filter(
    (inv) =>
      Number(inv.customerId) === Number(selectedCustomerId) &&
      inv.status !== 'PAID' &&
      inv.status !== 'CANCELLED'
  );

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  const handleInvoiceChange = (invId: number | '') => {
    setSelectedInvoiceId(invId);
    if (invId !== '') {
      const matched = invoices.find((i) => i.id === invId);
      if (matched) {
        setAmount(matched.outstandingBalance);
      }
    }
    if (fieldErrors.amount) {
      setFieldErrors((prev) => {
        const n = { ...prev };
        delete n.amount;
        return n;
      });
    }
  };

  const handleAmountChange = (val: string) => {
    const num = val === '' ? '' : parseFloat(val);
    setAmount(num);

    if (fieldErrors.amount) {
      setFieldErrors((prev) => {
        const n = { ...prev };
        delete n.amount;
        return n;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!selectedCustomerId) {
      errs.customer = 'Please select a paying customer.';
    }

    if (!selectedAccountId) {
      errs.account = 'Please select a receiving cash account.';
    }

    if (amount === '' || isNaN(Number(amount)) || Number(amount) <= 0) {
      errs.amount = 'Payment amount must be greater than zero.';
    } else if (selectedInvoice && Number(amount) > selectedInvoice.outstandingBalance) {
      errs.amount = `Payment amount (${currencySymbol} ${amount}) cannot exceed remaining balance (${currencySymbol} ${selectedInvoice.outstandingBalance.toLocaleString('en-IN')}).`;
    }

    if (!paymentDate) {
      errs.paymentDate = 'Payment date is required.';
    }

    if (referenceNumber.trim()) {
      const cleanRef = referenceNumber.trim();
      if (!/^[A-Za-z0-9_/-]{2,50}$/.test(cleanRef)) {
        errs.referenceNumber = 'Reference / UTR must be between 2 and 50 alphanumeric characters or hyphens.';
      }
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
      await paymentApi.recordPayment(businessId, {
        customerId: Number(selectedCustomerId),
        invoiceId: selectedInvoiceId ? Number(selectedInvoiceId) : undefined,
        cashAccountId: Number(selectedAccountId),
        paymentDate,
        amount: Number(amount),
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
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
            <h2 className="text-base font-semibold text-zinc-900">Record Received Payment</h2>
            <p className="text-xs text-zinc-500">Credit cash account and reconcile customer invoice balance.</p>
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
          {/* Customer */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Paying Customer *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(Number(e.target.value));
                setSelectedInvoiceId('');
              }}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.taxId ? `(${c.taxId})` : ''}
                </option>
              ))}
            </select>
            {fieldErrors.customer && (
              <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.customer}</p>
            )}
          </div>

          {/* Optional Invoice Link */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-zinc-700">Reconcile to Invoice</label>
              {selectedInvoice && (
                <span className="text-[11px] font-mono text-zinc-500">
                  Due Balance: <strong className="text-zinc-900">{currencySymbol} {selectedInvoice.outstandingBalance.toLocaleString('en-IN')}</strong>
                </span>
              )}
            </div>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
            >
              <option value="">General Payment on Account (No invoice link)</option>
              {customerInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — Due: {inv.dueDate} — Balance: {currencySymbol} {inv.outstandingBalance.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Payment Amount ({currencySymbol}) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={selectedInvoice ? selectedInvoice.outstandingBalance : 99999999.99}
                placeholder="10000"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-xs text-zinc-900 font-mono focus:outline-none ${
                  fieldErrors.amount ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-zinc-300 bg-white focus:border-zinc-900'
                }`}
                required
              />
              {fieldErrors.amount ? (
                <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.amount}</p>
              ) : selectedInvoice ? (
                <p className="mt-1 text-[10px] text-zinc-400">Max payable: {currencySymbol} {selectedInvoice.outstandingBalance.toLocaleString('en-IN')}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Deposit To Cash Account *</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(Number(e.target.value))}
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
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Payment Date *</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
              >
                <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                <option value="BANK_TRANSFER">Direct Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="CASH">Cash in Hand</option>
                <option value="CHEQUE">Cheque / Demand Draft</option>
                <option value="CREDIT_CARD">Credit / Debit Card</option>
                <option value="OTHER">Other Method</option>
              </select>
            </div>
          </div>

          {/* Reference & Notes */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-zinc-700">Reference / UTR / Transaction ID</label>
              <span className="text-[10px] text-zinc-400">{referenceNumber.length}/50</span>
            </div>
            <input
              type="text"
              placeholder="e.g. UTR-9823482741"
              value={referenceNumber}
              maxLength={50}
              onChange={(e) => {
                setReferenceNumber(e.target.value);
                if (fieldErrors.referenceNumber) {
                  setFieldErrors((prev) => {
                    const n = { ...prev };
                    delete n.referenceNumber;
                    return n;
                  });
                }
              }}
              className={`w-full rounded-md border px-3 py-2 text-xs text-zinc-900 font-mono focus:outline-none ${
                fieldErrors.referenceNumber ? 'border-rose-400 bg-rose-50/30' : 'border-zinc-300 bg-white focus:border-zinc-900'
              }`}
            />
            {fieldErrors.referenceNumber && (
              <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.referenceNumber}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-zinc-700">Payment Notes</label>
              <span className="text-[10px] text-zinc-400">{notes.length}/500</span>
            </div>
            <textarea
              rows={2}
              placeholder="Internal remarks or receipt details..."
              value={notes}
              maxLength={500}
              onChange={(e) => setNotes(e.target.value)}
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
              disabled={isLoading || accounts.length === 0}
              className="rounded-md bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
            >
              {isLoading ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
