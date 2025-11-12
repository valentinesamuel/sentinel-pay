# Sprint 27 Tickets - Batch Payments & Mobile Money Mocks

**Sprint:** Sprint 27
**Duration:** 2 weeks (Week 55-56)
**Sprint Goal:** Implement bulk payment processing and mobile money integration preparation
**Story Points Committed:** 35
**Team:** Solo Developer

---

## Quick Links
- [Sprint 27 Backlog](./SPRINT_27_BACKLOG.md)
- [Product Backlog](../PRODUCT_BACKLOG.md)

---

## Sprint Overview

This sprint implements batch payment processing and mobile money mock services:
1. CSV/Excel batch upload & validation
2. Maker-checker approval workflow
3. Scheduled batch execution
4. Mock MTN MoMo, Airtel Money, M-Pesa services
5. Provider abstraction for future real integrations

**Business Impact:** Enable 10K+ bulk payments, reach 80%+ of mobile money market

---

## Task Breakdown

### Epic: EPIC-19 (Batch Processing)
### Feature: FEATURE-19.1 (Batch Payment Upload & Validation)

---

## User Story: US-27.1.1 - Batch Payment Upload & Validation (10 SP)

### Task 1: Design Batch Data Model & Database Schema
**Task ID:** T-27.1
**Story:** US-27.1.1
**Story Points:** 2
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Design TypeScript interfaces and PostgreSQL schema for batch payments and batch items.

**Acceptance Criteria:**
- [ ] `BatchPaymentRow`, `BatchUploadResult`, `ValidationError` interfaces complete
- [ ] Database tables: batch_payments, batch_payment_items with indexes
- [ ] Support 10K+ items per batch
- [ ] File metadata tracking
- [ ] Status state machine designed

**Estimated Time:** 8 hours

---

### Task 2: Implement CSV/Excel File Parsing
**Task ID:** T-27.2
**Story:** US-27.1.1
**Story Points:** 2
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Build file parsers for CSV (csv-parser) and Excel (xlsx) formats with proper error handling.

**Acceptance Criteria:**
- [ ] Parse CSV files with headers
- [ ] Parse Excel (.xlsx) files
- [ ] Handle UTF-8 encoding
- [ ] Extract row data into structured format
- [ ] Handle malformed files gracefully
- [ ] Support file size up to 5MB

**Dependencies:**
- npm install csv-parser xlsx

**Estimated Time:** 8 hours

---

### Task 3: Implement Batch Validation Engine
**Task ID:** T-27.3
**Story:** US-27.1.1
**Story Points:** 3
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Build comprehensive validation engine with 30+ validation rules for recipient data, amounts, and payment types.

**Acceptance Criteria:**
- [ ] Validate recipient name (required, max 100 chars)
- [ ] Validate account number (10-15 digits)
- [ ] Validate amount (> 0, <= ₦10K limit)
- [ ] Validate payment type (enum)
- [ ] Detect duplicate recipients
- [ ] Check total vs. user balance
- [ ] Generate detailed error messages per row
- [ ] Support 10K records in < 30 seconds

**Estimated Time:** 12 hours

---

### Task 4: Build Batch Upload API Endpoints
**Task ID:** T-27.4
**Story:** US-27.1.1
**Story Points:** 2
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Create REST API endpoints for batch upload, retrieval, and error report download.

**Acceptance Criteria:**
- [ ] POST /api/v1/batch-payments/upload (multipart/form-data)
- [ ] GET /api/v1/batch-payments/:batchId
- [ ] GET /api/v1/batch-payments/:batchId/errors (CSV download)
- [ ] JWT authentication required
- [ ] Role-based access control
- [ ] Rate limiting (5 uploads/hour)

**Estimated Time:** 8 hours

---

### Task 5: Write Unit Tests for Batch Upload
**Task ID:** T-27.5
**Story:** US-27.1.1
**Story Points:** 1
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Comprehensive unit tests for file parsing and validation.

