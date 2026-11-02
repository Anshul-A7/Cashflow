import React, { useState } from 'react';
import { customerApi } from '../../services/api';
import { X, AlertCircle } from 'lucide-react';

interface AddCustomerModalProps {
  businessId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  businessId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Field-specific validation states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Customer name is required.';
    } else if (name.trim().length < 2) {
      errs.name = 'Customer name must be at least 2 characters.';
    } else if (name.trim().length > 100) {
      errs.name = 'Customer name cannot exceed 100 characters.';
    }

    if (email.trim()) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email.trim())) {
        errs.email = 'Please enter a valid email address (e.g. client@company.com).';
      }
    }

    if (phone.trim()) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        errs.phone = `Phone number must be exactly 10 digits (currently ${cleanPhone.length} digits).`;
      } else if (!/^[6-9]/.test(cleanPhone)) {
        errs.phone = 'Mobile number must start with 6, 7, 8, or 9.';
      }
    }

    if (taxId.trim()) {
      const upperTax = taxId.trim().toUpperCase();
      if (!/^[A-Z0-9_/-]{6,20}$/.test(upperTax)) {
        errs.taxId = 'Tax ID / GSTIN must be between 6 and 20 alphanumeric characters.';
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePhoneChange = (val: string) => {
    // Only allow numbers and limit strictly to 10 digits
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    if (fieldErrors.phone) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
  };

  const handleTaxIdChange = (val: string) => {
    // Auto uppercase and alphanumeric only, max 15 characters
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
    setTaxId(clean);
    if (fieldErrors.taxId) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.taxId;
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
      await customerApi.createCustomer(businessId, {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        taxId: taxId.trim().toUpperCase() || undefined,
      });
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setTaxId('');
      setFieldErrors({});
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register customer');
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
            <h2 className="text-base font-semibold text-zinc-900">Register New Customer</h2>
            <p className="text-xs text-zinc-500">Track client credit limits, invoices, and payment reliability.</p>
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
              <label className="block text-xs font-medium text-zinc-700">Customer / Company Name *</label>
              <span className="text-[10px] text-zinc-400">{name.length}/100</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Acme Industrial Corp"
              value={name}
              maxLength={100}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => {
                    const n = { ...prev };
                    delete n.name;
                    return n;
                  });
                }
              }}
              className={`w-full rounded-md border px-3 py-2 text-xs text-zinc-900 focus:outline-none ${
                fieldErrors.name ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-zinc-300 bg-white focus:border-zinc-900'
              }`}
              required
            />
            {fieldErrors.name && (
              <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="billing@acme.com"
                value={email}
                maxLength={100}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => {
                      const n = { ...prev };
                      delete n.email;
                      return n;
                    });
                  }
                }}
                className={`w-full rounded-md border px-3 py-2 text-xs text-zinc-900 focus:outline-none ${
                  fieldErrors.email ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-zinc-300 bg-white focus:border-zinc-900'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-zinc-700">Phone (10 Digits)</label>
                <span className="text-[10px] text-zinc-400">{phone.length}/10</span>
              </div>
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                maxLength={10}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-xs text-zinc-900 font-mono focus:outline-none ${
                  fieldErrors.phone ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-zinc-300 bg-white focus:border-zinc-900'
                }`}
              />
              {fieldErrors.phone ? (
                <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.phone}</p>
              ) : (
                <p className="mt-1 text-[10px] text-zinc-400">Strictly 10 digits (6-9)</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-zinc-700">GSTIN / Tax ID</label>
              <span className="text-[10px] text-zinc-400">{taxId.length}/15</span>
            </div>
            <input
              type="text"
              placeholder="e.g. 27ABCDE1234F1Z5"
              value={taxId}
              maxLength={15}
              onChange={(e) => handleTaxIdChange(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 text-xs text-zinc-900 font-mono tracking-wider focus:outline-none ${
                fieldErrors.taxId ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-zinc-300 bg-white focus:border-zinc-900'
              }`}
            />
            {fieldErrors.taxId ? (
              <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.taxId}</p>
            ) : (
              <p className="mt-1 text-[10px] text-zinc-400">15-char GSTIN or 10-char PAN</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-zinc-700">Billing Address</label>
              <span className="text-[10px] text-zinc-400">{address.length}/255</span>
            </div>
            <textarea
              rows={2}
              placeholder="Full billing street address, city, state"
              value={address}
              maxLength={255}
              onChange={(e) => setAddress(e.target.value)}
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
              {isLoading ? 'Saving...' : 'Register Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
