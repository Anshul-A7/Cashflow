-- ==============================================================================
-- CashFlow-Guardian PostgreSQL / Supabase Schema Definition
-- Fully normalized, ACID compliant, production ready schema
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_BUSINESS_OWNER',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    tax_id VARCHAR(50),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    address VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30),
    address VARCHAR(255),
    tax_id VARCHAR(50),
    payment_reliability_score NUMERIC(5, 2) DEFAULT 100.00,
    average_days_late NUMERIC(5, 2) DEFAULT 0.00,
    risk_tier VARCHAR(30) NOT NULL DEFAULT 'LOW_RISK',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Cash Accounts Table
CREATE TABLE IF NOT EXISTS cash_accounts (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(30) NOT NULL,
    account_number VARCHAR(50),
    bank_name VARCHAR(100),
    current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) DEFAULT 0.00,
    discount_amount NUMERIC(15, 2) DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL,
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    notes VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    line_total NUMERIC(15, 2) NOT NULL
);

-- 7. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    cash_account_id BIGINT REFERENCES cash_accounts(id) ON DELETE SET NULL,
    category VARCHAR(40) NOT NULL,
    payee VARCHAR(150) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    expense_date DATE NOT NULL,
    due_date DATE,
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_frequency VARCHAR(30),
    description VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 8. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    invoice_id BIGINT REFERENCES invoices(id) ON DELETE SET NULL,
    cash_account_id BIGINT NOT NULL REFERENCES cash_accounts(id) ON DELETE RESTRICT,
    payment_date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    reference_number VARCHAR(100),
    notes VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 9. AI Insights Table
CREATE TABLE IF NOT EXISTS ai_insights (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    insight_type VARCHAR(40) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    actionable_advice TEXT,
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message VARCHAR(500) NOT NULL,
    reference_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_business_status ON invoices(business_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_expenses_business_date ON expenses(business_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_payments_business_date ON payments(business_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_customers_business ON customers(business_id);

