import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { CashAccountsPage } from './pages/CashAccountsPage';
import { CustomersPage } from './pages/CustomersPage';
import { ForecastPage } from './pages/ForecastPage';
import { AiAdvisorPage } from './pages/AiAdvisorPage';
import { ReportsPage } from './pages/ReportsPage';
import { WorkspacePage } from './pages/WorkspacePage';

// Modals
import { CreateInvoiceModal } from './components/modals/CreateInvoiceModal';
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { AddAccountModal } from './components/modals/AddAccountModal';
import { AddCustomerModal } from './components/modals/AddCustomerModal';
import { Invoice } from './types';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading, activeBusiness } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Modal Visibility States
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  // Refresh trigger counter to reload page data when modals close successfully
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white text-zinc-900">
        <div className="text-center space-y-2">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">Initializing CashFlow-Guardian...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !activeBusiness) {
    return <AuthPage />;
  }

  const currencySymbol = activeBusiness.currency === 'USD' ? '$' : '₹';

  const handleOpenPaymentWithInvoice = (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#FAFAFA] text-zinc-900 overflow-hidden font-sans">
      {/* Top Global Header */}
      <Header
        refreshKey={refreshKey}
        onOpenNewInvoice={() => setIsInvoiceModalOpen(true)}
        onOpenNewExpense={() => setIsExpenseModalOpen(true)}
        onOpenNewPayment={() => {
          setSelectedInvoiceForPayment(null);
          setIsPaymentModalOpen(true);
        }}
        onNavigateToWorkspace={() => setCurrentTab('workspace')}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Vertical Navigation */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Primary Page Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {currentTab === 'dashboard' && (
              <DashboardPage
                key={`dash-${refreshKey}-${activeBusiness.id}`}
                businessId={activeBusiness.id}
                currencySymbol={currencySymbol}
                onOpenNewInvoice={() => setIsInvoiceModalOpen(true)}
                onOpenNewExpense={() => setIsExpenseModalOpen(true)}
                onOpenNewPayment={() => {
                  setSelectedInvoiceForPayment(null);
                  setIsPaymentModalOpen(true);
                }}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'invoices' && (
              <InvoicesPage
                key={`inv-${refreshKey}-${activeBusiness.id}`}
                businessId={activeBusiness.id}
                currencySymbol={currencySymbol}
                onOpenCreateModal={() => setIsInvoiceModalOpen(true)}
                onOpenPaymentModal={handleOpenPaymentWithInvoice}
              />
            )}

            {currentTab === 'expenses' && (
              <ExpensesPage
                key={`exp-${refreshKey}-${activeBusiness.id}`}
                businessId={activeBusiness.id}
                currencySymbol={currencySymbol}
                onOpenAddModal={() => setIsExpenseModalOpen(true)}
              />
            )}

            {currentTab === 'payments' && (
              <PaymentsPage
                key={`pay-${refreshKey}-${activeBusiness.id}`}
                businessId={activeBusiness.id}
                currencySymbol={currencySymbol}
                onOpenRecordModal={() => {
                  setSelectedInvoiceForPayment(null);
                  setIsPaymentModalOpen(true);
                }}
              />
            )}

            {currentTab === 'accounts' && (
              <CashAccountsPage
                key={`acc-${refreshKey}-${activeBusiness.id}`}
                businessId={activeBusiness.id}
                currencySymbol={currencySymbol}
                onOpenAddModal={() => setIsAccountModalOpen(true)}
              />
            )}

            {currentTab === 'customers' && (
              <CustomersPage
                key={`cust-${refreshKey}-${activeBusiness.id}`}
                businessId={activeBusiness.id}
                currencySymbol={currencySymbol}
                onOpenAddModal={() => setIsCustomerModalOpen(true)}
              />
            )}

            {currentTab === 'forecast' && (
              <ForecastPage
                key={`fc-${refreshKey}-${activeBusiness.id}`}
                businessId={activeBusiness.id}
                currencySymbol={currencySymbol}
              />
            )}

            {currentTab === 'ai' && (
              <AiAdvisorPage
                key={`ai-${refreshKey}-${activeBusiness.id}`}
                businessId={activeBusiness.id}
                currencySymbol={currencySymbol}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsPage
                key={`rep-${refreshKey}-${activeBusiness.id}`}
                businessId={activeBusiness.id}
                currencySymbol={currencySymbol}
              />
            )}

            {currentTab === 'workspace' && (
              <WorkspacePage
                key={`ws-${refreshKey}-${activeBusiness.id}`}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CreateInvoiceModal
        businessId={activeBusiness.id}
        currencySymbol={currencySymbol}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSuccess={triggerRefresh}
        onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
      />

      <RecordPaymentModal
        businessId={activeBusiness.id}
        currencySymbol={currencySymbol}
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedInvoiceForPayment(null);
        }}
        onSuccess={triggerRefresh}
        preselectedInvoice={selectedInvoiceForPayment}
      />

      <AddExpenseModal
        businessId={activeBusiness.id}
        currencySymbol={currencySymbol}
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={triggerRefresh}
      />

      <AddAccountModal
        businessId={activeBusiness.id}
        currencySymbol={currencySymbol}
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSuccess={triggerRefresh}
      />

      <AddCustomerModal
        businessId={activeBusiness.id}
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={triggerRefresh}
      />
    </div>
  );
};

export default App;
