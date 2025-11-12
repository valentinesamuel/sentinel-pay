# Post-Incident Review (PIR) Template

Use this template to conduct a blameless post-mortem review of incidents. Copy this file, fill it out, and store in incident tracking system.

---

## Incident Summary

| Field | Value |
|-------|-------|
| **Incident ID** | INC-2024-0115-001 |
| **Title** | Payment Processing Delays - Database Query Optimization |
| **Date** | 2024-01-15 |
| **Duration** | 55 minutes (10:15 AM - 11:10 AM UTC) |
| **Severity** | SEV-2 (High) |
| **Root Cause** | Database query plan changed due to index statistics not updated |
| **PIR Date** | 2024-01-16 at 2:00 PM UTC |
| **PIR Attendees** | @john.doe (IC), @jane.smith (Backend Lead), @dba-team, @backend-manager |

---

## Timeline of Events

Create a factual, chronological timeline. Use actual times from logs/monitoring.

| Time | Event | Source |
|------|-------|--------|
| 10:15:30 | Alert: "Error rate > 5%" | Prometheus |
| 10:16:00 | Datadog dashboard shows red | Team monitoring |
| 10:17:00 | Slack alert notification | AlertManager |
| 10:18:00 | @jane.smith acknowledges alert in #incidents | Slack |
| 10:20:00 | Determined payment processing affected | Request logs |
| 10:22:00 | @incident-commander declared SEV-2 | Slack |
| 10:25:00 | Investigation started: checking recent deployments | GitHub |
| 10:28:00 | Identified recent database migration (index added) | Git log |
| 10:30:00 | Query plan analysis showed suboptimal plan | EXPLAIN output |
| 10:35:00 | Hypothesis confirmed: new index causing inefficient plan | DBA analysis |
| 10:38:00 | Created fix: updated index hints in query | Code review |
| 10:42:00 | Deployed to staging, smoke tests passed | Jenkins |
| 10:45:00 | Deployed to production with monitoring | Spinnaker |
| 10:47:00 | Error rate began decreasing | Datadog |
| 10:55:00 | Error rate returned to baseline (<0.5%) | Monitoring |
| 11:05:00 | Stability confirmed for 10 minutes | On-call verification |
| 11:10:00 | Incident declared RESOLVED | Slack |

---

## What Happened

### Executive Summary
Provide a 2-3 sentence explanation suitable for non-technical stakeholders.

A recent database optimization added a new index to improve payment query performance. However, the database query optimizer unexpectedly chose an inefficient execution plan when using the new index, causing payment processing queries to slow from 100ms to 800ms. This caused timeouts and errors for approximately 15% of payment transactions over a 55-minute period until we identified and reverted the problematic index change.

### Detailed Description

**Incident Overview**:
On 2024-01-15 at 10:15 AM UTC, error rate alerts fired when error rate jumped from <0.1% to 5.2% within 30 seconds. Investigation revealed payment processing was affected, with 10,000-15,000 transactions per minute experiencing delays >500ms.

**What went wrong**:
At approximately 9:45 AM UTC (30 minutes before incident), a database migration was automatically applied as part of normal deployment. The migration added a new index to the `transactions` table:

```sql
CREATE INDEX idx_transactions_user_merchant_date
ON transactions(user_id, merchant_id, created_at DESC);
```

This index was intended to optimize the common query pattern:
```sql
SELECT * FROM transactions
WHERE user_id = ? AND merchant_id = ?
ORDER BY created_at DESC;
```

However, when this query was run after the index was created, the query optimizer in PostgreSQL chose to use the new index but with a suboptimal execution strategy that:
1. First filtered transactions by `user_id` and `merchant_id` using the index
2. Then attempted to scan ALL matching rows to apply sorting
3. For merchants with millions of transactions, this meant scanning millions of rows
4. Query time went from 100ms (using old index strategy) to 800ms+ (using new inefficient plan)

**Why it wasn't caught**:
1. The migration was deployed to production without prior testing in a production-like staging environment
2. No monitoring existed for significant query plan changes
3. Index statistics (`ANALYZE`) weren't run immediately after creating the index
4. Manual testing before deployment only tested small data volumes (<1000 transactions)
5. The inefficiency only manifested with realistic data volumes

**Cascade effect**:
- Slow payment processing queries → database connection pool saturation
- Connection pool saturation → application servers unable to get new connections
- Unable to get connections → application throws error/timeout
- Error rate spike → alert fires

---

## Root Cause Analysis

