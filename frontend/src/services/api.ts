import axios, { AxiosError } from 'axios';
import {
  AuthResponse,
  CashAccount,
  CashFlowForecastResponse,
  Customer,
  CustomerBehaviorDto,
  DashboardSummaryResponse,
  Expense,
  ExpenseCategoryPoint,
  Invoice,
  InvoiceStatus,
  Payment,
  AiDiagnosticResponse,
  AiInsightDto,
  NotificationDto,
  User,
} from '../types';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; fieldErrors?: Record<string, string>; error?: string }>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    let message = '';

    // 1. Extract backend field validation errors if present
    if (data?.fieldErrors && typeof data.fieldErrors === 'object') {
      const fieldList = Object.values(data.fieldErrors).filter(Boolean);
      if (fieldList.length > 0) {
        message = fieldList.join('. ');
      }
    }

    // 2. Extract backend structured message if present (and not a raw status string)
    if (!message && data?.message && typeof data.message === 'string') {
      if (!data.message.includes('status code') && !data.message.includes('JSON parse error') && !data.message.startsWith('No static resource')) {
        message = data.message;
      }
    }

    // 3. Fallback to clean human-friendly messages based on HTTP status code
    if (!message) {
      switch (status) {
        case 400:
          message = 'Invalid request parameters. Please verify your entered details.';
          break;
        case 401:
          message = 'Invalid email or password. Please verify your credentials or register a new workspace.';
          break;
        case 403:
          message = 'Access denied. You do not have permission to view or modify this workspace resource.';
          break;
        case 404:
          message = 'The requested business record or resource could not be found.';
          break;
        case 409:
          message = 'A business record with these details already exists.';
          break;
        case 422:
          message = 'Data validation failed. Please check the entered fields.';
          break;
        case 502:
        case 503:
        case 504:
          message = 'The financial server is initializing or temporarily busy. Please wait a moment and try again.';
          break;
        case 500:
          message = 'The server encountered a temporary issue. Please try again shortly.';
          break;
        default:
          if (error.code === 'ERR_NETWORK' || !error.response) {
            message = 'Unable to connect to the backend service. Please ensure the server is active and retry.';
          } else {
            message = 'An unexpected error occurred. Please refresh or try again.';
          }
      }
    }

    // Cleanse any residual technical strings or raw error strings
    if (message.includes('status code') || message.includes('AxiosError') || message.includes('ECONNREFUSED') || message.startsWith('<')) {
      message = 'The financial server is initializing or temporarily busy. Please wait a moment and try again.';
    }

    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/api/auth/login', { email, password });
    return res.data;
  },
  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    businessName: string;
    taxId?: string;
    currency?: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/api/auth/register', data);
    return res.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const res = await api.get<User>('/api/auth/me');
    return res.data;
  },
  updateProfile: async (data: { fullName?: string; newPassword?: string }): Promise<User> => {
    const res = await api.put<User>('/api/auth/profile', data);
    return res.data;
  },
  updateBusiness: async (businessId: number, data: Partial<any>): Promise<any> => {
    const res = await api.put<any>(`/api/auth/business/${businessId}`, data);
    return res.data;
  },
  createBusiness: async (data: Partial<any>): Promise<any> => {
    const res = await api.post<any>('/api/auth/business', data);
    return res.data;
  },
};

export const dashboardApi = {
  getSummary: async (businessId: number): Promise<DashboardSummaryResponse> => {
    const res = await api.get<DashboardSummaryResponse>(`/api/dashboard/${businessId}`);
    return res.data;
  },
};

export const customerApi = {
  getCustomers: async (businessId: number): Promise<Customer[]> => {
    const res = await api.get<Customer[]>(`/api/customers/${businessId}`);
    return res.data;
  },
  createCustomer: async (businessId: number, data: Partial<Customer>): Promise<Customer> => {
    const res = await api.post<Customer>(`/api/customers/${businessId}`, data);
    return res.data;
  },
  updateCustomer: async (businessId: number, customerId: number, data: Partial<Customer>): Promise<Customer> => {
    const res = await api.put<Customer>(`/api/customers/${businessId}/${customerId}`, data);
    return res.data;
  },
  deleteCustomer: async (businessId: number, customerId: number): Promise<void> => {
    await api.delete(`/api/customers/${businessId}/${customerId}`);
  },
  getCustomerBehavior: async (businessId: number): Promise<CustomerBehaviorDto[]> => {
    const res = await api.get<CustomerBehaviorDto[]>(`/api/customers/${businessId}/behavior`);
    return res.data;
  },
};

