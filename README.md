# CashFlow-Guardian (CG)

<div align="center">

![Java](https://img.shields.io/badge/Java-21-orange.svg?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-19.0-blue.svg?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38bdf8.svg?style=flat-square&logo=tailwindcss)
![Google Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blueviolet.svg?style=flat-square&logo=google)
![License](https://img.shields.io/badge/License-Apache%202.0-lightgrey.svg?style=flat-square)

**Autonomous Enterprise Cash Flow & Predictive Liquidity Intelligence Engine**  
*Built for small-to-midsize businesses to monitor receivables, forecast cash positions, prevent overdrafts, and evaluate customer payment reliability.*

</div>

---

## 📋 Table of Contents
- [Executive Overview](#-executive-overview)
- [System Architecture](#-system-architecture)
- [Core Features & Modules](#-core-features--modules)
- [⚡ 1-Click Quickstart (Windows)](#-1-click-quickstart-windows)
- [💻 Cross-Platform Setup (macOS / Linux)](#-cross-platform-setup-macos--linux)
- [🤖 Google Gemini AI Advisor Configuration](#-google-gemini-ai-advisor-configuration)
- [📡 Live API & Swagger Documentation](#-live-api--swagger-documentation)
- [🗄️ Database Management & PostgreSQL Migration](#️-database-management--postgresql-migration)
- [📁 Project Directory Structure](#-project-directory-structure)
- [🛡️ Security Architecture](#️-security-architecture)
- [👥 Contributing & Author](#-contributing--author)

---

## 🌟 Executive Overview

**CashFlow-Guardian** is an institutional-grade financial liquidity cockpit. Most small-to-midsize businesses fail not due to lack of profitability, but because of cash flow timing mismatches. CashFlow-Guardian solves this by continuously synchronizing accounts receivable, tracking burn velocity, forecasting 30-day liquidity horizons under multiple economic scenarios, and computing algorithmic payment reliability scores for every customer.

### Design Philosophy
- **Swiss Minimalist Aesthetic**: High-contrast, typography-driven UI (`#000000` on `#FFFFFF`) with subtle micro-interactions and zero visual clutter.
- **Real-Time Data Integrity**: Strict double-entry financial synchronization, tenant-isolated multi-workspace architecture, and persistent storage. Zero mock or placeholder data.
- **Hybrid Intelligence**: Operates offline out-of-the-box with a deterministic liquidity heuristic engine, with seamless optional upgrade to **Google Gemini 1.5 Flash** for generative CFO-level strategic recommendations.

---

## 🏗️ System Architecture

```
                                 [ Browser Client (Port 3000) ]
                                                │
                                    React 19 + TypeScript + Vite
                                        Tailwind CSS v4
                                                │
                                    REST APIs (Stateless JWT)
                                                ▼
                     [ Spring Boot 3.3.5 Application Server (Port 8080) ]
                      ┌───────────────────────────────────────────────┐
                      │  • Security Filter Chain (BCrypt + HMAC-512)  │
                      │  • Multi-Tenant Business Isolation            │
                      │  • Double-Entry Accounting Core               │
                      │  • CPBI Credit Scoring Engine                 │
                      │  • 30-Day Liquidity Horizon Simulator         │
                      └───────────────────────┬───────────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
     [ Persistent Embedded Storage ]                     [ External AI Gateway ]
        H2 File Database / PostgreSQL                      Google Gemini 1.5 Flash API
     (jdbc:h2:file:./data/cashflowdb)                 (Dynamic Generative CFO Audits)
```

---

## 🎯 Core Features & Modules

### 1. Unified Liquidity Telemetry
- Real-time **Available Cash**, **Accounts Receivable (AR)**, and **Runway & Health Score** metrics.
- Automatic notification center alerting owners about impending cash crunches, overdue collections, and burn rate spikes.

### 2. Invoicing & Receivables Aging (AR)
- Complete invoice lifecycle: `DRAFT` ➔ `SENT` ➔ `PAID` ➔ `OVERDUE` ➔ `VOID`.
- Automatic aging classification: **Current (0-30 days)**, **31-60 days**, **61-90 days**, and **90+ days critical debt**.
- Instant invoice generation with itemized line items, GSTIN / Tax tracking, and PDF ledger export.

### 3. Outflows & Operating Expenses (AP)
- Comprehensive expense ledger with category tagging (Payroll, Cloud Infrastructure, Legal, Marketing, Facilities).
- Real-time net burn rate velocity calculation to estimate runway accurately.

### 4. Customer CPBI (Credit & Payment Behavior Index)
- Proprietary algorithmic risk engine scoring customers from **0 to 100**.
- Analyzes on-time settlement history, average payment delay days, and invoice volume to categorize customers into **Low Risk**, **Moderate Risk**, or **High Default Risk**.

### 5. 30-Day Cash Flow Horizon
- Daily balance forecasting accounting for scheduled payment inflows and recurring operational expenses.
- Scenario stress-testing:
  - **Expected Case**: Standard collections model.
  - **Pessimistic Case**: 40% receivables delay + emergency expense shock.
  - **Optimistic Case**: Accelerated 100% receivables settlement.

### 6. Dual-Mode AI Strategic Advisor
- **Deterministic Heuristic Mode**: Instant offline mathematical audit of working capital efficiency, DSO (Days Sales Outstanding), and cash buffer adequacy.
- **Google Gemini Generative Mode**: Real-time generative advisory assessing macroeconomic risks, vendor terms negotiation, and liquidity runway extension tactics.

### 7. Multi-Entity Workspace & Profile Administration
- Manage multiple corporate subsidiaries, LLCs, or independent entities under a single owner login.
- Configurable base ledger currency (`INR ₹`, `USD $`, `EUR €`, `GBP £`) and official tax IDs (`GSTIN` / `PAN`).

---

## ⚡ 1-Click Quickstart (Windows)

Anyone can clone and run CashFlow-Guardian in under two minutes with automated one-click scripts.

### Prerequisites
- **Java JDK 21+** ([Download Eclipse Temurin 21](https://adoptium.net/temurin/releases/?version=21))
- **Node.js 18+ LTS** ([Download Node.js](https://nodejs.org))
- **Git** ([Download Git](https://git-scm.com))

### Step 1: Clone the Repository
```cmd
git clone https://github.com/Anshul-A7/Cashflow.git
cd Cashflow
```

### Step 2: Run the Automated Installer
Double-click `install.bat` or run:
```cmd
install.bat
```
*What the installer does automatically:*
- Validates Java JDK 21+ and Node.js in system `PATH`.
- Generates your local `.env` configuration from `.env.example`.
- Creates local embedded database directories (`backend\data`).
- Downloads Gradle dependencies and compiles the backend executable JAR.
- Installs all frontend npm packages and generates the production bundle.
- **Smart cache check**: Won't re-download or rebuild if already built!

### Step 3: Launch the Application
Double-click `run.bat` or run:
```cmd
run.bat
```
*What the runner does automatically:*
- Verifies all binaries and environment settings.
- Starts the Spring Boot backend on **Port 8080**.
- Starts the Vite frontend on **Port 3000**.
- Launches your default web browser directly to `http://localhost:3000`.

### Step 4: Graceful Shutdown
To cleanly stop all background services:
Double-click `stop.bat` or run:
```cmd
stop.bat
```

---

## 💻 Cross-Platform Setup (macOS / Linux)

For macOS and Linux systems, use the standard command-line tools:

```bash
# 1. Clone repository
git clone https://github.com/Anshul-A7/Cashflow.git
cd Cashflow

# 2. Setup environment
cp .env.example .env
mkdir -p backend/data

# 3. Build Backend
cd backend
chmod +x gradlew
./gradlew bootJar -x test
cd ..

# 4. Build Frontend
cd frontend
npm install
npm run build
cd ..

# 5. Run Backend (Terminal 1)
java -jar backend/build/libs/cashflow-guardian-backend-1.0.0-SNAPSHOT.jar --spring.profiles.active=h2

# 6. Run Frontend (Terminal 2)
cd frontend
npm run dev -- --port 3000 --host
```

---

## 🤖 Google Gemini AI Advisor Configuration

CashFlow-Guardian works out of the box with its built-in mathematical engine. To enable live Generative AI CFO analysis:

1. Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Open the `.env` file in the root folder of CashFlow:
   ```env
   # Google Gemini AI Configuration
   GEMINI_API_KEY=AIzaSyYourGeneratedGeminiApiKeyHere
   GEMINI_MODEL=gemini-1.5-flash
   ```
3. Restart via `run.bat`. The engine will instantly recognize the key and stream real-time generative cash flow diagnostics.

---

## 📡 Live API & Swagger Documentation

When the backend is active, complete interactive OpenAPI documentation is available:

- **Swagger UI Interactive Explorer**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **OpenAPI v3 JSON Spec**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

### Primary API Routes:
| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | `POST` | Register new business workspace & admin account |
| `/api/auth/login` | `POST` | Authenticate and obtain JWT token |
| `/api/auth/profile` | `PUT` | Update user name, email, and password |
| `/api/auth/business/{id}` | `PUT` | Update workspace legal name, tax ID, phone, address |
| `/api/businesses/{id}/dashboard/summary` | `GET` | Live telemetry (Cash, Receivables, Overdue, Health) |
| `/api/businesses/{id}/invoices` | `GET`, `POST` | Manage receivables ledger & issue invoices |
| `/api/businesses/{id}/expenses` | `GET`, `POST` | Manage operating expenses & burn rate |
| `/api/businesses/{id}/payments` | `POST` | Record inbound customer invoice settlements |
| `/api/businesses/{id}/customers/cpbi` | `GET` | Algorithmic customer payment behavior index |
| `/api/businesses/{id}/forecast/horizon` | `GET` | 30-day multi-scenario cash projection |
| `/api/businesses/{id}/ai/advisor` | `POST` | Trigger Gemini / Heuristic strategic CFO audit |

---

## 🗄️ Database Management & PostgreSQL Migration

### Embedded H2 Database Console (Default)
Out-of-the-box, data is persisted to an embedded file database stored in `backend/data/cashflowdb.mv.db`.
- **H2 Web Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- **JDBC URL**: `jdbc:h2:file:./data/cashflowdb`
- **Username**: `sa`
- **Password**: *(leave blank)*

### External PostgreSQL / Supabase Migration
To connect to an external production PostgreSQL database, update `.env`:
```env
DB_URL=jdbc:postgresql://your-db-host:5432/cashflow_guardian
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password
```
Spring Boot will automatically configure the HikariCP connection pool and run Hibernate DDL migrations on startup.

---

## 📁 Project Directory Structure

```
Cashflow/
├── backend/                               # Spring Boot 3.3.5 Java Backend
│   ├── src/main/java/com/cashflowguardian/app/
│   │   ├── config/                        # Security & WebMvc configuration
│   │   ├── controller/                    # REST API controllers
│   │   ├── dto/                           # Request & Response DTOs
│   │   ├── entity/                        # JPA Hibernate data entities
│   │   ├── repository/                    # Spring Data JPA repositories
│   │   └── service/                       # Business logic, CPBI, Forecast, Gemini AI
│   ├── src/main/resources/
│   │   ├── application.properties         # Core backend configuration
│   │   └── application-h2.properties      # Persistent H2 file profile
│   ├── build.gradle                       # Gradle dependencies & tasks
│   └── gradlew.bat / gradlew              # Embedded Gradle wrapper
│
├── frontend/                              # React 19 + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/                    # Header, Sidebar, Navigation, Modals
│   │   ├── context/                       # AuthContext & Session management
│   │   ├── pages/                         # Dashboard, Invoices, Expenses, Forecast, AI
│   │   ├── services/                      # Axios API client & interceptors
│   │   └── types/                         # TypeScript interfaces & enums
│   ├── package.json                       # Frontend dependencies
│   └── vite.config.ts                     # Vite build & proxy configuration
│
├── .env.example                           # Template environment configuration
├── .gitignore                             # Production repository exclusions
├── install.bat                            # 1-Click zero-hassle installer (Windows)
├── run.bat                                # 1-Click launcher (Windows)
├── stop.bat                               # 1-Click graceful shutdown (Windows)
├── CashFlow-Guardian.pdf                  # System presentation & architecture guide
└── README.md                              # Repository documentation
```

---

## 🛡️ Security Architecture

1. **Stateless JWT Authentication**: Passwords hashed using industry-standard `BCrypt`. Cryptographic tokens signed with HMAC-SHA512.
2. **Tenant Isolation**: Every database query is scoped strictly to the authenticated `business_id` to prevent cross-tenant data leakage.
3. **No Leaked Credentials**: `.gitignore` strictly protects `.env`, local database files (`*.mv.db`), system logs, and private keys.
4. **Input Sanitization**: Strict validation on tax IDs (GSTIN/PAN), invoice totals, email addresses, and currency codes.

---

## 👥 Contributing & Author

Developed and maintained by **[Anshul-A7](https://github.com/Anshul-A7)**.

Contributions, issues, and feature requests are welcome!
Feel free to open an issue or submit a pull request on the [GitHub Repository](https://github.com/Anshul-A7/Cashflow).

### License
This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