### Primary Root Cause
Database query optimizer chose inefficient execution plan after index creation due to stale statistics.

### Contributing Factors

**Insufficient testing**:
- Migration tested with small dataset in staging
- Real data volumes (millions of transactions) not used in testing
- No load testing of migration before production deployment

**Lack of monitoring**:
- No monitoring for query plan changes
- No monitoring for 10x+ performance degradation
- No automatic query analysis on index creation

**Process gaps**:
- Index creation didn't trigger ANALYZE immediately
- No runbook for "Database migrations" requiring staging validation
- Deployment approval process didn't require DBA sign-off

**Knowledge gaps**:
- Engineering team not aware of PostgreSQL query optimizer behavior
- Unfamiliarity with EXPLAIN ANALYZE for debugging
- Didn't know to update statistics after bulk schema changes

### Why Did Root Cause Happen?

**Question**: Why wasn't the index tested with realistic data?
**Answer**: Staging environment has only 10,000 sample transactions for privacy. Production has 50M transactions. Migration process doesn't require explicit staging validation.

**Question**: Why wasn't there a monitoring alert for this?
**Answer**: General approach is to alert on error rate (which we did). But query performance regressions aren't always obvious in error rates. They cause timeouts which are errors, but took 20 minutes to diagnose.

**Question**: Why didn't the DBA team catch this?
**Answer**: DBA reviews migrations only upon request, not automatically. There was no review request for this migration.

---

## Impact Assessment

### Customer Impact

**Scope**:
- Affected customers: ~500 (out of ~50,000 active customers)
- Transactions delayed: ~27,500
- Merchants affected: ~200 (out of ~5,000)
- Severity per customer: Payment processed but slowly

**Financial Impact**:
- Revenue lost: ~$0 (payments did complete, just slowly)
- Potential chargeback risk: ~$50K (estimated if customers had disputed)
- Refund/credits issued: $0
- SLA breach: Yes (p95 latency >500ms, SLA is <200ms)

**Customer Service Impact**:
- Support tickets filed: 3
- Escalations: 0
- Complaints: 3
- Customer communications needed: Yes

### Internal Impact

**Team Impact**:
- Engineering hours spent: ~8 hours total (diagnostics + fix + PIR)
- Unplanned incident work disrupting planned sprint work
- Elevated stress for on-call team during incident

**System Impact**:
- Database: 100% CPU for 55 minutes on query executor
- Payment service: 98% CPU, high memory usage from buffered requests
- Monitoring: Alert response working as designed, helped catch it quickly
- Reputation: Minor reputation impact, but acceptable for cloud services (downtime does happen)

---

## What Went Well

🟢 **Positive Aspects & Lessons to Preserve**

1. **Fast Alert Response** (1 minute)
   - Monitoring alerts fired within 30 seconds of incident
   - Team acknowledged within 1 minute
   - Why it worked: Well-configured error rate monitoring

2. **Clear Incident Declaration** (7 minutes from detection)
   - Immediate Slack notification with severity and details
   - Incident commander clearly identified
   - Why it worked: Incident response process is defined and practiced

3. **Effective Team Coordination**
   - Backend team and DBA team worked well together
   - Quick hypothesis formation and testing
   - Why it worked: Clear escalation path, people knew who to contact

4. **Transparent Communication**
   - Status updates in Slack every 15 minutes
   - Customers notified within 40 minutes
   - Why it worked: IC focused on communication as parallel activity, didn't try to "stay quiet"

5. **Rollback Plan Was Ready**
   - If fix didn't work, could have rolled back index immediately
   - Rollback would have taken 5 minutes
   - Why it worked: Had tested rollback beforehand, deployment system supports fast rollback

6. **Monitoring Infrastructure** (caught it fast)
   - Error rate increased from 0.1% to 5% in 30 seconds
   - Monitoring alerted within 30 seconds
   - Why it works: Prometheus scrape every 15 seconds + AlertManager push

7. **Data Integrity**
   - All transactions completed successfully
   - No data loss
   - No corruption
   - No need for data recovery

---

## What Could Be Better

🟠 **Areas for Improvement**

### 1. **Delayed Root Cause Diagnosis** (20 minutes)
- **What happened**: Took until 10:35 AM to confirm root cause
- **Why**: Had to manually compare old vs new index definitions, check query execution plans
- **Impact**: 20 minutes wasted when could have been diagnosing earlier
- **How to fix**: Implement automated query plan regression detection
  - Monitor EXPLAIN ANALYZE output before/after index creation
  - Alert if execution time changes >20%
  - Add to CI/CD: run EXPLAIN on production schemas