**Acceptance Criteria:**
- [ ] 20+ unit tests
- [ ] Test CSV parsing
- [ ] Test Excel parsing
- [ ] Test all validation rules
- [ ] Test error generation
- [ ] 90%+ code coverage

**Estimated Time:** 4 hours

---

## User Story: US-27.1.2 - Batch Approval Workflow (8 SP)

### Task 6: Design Approval Rules & Workflow
**Task ID:** T-27.6
**Story:** US-27.1.2
**Story Points:** 1
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Design amount-based approval rules and maker-checker workflow logic.

**Acceptance Criteria:**
- [ ] Approval rules: < ₦1M (1 approver), ₦1M-₦5M (2 approvers), > ₦5M (3 approvers)
- [ ] Maker-checker enforcement design
- [ ] Database schema: batch_approvals table
- [ ] Approval state machine
- [ ] Role-based approver assignment

**Estimated Time:** 4 hours

---

### Task 7: Implement Batch Approval Service
**Task ID:** T-27.7
**Story:** US-27.1.2
**Story Points:** 3
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Build approval service with maker-checker enforcement and multi-level approval logic.

**Acceptance Criteria:**
- [ ] Submit batch for approval
- [ ] Prevent maker from approving own batch
- [ ] Support multi-level approvals
- [ ] Approve batch (update status)
- [ ] Reject batch with reason
- [ ] Get pending batches for approver
- [ ] Email notifications on approval/rejection

**Estimated Time:** 12 hours

---

### Task 8: Build Approval API Endpoints
**Task ID:** T-27.8
**Story:** US-27.1.2
**Story Points:** 2
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Create API endpoints for approval workflow operations.

**Acceptance Criteria:**
- [ ] POST /api/v1/batch-payments/:batchId/submit
- [ ] POST /api/v1/batch-payments/:batchId/approve
- [ ] POST /api/v1/batch-payments/:batchId/reject
- [ ] GET /api/v1/batch-payments/pending-approvals
- [ ] Role-based access (finance_manager, admin)
- [ ] 2FA for high-value approvals (> ₦5M)

**Estimated Time:** 8 hours

---

### Task 9: Write Tests for Approval Workflow
**Task ID:** T-27.9
**Story:** US-27.1.2
**Story Points:** 2
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Unit and integration tests for approval workflow.

**Acceptance Criteria:**
- [ ] 15+ unit tests
- [ ] Test maker-checker enforcement
- [ ] Test multi-level approvals
- [ ] Test rejection workflow
- [ ] 8+ integration tests
- [ ] 5+ E2E tests

**Estimated Time:** 8 hours

---

## User Story: US-27.2.1 - Scheduled Batch Execution (8 SP)

### Task 10: Implement Batch Scheduling Service
**Task ID:** T-27.10
**Story:** US-27.2.1
**Story Points:** 2
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Build service to schedule batches for future execution with validation.

**Acceptance Criteria:**
- [ ] Schedule batch for future date/time
- [ ] Validate scheduled time is in future
- [ ] Support recurring schedules (weekly, monthly)
- [ ] Cancel scheduled batch
- [ ] Reschedule batch

**Estimated Time:** 8 hours

---

### Task 11: Implement Batch Execution Engine
**Task ID:** T-27.11
**Story:** US-27.2.1
**Story Points:** 3
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Build execution engine that processes batch items sequentially with retry logic.

**Acceptance Criteria:**
- [ ] Deduct total from wallet before processing
- [ ] Process items sequentially
- [ ] Create transactions for each item
- [ ] Retry failed items (max 3 attempts)
- [ ] Handle insufficient balance
- [ ] Generate execution report
- [ ] Process 10K items in < 5 minutes

**Estimated Time:** 12 hours

---

### Task 12: Implement Cron Job for Scheduled Execution
**Task ID:** T-27.12
**Story:** US-27.2.1
**Story Points:** 1
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Create cron job that checks for scheduled batches every minute and executes them.

**Acceptance Criteria:**
- [ ] Cron runs every minute
- [ ] Find batches scheduled for now (±1 minute)
- [ ] Execute batches automatically
- [ ] Handle execution failures
- [ ] Alert on failures

