# Product Backlog - Payment Platform

**Product Name:** Ubiquitous Tribble Payment Platform
**Product Owner:** [Your Name]
**Scrum Master:** [Your Name]
**Team:** Solo Developer (Portfolio Project)
**Sprint Duration:** 2 weeks
**Velocity Target:** 40 story points per sprint (adjustable based on actual velocity)

---

## Table of Contents
1. [Epic Overview](#epic-overview)
2. [Sprint Planning](#sprint-planning)
3. [Epics & Features](#epics--features)
   - [EPIC-1: Core Infrastructure & Security](#epic-1-core-infrastructure--security)
   - [EPIC-2: User Management & Authentication](#epic-2-user-management--authentication)
   - [EPIC-3: Wallet & Account Management](#epic-3-wallet--account-management)
   - [EPIC-4: Payment Processing](#epic-4-payment-processing)
   - [EPIC-5: Transfer & Remittance](#epic-5-transfer--remittance)
   - [EPIC-6: Card Management](#epic-6-card-management)
   - [EPIC-7: Bank Integration](#epic-7-bank-integration)
   - [EPIC-8: Bill Payments](#epic-8-bill-payments)
   - [EPIC-9: Currency Exchange](#epic-9-currency-exchange)
   - [EPIC-10: Refunds & Disputes](#epic-10-refunds--disputes)
   - [EPIC-11: Fraud Detection](#epic-11-fraud-detection)
   - [EPIC-12: Reconciliation](#epic-12-reconciliation)
   - [EPIC-13: KYC & Compliance](#epic-13-kyc--compliance)
   - [EPIC-14: Notifications](#epic-14-notifications)
   - [EPIC-15: Reporting & Analytics](#epic-15-reporting--analytics)
   - [EPIC-16: Webhooks & Integration](#epic-16-webhooks--integration)
   - [EPIC-17: Mock Provider Service](#epic-17-mock-provider-service)

---

## Epic Overview

| Epic ID | Epic Name | Business Value | Story Points | Priority | Status |
|---------|-----------|----------------|--------------|----------|--------|
| EPIC-1 | Core Infrastructure & Security | Critical - Foundation for all features | 120 | P0 | In Progress |
| EPIC-2 | User Management & Authentication | Critical - User access control | 80 | P0 | Not Started |
| EPIC-3 | Wallet & Account Management | Critical - Core financial operations | 100 | P0 | Not Started |
| EPIC-4 | Payment Processing | High - Revenue generation | 130 | P1 | Not Started |
| EPIC-5 | Transfer & Remittance | High - Core feature | 110 | P1 | Not Started |
| EPIC-6 | Card Management | High - User convenience | 90 | P1 | Not Started |
| EPIC-7 | Bank Integration | High - Fiat on/off ramp | 100 | P1 | Not Started |
| EPIC-8 | Bill Payments | Medium - Additional revenue | 70 | P2 | Not Started |
| EPIC-9 | Currency Exchange | High - International support | 80 | P1 | Not Started |
| EPIC-10 | Refunds & Disputes | High - Customer satisfaction | 90 | P1 | Not Started |
| EPIC-11 | Fraud Detection | Critical - Risk management | 100 | P0 | Not Started |
| EPIC-12 | Reconciliation | Critical - Financial accuracy | 110 | P0 | Not Started |
| EPIC-13 | KYC & Compliance | Critical - Regulatory compliance | 90 | P0 | Not Started |
| EPIC-14 | Notifications | Medium - User engagement | 60 | P2 | Not Started |
| EPIC-15 | Reporting & Analytics | Medium - Business intelligence | 80 | P2 | Not Started |
| EPIC-16 | Webhooks & Integration | Medium - Developer experience | 50 | P2 | Not Started |
| EPIC-17 | Mock Provider Service | Critical - Development enablement | 140 | P0 | In Progress |
| EPIC-18 | Modern Payment Methods | High - QR codes, payment links | 25 | P1 | Not Started |
| EPIC-19 | Batch Processing | High - Bulk payments | 35 | P1 | Not Started |
| EPIC-20 | Mobile Money | High - MTN MoMo, Airtel, M-Pesa | 35 | P1 | Not Started |
| EPIC-21 | Recurring Payments | High - Standing orders, direct debit | 20 | P1 | Not Started |
| EPIC-22 | Customer Experience | Critical - Support system | 35 | P0 | Not Started |
| EPIC-23 | E-commerce Integration | Medium - Plugins | 15 | P2 | Not Started |
| EPIC-24 | Internationalization | Medium - Multi-language | 10 | P2 | Not Started |

**Total Estimated Story Points:** ~1,963 (includes all new sprints 24-33: +315 SP)
**Estimated Duration:** 33 sprints (67 weeks / ~16 months including security & enhancements)

---

## Sprint Planning

### Sprint 0: Foundation (COMPLETED ✅)
**Goal:** Set up development environment and infrastructure
**Story Points:** 40
**Duration:** Week 1-2

- ✅ Repository initialization
- ✅ Docker Compose setup
- ✅ CI/CD pipeline
- ✅ Shared libraries (constants, enums)
- ✅ NestJS application scaffolding (all 4 services)
- ✅ Security documentation

---

### Sprint 1: Core Security & Database Foundation
**Goal:** Implement security infrastructure and core database entities
**Story Points:** 45
**Duration:** Week 3-4
**Epics:** EPIC-1

---

### Sprint 2: User Authentication & Authorization
**Goal:** Complete user registration, login, and JWT-based auth
**Story Points:** 42
**Duration:** Week 5-6
**Epics:** EPIC-2

---

### Sprint 3: Multi-Factor Authentication & Session Management
**Goal:** Implement MFA (TOTP, SMS, Email) and secure session handling
**Story Points:** 38
**Duration:** Week 7-8
**Epics:** EPIC-2

---

### Sprint 4: Wallet Core & Ledger System
**Goal:** Build multi-currency wallet and double-entry ledger
**Story Points:** 45
**Duration:** Week 9-10
**Epics:** EPIC-3

---

### Sprint 5: Wallet Operations & Balance Management
**Goal:** Implement wallet operations (fund, withdraw, transfer)
**Story Points:** 40
**Duration:** Week 11-12
**Epics:** EPIC-3

---

### Sprint 6: Withdrawals & Bill Payments
**Goal:** Implement wallet withdrawal to bank accounts, bill payment services, and KYC verification workflows
**Story Points:** 45
**Duration:** Week 13-14
**Epics:** EPIC-5, EPIC-6, EPIC-7

---

### Sprint 6A: Mock Card Issuance Service Foundation (NEW)
**Goal:** Build production-grade mock card issuance service with complete transaction simulation
**Story Points:** 48
**Duration:** Week 13A-14A (2 weeks) - Inserted Sprint
**Epics:** EPIC-17

**Features:**
- Virtual card issuance with Luhn-valid card numbers
- Card lifecycle management (freeze, unfreeze, terminate, limits)
- Transaction authorization simulation with realistic decline scenarios
- Transaction settlement and batch processing
- Spending limit enforcement (daily, monthly, per-transaction)
- Test card numbers for all scenarios
- Provider swap interface for future Stripe/Sudo/Paystack integration

**Rationale:**
This sprint was added to provide a comprehensive mock card issuance service that:
- Saves $18,000-60,000 in provider fees during 12-month development
- Enables full card feature testing without external dependencies
- Provides a clean abstraction layer for future provider swaps
- Blocks Sprint 10 (Virtual Cards) - must be completed first

---

### Sprint 7: Notifications, Webhooks & Fraud Detection
**Goal:** Implement comprehensive notification system, webhook management for merchants, and fraud detection mechanisms
**Story Points:** 42
**Duration:** Week 15-16
**Epics:** EPIC-8, EPIC-9, EPIC-10

---

### Sprint 8: Payment Processing - Card Payments
**Goal:** Implement card payment processing with mock providers
**Story Points:** 43
**Duration:** Week 17-18
**Epics:** EPIC-4

---

### Sprint 9: Payment Processing - Bank Transfers
**Goal:** Implement bank transfer payments (NIP integration)
**Story Points:** 40
**Duration:** Week 19-20
**Epics:** EPIC-4, EPIC-7

---

### Sprint 10: Local & International Transfers
**Goal:** Build P2P transfer system (local and cross-border)
**Story Points:** 45
**Duration:** Week 21-22
**Epics:** EPIC-5

---

### Sprint 11: Card Management
**Goal:** Implement card linking, tokenization, and management
**Story Points:** 38
**Duration:** Week 23-24
**Epics:** EPIC-6

---

### Sprint 12: Bank Account Management
**Goal:** Build bank account linking and verification
**Story Points:** 40
**Duration:** Week 25-26
**Epics:** EPIC-7

---

### Sprint 13: Bill Payments
**Goal:** Implement airtime, data, utilities, cable TV payments
**Story Points:** 35
**Duration:** Week 27-28
**Epics:** EPIC-8

---

### Sprint 14: Currency Exchange & FX
**Goal:** Build FX rate engine and currency conversion
**Story Points:** 38
**Duration:** Week 29-30
**Epics:** EPIC-9

---

### Sprint 15: Refunds & Disputes - Part 1
**Goal:** Implement refund request and processing
**Story Points:** 40
**Duration:** Week 31-32
**Epics:** EPIC-10

---

### Sprint 16: Refunds & Disputes - Part 2
**Goal:** Build dispute management system
**Story Points:** 42
**Duration:** Week 33-34
**Epics:** EPIC-10

---

### Sprint 17: Fraud Detection
**Goal:** Implement rule-based fraud detection engine
**Story Points:** 45
**Duration:** Week 35-36
**Epics:** EPIC-11

---

### Sprint 18: Reconciliation Service
**Goal:** Build automated reconciliation engine
**Story Points:** 48
**Duration:** Week 37-38
**Epics:** EPIC-12

---

### Sprint 19: KYC & Compliance
**Goal:** Implement KYC verification and tier management
**Story Points:** 40
**Duration:** Week 39-40
**Epics:** EPIC-13

---

### Sprint 20: Notifications & Webhooks
**Goal:** Build notification system and webhook infrastructure
**Story Points:** 35
**Duration:** Week 41-42
**Epics:** EPIC-14, EPIC-16

---

### Sprint 21: Reporting & Analytics
**Goal:** Implement reports, dashboards, and analytics
**Story Points:** 38
**Duration:** Week 43-44
**Epics:** EPIC-15

---

### Sprint 22: Performance Optimization & Testing
**Goal:** Load testing, optimization, bug fixes
**Story Points:** 30
**Duration:** Week 45-46

---

### Sprint 23: Documentation & Deployment
**Goal:** Complete API docs, deployment guides, final polish
**Story Points:** 25
**Duration:** Week 47-48

---

### Sprint 24: Security Hardening & Penetration Testing (NEW)
**Goal:** Production security readiness - penetration testing, vulnerability scanning, SIEM setup
**Story Points:** 45
**Duration:** Week 49-50 (2 weeks)
**Epics:** EPIC-1 (Core Infrastructure & Security)

**Features:**
- Penetration testing engagement
- Vulnerability assessment and remediation
- SIEM/SOAR implementation (Wazuh/ELK Stack)
- WAF/DDoS protection (Cloudflare)
- Security audit and compliance checks
- SSL/TLS configuration hardening
- Rate limiting enhancement
- API security testing

**Rationale:**
Security hardening is CRITICAL before production launch. This sprint ensures:
- Identifies and fixes vulnerabilities before attackers do
- Meets PCI DSS and CBN security requirements
- Implements monitoring and alerting
- Protects against common attack vectors

**Cost:** $25,000-45,000 (penetration testing + security tools)

---

### Sprint 25: Security Monitoring & Incident Response (NEW)
**Goal:** Production monitoring, alerting, and incident response procedures
**Story Points:** 30
**Duration:** Week 51-52 (2 weeks)
**Epics:** EPIC-1

**Features:**
- 24/7 monitoring setup
- Alert configuration (PagerDuty/OpsGenie)
- Incident response playbooks
- Log aggregation and analysis
- Security dashboard
- Backup and disaster recovery testing

---

### Sprint 26: QR Code Payments & Payment Links (NEW)
**Goal:** Implement modern payment methods - QR codes and shareable payment links
**Story Points:** 25
**Duration:** Week 53-54 (2 weeks)
**Epics:** EPIC-18 (Modern Payment Methods)

**Features:**
- **Dynamic QR Code Generation:**
  - Real-time QR code generation for payment requests
  - QR codes with embedded amount, merchant info, reference
  - Support for PNG, SVG, Base64 formats
  - Customizable QR code design (logo, colors)
  - Single-use QR codes for security

- **Static Merchant QR Codes:**
  - Reusable QR codes for merchants (customer enters amount)
  - Merchant profile integration
  - Transaction tracking per QR code
  - QR code analytics (scans, successful payments)

- **QR Code Scanning & Processing:**
  - Mobile app QR scanner integration
  - QR code validation and decryption
  - Payment confirmation flow
  - Support for multiple QR code standards (EMVCo, NQR)

- **Shareable Payment Links:**
  - Generate unique payment URLs (pay.ubiquitous-tribble.com/xyz)
  - Customizable payment pages with branding
  - Social media sharing (WhatsApp, Twitter, Email)
  - Link tracking and analytics

- **Payment Link Expiry Management:**
  - Configurable expiry (1 hour, 24 hours, 7 days, custom)
  - Auto-disable after first payment (single-use links)
  - Link extension and renewal

- **Payment Link Analytics:**
  - Click-through rates, conversion rates
  - Payment success/failure tracking
  - Geographic distribution of payments
  - Popular payment methods per link

**Technical Implementation:**
- QR code library: qrcode npm package
- Short URL service: nanoid for unique IDs
- Database: payment_links, qr_codes tables
- API endpoints: POST /api/payments/qr, POST /api/payments/links
- Mobile SDK integration for QR scanning

**Cost:** $0 (free npm libraries)
**Business Impact:** 40% increase in peer-to-peer payments, reduced payment friction

---

### Sprint 27: Batch Payments & Mobile Money Mocks (NEW) ✅ COMPLETED
**Goal:** Bulk payment processing and mobile money integration preparation
**Story Points:** 35
**Duration:** Week 55-56 (2 weeks)
**Epics:** EPIC-19 (Batch Processing), EPIC-20 (Mobile Money)

**Features:**
- **Batch Payment Upload & Validation:**
  - CSV/Excel file upload (support 10K+ records)
  - 30+ validation rules (account number, amount, duplicate detection)
  - Real-time validation with error reporting
  - Preview before submission
  - Upload templates with sample data
  - Parse 10K records in < 30 seconds

- **Batch Approval Workflow (Maker-Checker):**
  - Dual control: maker cannot approve own batch
  - Amount-based approval rules (1-3 approvers based on total amount)
  - Email notifications on approval/rejection
  - Approval history and audit trail
  - Batch modification/deletion before approval

- **Scheduled Batch Execution:**
  - Cron-based batch processing (every minute)
  - Process 10K payments in < 5 minutes
  - Sequential processing to prevent race conditions
  - Retry logic for failed payments (max 3 attempts)
  - Batch status tracking (PENDING, PROCESSING, COMPLETED, FAILED)

- **Payout Batching Optimization:**
  - Group payments by provider for efficiency
  - Batch settlement with providers
  - Reduced transaction costs through batching
  - Real-time batch progress tracking

- **Mock MTN Mobile Money Service:**
  - Phone number validation (234803, 234806, 234810, 234813, 234814, 234816, 234903, 234906)
  - Transaction limits: ₦5K-₦200K, daily ₦500K
  - 1.5% transaction fee
  - Test scenarios via phone last digit (0=success, 1=pending, 2=insufficient, 3=error)
  - Deposit/withdrawal simulation with balance tracking

- **Mock Airtel Money & M-Pesa Services:**
  - Airtel Money: 1.75% fee, phone prefixes 234802, 234808, 234812, 234902, 234907
  - M-Pesa: 2% fee, ₦300K daily limit, phone prefixes 234709, 234817
  - Provider abstraction interface for easy mock/real swap
  - Comprehensive test scenarios for all providers

- **Mobile Money Analytics:**
  - Provider comparison (fees, limits, success rates)
  - Transaction volume by provider
  - Failed transaction analysis
  - Cost optimization recommendations

**Technical Implementation:**
- ExcelJS and csv-parser for file parsing
- PostgreSQL batch_payments, mobile_money_transactions tables
- @nestjs/schedule for cron jobs
- Multer for file uploads
- Provider abstraction pattern with factory
- 141 acceptance criteria, 131+ tests

**Database Schema:**
- batch_payments (id, user_id, batch_id, file_name, total_amount, status, scheduled_at)
- batch_payment_items (batch_id, recipient_account, amount, status, error_message)
- mobile_money_transactions (transaction_id, provider, phone, amount, status, fee)

**Cost:** $0 (mock services, real integration when profitable: $5K-15K saved during development)
**Business Impact:**
- Enable bulk disbursements for payroll, vendor payments
- Reach 80%+ Nigerian mobile money market (MTN, Airtel, M-Pesa)
- Cost savings: $5K-15K during development phase

---

### Sprint 28: Standing Orders & Direct Debit (NEW)
**Goal:** Recurring payment automation and mandate management
**Story Points:** 20
**Duration:** Week 57-58 (2 weeks)
**Epics:** EPIC-21 (Recurring Payments)

**Features:**
- Standing order creation
- Direct debit mandates
- Recurring payment scheduling
- Auto-charge processing
- Failed payment retry logic
- Subscription management

**Cost:** $0 (internal cron jobs)

---

### Sprint 29: Statement Generation & Export (NEW)
**Goal:** Transaction statements and data export capabilities
**Story Points:** 15
**Duration:** Week 59 (1 week)
**Epics:** EPIC-15 (Reporting & Analytics)

**Features:**
- PDF statement generation
- CSV transaction export
- Monthly/quarterly statements
- Account balance reports
- Custom date range reports

**Cost:** $0 (internal feature)

---

### Sprint 30: Compliance Automation - CBN & Tax (NEW) ✅ COMPLETED
**Goal:** Regulatory reporting and tax calculation automation
**Story Points:** 30
**Duration:** Week 60-61 (2 weeks)
**Epics:** EPIC-13 (KYC & Compliance)

**Features:**
- **CBN Monthly Regulatory Reporting:**
  - Automated CBN Monthly Statistical Return generation
  - Transaction volume and value aggregation
  - User statistics (active users, new registrations, KYC tiers)
  - Financial position reporting (assets, liabilities, equity)
  - Agent network statistics (if applicable)
  - Excel/PDF export in CBN-required format
  - Scheduled monthly submission workflow
  - Report validation against CBN guidelines

- **Tax Calculation & Withholding:**
  - VAT calculation (7.5% on applicable transactions)
  - Withholding Tax (WHT) calculation (5-10% based on transaction type)
  - Stamp duty calculation (₦50 for transactions >₦10K)
  - Tax period tracking (monthly, quarterly, annual)
  - Tax remittance reports for FIRS filing
  - Automated tax deduction on transactions
  - Tax exemption handling for qualifying transactions
  - Tax audit trail and reporting

- **Sanctions Screening Integration:**
  - OFAC (US Office of Foreign Assets Control) sanctions list screening
  - UN Consolidated Sanctions List screening
  - EU Sanctions List screening
  - Real-time screening on user registration and transactions
  - Fuzzy name matching (Levenshtein distance algorithm)
  - Match scoring with configurable thresholds (>80% = block, 60-80% = review)
  - False positive management (whitelist mechanism)
  - Sanctions screening audit log

- **AML Transaction Monitoring & SAR:**
  - Anti-Money Laundering (AML) rule engine with 7+ detection rules
  - Suspicious Activity Report (SAR) generation for NFIU
  - Transaction pattern analysis (velocity, structuring, round amounts)
  - High-risk customer flagging (PEP, high-risk countries)
  - Threshold monitoring (₦5M+ transactions auto-flagged)
  - Case management for suspicious transactions
  - SAR submission workflow with compliance officer approval
  - AML compliance dashboard with metrics

- **Regulatory Filing Automation:**
  - Auto-generate monthly CBN reports on 1st of each month
  - Tax filing reminders and due date tracking
  - EFCC quarterly reporting (if required)
  - NFIU SAR submissions (within 24 hours of detection)
  - Regulatory document repository
  - Filing history and status tracking

- **Compliance Dashboard:**
  - Real-time compliance status overview
  - Upcoming filing deadlines calendar
  - Sanctions screening match review queue
  - AML alerts and case management
  - Tax liability summary by period
  - Compliance risk indicators (KYC coverage, screening hit rate)
  - Executive compliance summary for board reporting

- **Audit Trail Enhancements:**
  - 7-year audit log retention (CBN requirement)
  - Immutable audit logs (append-only, tamper-proof)
  - Comprehensive event tracking (all compliance actions)
  - Audit log export for regulatory audits
  - Real-time audit monitoring and alerting
  - Compliance officer access logs

**Technical Implementation:**
- NestJS services: CBNReportingService, TaxCalculationService, SanctionsScreeningService, AMLMonitoringService
- PostgreSQL tables: cbn_reports, taxes, sanctions_screening_results, aml_alerts, sar_reports
- ExcelJS for CBN report Excel generation
- Cron jobs for monthly CBN report generation
- Levenshtein distance algorithm for name matching
- Redis caching for sanctions lists (refresh daily)
- 120+ acceptance criteria, 125+ tests

**Database Schema:**
- cbn_monthly_reports (id, report_month, transaction_volume, user_count, report_data_json, status, submitted_at)
- taxes (id, transaction_id, vat_amount, wht_amount, stamp_duty, tax_period, status)
- sanctions_screening (id, entity_name, screening_date, match_score, list_source, status, reviewed_by)
- aml_alerts (id, user_id, transaction_id, alert_type, risk_score, status, case_id)

**Regulatory Compliance:**
- CBN Circular on Payment Service Banks (PSB Guidelines)
- Nigeria Data Protection Regulation (NDPR)
- FIRS Tax Regulations (VAT, WHT)
- EFCC Money Laundering Prevention Act
- NFIU Guidelines on Suspicious Transaction Reporting

**Cost:** $0 (internal) + optional $500-2K/year for commercial sanctions data feeds (OFAC free via US Treasury website)
**Business Impact:**
- Avoid CBN penalties (₦1M-₦10M per violation)
- Tax compliance (avoid FIRS penalties: 10% of unpaid tax + interest)
- Prevent sanctioned entity transactions (avoid US$1M+ fines)
- Reduce AML/CFT risk (protection from ₦50M-₦100M EFCC penalties)
- Regulatory approval for scaling (CBN license compliance)
**Cost Savings:** Avoid manual reporting costs (₦500K-₦1M/year for consultants)

---

### Sprint 31: Customer Support System (NEW) ✅ COMPLETED
**Goal:** Comprehensive customer support ticket management with SLA tracking, multi-channel support, and knowledge base
**Story Points:** 35
**Duration:** Week 62-63 (2 weeks)
**Epics:** EPIC-22 (Customer Experience)

**Features:**
- **Support Ticket Creation & Multi-Channel Intake:**
  - In-app ticket creation form with validation (subject, category, description, attachments)
  - Email-to-ticket conversion (support@ubiquitous-tribble.com with Gmail API)
  - Web portal for guest ticket submission (reCAPTCHA v3, OTP verification)
  - Phone call logging by support agents
  - Ticket ID format: TKT-YYYYMMDD-XXXXX
  - Multi-channel tracking (IN_APP, EMAIL, WEB, PHONE)
  - File attachment support (5 files max, 10MB total, virus scanning with ClamAV)
  - Auto-categorization using rules (Account Issues, Transaction Failed, Card Problems, KYC, etc.)
  - Duplicate ticket detection (Levenshtein distance algorithm)
  - Priority auto-suggestion based on category and keywords

- **Agent Ticket Management & Response System:**
  - Agent dashboard with ticket queue (50 tickets/page, virtual scrolling)
  - Advanced filtering (status, priority, category, SLA status, date range, search)
  - Ticket detail view with 3 panels (Conversation, Context, Actions)
  - Customer context panel (profile, transactions, cards, previous tickets, risk score)
  - Rich text response editor (WYSIWYG, markdown, templates, attachments)
  - 20 pre-built response templates with variable replacement
  - Status transitions (NEW → OPEN → IN_PROGRESS → AWAITING_CUSTOMER → RESOLVED → CLOSED)
  - Priority management (URGENT, HIGH, MEDIUM, LOW) with SLA recalculation
  - Ticket assignment and round-robin routing
  - Escalation workflow (tier 2 support, manager notifications via email + Slack)
  - Internal notes with @mentions for team collaboration
  - Real-time updates via WebSockets
  - Keyboard shortcuts (Ctrl+R, Ctrl+Enter, J/K navigation)

- **SLA Tracking & Escalation:**
  - SLA deadlines by priority (Urgent: 2h, High: 8h, Medium: 24h, Low: 48h)
  - Business hours calculation (Mon-Fri 8AM-6PM WAT)
  - SLA pause when status = AWAITING_CUSTOMER
  - Warnings at 75%, 90%, 100% of SLA time elapsed
  - Notifications to agent and manager on SLA breach
  - Color-coded SLA indicators (green/yellow/red/flashing red)
  - SLA extension request workflow (agent requests, manager approves)

- **Knowledge Base & Self-Service Portal:**
  - Public KB portal at help.ubiquitous-tribble.com
  - Article CMS with rich text editor (headings, lists, links, images, code blocks, tables)
  - Version history and revert functionality
  - Full-text search with Elasticsearch (autocomplete, fuzzy matching, ranking)
  - Multi-language support (English, Yoruba, Hausa, Igbo) with Google Translate API
  - Article ratings (helpful/not helpful) with feedback collection
  - Related articles recommendation
  - Table of contents (TOC) auto-generation
  - Print/PDF export functionality
  - SEO optimization (meta tags, structured data, sitemap)
  - Target: 30% ticket deflection rate

- **Support Analytics & Reporting Dashboard:**
  - Manager dashboard with 6 KPIs (ticket volume, open tickets, avg response time, avg resolution time, SLA compliance, CSAT score)
  - Ticket volume trends chart (line chart with date range selector)
  - Distribution charts (category pie chart, priority bar chart, channel donut chart)
  - Agent performance metrics table (tickets assigned/resolved, response times, CSAT, SLA compliance)
  - Individual agent dashboards with goals tracking
  - SLA compliance report with breach table
  - Backlog aging analysis (0-1 day, 1-3 days, 3-7 days, 7-14 days, >14 days)
  - Custom report builder with export (PNG, CSV, PDF)
  - Real-time data refresh (WebSocket, 5-minute intervals)

- **Customer Satisfaction (CSAT) Survey:**
  - Post-ticket-closure survey via email (1-5 star rating)
  - Survey questions: resolution satisfaction, agent professionalism
  - Feedback comments collection
  - Low rating triggers manager review
  - CSAT analytics and trending

- **Notification System:**
  - Email notifications (ticket created, assigned, agent response, resolved, closed)
  - In-app notifications (real-time via WebSocket)
  - Push notifications for mobile app (Firebase Cloud Messaging)
  - Notification preferences management
  - Unsubscribe functionality for non-critical emails

- **Access Control (RBAC):**
  - SUPPORT_AGENT role: View assigned tickets, respond, change status
  - SUPPORT_TEAM_LEAD role: View team tickets, reassign, analytics
  - SUPPORT_MANAGER role: Full access, analytics, approval workflows
  - Customers: View own tickets only, create tickets, reopen closed tickets

**Technical Implementation:**
- NestJS services: TicketCreationService, TicketManagementService, KnowledgeBaseService, AnalyticsService
- PostgreSQL tables: support_tickets, ticket_messages, ticket_attachments, ticket_activity_log, kb_articles, kb_article_feedback, response_templates
- AWS S3 for file attachments (encrypted at rest, AES-256)
- ClamAV for virus scanning
- Elasticsearch for KB article search (or PostgreSQL full-text search as fallback)
- Gmail API for email-to-ticket conversion
- WebSockets for real-time updates
- Chart.js/Recharts for analytics visualizations
- 147 acceptance criteria, 146 tests (80 unit, 42 integration, 24 E2E)

**Database Schema:**
- support_tickets (id, ticket_id, user_id, subject, description, category, priority, status, channel, assigned_agent_id, sla_deadline, sla_breached, csat_rating)
- ticket_messages (id, ticket_id, sender_id, sender_type, message_body, is_internal, created_at)
- ticket_attachments (id, ticket_id, message_id, file_name, s3_key, s3_url, virus_scan_status)
- kb_articles (id, title, slug, category, tags, content, status, view_count, helpful_count, not_helpful_count)
- Materialized view: support_analytics_daily (refreshed nightly for performance)

**Performance Benchmarks:**
- Ticket creation API: < 500ms (95th percentile)
- Email-to-ticket conversion: < 30 seconds
- Dashboard load time: < 3 seconds
- KB article search: < 500ms
- Handle 1000 tickets/hour creation rate
- Support 50 concurrent agents

**Cost:** $0 (internal build) vs. $50-200/mo (Zendesk/Intercom)
**Infrastructure Cost:** $323/month (S3, Elasticsearch, Redis, Email service, ClamAV)
**Business Impact:**
- 30% ticket deflection via KB self-service
- Cost savings: ₦2M/month ($4K/month) reduced agent hiring needs
- CSAT improvement: 3.2 → 4.5/5.0 (40% increase)
- Agent productivity: 40% increase via automation
- SLA compliance target: 95%+
- Payback period: 1.75 months ($7K dev cost / $4K monthly savings)

---

### Sprint 32: Developer SDKs (NEW)
**Goal:** Multi-language SDKs for API integration
**Story Points:** 30
**Duration:** Week 64-65 (2 weeks)
**Epics:** EPIC-16 (Webhooks & Integration)

**Features:**
- Node.js SDK
- Python SDK
- PHP SDK
- Developer dashboard
- Enhanced API documentation
- Postman collections

**Cost:** $0

---

### Sprint 33: E-commerce Plugins & Multi-Language (NEW)
**Goal:** E-commerce platform integration and internationalization
**Story Points:** 25
**Duration:** Week 66-67 (2 weeks)
**Epics:** EPIC-23 (E-commerce Integration), EPIC-24 (Internationalization)

**Features:**
- WooCommerce plugin
- Shopify plugin
- Multi-language support (i18n)
- English, Yoruba, Hausa, Igbo translations
- Currency localization

**Cost:** $0 + translation services ($500-2K)

---

### Sprint 34: Payroll Management System (NEW)
**Goal:** Automated salary disbursement and payroll processing for businesses
**Story Points:** 30
**Duration:** Week 68-69 (2 weeks)
**Epics:** Business & Enterprise (New Epic Extension)

**Features:**
- **Employee Management Module:**
  - Add/edit/remove employees from payroll
  - Bank account details per employee (account number, bank code, account name)
  - Salary structure definition (basic salary, allowances, deductions)
  - Employment status tracking (active, suspended, terminated)
  - Employee bulk upload (CSV/Excel with 50+ fields)
  - Employee verification workflow (confirm bank details match CBN records)
  - Department and cost center assignment

- **Payroll Calculation Engine:**
  - Automated salary calculation with formula builder
  - Basic salary + allowances (housing, transport, lunch, performance bonus)
  - Deductions (tax - PAYE, pension - 8% CPS, NHF - 2.5%, health insurance - 5%)
  - Overtime calculation (1.5x rate for hours >40/week)
  - Leave deduction (unpaid leave, sick leave usage)
  - Loan deductions (track loan repayments)
  - Tax filing integration (generate PAYE reports for FIRS)
  - Gross to net salary calculation
  - Salary advance management (cap at 50% of monthly salary)

- **Payroll Schedule & Approval Workflow:**
  - Set payroll frequency (monthly, bi-weekly, weekly, custom dates)
  - Payroll period configuration (e.g., 25th of each month)
  - Schedule multi-month payroll runs in advance
  - HR submits payroll for approval
  - Manager reviews and approves (dual approval for >₦5M)
  - Finance approves fund allocation
  - System calculates exact settlement amounts per employee
  - Change request tracking (add/remove employees, salary adjustments mid-payroll)

- **Bulk Salary Disbursement (Batch Payments Integration):**
  - Auto-create batch payment from approved payroll
  - One-click settlement to all employee accounts
  - Fallback to manual transfers for problematic accounts
  - Reconciliation against batch payment status
  - Handle failed transfers (retry, manual intervention, reversal workflow)
  - Settlement confirmation per employee (email payslip + payment confirmation)
  - Multi-currency support (for expat employees: USD, GBP to NGN conversion)

- **Payslip Generation & Distribution:**
  - Auto-generate professional payslips (PDF format)
  - Payslip content: gross salary, deductions, net pay, leave balance, loan balance
  - Digital payslip repository (employee self-service portal)
  - Email payslips securely (encrypted link, OTP verification)
  - SMS notification of salary deposit
  - Payslip templates with company branding
  - Payslip history (searchable by date range)
  - Print-friendly format

- **Payroll Reporting & Compliance:**
  - Monthly payroll summary report (total payroll, deductions breakdown)
  - Employee payroll register (all employees, salaries, deductions)
  - Bank settlement report (matches batch payment reconciliation)
  - PAYE tax report for FIRS filing (form)
  - Pension contribution report for PENCOM
  - NHF contribution report for housing authority
  - Health insurance reconciliation report
  - Departmental payroll breakdown (costs by department)
  - Year-to-date payroll summary per employee (for loan/mortgage applications)
  - Export payroll data to Excel (for accounting integration)

- **Integration with HR Systems:**
  - API integration with BambooHR (sync employee data)
  - API integration with Workday (future)
  - Auto-fetch leave requests from HR system
  - Auto-sync employee master data changes
  - Webhook notifications for employee changes

- **Self-Service Portal for Employees:**
  - View own payslip (current and historical)
  - Download payslip as PDF
  - Verify salary details
  - View tax information
  - Request salary certificate (for loans, visa applications)
  - Update bank account details (employee-initiated changes, manager approval)
  - View leave balance and usage

- **Payroll Analytics & Insights:**
  - Payroll cost trend (monthly comparison, YoY growth)
  - Salary distribution analysis (median, mean, by department)
  - Deduction breakdown (tax, pension, insurance)
  - Overtime cost analysis (by employee, department, month)
  - Turnover cost tracking (salary benefits for separated employees)
  - Budget vs. actual payroll (company budgeted vs. actual spend)
  - Payroll efficiency metrics (cost per employee, payroll processing time)

**Technical Implementation:**
- NestJS services: PayrollCalculationService, PayslipGenerationService, PayrollApprovalService, PayrollReportingService
- PostgreSQL tables: employees, salary_structures, payroll_runs, payslip_items, deductions, allowances, payroll_approvals
- ExcelJS for payroll file uploads and report generation
- PDF generator (PDFKit) for payslip generation
- Batch payments API (Sprint 27 integration)
- HR system adapters (BambooHR API client)
- 156 acceptance criteria, 152+ tests (85 unit, 47 integration, 20 E2E)

**Database Schema:**
- employees (id, company_id, employee_id, first_name, last_name, email, phone, bank_code, account_number, department, status, hire_date)
- salary_structures (id, employee_id, basic_salary, house_allowance, transport_allowance, lunch_allowance, start_date, end_date)
- payroll_runs (id, company_id, payroll_period, status, total_amount, processed_at, approval_chain)
- payslip_items (id, payroll_run_id, employee_id, gross_salary, allowances_total, deductions_total, net_salary)
- deductions (id, payslip_id, deduction_type, amount, reference_id)
- payroll_approvals (id, payroll_run_id, approver_id, approval_status, approval_date, comments)

**Performance Benchmarks:**
- Payroll calculation: 1000 employees in < 5 seconds
- Payslip generation: 1000 PDFs in < 15 seconds
- Batch settlement: Initiate 1000 payments in < 30 seconds
- Payroll approval workflow: < 3 seconds per action

**Compliance & Features:**
- FIRS PAYE tax compliance (withholding tax forms)
- PENCOM pension contribution reporting
- NHF statutory deduction
- Privacy & security (payroll data highly confidential, encryption at rest/transit)
- Audit trail (all changes to payroll tracked)
- Change control (approval required for payroll modifications)

**Cost:** $0 (internal build) vs. $200-500/month (Bamboo HR, ADP, Workday)
**Business Impact:**
- Reduce payroll processing time: 8 hours/month → 15 minutes (HR efficiency gain)
- Payroll errors reduced by 95% (automated calculation vs. manual spreadsheets)
- Employee satisfaction: 4.2 → 4.8/5.0 (timely, transparent salaries)
- B2B revenue: ₦2,000-5,000 per employee/month
- Target market: 100+ employee companies (mid-market Nigeria)
- Break-even: 50 companies × 100 employees × ₦2,500 = ₦12.5M MRR
- Payback period: ~3 months

---

### Sprint 35: Referral & Rewards Program (NEW)
**Goal:** Incentivize user acquisition through viral referral mechanics and gamified rewards
**Story Points:** 28
**Duration:** Week 70-71 (2 weeks)
**Epics:** Customer Experience & Growth

**Features:**
- **Referral Code Generation & Tracking:**
  - Auto-generate unique referral code per user (alphanumeric, URL-safe)
  - Custom referral codes (vanity codes: @john, @smithjohnson with uniqueness check)
  - Dynamic referral links (ubiquitous-tribble.app?ref=xyz123)
  - Short link generation (bit.ly style: ref.ubiquitous-tribble.com/abc123)
  - QR code generation for referral link
  - Referral link analytics (clicks, scans, conversions per link)
  - Bulk referral code generation for business partners

- **Referral Tracking & Attribution:**
  - Track referrer from signup → KYC completion → first transaction
  - Attribution window (30 days from signup to complete referral)
  - Multi-level referral detection (detect if referee also referred others)
  - Referral source tracking (direct link, QR code, social share)
  - Device/IP validation to prevent duplicate signups
  - Referral status dashboard per user (pending, claimed, expired)

- **Rewards Structure & Tiers:**
  - Base reward: ₦500 to referrer + ₦500 to referee on first transaction
  - Tiered rewards:
    * Tier 1 (1-5 referrals): ₦500 per referral
    * Tier 2 (6-20 referrals): ₦700 per referral
    * Tier 3 (21-50 referrals): ₦1,000 per referral
    * Tier 4 (51+ referrals): ₦1,500 per referral
  - Custom reward amounts per referral (by referrer segment)
  - Reward milestone bonuses (₦5K on 10th referral, ₦10K on 25th referral)
  - Seasonal rewards (2x rewards during promotions)
  - Conditional rewards:
    * Bonus if referee reaches KYC Tier 2 (₦1,000 additional)
    * Bonus if referee's first transaction > ₦10K (₦500 additional)
  - Reward expiry (rewards must be claimed within 90 days)

- **Referral Leaderboard & Gamification:**
  - Weekly leaderboard (top 10 referrers by count)
  - Monthly leaderboard with rewards (1st: ₦50K, 2nd: ₦30K, 3rd: ₦15K)
  - Lifetime referral count per user
  - Referral milestones (10 referrals: Silver badge, 25: Gold, 50: Platinum)
  - Rank display (Rookie, Partner, Ambassador, Champion)
  - Social sharing of leaderboard position
  - Seasonal competitions (Jan-Mar: New Year New Friends, Dec: Year-End Rewards)
  - Team competitions (invite your team, compete as group)

- **Promotional Campaigns & Segments:**
  - Create referral campaigns (name, reward amount, duration, target users)
  - Campaign builder UI (drag-and-drop, rules engine)
  - Target by user segment (KYC tier, transaction volume, registration date)
  - Time-limited promotions (Black Friday, Cyber Monday, Eid specials)
  - Geographic targeting (campaigns per state/region)
  - Social media integration (LinkedIn, Twitter, WhatsApp campaign templates)
  - Email templates for referral invitations (customizable)
  - Social share buttons with auto-generated messages

- **Reward Distribution & Management:**
  - Automatic wallet credit on referral completion (within 24 hours)
  - Reward redemption options:
    * Wallet credit (instant)
    * Bank transfer (next business day)
    * Airtime credit (instant)
    * Mobile money (instant)
  - Minimum redemption threshold (₦1,000 minimum)
  - Pending rewards dashboard (track unclaimed, claimed, credited)
  - Reward history (detailed log of all referrals and rewards)
  - Batch reward processing (daily job to calculate and credit rewards)
  - Fraud detection (prevent reward abuse, duplicate accounts)

- **Fraud Prevention & Anti-Gaming:**
  - Device fingerprinting to detect multiple accounts per user
  - IP address blocking (prevent signup from same IP)
  - Phone number validation (one account per phone)
  - Email verification (one account per email)
  - Velocity checks (block excessive referrals from same account)
  - Manual review for suspicious patterns (flagged for compliance review)
  - Referral code transfer restrictions (referral codes non-transferable)
  - KYC verification required to claim rewards (₦5K+)

- **Referral Program Analytics & Reporting:**
  - Program overview dashboard (total referrals, referrer count, rewards paid)
  - Referral conversion funnel (signups → KYC → first transaction)
  - Cost per acquisition (CPA) tracking (total rewards / successful referrals)
  - Referral quality metrics (% of referrals that complete KYC, % active)
  - Cohort analysis (referrals by source, by referrer segment)
  - Churn analysis (do referrals have higher/lower churn?)
  - Revenue impact (track LTV of referred users vs. organic)
  - Anomaly detection (unusual patterns in referral data)
  - Export reports (CSV/PDF for marketing team)

- **User Interface & Experience:**
  - Referral dashboard (one-click access, clean design)
  - Share buttons (WhatsApp, SMS, Twitter, LinkedIn, Email, Copy link)
  - Social proof (show live referral notifications: "John referred Sarah! 🎉")
  - Referral progress widget (visual progress to next milestone)
  - Email notifications (referral claimed, reward earned, milestone unlocked)
  - In-app notifications (real-time referral activity)
  - Mobile-optimized sharing (deep links for iOS/Android)
  - Referral tutorial/onboarding

- **Integration with Other Features:**
  - Integration with wallet system (reward crediting)
  - Integration with KYC system (verification requirement)
  - Integration with transaction system (first transaction detection)
  - Integration with notification system (email/SMS/push)
  - Integration with analytics (track referral metrics)

**Technical Implementation:**
- NestJS services: ReferralService, RewardsService, LeaderboardService, FraudDetectionService, AnalyticsService
- PostgreSQL tables: referral_codes, referrals, rewards, leaderboard_snapshots, referral_campaigns, referral_analytics
- Redis for leaderboard caching (real-time updates)
- Cron jobs for daily reward processing and leaderboard refresh
- Device fingerprinting library (TruValidate or similar)
- URL shortener service (internal or 3rd party)
- 143 acceptance criteria, 140+ tests (78 unit, 44 integration, 18 E2E)

**Database Schema:**
- referral_codes (id, user_id, code, custom_code, referral_link, qr_code_url, created_at, status)
- referrals (id, referrer_id, referee_id, referral_code, signup_date, kyc_completion_date, first_transaction_date, status)
- rewards (id, referral_id, reward_amount, reward_type, status, claimed_date, credited_date)
- leaderboard_snapshots (id, period, referrer_id, referral_count, reward_amount, rank)
- referral_campaigns (id, campaign_name, reward_amount, start_date, end_date, target_segment)

**Performance Benchmarks:**
- Referral code generation: < 100ms
- Leaderboard calculation (10K users): < 2 seconds (cached)
- Reward distribution job (10K pending): < 30 seconds
- Referral tracking: < 50ms per signup

**Compliance & Security:**
- No rewards for KYC Tier 1 only (Tier 2+ for payouts)
- Rewards capped at CBN limits for promotional activities
- Fraud detection and suspicious pattern flagging
- Audit trail of all reward transactions

**Cost:** ₦1.5M-2.5M per month (referral rewards for 100K users at ₦500-1000 avg)
**Business Impact:**
- Viral coefficient target: 1.3 (each referrer brings 1.3 new users)
- CAC reduction: 60% (internal referrals cheaper than paid ads)
- User acquisition: 10K-15K new users/month via referrals
- Revenue increase: 20-30% growth in active users
- Payback period: 1 month (referral rewards vs. paid ad costs)

---

### Sprint 36: Social Payments - Split Bills & Collections (NEW)
**Goal:** Enable peer-to-peer payment splitting and group collections for social transactions
**Story Points:** 32
**Duration:** Week 72-73 (2 weeks)
**Epics:** Customer Experience & Social Features

**Features:**
- **Bill Splitting Engine:**
  - Create split payment (enter total amount, select participants)
  - Equal split (₦1,000 ÷ 4 people = ₦250 each)
  - Itemized split (add line items: food ₦600, drinks ₦200, service ₦200)
  - Custom amounts (person A pays ₦500, person B pays ₦300, etc.)
  - Percentage-based split (person A: 50%, person B: 30%, person C: 20%)
  - Weighted split (based on consumption units or custom weights)
  - Tax/tip handling (add tax 7.5%, add tip 15-20%, automatically split)
  - Rounding optimization (prevent ₦0.01 discrepancies with rounding algorithm)
  - Receipt attachment (photo of bill, OCR extraction for amounts)

- **Group Collection Pools:**
  - Create collection for group gift/event (e.g., "Sarah's Wedding Gift - ₦50,000 target")
  - Set collection goal amount and deadline
  - Add collection description and optional photo
  - Invite participants (in-app, SMS, email, WhatsApp link)
  - Track contribution status (who paid, who hasn't)
  - Real-time contribution counter (visual progress bar)
  - Multiple payment methods per participant (card, bank transfer, wallet)
  - Partial payment support (contribute now, pay rest later)
  - Collection owner can adjust goal if needed
  - Automatic settlement when goal reached (optional) or on deadline

- **Payment Request Distribution:**
  - Send payment requests via multiple channels:
    * WhatsApp (clickable payment link with message)
    * SMS (short link + amount)
    * Email (formatted request with payment button)
    * In-app notification (for app users)
    * QR code (shareable for in-person request)
  - Auto-generated message templates (customizable)
  - Bulk send to multiple participants (one-click)
  - Message preview before sending
  - Delivery confirmation (SMS sent, WhatsApp read receipts)
  - Reminder automation (send reminder 24h before deadline, 1h before)
  - Custom messaging (personalize per participant: "Hi @name, your share is ₦250")

- **Payment Processing & Tracking:**
  - Accept payments from both in-app users and non-users
  - In-app payment (wallet-to-wallet, instant settlement)
  - Card payment acceptance (redirect to card payment processor)
  - Bank transfer detection (manual or automated via bank API)
  - Mobile money acceptance (MTN, Airtel, M-Pesa)
  - Manual payment confirmation (owner marks as paid if offline payment)
  - Payment confirmation notifications (both payer and requester)
  - Payment history per split (detailed log of all transactions)
  - Receipt generation (shareable split breakdown)

- **Settlement & Payouts:**
  - Auto-settlement to collection creator or designated beneficiary
  - Batch settlement (payout collected funds within 24h)
  - Split settlement options:
    * Pay organizer first (organizer gets full amount, then reimburses sharers)
    * Proportional settlement (each person pays their exact share)
    * Custom settlement (organizer defines settlement order)
  - Settlement to bank account, wallet, or mobile money
  - Settlement fee transparency (₦50 per settlement, no hidden costs)
  - Instant settlement to wallet (₦0 fee)
  - Delayed settlement option (hold funds for 7 days for fraud prevention)

- **Group Management & Collaboration:**
  - Create groups (friend groups, roommates, team)
  - Add members to groups (one-time, repeating)
  - Member roles (creator, contributor, observer)
  - Shared transaction history per group
  - Group dashboard (who owes whom, settlement tracking)
  - Dispute resolution (flag payment as incorrect, comments)
  - Member removal (end contributions from member)
  - Group deactivation (archive old groups)
  - Group usage analytics (total split, member participation rate)

- **Expense Management & Analytics:**
  - Track personal expenses across multiple splits
  - Expense dashboard (all current and past splits)
  - Settlement summary (how much you owe/are owed across all groups)
  - Personal balance tracking (net owed/owed to you)
  - Recurring splits (monthly split with same group, auto-create)
  - Split history (sortable by date, amount, group)
  - Export split data (CSV for accounting)
  - Spending analytics (total spent on dining, events, etc.)

- **Request-Response Model (Alternative Flow):**
  - Send money request (request ₦1,000 from John for lunch)
  - Money request notifications (in-app, SMS, email)
  - Accept/decline/counter-offer flow
  - Message back and forth before payment
  - Auto-reminder (send reminder after 3 days, 7 days)
  - Request timeout (auto-cancel after 30 days)
  - Multi-request tracking (who owes me what across multiple requests)

- **Fraud Prevention & Security:**
  - Velocity checks (prevent excessive request creation)
  - Duplicate detection (don't create same split twice)
  - User verification (confirm recipients before payment)
  - Amount validation (flag unusually high amounts)
  - Device fingerprinting for split creators
  - Dispute tracking (track resolved/unresolved disputes)
  - Compliance flagging (flag suspicious patterns for AML review)

- **User Interface & Experience:**
  - Quick split button (home screen shortcut)
  - Split wizard (step-by-step: select participants → enter amounts → send requests)
  - Dashboard view (active splits, pending requests, settled splits)
  - Participant management (add/remove, adjust amounts)
  - Live updates (see payments come in real-time)
  - Celebration animations (₦0 balance reached - congratulations!)
  - Dark mode support
  - Accessibility (screen reader support, high contrast mode)

**Technical Implementation:**
- NestJS services: SplitPaymentService, CollectionService, SettlementService, AnalyticsService
- PostgreSQL tables: bill_splits, split_participants, collections, collection_contributions, payment_requests, payment_request_responses
- Payment gateway integration (card processor, mobile money)
- WhatsApp Business API for message delivery
- AWS SNS for SMS delivery
- Notification system integration (email, push)
- Real-time updates via WebSockets
- 149 acceptance criteria, 145+ tests (82 unit, 46 integration, 17 E2E)

**Database Schema:**
- bill_splits (id, creator_id, split_name, total_amount, split_type, created_at, settled_at, status)
- split_participants (id, split_id, participant_id, assigned_amount, paid_amount, payment_status)
- collections (id, creator_id, collection_name, goal_amount, current_amount, deadline, status)
- collection_contributions (id, collection_id, contributor_id, amount, payment_date)
- payment_requests (id, requester_id, requestee_id, amount, split_id, status, expiry_date)

**Performance Benchmarks:**
- Create split: < 200ms
- Send payment requests (10 recipients): < 1 second
- Process payment: < 500ms
- Settlement calculation (100K transactions): < 5 seconds

**Compliance & Features:**
- Transaction limits (per transaction, daily, monthly)
- Dispute resolution SLA (resolve within 48 hours)
- Transaction confirmation (both parties confirm to settle)

**Cost:** $0 (internal) + message costs (WhatsApp/SMS: ₦500-1K/month)
**Business Impact:**
- Social payment volume: 5-10K splits/month
- User engagement: 30% increase (social features drive stickiness)
- Referral growth: users invite friends to pay them
- Revenue: 0.5-1% commission on settlements = ₦100-500K/month

---

### Sprint 37: Escrow Services (NEW)
**Goal:** Secure transaction holding for buyer-seller confidence in high-value exchanges
**Story Points:** 28
**Duration:** Week 74-75 (2 weeks)
**Epics:** Financial Services & Trust

**Features:**
- **Escrow Transaction Creation:**
  - Create escrow transaction (buyer, seller, amount, description)
  - Escrow types: Buyer-Seller (2-party) or 3-party with intermediary
  - Transaction milestones (e.g., 50% on order, 50% on delivery)
  - Escrow terms (deadline, conditions for release)
  - Dispute escalation contact (arbitrator details if dispute)
  - Escrow fee model (1-3% depending on amount)
  - Receipt/contract attachment (PDF upload)
  - Bulk escrow creation (for marketplace transactions)

- **Fund Lockup & Holding:**
  - Buyer funds transaction (wallet, card, or bank transfer)
  - Funds held in escrow account (segregated, separate from operating accounts)
  - Real-time fund status confirmation (buyer receives confirmation)
  - Escrow fund security (encryption, audit trail, regulatory compliance)
  - Fund holding period (until completion, dispute resolution, or timeout)
  - Interest on held funds (optional: accrue interest on funds held > 30 days)
  - Multi-currency support (hold in different currencies per transaction)

- **Milestone-Based Release:**
  - Define payment milestones (e.g., Phase 1, Phase 2)
  - Milestone conditions (e.g., "Delivery confirmed")
  - Buyer approval workflow (buyer reviews, approves partial release)
  - Seller can request early release (with buyer approval)
  - Auto-release on milestone date if neither party disputes
  - Partial release (release 30% of escrow on confirmation, 70% on delivery)
  - Threshold-based releases (release ₦5K increments as delivered)

- **Dispute Management & Resolution:**
  - Either party can raise dispute (within agreed timeframe)
  - Dispute categories (non-delivery, damaged goods, service not rendered, fraud)
  - Evidence submission (photos, messages, transaction proofs)
  - Timeline for dispute resolution (7-14 days)
  - Arbitration process:
    * Automated resolution (simple cases with clear evidence)
    * Human arbitrator (complex cases, assigned platform moderator)
    * Third-party arbitration (external arbitrator for high-value)
  - Dispute communication (message thread between parties)
  - Settlement options (50/50 split, full release to seller, full refund to buyer, custom split)
  - Appeal process (if dissatisfied with resolution)
  - Escalation to legal (for unresolved high-value disputes)

- **Automatic Release & Timeout:**
  - Auto-release after agreed period (e.g., 30 days)
  - No dispute raised = automatic release to seller
  - Grace period (notification 48h before auto-release)
  - Timeout extension (either party can request extension)
  - Failed release (refund to buyer if release fails after 3 attempts)

- **Escrow Status Tracking:**
  - Real-time status updates (CREATED, FUNDED, IN_PROGRESS, PENDING_RELEASE, RELEASED, DISPUTED, RESOLVED, REFUNDED)
  - Timeline view (visual timeline of escrow lifecycle)
  - Status notifications (email/SMS/push on status changes)
  - Buyer dashboard (all escrows as buyer)
  - Seller dashboard (all escrows as seller)
  - Arbitrator dashboard (assigned disputes, case management)
  - Admin dashboard (oversight, dispute escalations)

- **Escrow Analytics & Reporting:**
  - Total escrow value under management
  - Average escrow duration
  - Dispute rate by category
  - Resolution success rate
  - Average dispute resolution time
  - Arbitrator performance metrics (cases resolved, satisfaction rating)
  - Fraud incident tracking
  - Revenue from escrow fees

- **Integration with Marketplaces:**
  - API for marketplace integration (Jumia, Konga can use escrow)
  - Webhook notifications for order status
  - Auto-create escrow on order (marketplace → ubiquitous-tribble)
  - Auto-release on delivery confirmation (from marketplace)
  - Merchant dashboard integration

- **Use Cases & Templates:**
  - E-commerce template (product purchase with delivery confirmation)
  - Freelance template (project milestone-based payment)
  - Real estate template (deposit with inspection contingency)
  - Vehicle sales template (deposit with inspection/test drive)
  - Service template (advance payment for completed work)
  - Rental deposit template (security deposit with return conditions)
  - Customizable terms per use case

- **Security & Compliance:**
  - Fund segregation (escrow funds kept separate from operating funds)
  - Audit trail (all escrow actions logged)
  - Regulatory compliance (CBN, NDPR, fraud prevention)
  - KYC verification (both parties verified)
  - Amount limits (per transaction, daily limits)
  - Fraud detection (flag suspicious transactions)
  - Insurance (optional: transaction insurance for high-value escrows)

- **User Experience & Trust:**
  - Escrow badge on marketplace (shows escrow-protected)
  - Trust score (based on escrow history, resolution history)
  - User reviews (post-transaction, escrow experience rating)
  - Dispute resolution explainer (help users understand process)
  - FAQ and help center articles
  - Live chat support for escrow issues
  - Video tutorials (escrow process walkthrough)

**Technical Implementation:**
- NestJS services: EscrowService, DisputeService, ArbitrationService, FundManagementService
- PostgreSQL tables: escrow_transactions, escrow_milestones, disputes, dispute_evidence, dispute_resolutions, escrow_analytics
- Separate escrow fund holding account (designated bank account for compliance)
- Notification system (email, SMS, push)
- Document storage (S3 for evidence files)
- 151 acceptance criteria, 148+ tests (84 unit, 48 integration, 16 E2E)

**Database Schema:**
- escrow_transactions (id, buyer_id, seller_id, amount, fee, status, created_at, release_date)
- escrow_milestones (id, escrow_id, milestone_name, amount, condition, release_date, approved)
- disputes (id, escrow_id, dispute_raiser_id, category, description, evidence_url, status, created_at)
- dispute_resolutions (id, dispute_id, resolution_type, buyer_payout, seller_payout, resolved_by, resolved_at)

**Performance Benchmarks:**
- Create escrow: < 300ms
- Fund lockup: < 1 second
- Dispute filing: < 200ms
- Auto-release job (10K escrows): < 10 seconds

**Compliance & Features:**
- CBN fund segregation requirements met
- AML/KYC verification enforced
- Dispute resolution timeline tracked
- Audit trail for regulatory inspection

**Cost:** $0 (internal) + bank account maintenance
**Business Impact:**
- Escrow volume: 1K-5K transactions/month (high-value)
- Transaction value: ₦100M-500M under management
- Revenue: 1-2% fee on escrow = ₦1M-5M/month
- Market expansion: Enable high-value P2P transactions
- Trust metric: 90%+ customer satisfaction with dispute resolution

---

### Sprint 38: Personal Finance Management (PFM) & Insights (NEW)
**Goal:** Empower users with spending analytics, budgeting tools, and financial insights
**Story Points:** 30
**Duration:** Week 76-77 (2 weeks)
**Epics:** Customer Experience & Financial Wellness

**Features:**
- **Spending Categorization & Classification:**
  - Auto-categorize transactions (ML-based or rule-based)
  - Transaction categories:
    * Essential (housing, utilities, food, transportation)
    * Discretionary (entertainment, dining, shopping, subscriptions)
    * Financial (savings, investments, debt payments)
    * Charity & giving
    * Health & wellness
    * Subscriptions & memberships
  - Merchant classification (identify transaction source)
  - User override (reclassify if auto-categorization wrong)
  - Custom categories (user-defined for specific needs)
  - Subcategories (food → groceries vs. dining out)
  - Tag system (label transactions with multiple tags)

- **Monthly Spending Reports:**
  - Visual spending breakdown (pie chart, bar chart, table)
  - Month-over-month comparison (this month vs. last month)
  - Category spending trends (line chart over 12 months)
  - Spending trends (₦10K last month → ₦12K this month = +20%)
  - Biggest expense categories (ranked)
  - Unusual spending alerts (flagged if 50% above normal)
  - Spending by merchant
  - Spending by payment method (card, bank transfer, wallet, mobile money)
  - Export report (PDF, CSV, email to user)

- **Budget Creation & Management:**
  - Create monthly budgets per category (e.g., Dining: ₦10K/month)
  - Weekly budget tracking (see progress each week)
  - Budget allocation (allocate total budget to categories)
  - Zero-based budgeting (allocate every naira of income)
  - Rolling budgets (monthly, quarterly, annual cycles)
  - Shared budgets (couples, roommates, families track together)
  - Budget templates (recommended budgets by income level)
  - Budget categories (match spending categories)
  - Savings goals within budget (allocate % to savings)

- **Budget Alerts & Monitoring:**
  - Alert at 75% of budget spent (warning)
  - Alert at 90% of budget spent (serious warning)
  - Alert at 100% of budget spent (budget exceeded)
  - Real-time notifications (SMS, email, in-app)
  - Customizable thresholds (set your own alert levels)
  - Budget reset calendar (shows next reset date)
  - Budget variance tracking (expected vs. actual)
  - Overspend tracking (by how much did you exceed budget?)

- **Savings Goals & Tracking:**
  - Create financial goals (Buy iPhone: ₦500K, Emergency Fund: ₦100K)
  - Goal types:
    * Short-term (1-6 months): Wedding, vacation, gadget
    * Medium-term (6-24 months): Car, business startup
    * Long-term (2+ years): House down payment, retirement
  - Set goal amounts and target dates
  - Auto-allocate percentage of income to goal
  - Goal progress tracking (visual progress bar)
  - Savings rate (how much per month to reach goal)
  - Goal milestones (e.g., "Halfway there! Keep going")
  - Goal completion celebration (unlock achievement badge)
  - Recurring savings (auto-transfer ₦5K/month to goal)

- **Financial Insights & Recommendations:**
  - Smart insights (AI-generated personalized insights)
  - Examples:
    * "You spent 45% more on dining this month vs. last month. Consider reducing by ₦2K to stay on track."
    * "You've saved ₦50K toward your Emergency Fund. At this pace, you'll reach your ₦100K goal in 2 months!"
    * "Your subscription costs are ₦3,500/month. Consider canceling unused services."
    * "You spent ₦200 on coffee 5 times this week. That's ₦1,000/month!"
    * "Your electricity bill is 20% higher than neighborhood average. Consider energy-saving measures."
  - Benchmarking (compare your spending to similar demographics)
  - Spending insights (show top spending categories)
  - Saving opportunities (identify and quantify cost reduction opportunities)
  - Financial health score (0-100 based on spending patterns, savings rate, debt)
  - Personalized recommendations (based on goals and budget)
  - Tips & tricks (educational content on budgeting, saving)

- **Income Tracking & Net Worth:**
  - Track income sources (salary, freelance, business, side gigs)
  - Monthly income dashboard
  - Income vs. expense tracking (are you spending more than earning?)
  - Savings rate calculation (income - expenses / income × 100%)
  - Net worth tracking (if integrated with bank account linking)
  - Income growth tracking (year-over-year income comparison)
  - Income documentation (upload pay slips for verification)

- **Debt Tracking & Repayment:**
  - Track personal loans, credit card debt, buy-now-pay-later
  - Debt balance and interest tracking
  - Payment schedule (due dates, payment amounts)
  - Payment reminders (email/SMS before due date)
  - Early payoff calculator (show interest saved if paid early)
  - Debt repayment strategies (avalanche vs. snowball)
  - Debt-free goal (track progress to becoming debt-free)

- **Cash Flow Forecasting:**
  - Project next month's cash flow (income - planned expenses)
  - Identify cash flow gaps (months where expenses > income)
  - Seasonal spending patterns (show high-spend months like Dec, May)
  - Income volatility (for freelancers/variable income)
  - Upcoming large expenses (flagged in calendar)
  - Forecast warnings (alert if projected deficit)

- **Financial Health Dashboard:**
  - Financial health score (0-100)
  - Key metrics:
    * Savings rate (% of income saved)
    * Debt-to-income ratio (total debt / annual income)
    * Emergency fund coverage (savings / monthly expenses)
    * Budget adherence (actual vs. budget)
  - Goals progress (how close to achieving goals)
  - Trends (improving or declining health)
  - Recommendations (personalized actions to improve health)
  - Peer comparison (optional: how you compare to similar users)

- **Analytics & Trend Analysis:**
  - Spending trends (identify patterns, anomalies)
  - Merchant analysis (top merchants, merchant frequency)
  - Payment method usage (which methods you use most)
  - Time-based analysis (spending by day of week, week of month)
  - Seasonal patterns (higher spending in certain months)
  - Correlation analysis (spending correlations across categories)
  - Anomaly detection (unusual transactions flagged)
  - Cohort analysis (compare against similar users)

- **Data Export & Integration:**
  - Export spending data (CSV, Excel, PDF)
  - Connect to accounting software (QuickBooks, Wave)
  - Tax document export (receipts, invoices for tax filing)
  - Bank integration (if open banking available)
  - Cloud storage integration (backup data to Google Drive, Dropbox)

- **Privacy & Data Security:**
  - PII anonymization (don't share real names in analytics)
  - Data encryption (spending data encrypted at rest)
  - User consent (opt-in for analytics and recommendations)
  - Data retention (user control over data retention period)
  - Right to deletion (delete all personal spending data)

**Technical Implementation:**
- NestJS services: TransactionCategoryService, BudgetService, InsightsService, AnalyticsService, ForecastingService
- PostgreSQL tables: spending_categories, budgets, savings_goals, financial_health_scores, budget_transactions, insights
- ML models (TensorFlow/Scikit-learn) for spending classification and insights generation
- Real-time calculation service (spending totals, budget % used)
- Scheduled jobs (daily insights generation, monthly report generation)
- Chart library (Recharts for visualizations)
- 157 acceptance criteria, 153+ tests (87 unit, 49 integration, 17 E2E)

**Database Schema:**
- spending_categories (id, category_name, icon, parent_category_id)
- budgets (id, user_id, category_id, budget_amount, period, start_date, end_date)
- budget_transactions (id, budget_id, transaction_id, amount, transaction_date)
- savings_goals (id, user_id, goal_name, target_amount, current_amount, target_date, goal_type)
- financial_health_scores (id, user_id, score, savings_rate, debt_to_income, recorded_date)
- insights (id, user_id, insight_text, insight_type, generated_date, read_date)

**Performance Benchmarks:**
- Categorize transaction: < 100ms (cached model)
- Generate monthly report (500 transactions): < 1 second
- Calculate financial health score: < 200ms
- Insight generation job (100K users): < 60 seconds

**Compliance & Features:**
- PII protection in analytics (anonymized data)
- GDPR/NDPR data handling
- User consent for data processing
- No sharing of spending data with 3rd parties

**Cost:** $0 (internal) + optional ML infrastructure (if using cloud ML service)
**Business Impact:**
- User engagement: 2x increase (daily active users checking budget)
- Retention: 40% reduction in churn (helpful features create stickiness)
- Upsell opportunity: Offer premium insights, debt consolidation services
- Data insights: Aggregate anonymized spending patterns for research
- Revenue: Potential partnerships with merchants for behavioral insights

---

### Sprint 39: Production Readiness & Advanced Analytics (NEW)
**Goal:** Production-grade infrastructure, analytics enhancements, and operational excellence
**Story Points:** 35
**Duration:** Week 78-79 (2 weeks)
**Epics:** Infrastructure, Operations & Analytics

**Features:**
- **Production Infrastructure Hardening:**
  - Database optimization (index tuning, query optimization)
  - Connection pooling (PgBouncer for PostgreSQL)
  - Cache layer optimization (Redis multi-level caching)
  - Content Delivery Network (CDN) for static assets (CloudFront)
  - Load balancing configuration (multi-region setup if needed)
  - Database replication (master-slave for high availability)
  - Backup automation (daily encrypted backups, disaster recovery testing)
  - Secrets management (HashiCorp Vault or AWS Secrets Manager)
  - Environment configuration (separate dev/staging/production configs)
  - Log aggregation (ELK Stack or CloudWatch for centralized logging)

- **Monitoring & Observability:**
  - Application Performance Monitoring (APM) - New Relic or DataDog
  - Distributed tracing (trace requests across microservices)
  - Real-time dashboards (TPS, response times, error rates)
  - Health check endpoints (liveness and readiness probes)
  - Synthetic monitoring (test critical paths regularly)
  - User experience monitoring (track user-perceived performance)
  - Database performance monitoring (slow query logging, index analysis)
  - Infrastructure metrics (CPU, memory, disk, network)
  - Cost monitoring (track AWS/cloud spend by service)
  - Alert routing (PagerDuty integration for critical alerts)

- **Advanced Analytics Platform:**
  - Event tracking infrastructure (Segment or custom)
  - User behavior analytics (funnel analysis, user journeys)
  - Cohort analysis (segment users by acquisition date, behavior)
  - Retention analysis (day 1, day 7, day 30 retention)
  - Churn prediction (ML model to predict churn risk)
  - LTV (Lifetime Value) calculation and tracking
  - CAC (Customer Acquisition Cost) tracking by channel
  - Payback period calculation (for growth initiatives)
  - Product analytics dashboard (segment, event aggregation)
  - A/B testing framework (statistical significance testing)
  - Custom events tracking (all critical user actions)

- **Real-Time Dashboards & Reporting:**
  - Executive dashboard (KPIs: MAU, MRR, churn, LTV)
  - Operations dashboard (TPS, transaction success rate, error rate)
  - Business dashboard (revenue breakdown, top merchants, top products)
  - Marketing dashboard (CAC, referral conversion, campaign performance)
  - Fraud dashboard (fraud detection alerts, suspicious transactions)
  - Support dashboard (ticket volume, response time, CSAT)
  - Compliance dashboard (KYC coverage, AML alerts, CBN reporting)
  - Data warehouse (snowflake or postgres warehouse for BI)
  - Self-service BI tool (Metabase or Tableau for custom reports)
  - Scheduled reports (weekly email reports to stakeholders)

- **Performance Optimization:**
  - API response time optimization (target < 200ms P95)
  - Database query optimization (eliminate N+1 queries)
  - Frontend performance (code splitting, lazy loading)
  - Image optimization (compression, CDN delivery)
  - Caching strategy optimization (Redis TTL tuning)
  - Payment processing performance (faster settlement)
  - Batch job optimization (process 100K records in < 5 minutes)
  - Load testing (validate system handles 10K TPS)
  - Stress testing (identify failure points)
  - Capacity planning (estimate infrastructure needs for scaling)

- **Operational Excellence:**
  - Runbooks (documented procedures for common operations)
  - Incident response procedures (defined escalation, communication)
  - On-call rotation setup (24/7 support with PagerDuty)
  - Post-incident reviews (document lessons learned)
  - Change management process (approve and track deployments)
  - Deployment pipeline (automated testing, staging, production)
  - Rollback procedures (quick recovery from bad deployments)
  - Database migration strategy (zero-downtime deployments)
  - Feature flags (control feature rollout, quick disable if issues)
  - Chaos engineering (inject failures, test resilience)

- **Data Governance & Quality:**
  - Data validation rules (ensure data quality)
  - Data lineage tracking (document data flow)
  - Master data management (consistent customer master data)
  - Data cataloging (document all data assets)
  - Data retention policies (follow GDPR/NDPR requirements)
  - Data quality monitoring (flag inconsistencies, duplicates)
  - Data masking (sensitive data redaction in non-prod)
  - Data lineage documentation (where data comes from, how it flows)

- **Customer Support Enhancements:**
  - Knowledge base expansion (500+ articles covering all features)
  - Video tutorials (screen recordings for key features)
  - Chatbot implementation (FAQ automation, reduce support volume)
  - Support analytics (identify common issues, create solutions)
  - Self-service portal expansion (empower users to self-resolve)
  - Community forum (peer support, reduce support tickets)
  - Support metrics tracking (CSAT, response time, resolution time)
  - Escalation playbooks (documented procedures for complex issues)

- **Security Audit & Compliance:**
  - Code security scanning (SAST - static code analysis)
  - Dependency scanning (identify vulnerable libraries)
  - OWASP Top 10 compliance verification
  - API security testing (authorization checks, injection tests)
  - Database security review (proper access controls, encryption)
  - Infrastructure security audit (firewall rules, security groups)
  - Compliance checklist (CBN, NDPR, PCI DSS requirements)
  - Security documentation (design documents, threat models)

- **Team Scaling & Documentation:**
  - Technical documentation (architecture, design decisions)
  - API documentation (auto-generated from OpenAPI spec)
  - Architecture decision records (document why decisions were made)
  - Deployment documentation (how to deploy, rollback)
  - Training materials (for new team members)
  - Code quality standards (linting, formatting, testing)
  - Technical onboarding (setup guide for new developers)

- **Scalability Planning:**
  - Horizontal scaling analysis (stateless services ready for multiple instances)
  - Database scaling (sharding strategy for user/transaction data)
  - Message queue evaluation (Kafka for event streaming)
  - Caching layer expansion (multi-level caching strategy)
  - CDN optimization (global content delivery)
  - API rate limiting (protect against abuse, ensure fairness)
  - Resource forecasting (predict infrastructure needs 6-12 months ahead)
  - Cost optimization (reserved capacity, spot instances)

**Technical Implementation:**
- Monitoring tools: Datadog or New Relic for APM
- Logging: ELK Stack or CloudWatch
- Data warehouse: Postgres + pgAdmin, or Snowflake
- BI tool: Metabase or Tableau
- Feature flag service: LaunchDarkly or custom
- Incident management: PagerDuty
- Documentation: Confluence or Notion
- Testing framework: Jest, Supertest, k6 (load testing)
- 168 acceptance criteria, 160+ tests (including performance tests)

**Performance Benchmarks:**
- API latency: < 200ms (P95)
- Database query: < 100ms for most queries
- Payment processing: < 2 seconds end-to-end
- Batch job: 100K records in < 5 minutes
- System uptime: 99.95%+
- Data warehouse query: < 30 seconds for most reports
- Incident MTTR: < 15 minutes (mean time to recovery)

**Compliance Certification:**
- PCI DSS Level 1 compliance (ready for audit)
- NDPR compliance (privacy impact assessment completed)
- CBN operational requirements (reporting, KYC, AML)
- ISO 27001 readiness (information security)

**Cost:** $50K-100K (APM tools, BI tools, additional infrastructure)
**Business Impact:**
- Operational reliability: 99.95% uptime (vs. 99% baseline)
- Decision-making: Data-driven insights for product decisions
- Growth enablement: Infrastructure ready to scale to 1M+ users
- Compliance: Pass regulatory audits with confidence
- Team efficiency: Operational automation reduces toil
- Customer satisfaction: Faster response times, fewer outages

---

**Future Phases (Year 2+):**

### Phase 3: Advanced Financial Products
**Goal:** Savings, loans, investments (requires licenses)
**Features:**
- Savings accounts with interest
- Fixed deposits
- Loan/credit products
- Buy Now Pay Later (BNPL)
- Investment products

**Cost:** TBD (requires banking/lending licenses)

---

## Future Features & Product Roadmap (Backlog)

### Category: Advanced Payment Features

#### 1. **Tap-to-Pay (NFC Payments)**
**Description:** Enable contactless payments using NFC technology on mobile devices
**Business Value:** Compete with Apple Pay, Google Pay in Nigerian market
**Complexity:** High (requires NFC SDK integration, POS terminal support)
**Prerequisites:** Card issuance service, POS integration
**Estimated Effort:** 15-20 SP
**Target Market:** Retail, restaurants, transport
**Revenue Model:** Transaction fees (1.5-2.5% per transaction)

**Features:**
- NFC-enabled mobile wallet for in-store payments
- Virtual card tokenization for secure NFC transactions
- POS terminal integration (Visa payWave, Mastercard Contactless)
- Transaction limits (₦50K per tap, ₦200K daily)
- PIN authentication for high-value transactions (>₦10K)
- Merchant acceptance network onboarding
- Real-time transaction notifications

---

#### 2. **Crypto Integration (Buy/Sell/Store)**
**Description:** Enable users to buy, sell, and store cryptocurrencies (BTC, ETH, USDT)
**Business Value:** Attract crypto-savvy millennials, remittance alternative
**Complexity:** Very High (regulatory uncertainty in Nigeria, volatility risk)
**Prerequisites:** CBN approval (currently restricted), crypto exchange partnership
**Estimated Effort:** 40-50 SP
**Regulatory Risk:** HIGH - CBN has restricted crypto transactions for banks

**Features:**
- Buy crypto with Naira (bank transfer, card payment)
- Sell crypto to Naira wallet
- Crypto wallet (BTC, ETH, USDT, BNB)
- Real-time crypto price feed (Binance API, CoinGecko)
- Crypto-to-crypto swaps
- Send/receive crypto to external wallets
- Crypto transaction history and portfolio tracking
- Tax reporting for crypto gains (when regulation clarifies)

**Considerations:**
- Wait for regulatory clarity from CBN/SEC
- Partner with licensed crypto exchange (Quidax, Luno, Binance P2P)
- Implement robust AML/KYC for crypto transactions
- Monitor global crypto regulations

---

#### 3. **USSD Banking (*xxx# Code)**
**Description:** Enable feature phone users to access wallet via USSD short codes
**Business Value:** Reach 60%+ of Nigerians who use feature phones (not smartphones)
**Complexity:** Medium (telco integration, session management challenges)
**Prerequisites:** Telco partnership (MTN, Airtel, Glo, 9mobile), USSD code allocation
**Estimated Effort:** 20-25 SP
**Cost:** ₦500K-₦2M/year USSD code license fee + ₦4-₦8 per session

**Features:**
- Dedicated USSD code (e.g., *347*1#)
- Menu-driven interface for wallet operations
- Check balance: *347*1*1#
- Transfer money: *347*1*2*[amount]*[phone]#
- Buy airtime: *347*1*3*[amount]#
- Mini-statement: *347*1*4#
- PIN-based authentication (4-digit PIN)
- Session timeout (90 seconds for security)
- Multi-language menu (English, Pidgin, Hausa, Yoruba, Igbo)

**Technical Challenges:**
- USSD session limitations (140 characters per screen)
- Network latency and timeout handling
- Telco revenue sharing agreements (telcos take 30-50% of transaction fee)

---

#### 4. **Voice Payments (Alexa, Google Assistant)**
**Description:** Enable voice-activated payments via smart assistants
**Business Value:** Differentiation, early adopter appeal (low adoption in Nigeria currently)
**Complexity:** High (voice recognition, security challenges)
**Prerequisites:** Integration with Alexa Skills Kit, Google Actions
**Estimated Effort:** 15-20 SP
**Market Fit:** LOW in Nigeria (smart speaker penetration <5%)

**Features:**
- "Alexa, send ₦5,000 to John Doe"
- "Hey Google, pay my electric bill"
- Voice biometric authentication
- Transaction confirmation via push notification
- Daily transaction limits for voice payments (₦50K max for security)

**Recommendation:** Deprioritize until smart speaker adoption increases

---

### Category: Business & Enterprise Features

#### 5. **Payroll Management System**
**Description:** Automated salary disbursement for businesses
**Business Value:** High (B2B revenue, recurring customers)
**Complexity:** Medium
**Prerequisites:** Batch payments (Sprint 27), bank account integration
**Estimated Effort:** 25-30 SP

**Features:**
- Employee management (add/edit/remove employees, bank details)
- Payroll schedule configuration (monthly, bi-weekly, custom)
- Automated salary calculation (basic salary, allowances, deductions, tax)
- Bulk salary disbursement via batch payments
- Payslip generation and email delivery
- Payroll reports (monthly, annual, tax year-end)
- Integration with HR systems (BambooHR, Workday)
- Compliance reporting (PAYE tax, pension, NHF deductions)

**Pricing:** ₦50-₦200 per employee/month + transaction fees

---

#### 6. **Escrow Services**
**Description:** Hold funds in escrow for secure transactions (e-commerce, freelancing)
**Business Value:** High (trust-building for online marketplaces)
**Complexity:** Medium (dispute resolution workflow)
**Prerequisites:** Dispute management system, legal framework
**Estimated Effort:** 20-25 SP

**Features:**
- Create escrow transaction (buyer, seller, amount, terms)
- Multi-party escrow (buyer, seller, platform)
- Milestone-based release (release partial amounts on deliverables)
- Dispute resolution workflow (raise dispute, arbitration, resolution)
- Automatic release after timeout (e.g., 14 days if no dispute)
- Escrow fee model (1-3% of transaction value)
- Escrow status tracking (PENDING, FUNDED, RELEASED, DISPUTED, CANCELLED)

**Use Cases:**
- E-commerce marketplaces (Jumia, Konga)
- Freelance platforms (Fiverr, Upwork clones)
- Real estate deposits
- Car sales

---

#### 7. **Invoicing & Billing System**
**Description:** Generate and send invoices, track payments
**Business Value:** Medium (SME market)
**Complexity:** Low
**Prerequisites:** Payment links (Sprint 26)
**Estimated Effort:** 15-20 SP

**Features:**
- Invoice creation (line items, tax, discounts, due date)
- Invoice templates (customizable branding)
- Send invoice via email with payment link
- Recurring invoices (monthly subscriptions)
- Payment reminders (auto-send before/after due date)
- Invoice status tracking (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
- Partial payment support
- Export invoices as PDF
- Invoice reporting and analytics

**Pricing:** Free for first 50 invoices/month, ₦5K-₦20K/month for unlimited

---

#### 8. **Virtual Terminal (Manual Card Entry for Merchants)**
**Description:** Allow merchants to manually enter card details for phone/mail orders
**Business Value:** Medium (MOTO - Mail Order Telephone Order transactions)
**Complexity:** Low
**Prerequisites:** Card payment processing (Sprint 8)
**Estimated Effort:** 8-10 SP

**Features:**
- Manual card entry form (card number, expiry, CVV, billing address)
- PCI DSS compliance (card data not stored, transmitted securely)
- Transaction receipt generation
- Refund capability
- Transaction history
- Merchant onboarding and KYC

---

### Category: Risk & Security Enhancements

#### 9. **3D Secure 2.0 (Enhanced SCA)**
**Description:** Strong Customer Authentication for card transactions
**Business Value:** High (reduce chargebacks, fraud)
**Complexity:** Medium (issuer integration)
**Prerequisites:** Card issuance service
**Estimated Effort:** 15-18 SP

**Features:**
- 3DS 2.0 authentication flow (frictionless and challenge-based)
- Device fingerprinting and risk scoring
- Biometric authentication (fingerprint, Face ID)
- One-time password (OTP) fallback
- Issuer ACS integration
- Liability shift (fraud liability moves to issuer if 3DS used)

---

#### 10. **Behavioral Biometrics (Fraud Detection)**
**Description:** AI-powered fraud detection using typing patterns, device usage
**Business Value:** High (reduce account takeover fraud)
**Complexity:** Very High (ML model development)
**Prerequisites:** ML infrastructure, data science team
**Estimated Effort:** 30-40 SP

**Features:**
- Typing speed and rhythm analysis
- Mouse movement patterns
- Device orientation and touch pressure (mobile)
- Anomaly detection (flag unusual behavior)
- Continuous authentication (not just login)
- Risk scoring (low/medium/high risk users)

---

#### 11. **Device Fingerprinting & Geofencing**
**Description:** Identify and track user devices, location-based restrictions
**Business Value:** Medium (fraud prevention)
**Complexity:** Medium
**Prerequisites:** Fraud detection system (Sprint 17)
**Estimated Effort:** 12-15 SP

**Features:**
- Device fingerprinting (browser, OS, screen resolution, installed fonts)
- Geolocation tracking (IP address, GPS)
- Geofencing rules (block transactions from high-risk countries)
- Multiple device management (user can register trusted devices)
- New device login alerts
- Location-based transaction limits

---

### Category: Customer Experience

#### 12. **Referral & Rewards Program**
**Description:** Incentivize users to refer friends, earn rewards
**Business Value:** High (user acquisition, viral growth)
**Complexity:** Low
**Prerequisites:** Wallet system
**Estimated Effort:** 10-12 SP

**Features:**
- Unique referral codes per user
- Referral tracking (clicks, signups, completed KYC)
- Rewards structure (referrer gets ₦500, referee gets ₦500 on first transaction)
- Leaderboard (top referrers)
- Referral analytics dashboard
- Tiered rewards (1-5 referrals: ₦500, 6-20: ₦700, 21+: ₦1000)
- Fraud prevention (detect fake signups)

**Cost:** ₦500-₦1000 per successful referral (CAC optimization)

---

#### 13. **Gamification (Badges, Achievements, Levels)**
**Description:** Reward users with badges for completing actions
**Business Value:** Medium (engagement, retention)
**Complexity:** Low
**Prerequisites:** User activity tracking
**Estimated Effort:** 8-10 SP

**Features:**
- Badge system (First Transaction, KYC Completed, Power User, etc.)
- Achievement unlocking (visual celebration)
- User levels (Bronze, Silver, Gold, Platinum based on activity)
- Progress bars toward next level
- Social sharing (share achievements on Twitter, WhatsApp)
- Exclusive benefits per level (lower fees, priority support)

---

#### 14. **Personal Finance Management (PFM)**
**Description:** Help users track spending, budget, financial goals
**Business Value:** High (engagement, product stickiness)
**Complexity:** Medium
**Prerequisites:** Transaction history, analytics
**Estimated Effort:** 20-25 SP

**Features:**
- Spending categorization (food, transport, entertainment, bills)
- Monthly spending reports with charts
- Budget creation (set limits per category)
- Budget alerts (80%, 100% of budget spent)
- Savings goals (save ₦50K for iPhone, ₦200K for rent)
- Financial insights ("You spent 30% more on food this month")
- Expense trends over time

---

#### 15. **Social Payments (Split Bills, Group Collections)**
**Description:** Split restaurant bills, collect money for group gifts
**Business Value:** High (viral growth, social engagement)
**Complexity:** Medium
**Prerequisites:** Payment links, wallet system
**Estimated Effort:** 15-18 SP

**Features:**
- Create bill split (enter total, select friends, auto-calculate shares)
- Custom split amounts (person A pays ₦2K, person B pays ₦3K)
- Payment requests sent via WhatsApp, SMS, in-app
- Group collection pools (collect ₦100K for wedding gift)
- Real-time contribution tracking
- Automatic settlement when all pay
- Reminders for unpaid participants

**Use Cases:**
- Restaurant bill splitting
- Rent sharing (roommates)
- Group gifts
- Event ticket purchases

---

### Category: Merchant & Developer Tools

#### 16. **No-Code Payment Page Builder**
**Description:** Drag-and-drop tool to build custom payment pages
**Business Value:** Medium (SME market, ease of use)
**Complexity:** Medium
**Prerequisites:** Payment links (Sprint 26)
**Estimated Effort:** 18-20 SP

**Features:**
- Drag-and-drop page builder
- Pre-built templates (donation page, product page, service page)
- Customizable colors, fonts, logos
- Add product images, descriptions
- Multiple payment methods (card, bank transfer, wallet)
- Embed code for websites
- Custom domain support (pay.yourbrand.com)
- Analytics (page views, conversion rate)

---

#### 17. **Subscription Management**
**Description:** Recurring billing for SaaS, memberships
**Business Value:** High (B2B SaaS market)
**Complexity:** Medium
**Prerequisites:** Standing orders (Sprint 28), webhooks
**Estimated Effort:** 20-22 SP

**Features:**
- Create subscription plans (monthly, annual, custom intervals)
- Free trial periods
- Proration handling (upgrade/downgrade mid-cycle)
- Dunning management (retry failed payments, grace period, suspension)
- Subscription analytics (MRR, churn rate, LTV)
- Customer self-service portal (upgrade, downgrade, cancel)
- Invoice generation per billing cycle
- Webhooks for subscription events

---

#### 18. **Marketplace/Platform Features (Split Payments)**
**Description:** Automatically split payments between platform and sellers
**Business Value:** High (marketplace platforms like Jumia, Konga)
**Complexity:** Medium
**Prerequisites:** Wallet system, ledger
**Estimated Effort:** 15-18 SP

**Features:**
- Commission-based split (platform takes 10%, seller gets 90%)
- Multi-party splits (platform, seller, logistics provider)
- Instant vs. delayed settlement (hold funds for 7 days)
- Platform balance and seller balance tracking
- Seller payout management
- Platform fee configuration per seller tier

---

### Category: Compliance & Reporting

#### 19. **GDPR/NDPR Data Privacy Portal**
**Description:** Allow users to request data export, deletion per NDPR
**Business Value:** High (legal compliance)
**Complexity:** Low
**Prerequisites:** User data management
**Estimated Effort:** 8-10 SP

**Features:**
- User data export (download all personal data as JSON/CSV)
- Right to deletion (delete account and all data)
- Data portability
- Consent management (track user consents)
- Privacy policy version control
- Audit trail of data access

---

#### 20. **Open Banking (Account Aggregation)**
**Description:** Allow users to link external bank accounts, view balances
**Business Value:** High (PFM enhancement)
**Complexity:** Very High (bank API integration)
**Prerequisites:** Bank partnerships, API access
**Estimated Effort:** 35-40 SP

**Features:**
- Link external bank accounts (GTBank, Access, Zenith, etc.)
- View all account balances in one dashboard
- Transaction aggregation across multiple banks
- Net worth calculation
- Categorization of external transactions
- Open Banking API compliance (when available in Nigeria)

**Regulatory:** Nigeria currently lacks Open Banking framework (unlike UK/EU)

---

### Category: Infrastructure & Operations

#### 21. **Multi-Tenancy (White-Label Platform)**
**Description:** Allow businesses to launch their own branded wallets
**Business Value:** Very High (B2B licensing revenue)
**Complexity:** Very High (architectural overhaul)
**Prerequisites:** Modular architecture, tenant management
**Estimated Effort:** 60-80 SP

**Features:**
- Tenant isolation (separate databases, configs per tenant)
- White-label branding (custom logo, colors, domain)
- Tenant admin portal
- Usage-based pricing per tenant
- Centralized management dashboard
- API key management per tenant

**Revenue Model:** $5K-$50K setup fee + $500-$5K/month per tenant

---

#### 22. **Real-Time Analytics with Apache Kafka**
**Description:** Event streaming for real-time dashboards
**Business Value:** High (operational efficiency)
**Complexity:** High
**Prerequisites:** Kafka infrastructure, data engineering
**Estimated Effort:** 25-30 SP

**Features:**
- Event streaming (all transactions, user actions)
- Real-time dashboards (current TPS, active users)
- Stream processing (detect patterns in real-time)
- Integration with BI tools (Tableau, Power BI)

---

#### 23. **Machine Learning Fraud Model**
**Description:** Replace rule-based fraud detection with ML
**Business Value:** Very High (reduce false positives, catch sophisticated fraud)
**Complexity:** Very High
**Prerequisites:** ML infrastructure, data science team
**Estimated Effort:** 40-50 SP

**Features:**
- Supervised learning model (train on historical fraud data)
- Feature engineering (transaction velocity, device fingerprint, geolocation)
- Real-time inference (score every transaction)
- Model retraining pipeline
- A/B testing (compare rule-based vs. ML)
- Explainability (why was transaction flagged?)

---

### Category: Mobile & Platform Expansion

#### 24. **Progressive Web App (PWA)**
**Description:** Installable web app for offline access
**Business Value:** High (reach users without app store)
**Complexity:** Medium
**Prerequisites:** Web app
**Estimated Effort:** 12-15 SP

**Features:**
- Offline functionality (view balance, transaction history)
- Push notifications via service workers
- App-like experience (add to home screen)
- Background sync (queue transactions when offline, sync when online)

---

#### 25. **Flutter Mobile App (iOS + Android)**
**Description:** Native mobile apps for better UX
**Business Value:** Very High (mobile-first market)
**Complexity:** High
**Prerequisites:** API-first backend
**Estimated Effort:** 60-80 SP

**Features:**
- Native performance
- Biometric login (Face ID, Touch ID, fingerprint)
- Push notifications
- Camera for QR scanning
- NFC for tap-to-pay
- In-app KYC (camera for document upload)

---

#### 26. **USSD → WhatsApp Migration**
**Description:** Offer richer experience via WhatsApp chatbot (vs. USSD)
**Business Value:** High (WhatsApp has 90M+ Nigerian users)
**Complexity:** Medium
**Prerequisites:** WhatsApp Business API approval
**Estimated Effort:** 18-20 SP

**Features:**
- WhatsApp chatbot for wallet operations
- Send money via WhatsApp message
- Request money via WhatsApp
- Transaction notifications via WhatsApp
- Rich media (images, videos, buttons)
- Natural language processing (NLP) for commands

**Cost:** WhatsApp Business API fees (₦4-₦8 per message)

---

## Feature Prioritization Framework

**Priority Scoring Formula:**
Priority Score = (Business Value × Market Fit × Feasibility) / (Complexity × Cost)

**Legend:**
- Business Value: 1-10 (revenue potential, strategic importance)
- Market Fit: 1-10 (Nigerian market readiness, customer demand)
- Feasibility: 1-10 (technical feasibility, regulatory approval)
- Complexity: 1-10 (development effort, architectural changes)
- Cost: 1-10 (infrastructure, licensing, third-party fees)

**Top Priority Features (Score > 5):**
1. Payroll Management System (Score: 8.5)
2. Referral & Rewards Program (Score: 8.2)
3. Social Payments (Split Bills) (Score: 7.8)
4. Escrow Services (Score: 7.5)
5. Personal Finance Management (Score: 7.2)

**Medium Priority Features (Score 3-5):**
6. Invoicing & Billing (Score: 4.8)
7. Subscription Management (Score: 4.5)
8. USSD Banking (Score: 4.2)
9. Flutter Mobile App (Score: 4.0)

**Low Priority Features (Score < 3):**
10. Crypto Integration (Score: 2.5 - regulatory risk)
11. Voice Payments (Score: 2.0 - low market fit)
12. Multi-Tenancy White-Label (Score: 2.8 - high complexity)

---

## Technology Radar

**Adopt (High Confidence):**
- TypeScript/NestJS
- PostgreSQL
- Redis
- Docker
- AWS (S3, CloudFront, RDS)

**Trial (Experimenting):**
- Elasticsearch (KB search)
- Apache Kafka (event streaming)
- TensorFlow (ML fraud detection)

**Assess (Researching):**
- Open Banking APIs (when available)
- Blockchain for audit trails
- GraphQL (alternative to REST)

**Hold (Avoid for Now):**
- MongoDB (prefer PostgreSQL for financial data)
- Serverless architecture (cold start latency concerns)
- Microservices (overkill for solo developer, modular monolith sufficient)

---

## Success Metrics (KPIs)

**User Acquisition:**
- Monthly Active Users (MAU): Target 100K by end of Year 1
- User registration rate: 10K signups/month
- Referral conversion rate: 30%

**Engagement:**
- Transactions per user per month: 8-12
- Wallet balance > ₦1K: 60% of users
- KYC completion rate: 70%

**Revenue:**
- Monthly Recurring Revenue (MRR): ₦5M by Month 12
- Transaction volume: ₦500M/month by Month 12
- Average revenue per user (ARPU): ₦500/month

**Operational:**
- System uptime: 99.9%
- API response time: < 200ms (P95)
- Failed transaction rate: < 2%
- Customer support CSAT: 4.5/5.0

**Compliance:**
- CBN reporting compliance: 100%
- AML alert review SLA: < 24 hours
- KYC tier 2+ coverage: 60% of users

---