- **Owner**: @dba-team
- **Timeline**: Implement by 2024-02-01

### 2. **Production Deployed Without Staging Test** (root cause)
- **What happened**: Index creation migration went directly to production
- **Why**: No requirement to test migrations in production-like environment
- **Impact**: If tested with 50M rows, would have caught the inefficiency
- **How to fix**: Enforce staging validation for all schema changes
  - Create staging data with real volume (1M rows minimum)
  - Require DBA sign-off on migrations
  - Add deployment approval step
- **Owner**: @devops-lead, @dba-team
- **Timeline**: Implement by 2024-02-01

### 3. **Missing Query Plan Monitoring** (prevention)
- **What happened**: Could not quickly identify which query became slow
- **Why**: No monitoring dashboard for query performance
- **Impact**: Diagnosis took 20 minutes
- **How to fix**: Build query performance monitoring
  - Prometheus metrics for top 50 queries
  - Dashboard showing p50, p95, p99 latencies
  - Alert when any query >2x its baseline
- **Owner**: @monitoring-team
- **Timeline**: Implement by 2024-02-15

### 4. **Long Time to Production Fix** (15 minutes)
- **What happened**: Fix deployed at 10:50 AM, 35 minutes after detection
- **Why**:
  - Manual code change required (update query hints)
  - Standard PR review + CI/CD pipeline + deployment process
  - Cannot skip steps even in incident
- **Impact**: Each minute of delay = more customers affected
- **How to fix**: Implement expedited deployment process for incidents
  - Approval from 1 IC + 1 tech lead (vs normal PR review)
  - Skip CI tests for Hotfix deployments (run separately)
  - Target: Deploy within 5 minutes of code commit
- **Owner**: @devops-lead, @backend-manager
- **Timeline**: Implement by 2024-02-01

### 5. **Customer Communication Lag** (40 minutes)
- **What happened**: Customers weren't notified until 10:55 AM
- **Why**:
  - Manual Slack message to customer-notif channel
  - Product manager needed to draft message
  - Formal approval required for customer comms
- **Impact**: Customers found out from slow transactions, not from us
- **How to fix**: Automate initial status page update
  - When error rate > 5% → Auto-update status page: "We're investigating payment processing issues"
  - 5 minutes later, if still > 5%: Send email to affected customers
  - Provide real-time ETA from incident commander
- **Owner**: @product-team
- **Timeline**: Implement by 2024-02-15

### 6. **Too Many People in Incident Channel**
- **What happened**: 20+ people in #incident-sev-2 channel, lots of noise
- **Why**: Incident declared in public Slack, everyone jumped in to help
- **Impact**: Hard to follow actual progress, lots of duplicate investigation
- **How to fix**: Use role-based channels
  - #incidents: Public status updates only
  - #incident-sev-2-INTERNAL: Investigation team only
  - #incident-sev-2-EXEC: CTO/VP and IC only
  - Clear roles: IC, Tech Lead, Support Lead, Exec Sponsor
- **Owner**: @incident-commander-lead
- **Timeline**: Document in incident response guide (immediate)

---

## Lessons Learned

### Technical Lessons

1. **Database Index Statistics Matter**
   - Creating indexes doesn't automatically update statistics
   - Query optimizer uses stale statistics to choose plans
   - Always run `ANALYZE` immediately after bulk schema changes

2. **Testing with Small Data Volume is Insufficient**
   - 10,000 rows behavior ≠ 50,000,000 rows behavior
   - Query optimizer threshold changes kick in at different volumes
   - Must test with production-like data volumes

3. **Query Optimization Can Regress**
   - Indexes aren't always a win
   - Small changes can cause big performance swings
   - Need monitoring to catch regressions

### Process Lessons

1. **Incident Response Processes Are Valuable**
   - The process worked: alert → acknowledge → declare → investigate → fix → verify
   - Could have been much worse without clear incident response
   - Value of training: IC knew exactly what to do

2. **Communication is Critical**
   - Transparent status updates reduced customer anxiety
   - Even "still investigating" is better than silence
   - Automated status updates would be better

3. **Monitoring is the First Line of Defense**
   - Caught the incident within 1 minute
   - Without monitoring, could have gone on for hours
   - Good monitoring return on investment

### Organizational Lessons