**Dependencies:**
- npm install @nestjs/schedule

**Estimated Time:** 4 hours

---

### Task 13: Implement Payout Batching Optimization
**Task ID:** T-27.13
**Story:** US-27.2.1
**Story Points:** 1
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Group payments by provider for bulk API calls (cost optimization).

**Acceptance Criteria:**
- [ ] Group items by provider (MTN, GTB, etc.)
- [ ] Support bulk API calls
- [ ] Reduce API call count
- [ ] Track savings per batch

**Estimated Time:** 4 hours

---

### Task 14: Write Tests for Batch Execution
**Task ID:** T-27.14
**Story:** US-27.2.1
**Story Points:** 1
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Unit and integration tests for scheduling and execution.

**Acceptance Criteria:**
- [ ] 18+ unit tests
- [ ] Test scheduled execution
- [ ] Test cron job
- [ ] 10+ integration tests
- [ ] Test 10K+ item batch

**Estimated Time:** 4 hours

---

## User Story: US-27.3.1 - Mock MTN MoMo Service (6 SP)

### Task 15: Design Mobile Money Provider Interface
**Task ID:** T-27.15
**Story:** US-27.3.1
**Story Points:** 1
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Design provider abstraction interface for easy swapping between mock and real providers.

**Acceptance Criteria:**
- [ ] `MobileMoneyProvider` interface
- [ ] Methods: deposit, withdraw, queryTransaction, validateAccount
- [ ] `MobileMoneyProviderFactory` for provider selection
- [ ] Environment-based switching (mock vs. real)
- [ ] Database schema: mock_mobile_money_transactions

**Estimated Time:** 4 hours

---

### Task 16: Implement MTN MoMo Mock Service
**Task ID:** T-27.16
**Story:** US-27.3.1
**Story Points:** 3
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Build complete MTN MoMo mock service with realistic behavior and test scenarios.

**Acceptance Criteria:**
- [ ] Deposit from MTN to platform
- [ ] Withdraw from platform to MTN
- [ ] Validate MTN phone numbers (234803, 234806, etc.)
- [ ] Transaction limits (₦5K-₦200K)
- [ ] Daily limit (₦500K)
- [ ] Test scenarios (phone ending 0=success, 1=pending, 2=insufficient, 3=network error)
- [ ] Provider fee 1.5%
- [ ] Transaction < 500ms

**Estimated Time:** 12 hours

---

### Task 17: Implement Mobile Money Transaction History
**Task ID:** T-27.17
**Story:** US-27.3.1
**Story Points:** 1
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Store and query mobile money transaction history.

**Acceptance Criteria:**
- [ ] Store all transactions in database
- [ ] Query by transaction ID
- [ ] Query by phone number
- [ ] Filter by status
- [ ] Calculate daily totals
- [ ] Transaction receipts

**Estimated Time:** 4 hours

---

### Task 18: Write Tests for MTN MoMo
**Task ID:** T-27.18
**Story:** US-27.3.1
**Story Points:** 1
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Comprehensive tests for MTN MoMo service.

**Acceptance Criteria:**
- [ ] 15+ unit tests
- [ ] Test all scenarios (success, failure, pending)
- [ ] 8+ integration tests
- [ ] 5+ E2E tests
- [ ] Test daily limits

**Estimated Time:** 4 hours

---

## User Story: US-27.3.2 - Mock Airtel & M-Pesa Services (3 SP)

### Task 19: Implement Airtel Money Mock Service
**Task ID:** T-27.19
**Story:** US-27.3.2
**Story Points:** 1.5
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Build Airtel Money mock service reusing MTN structure.

**Acceptance Criteria:**
- [ ] Deposit/withdraw working
- [ ] Validate Airtel phone numbers (234802, 234808, etc.)
- [ ] Transaction limits (₦5K-₦200K)
- [ ] Provider fee 1.75%
- [ ] Test scenarios
- [ ] Consistent interface with MTN

**Estimated Time:** 6 hours

---

