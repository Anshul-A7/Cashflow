export type AccountType = 
  | 'BANK_CHECKING'
  | 'BANK_SAVINGS'
  | 'PETTY_CASH'
  | 'PAYMENT_GATEWAY'
  | 'DIGITAL_WALLET';

export type InvoiceStatus = 
  | 'DRAFT'
  | 'SENT'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export type PaymentMethod = 
  | 'BANK_TRANSFER'
  | 'UPI'
  | 'CASH'
  | 'CHEQUE'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'NET_BANKING'
  | 'OTHER';

export type ExpenseCategory = 
  | 'RENT'
  | 'SALARIES'
  | 'ELECTRICITY_AND_UTILITIES'
  | 'OFFICE_SUPPLIES'
  | 'MARKETING_AND_ADS'
  | 'TAXES_AND_DUTIES'
  | 'SOFTWARE_AND_SUBSCRIPTIONS'
  | 'RAW_MATERIALS_AND_INVENTORY'
  | 'TRAVEL_AND_LOGISTICS'
  | 'MAINTENANCE_AND_REPAIRS'
  | 'LEGAL_AND_PROFESSIONAL'
  | 'OTHER';

export type CustomerRiskTier = 
  | 'LOW_RISK'
  | 'MODERATE_RISK'
  | 'CHRONIC_LATE'
  | 'CRITICAL_DEFAULT_RISK';

export type InsightType = 
  | 'LIQUIDITY_SURPLUS'
  | 'CASH_SHORTAGE_WARNING'
  | 'EXPENSE_SPIKE'
  | 'LATE_PAYMENT_RISK'
  | 'TAX_PROVISION'
  | 'RECEIVABLE_ACCELERATION'
  | 'GENERAL_ADVISORY';

export type NotificationType = 
  | 'INVOICE_DUE_SOON'
  | 'INVOICE_OVERDUE'
  | 'EXPENSE_DUE_SOON'
  | 'LOW_CASH_WARNING'
  | 'PAYMENT_RECEIVED'
  | 'AI_FINANCIAL_INSIGHT';

export interface Business {
  id: number;
  name: string;
  taxId?: string;
  currency: string;
  address?: string;
  phone?: string;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  businesses: Business[];
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  fullName: string;
  activeBusinessId: number;
  activeBusinessName: string;
  businesses: Business[];
}

export interface Customer {
  id: number;
  businessId: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentReliabilityScore: number;
  averageDaysLate: number;
  riskTier: CustomerRiskTier;
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  createdAt: string;
}

export interface CashAccount {
  id: number;
  businessId: number;
  accountName: string;
  accountType: AccountType;
  accountNumber?: string;
  bankName?: string;
  currentBalance: number;
  updatedAt: string;
}

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Invoice {
  id: number;
  businessId: number;
  customerId: number;
  customerName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  status: InvoiceStatus;
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface Expense {
  id: number;
  businessId: number;
  cashAccountId?: number;
  cashAccountName?: string;
  category: ExpenseCategory;
  payee: string;
  amount: number;
  expenseDate: string;
  dueDate?: string;
  isPaid: boolean;
  isRecurring: boolean;
  recurringFrequency?: string;
  description?: string;
  createdAt: string;
}

export interface Payment {
  id: number;
  businessId: number;
  customerId: number;
  customerName: string;
  invoiceId?: number;
  invoiceNumber?: string;
  cashAccountId: number;
  cashAccountName: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface WeeklyForecastPoint {
  weekLabel: string;
  startDate: string;
  endDate: string;
  expectedInflow: number;
  expectedOutflow: number;
  projectedCash: number;
  isDeficit: boolean;
}

export interface CashFlowForecastResponse {
  currentCashBalance: number;
  totalOutstandingReceivables: number;
  totalUpcomingPayables: number;
  minimumProjectedCash: number;
  hasLiquidityRisk: boolean;
  estimatedRunwayDays: number;
  weeklyForecast: WeeklyForecastPoint[];
}

export interface CustomerBehaviorDto {
  customerId: number;
  customerName: string;
  email?: string;
  reliabilityScore: number;
  averageDaysLate: number;
  riskTier: CustomerRiskTier;
  totalInvoicesIssued: number;
  totalInvoicesPaid: number;
  overdueInvoicesCount: number;
  totalBilled: number;
  totalCollected: number;
  currentOutstandingBalance: number;
  behavioralSummary: string;
  recommendedCollectionAction: string;
}

export interface AiInsightDto {
  id: number;
  insightType: InsightType;
  title: string;
  content: string;
  actionableAdvice?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  generatedAt: string;
}

export interface MonthlyTrendPoint {
  month: string;
  income: number;
  expense: number;
  netCashFlow: number;
}

export interface ExpenseCategoryPoint {
  category: ExpenseCategory;
  categoryLabel: string;
  totalAmount: number;
  percentage: number;
}

export interface DashboardSummaryResponse {
  cashBalance: number;
  totalReceivables: number;
  upcomingExpenses: number;
  overdueInvoices: number;
  netCashFlowThisMonth: number;
  estimatedRunwayDays: number;
  totalCustomers: number;
  pendingInvoicesCount: number;
  overdueInvoicesCount: number;
  invoiceStatusDistribution: Record<string, number>;
  incomeVsExpenseTrend: MonthlyTrendPoint[];
  forecast: CashFlowForecastResponse;
  recentInsights: AiInsightDto[];
  expenseBreakdown: ExpenseCategoryPoint[];
}

export interface AiDiagnosticResponse {
  financialHealthScore: number;
  liquidityStatus: 'EXCELLENT' | 'STABLE' | 'VULNERABLE' | 'CRITICAL';
  executiveSummary: string;
  identifiedRisks: string[];
  strategicRecommendations: string[];
  calculatedRunwayDays: number;
  generatedInsights: AiInsightDto[];
  isAiGenerated: boolean;
}

export interface NotificationDto {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: number;
  isRead: boolean;
  createdAt: string;
}