1. **Need Clear Handoff Points**
   - DBA team not automatically involved in deployments
   - Created gap: engineering deployed without DBA review
   - Should have explicit "DBA approval required" checkboxes

2. **Staging Environment Must Match Production**
   - Staging with 10K rows is useless for volume testing
   - Need way to quickly populate staging with anonymized production data
   - Current gap: takes 3 days to refresh staging

3. **Incident Response Needs Training**
   - Team performed well, but only because had practiced
   - New engineers would have been lost
   - Should require incident response training for all engineers

---

## Action Items

### High Priority (Implement Within 2 Weeks)

**[1] Build Query Plan Regression Detection**
- **Objective**: Automatically detect when query execution plans change
- **Approach**: Store EXPLAIN output before/after schema changes; alert if execution time changes >20%
- **Owner**: @dba-team (@john.smith)
- **Due Date**: 2024-02-01
- **Estimation**: 2-3 days of work
- **Success Metric**: Catches similar regressions automatically
- **Related Playbook**: RUNBOOK_DATABASE.md

**[2] Enforce Staging Validation for Schema Changes**
- **Objective**: Prevent production deployments of untested schema changes
- **Approach**:
  1. Update deployment checklist: "All schema migrations validated in staging with ≥1M rows" (mandatory)
  2. Update CI/CD: Run migrations against staging data
  3. Require DBA sign-off on all migration PRs
- **Owner**: @devops-lead (@jane.smith) + @dba-team
- **Due Date**: 2024-02-01
- **Estimation**: 1 day of work
- **Success Metric**: All future migrations validated before production
- **Related Playbook**: RUNBOOK_DATABASE.md

**[3] Implement Expedited Deployment Process for Critical Incidents**
- **Objective**: Reduce time from fix to production from 15 minutes to <5 minutes
- **Approach**:
  1. Create "hotfix" deployment path: IC + Tech Lead approval only (no PR review)
  2. Skip non-critical CI tests for hotfixes
  3. Target deployment time: <2 minutes
  4. Document in INCIDENT_RESPONSE_GUIDE.md
- **Owner**: @devops-lead (@bob.jones)
- **Due Date**: 2024-02-01
- **Estimation**: 1 day of work
- **Success Metric**: Next SEV-2 deploys in <5 minutes
- **Related Playbook**: INCIDENT_RESPONSE_GUIDE.md

### Medium Priority (Implement Within 1 Month)

**[4] Automate Status Page Updates from Monitoring**
- **Objective**: Reduce customer notification latency from 40 minutes to 2 minutes
- **Approach**:
  1. Integration: AlertManager → Status page API
  2. Rules: Error rate >5% for 2 mins → "Investigating" status
  3. Escalation: Error rate >10% for 5 mins → "Major outage" + auto-email customers
- **Owner**: @product-team (@alice.wang)
- **Due Date**: 2024-02-15
- **Estimation**: 2-3 days of work
- **Success Metric**: Next incident has status update within 2 minutes
- **Related Playbook**: INCIDENT_RESPONSE_GUIDE.md

**[5] Build Query Performance Monitoring Dashboard**
- **Objective**: Provide visibility into query performance over time
- **Approach**:
  1. Prometheus: Track execution time for top 50 queries
  2. Grafana: Dashboard showing p50, p95, p99 latencies per query
  3. Alerts: Fire when any query latency >200% of baseline
- **Owner**: @monitoring-team (@carol.lee)
- **Due Date**: 2024-02-15
- **Estimation**: 3 days of work
- **Success Metric**: Dashboard shows all critical queries; 0 alerts at baseline
- **Related Playbook**: RUNBOOK_MONITORING.md

**[6] Improve Staging Environment for Volume Testing**
- **Objective**: Allow quick testing with production-like data volumes
- **Approach**:
  1. Create anonymized production data snapshot (50M rows)
  2. Automate weekly refresh of staging database
  3. Document in playbook: "How to test with production volume"
- **Owner**: @devops-lead (@bob.jones)
- **Due Date**: 2024-02-28
- **Estimation**: 2 days of work
- **Success Metric**: Can provision production-volume staging in <1 hour

**[7] Create "Database Migrations" Runbook**
- **Objective**: Document best practices for deploying database changes safely
- **Approach**:
  1. Cover: Index creation, table alterations, data migrations
  2. Include: Staging validation, statistics updates, monitoring
  3. Include: Rollback procedures
- **Owner**: @dba-team (@john.smith)
- **Due Date**: 2024-01-30
- **Estimation**: 1 day of work
- **Success Metric**: All team members aware; referenced in deployment process