### Task 20: Implement M-Pesa Mock Service
**Task ID:** T-27.20
**Story:** US-27.3.2
**Story Points:** 1.5
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Build M-Pesa mock service reusing MTN structure.

**Acceptance Criteria:**
- [ ] Deposit/withdraw working
- [ ] Validate M-Pesa phone numbers (234709, 234817)
- [ ] Transaction limits (₦5K-₦100K)
- [ ] Daily limit ₦300K
- [ ] Provider fee 2%
- [ ] Test scenarios
- [ ] Consistent interface with MTN

**Estimated Time:** 6 hours

---

## Integration Task

### Task 21: Integration Testing & E2E Scenarios
**Task ID:** T-27.21
**All User Stories**
**Story Points:** 2
**Priority:** P1
**Status:** 🔄 Not Started

**Description:**
Comprehensive integration testing covering complete workflows.

**Acceptance Criteria:**
- [ ] Full batch workflow: upload → approve → schedule → execute
- [ ] 10K+ batch execution test
- [ ] Mobile money integration with batch payments
- [ ] Concurrent batch processing
- [ ] Error recovery testing
- [ ] Performance benchmarks

**Estimated Time:** 8 hours

---

## Task Summary Table

| Task ID | Task Name | Story | SP | Priority | Est. Hours | Status |
|---------|-----------|-------|----|----------|------------|--------|
| T-27.1 | Design Batch Data Model | US-27.1.1 | 2 | P1 | 8h | 🔄 Not Started |
| T-27.2 | Implement CSV/Excel Parsing | US-27.1.1 | 2 | P1 | 8h | 🔄 Not Started |
| T-27.3 | Implement Validation Engine | US-27.1.1 | 3 | P1 | 12h | 🔄 Not Started |
| T-27.4 | Build Upload API Endpoints | US-27.1.1 | 2 | P1 | 8h | 🔄 Not Started |
| T-27.5 | Write Upload Tests | US-27.1.1 | 1 | P1 | 4h | 🔄 Not Started |
| T-27.6 | Design Approval Workflow | US-27.1.2 | 1 | P1 | 4h | 🔄 Not Started |
| T-27.7 | Implement Approval Service | US-27.1.2 | 3 | P1 | 12h | 🔄 Not Started |
| T-27.8 | Build Approval API | US-27.1.2 | 2 | P1 | 8h | 🔄 Not Started |
| T-27.9 | Write Approval Tests | US-27.1.2 | 2 | P1 | 8h | 🔄 Not Started |
| T-27.10 | Implement Scheduling Service | US-27.2.1 | 2 | P1 | 8h | 🔄 Not Started |
| T-27.11 | Implement Execution Engine | US-27.2.1 | 3 | P1 | 12h | 🔄 Not Started |
| T-27.12 | Implement Cron Job | US-27.2.1 | 1 | P1 | 4h | 🔄 Not Started |
| T-27.13 | Implement Payout Batching | US-27.2.1 | 1 | P1 | 4h | 🔄 Not Started |
| T-27.14 | Write Execution Tests | US-27.2.1 | 1 | P1 | 4h | 🔄 Not Started |
| T-27.15 | Design Provider Interface | US-27.3.1 | 1 | P1 | 4h | 🔄 Not Started |
| T-27.16 | Implement MTN MoMo Service | US-27.3.1 | 3 | P1 | 12h | 🔄 Not Started |
| T-27.17 | Implement Transaction History | US-27.3.1 | 1 | P1 | 4h | 🔄 Not Started |
| T-27.18 | Write MTN Tests | US-27.3.1 | 1 | P1 | 4h | 🔄 Not Started |
| T-27.19 | Implement Airtel Service | US-27.3.2 | 1.5 | P1 | 6h | 🔄 Not Started |
| T-27.20 | Implement M-Pesa Service | US-27.3.2 | 1.5 | P1 | 6h | 🔄 Not Started |
| T-27.21 | Integration & E2E Testing | All | 2 | P1 | 8h | 🔄 Not Started |
| **TOTAL** | **21 Tasks** | - | **35** | - | **140h** | - |

---

## Day-by-Day Plan (10 Working Days)

