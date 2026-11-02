import React, { useState, useEffect } from 'react';
import { Customer, InvoiceItem } from '../../types';
import { invoiceApi, customerApi } from '../../services/api';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';

interface CreateInvoiceModalProps {
  businessId: number;
  currencySymbol: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenCustomerModal: () => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  businessId,
  currencySymbol,
  isOpen,
  onClose,
  onSuccess,
  onOpenCustomerModal,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [taxRate, setTaxRate] = useState<number>(18); // Default 18% GST
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Professional Consulting Services', quantity: 1, unitPrice: 10000, lineTotal: 10000 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen, businessId]);

  const loadCustomers = async () => {
    try {
      const data = await customerApi.getCustomers(businessId);
      setCustomers(data);
      if (data.length > 0 && selectedCustomerId === '') {
        setSelectedCustomerId(data[0].id);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    const qty = Number(newItems[index].quantity) || 0;
    const price = Number(newItems[index].unitPrice) || 0;
    newItems[index].lineTotal = Number((qty * price).toFixed(2));

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (Number(it.lineTotal) || 0), 0);
  const taxAmount = Number(((subtotal * (Number(taxRate) || 0)) / 100).toFixed(2));
  const safeDiscount = Math.min(Number(discountAmount) || 0, subtotal);
  const totalAmount = Math.max(0, subtotal + taxAmount - (Number(discountAmount) || 0));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!selectedCustomerId) {
      errs.customer = 'Please select a customer for this invoice.';
    }

    if (!issueDate) {
      errs.issueDate = 'Issue date is required.';
    }

    if (!dueDate) {
      errs.dueDate = 'Due date is required.';
    } else if (issueDate && dueDate < issueDate) {
      errs.dueDate = 'Due date cannot be earlier than issue date.';
    }

    if (taxRate < 0 || taxRate > 100) {
      errs.taxRate = 'Tax rate must be between 0% and 100%.';
    }

    if (Number(discountAmount) < 0) {
      errs.discount = 'Discount cannot be negative.';
    } else if (Number(discountAmount) > subtotal) {
      errs.discount = `Discount (${currencySymbol} ${discountAmount}) cannot exceed subtotal (${currencySymbol} ${subtotal.toFixed(2)}).`;
    }

    if (items.length === 0) {
      errs.items = 'Invoice must have at least one line item.';
    } else {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (!it.description.trim()) {
          errs.items = `Item #${i + 1} description is required.`;
          break;
        }
        if (Number(it.quantity) <= 0) {
          errs.items = `Item #${i + 1} quantity must be greater than zero.`;
          break;
        }
        if (Number(it.unitPrice) < 0) {
          errs.items = `Item #${i + 1} unit price cannot be negative.`;
          break;
        }
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
      await invoiceApi.createInvoice(businessId, {
        customerId: Number(selectedCustomerId),
        invoiceNumber: invoiceNumber.trim() || undefined,
        issueDate,
        dueDate,
        taxRate: Number(taxRate) || 0,
        discountAmount: Number(discountAmount) || 0,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          description: i.description.trim(),
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Create Customer Invoice</h2>
            <p className="text-xs text-zinc-500">Record customer billing, specify tax rates, and track accounts receivable.</p>
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
          {/* Customer Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Customer *</label>
              {customers.length === 0 ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-zinc-500">No customers found.</span>
                  <button
                    type="button"
                    onClick={onOpenCustomerModal}
                    className="text-xs font-semibold text-zinc-900 underline hover:text-zinc-700"
                  >
                    + Register Customer
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(Number(e.target.value));
                      if (fieldErrors.customer) {
                        setFieldErrors((prev) => {
                          const n = { ...prev };
                          delete n.customer;
                          return n;
                        });
                      }
                    }}
                    className={`w-full rounded-md border px-3 py-2 text-xs text-zinc-900 focus:outline-none ${
                      fieldErrors.customer ? 'border-rose-400 bg-rose-50/30' : 'border-zinc-300 bg-white focus:border-zinc-900'
                    }`}
                    required
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.taxId ? `(${c.taxId})` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={onOpenCustomerModal}
                    className="shrink-0 rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
                    title="Add new customer"
                  >
                    +
                  </button>
                </div>
              )}
              {fieldErrors.customer && (
                <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.customer}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Invoice Number (Auto if blank)</label>
              <input
                type="text"
                placeholder="e.g. INV-2026-0001"
                value={invoiceNumber}
                maxLength={30}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 font-mono focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Issue Date *</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => {
                  setIssueDate(e.target.value);
                  if (fieldErrors.dueDate) {
                    setFieldErrors((prev) => {
                      const n = { ...prev };
                      delete n.dueDate;
                      return n;
                    });
                  }
                }}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                min={issueDate}
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
                  fieldErrors.dueDate ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-zinc-300 bg-white focus:border-zinc-900'
                }`}
                required
              />
              {fieldErrors.dueDate && (
                <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-zinc-800 uppercase tracking-wider">Line Items *</label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-1 text-xs font-medium text-zinc-700 hover:text-zinc-950"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {fieldErrors.items && (
              <p className="text-[11px] text-rose-600">{fieldErrors.items}</p>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Item description"
                    value={item.description}
                    maxLength={200}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    className="flex-1 rounded border border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="999999"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-16 rounded border border-zinc-300 px-2 py-1.5 text-xs text-zinc-900 font-mono text-right focus:border-zinc-900 focus:outline-none"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="99999999"
                    placeholder="Rate"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-24 rounded border border-zinc-300 px-2 py-1.5 text-xs text-zinc-900 font-mono text-right focus:border-zinc-900 focus:outline-none"
                    required
                  />
                  <div className="w-24 text-right text-xs font-mono font-medium text-zinc-900 pr-1">
                    {currencySymbol} {item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length <= 1}
                    className="p-1 text-zinc-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tax & Discount & Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <label className="w-28 text-xs font-medium text-zinc-700">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-24 rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-900 font-mono text-right focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <label className="w-28 text-xs font-medium text-zinc-700">Discount ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={subtotal}
                  value={discountAmount}
                  onChange={(e) => {
                    setDiscountAmount(parseFloat(e.target.value) || 0);
                    if (fieldErrors.discount) {
                      setFieldErrors((prev) => {
                        const n = { ...prev };
                        delete n.discount;
                        return n;
                      });
                    }
                  }}
                  className={`w-24 rounded border px-2 py-1 text-xs text-zinc-900 font-mono text-right focus:outline-none ${
                    fieldErrors.discount ? 'border-rose-400 bg-rose-50/30' : 'border-zinc-300 focus:border-zinc-900'
                  }`}
                />
              </div>
              {fieldErrors.discount && (
                <p className="text-[11px] text-rose-600">{fieldErrors.discount}</p>
              )}

              <div>
                <textarea
                  rows={2}
                  placeholder="Invoice notes / payment terms..."
                  value={notes}
                  maxLength={500}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded border border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-zinc-50 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="font-mono">{currencySymbol} {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Tax ({taxRate}%):</span>
                <span className="font-mono">+{currencySymbol} {taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {Number(discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-mono">-{currencySymbol} {Number(discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-950 font-bold border-t border-zinc-200 pt-2 text-sm">
                <span>Total Amount:</span>
                <span className="font-mono">{currencySymbol} {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
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
              disabled={isLoading || customers.length === 0}
              className="rounded-md bg-zinc-950 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 shadow-sm"
            >
              {isLoading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