### Low Priority (Implement Within 3 Months)

**[8] Incident Response Training for All Engineers**
- **Objective**: Ensure all engineers can respond to critical incidents
- **Approach**:
  1. Create 2-hour training module
  2. Include: Incident response process, communication, decision-making
  3. Role-playing: 2 simulated incidents
  4. Requirement for all engineers in first 6 months
- **Owner**: @engineering-manager (@david.park)
- **Due Date**: 2024-03-31
- **Estimation**: 4 days of work
- **Success Metric**: 100% of engineers trained; score >80% on knowledge check

**[9] Implement Cross-Team Incident Response Exercises**
- **Objective**: Test incident response process and team communication
- **Approach**:
  1. Quarterly "war games"
  2. Simulated SEV-2 incident
  3. Whole team involved
  4. Debrief and lessons learned
- **Owner**: @incident-commander-lead (@emma.taylor)
- **Due Date**: 2024-04-30
- **Estimation**: 1 day planning + 2 hours execution per quarter
- **Success Metric**: Team response time <15 minutes in simulations

---

## Follow-Up

### Action Item Tracking
- All action items tracked in Jira with "incident-PIR-2024-01-15" label
- Weekly status check in engineering meeting
- On-call team accountable for incident-related items

### Timeline Review
- 1-week review: Check on high-priority items (Jan 20)
- 1-month review: Full status update (Feb 15)
- 3-month review: Confirm all items completed (Apr 15)

---

## Appendices

### Appendix A: Query Execution Plans

**Before index creation:**
```sql
EXPLAIN (ANALYZE)
SELECT * FROM transactions
WHERE user_id = '12345' AND merchant_id = 'merch_789'
ORDER BY created_at DESC
LIMIT 100;

Index Scan using idx_transactions_user_id on transactions  (cost=0.42..1234.56 rows=89 loops=1)
  Index Cond: (user_id = '12345')
  Filter: (merchant_id = 'merch_789')
  Planning Time: 0.234 ms
  Execution Time: 87.234 ms  ✅ GOOD
```

**After index creation (problematic):**
```sql
EXPLAIN (ANALYZE)
SELECT * FROM transactions
WHERE user_id = '12345' AND merchant_id = 'merch_789'
ORDER BY created_at DESC
LIMIT 100;

Index Scan using idx_transactions_user_merchant_date on transactions  (cost=0.42..8234.56 rows=89 loops=1)
  Index Cond: ((user_id = '12345') AND (merchant_id = 'merch_789'))
  Planning Time: 0.456 ms
  Execution Time: 823.567 ms  ❌ BAD (10x slower)
```

---

### Appendix B: Customer Complaint Examples

1. Email from customer:
   > "We tried to process payment for our customer order but it took 5 minutes! Our checkout page timed out. What's going on?"

2. Support ticket:
   > "Payment failed with timeout error. We tried 3 times. Please don't charge us 3 times. We only want one charge."

3. Merchant dashboard report:
   > "Payment processing performance degraded. We recorded p95 latency of 2.3 seconds vs normal 150ms."

---

### Appendix C: Monitoring Alerts During Incident

```
Prometheus alerts that fired:
1. ErrorRateHigh (triggered 10:15 AM) - Error rate > 5%
2. PaymentServiceHighLatency (triggered 10:16 AM) - p95 latency > 500ms
3. DatabaseHighCPU (triggered 10:17 AM) - DB CPU > 80%
4. PaymentServiceHighMemory (triggered 10:20 AM) - Memory > 70%

Resolved timeline:
- ErrorRateHigh: Resolved 11:05 AM
- PaymentServiceHighLatency: Resolved 11:03 AM
- DatabaseHighCPU: Resolved 11:02 AM
- PaymentServiceHighMemory: Resolved 11:01 AM
```

---

## Sign-Off

This post-incident review was conducted on **2024-01-16** and approved by:

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Incident Commander | John Doe | ___________ | 2024-01-16 |
| Tech Lead | Jane Smith | ___________ | 2024-01-16 |
| Engineering Manager | Bob Jones | ___________ | 2024-01-16 |
| VP Engineering | Carol Lee | ___________ | 2024-01-16 |

---

## Document Management

- **Version**: 1.0
- **Last Updated**: 2024-01-16
- **Owner**: Engineering Leadership
- **Distribution**: Whole Engineering Team, Executive Team
- **Retention**: 7 years (regulatory requirement for fintech)