### Day 1 (Monday) - Batch Upload Foundation
- [ ] T-27.1: Design Batch Data Model (8h)
- **Daily Goal:** Complete data model and database setup
- **Story Points Completed:** 2 SP

### Day 2 (Tuesday) - File Parsing
- [ ] T-27.2: Implement CSV/Excel Parsing (8h)
- **Daily Goal:** Parse CSV and Excel files
- **Story Points Completed:** 2 SP (Total: 4 SP)

### Day 3 (Wednesday) - Validation & API
- [ ] T-27.3: Implement Validation Engine (6h)
- [ ] T-27.4: Build Upload API Endpoints (2h)
- **Daily Goal:** Validation engine operational
- **Story Points Completed:** 5 SP (Total: 9 SP)

### Day 4 (Thursday) - Upload Testing & Approval Design
- [ ] T-27.3: Complete Validation (6h remaining)
- [ ] T-27.5: Write Upload Tests (2h)
- **Daily Goal:** Complete upload feature
- **Story Points Completed:** 1 SP (Total: 10 SP)

### Day 5 (Friday) - Approval Workflow
- [ ] T-27.6: Design Approval Workflow (4h)
- [ ] T-27.7: Implement Approval Service (4h)
- **Daily Goal:** Approval service started
- **Story Points Completed:** 4 SP (Total: 14 SP)

### Day 6 (Monday) - Approval Completion
- [ ] T-27.7: Complete Approval Service (8h remaining)
- **Daily Goal:** Approval service complete
- **Story Points Completed:** 0 SP (Total: 14 SP)

### Day 7 (Tuesday) - Approval API & Tests
- [ ] T-27.8: Build Approval API (8h)
- **Daily Goal:** Approval API working
- **Story Points Completed:** 2 SP (Total: 16 SP)

### Day 8 (Wednesday) - Batch Execution
- [ ] T-27.9: Write Approval Tests (4h)
- [ ] T-27.10: Implement Scheduling Service (4h)
- **Daily Goal:** Testing and scheduling
- **Story Points Completed:** 4 SP (Total: 20 SP)

### Day 9 (Thursday) - Execution & Mobile Money
- [ ] T-27.11: Implement Execution Engine (6h)
- [ ] T-27.12: Implement Cron Job (2h)
- **Daily Goal:** Execution engine working
- **Story Points Completed:** 4 SP (Total: 24 SP)

### Day 10 (Friday) - Mobile Money & Final Testing
- [ ] T-27.11: Complete Execution Engine (6h remaining)
- [ ] T-27.13: Implement Payout Batching (2h)
- **Daily Goal:** Execution complete
- **Story Points Completed:** 2 SP (Total: 26 SP)

### Day 11 (Monday) - Mobile Money Implementation
- [ ] T-27.14: Write Execution Tests (4h)
- [ ] T-27.15: Design Provider Interface (4h)
- **Daily Goal:** Testing and provider design
- **Story Points Completed:** 2 SP (Total: 28 SP)

### Day 12 (Tuesday) - MTN MoMo
- [ ] T-27.16: Implement MTN MoMo Service (8h)
- **Daily Goal:** MTN service working
- **Story Points Completed:** 3 SP (Total: 31 SP)

### Day 13 (Wednesday) - MTN & Airtel
- [ ] T-27.16: Complete MTN (4h remaining)
- [ ] T-27.17: Transaction History (2h)
- [ ] T-27.19: Implement Airtel Service (2h)
- **Daily Goal:** MTN complete, Airtel started
- **Story Points Completed:** 2 SP (Total: 33 SP)

### Day 14 (Thursday) - M-Pesa & Integration
- [ ] T-27.19: Complete Airtel (4h remaining)
- [ ] T-27.20: Implement M-Pesa Service (4h)
- **Daily Goal:** All providers complete
- **Story Points Completed:** 1 SP (Total: 34 SP)

### Day 15 (Friday) - Final Testing
- [ ] T-27.18: Write MTN Tests (4h)
- [ ] T-27.21: Integration & E2E Testing (4h)
- **Daily Goal:** All tests passing, sprint complete
- **Story Points Completed:** 1 SP (Total: 35 SP ✅)

