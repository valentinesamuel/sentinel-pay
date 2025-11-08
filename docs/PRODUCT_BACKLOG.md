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