export const cashAccountApi = {
  getAccounts: async (businessId: number): Promise<CashAccount[]> => {
    const res = await api.get<CashAccount[]>(`/api/accounts/${businessId}`);
    return res.data;
  },
  createAccount: async (businessId: number, data: {
    accountName: string;
    accountType: string;
    accountNumber?: string;
    bankName?: string;
    initialBalance: number;
  }): Promise<CashAccount> => {
    const res = await api.post<CashAccount>(`/api/accounts/${businessId}`, data);
    return res.data;
  },
  updateAccount: async (businessId: number, accountId: number, data: Partial<CashAccount>): Promise<CashAccount> => {
    const res = await api.put<CashAccount>(`/api/accounts/${businessId}/${accountId}`, data);
    return res.data;
  },
  deleteAccount: async (businessId: number, accountId: number): Promise<void> => {
    await api.delete(`/api/accounts/${businessId}/${accountId}`);
  },
};

export const invoiceApi = {
  getInvoices: async (businessId: number, status?: InvoiceStatus): Promise<Invoice[]> => {
    const res = await api.get<Invoice[]>(`/api/invoices/${businessId}`, {
      params: status ? { status } : undefined,
    });
    return res.data;
  },
  getInvoiceById: async (businessId: number, invoiceId: number): Promise<Invoice> => {
    const res = await api.get<Invoice>(`/api/invoices/${businessId}/${invoiceId}`);
    return res.data;
  },
  createInvoice: async (businessId: number, data: {
    customerId: number;
    invoiceNumber?: string;
    issueDate: string;
    dueDate: string;
    taxRate?: number;
    discountAmount?: number;
    notes?: string;
    items: { description: string; quantity: number; unitPrice: number }[];
  }): Promise<Invoice> => {
    const res = await api.post<Invoice>(`/api/invoices/${businessId}`, data);
    return res.data;
  },
  updateStatus: async (businessId: number, invoiceId: number, status: InvoiceStatus): Promise<Invoice> => {
    const res = await api.patch<Invoice>(`/api/invoices/${businessId}/${invoiceId}/status`, null, {
      params: { status },
    });
    return res.data;
  },
  deleteInvoice: async (businessId: number, invoiceId: number): Promise<void> => {
    await api.delete(`/api/invoices/${businessId}/${invoiceId}`);
  },
};

export const expenseApi = {
  getExpenses: async (businessId: number): Promise<Expense[]> => {
    const res = await api.get<Expense[]>(`/api/expenses/${businessId}`);
    return res.data;
  },
  createExpense: async (businessId: number, data: {
    category: string;
    payee: string;
    amount: number;
    expenseDate: string;
    dueDate?: string;
    isPaid?: boolean;
    cashAccountId?: number;
    isRecurring?: boolean;
    recurringFrequency?: string;
    description?: string;
  }): Promise<Expense> => {
    const res = await api.post<Expense>(`/api/expenses/${businessId}`, data);
    return res.data;
  },
  getCategoryBreakdown: async (businessId: number): Promise<ExpenseCategoryPoint[]> => {
    const res = await api.get<ExpenseCategoryPoint[]>(`/api/expenses/${businessId}/categories`);
    return res.data;
  },
  deleteExpense: async (businessId: number, expenseId: number): Promise<void> => {
    await api.delete(`/api/expenses/${businessId}/${expenseId}`);
  },
};

export const paymentApi = {
  getPayments: async (businessId: number): Promise<Payment[]> => {
    const res = await api.get<Payment[]>(`/api/payments/${businessId}`);
    return res.data;
  },
  recordPayment: async (businessId: number, data: {
    customerId: number;
    invoiceId?: number;
    cashAccountId: number;
    paymentDate: string;
    amount: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }): Promise<Payment> => {
    const res = await api.post<Payment>(`/api/payments/${businessId}`, data);
    return res.data;
  },
};

export const forecastApi = {
  getForecast: async (businessId: number): Promise<CashFlowForecastResponse> => {
    const res = await api.get<CashFlowForecastResponse>(`/api/forecast/${businessId}`);
    return res.data;
  },
  getPositionUntil: async (businessId: number, untilDate: string): Promise<{ projectedCash: number }> => {
    const res = await api.get(`/api/forecast/${businessId}/position`, {
      params: { untilDate },
    });
    return res.data;
  },
};

export const aiApi = {
  getInsights: async (businessId: number): Promise<AiInsightDto[]> => {
    const res = await api.get<AiInsightDto[]>(`/api/ai/${businessId}/insights`);
    return res.data;
  },
  runDiagnostic: async (businessId: number): Promise<AiDiagnosticResponse> => {
    const res = await api.post<AiDiagnosticResponse>(`/api/ai/${businessId}/diagnose`);
    return res.data;
  },
};

export const notificationApi = {
  getNotifications: async (businessId: number): Promise<NotificationDto[]> => {
    const res = await api.get<NotificationDto[]>(`/api/notifications/${businessId}`);
    return res.data;
  },
  getUnreadCount: async (businessId: number): Promise<number> => {
    const res = await api.get<{ unreadCount: number }>(`/api/notifications/${businessId}/unread-count`);
    return res.data.unreadCount;
  },
  markAsRead: async (businessId: number, notificationId: number): Promise<void> => {
    await api.patch(`/api/notifications/${businessId}/${notificationId}/read`);
  },
};

export default api;