---

## Burndown Chart (Story Points)

```
35 SP |█████████████████████████████████
32 SP |████████████████████████████████   Day 1-2
27 SP |███████████████████████████       Day 3-4
20 SP |████████████████████              Day 5-7
14 SP |██████████████                    Day 8-9
07 SP |███████                           Day 10-12
02 SP |██                                Day 13-14
00 SP |                                  Day 15 ✅
```

**Expected Velocity:** 35 SP / 15 days = 2.3 SP/day

---

## Definition of Done (Sprint Level)

### Code Quality
- [ ] All 21 tasks completed
- [ ] 131+ unit/integration/E2E tests passing
- [ ] 90%+ code coverage across all services
- [ ] No critical or high-severity bugs
- [ ] Code reviewed and approved

### Functional Requirements
- [ ] CSV/Excel batch upload working (10K records)
- [ ] Batch validation with 30+ rules
- [ ] Maker-checker approval enforced
- [ ] Scheduled execution via cron
- [ ] 10K payments processed in < 5 minutes
- [ ] MTN MoMo, Airtel Money, M-Pesa mock services operational

### Performance
- [ ] Batch upload < 30 seconds (10K records)
- [ ] Batch execution < 5 minutes (10K payments)
- [ ] Mobile money transaction < 500ms
- [ ] Cron job reliability 99.9%+

### Documentation
- [ ] API documentation complete (Swagger/OpenAPI)
- [ ] Batch upload CSV/Excel template provided
- [ ] Provider integration guide
- [ ] Test phone numbers documented
- [ ] README updates

---

## Dependencies & Blockers

### External Dependencies
- None (all mock services)

### Internal Dependencies
- [ ] User authentication service
- [ ] Wallet service (hold/release funds)
- [ ] Transaction service
- [ ] Notification service (emails)

### Infrastructure
- [ ] PostgreSQL indexes for large batches
- [ ] Cron scheduler configured
- [ ] File upload middleware (multer)
- [ ] CSV/Excel libraries installed

---

## Risk Mitigation

| Risk | Mitigation | Owner |
|------|-----------|-------|
| Large batch performance (10K+) | Query optimization, payout batching | Solo Dev |
| Maker-checker bypass | Strict enforcement, audit logging | Solo Dev |
| Cron job failures | Monitoring, alerts, manual fallback | Solo Dev |
| File parsing errors | Comprehensive validation, clear errors | Solo Dev |

---

## Budget & Cost Estimates

### Development Costs
- Solo developer: 140 hours @ $50/hr = **$7,000**

### Cost Savings
- Mock mobile money services: **$5K-15K saved** during development

### Future Costs
- Real provider integration: $5K-10K per provider (when profitable)
- Transaction fees (production): 1.5-2% per transaction

**Total Sprint Cost:** $7,000 (development only)

---

## Success Metrics

### Sprint Success Criteria
- [ ] All 35 story points completed
- [ ] Zero critical bugs
- [ ] 90%+ test coverage
- [ ] All acceptance criteria met
- [ ] Demo to stakeholders successful

### Business Metrics
- Batch upload time: < 30 seconds (10K records)
- Batch execution time: < 5 minutes (10K payments)
- Maker-checker compliance: 100% (zero self-approvals)
- Mobile money success rate: 99%+
- Developer satisfaction: High (easy testing)

---

## Sprint Retrospective Questions

**What went well?**
- Batch processing efficiency?
- Maker-checker enforcement?
- Mobile money provider simulation realism?
- Code reuse across providers?

**What could be improved?**
- Batch file format flexibility?
- Approval workflow UI/UX?
- Scheduled execution accuracy?
- Test scenario coverage?

**Action items for next sprint:**
- Add more mobile money providers (Paga, OPay)?
- Implement batch templates (save common payrolls)?
- Real-time batch progress tracking?
- Machine learning for fraud detection?

---

**End of Sprint 27 Tickets**
