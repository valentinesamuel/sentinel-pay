# Runbooks Guide - Ubiquitous Tribble Fintech Platform

## Table of Contents
1. [Overview](#overview)
2. [Runbook Structure](#runbook-structure)
3. [Common Patterns](#common-patterns)
4. [Available Runbooks](#available-runbooks)
5. [Creating New Runbooks](#creating-new-runbooks)
6. [Runbook Maintenance](#runbook-maintenance)

---

## Overview

A runbook is a step-by-step guide for performing routine operational tasks and procedures on the fintech platform. Runbooks are designed to:

- **Reduce manual effort**: Automate and document common procedures
- **Ensure consistency**: Every operator follows the same process
- **Minimize errors**: Detailed steps reduce mistakes
- **Accelerate resolution**: Quick reference saves time
- **Onboard new team members**: Reference guide for training

### When to Use Runbooks

**Use runbooks for:**
- Routine operational tasks (deployments, database maintenance, backups)
- Regular maintenance windows (schema migrations, index optimization)
- Common operational procedures (user account creation, merchant verification)
- Data corrections and adjustments
- Scheduled tasks (settlement processing, reconciliation)

**Use incident response procedures for:**
- Unexpected failures and outages
- System emergencies requiring immediate response
- Situations requiring root cause analysis
- Issues affecting multiple systems
- Customer-impacting incidents

---

## Runbook Structure

Each runbook follows a consistent format:

```markdown
# Runbook: [Title]

## Overview
[2-3 sentence description of what this runbook does]

## Severity Level
- **Impact**: [None/Minor/Major/Critical]
- **Duration**: [Typical duration to complete]
- **Frequency**: [How often this is performed]
- **Rollback Possible**: [Yes/No/Depends on state]

## Prerequisites
- [Requirement 1]
- [Requirement 2]
- [Access level required]

## Required Tools
- [Tool 1] - [Purpose]
- [Tool 2] - [Purpose]

## Step-by-Step Procedure

### Phase 1: [Preparation/Validation]
1. [Detailed step with context]
   ```bash
   # Command example if applicable
   command --flag value
   ```
2. [Next step]
   - [Sub-step with additional context]
   - **Expected result**: [What should happen]
   - **Error handling**: [What to do if it fails]

### Phase 2: [Execution]
[Continue with detailed steps]

### Phase 3: [Verification]
[Verification and testing steps]

## Verification Checklist
- [ ] Verification step 1
- [ ] Verification step 2
- [ ] Monitor for 5 minutes

## Rollback Procedure
[Steps to reverse if needed]

## Estimated Time
[X-Y minutes depending on factors]

## Risk Assessment
- **Low**: [Reason]
- **Mitigation**: [How to reduce risk]

## Common Issues & Troubleshooting
### Issue: [Problem description]
**Cause**: [Why this happens]
**Solution**: [How to fix]
**Prevention**: [How to avoid next time]

## Related Runbooks
- [Link to related runbook]
- [Link to related runbook]

## Historical Execution Log
| Date | Operator | Duration | Status | Notes |
|------|----------|----------|--------|-------|
| 2024-01-15 | john.doe | 12m | Success | Routine maintenance |

## Last Updated
[Date] by [Person]

## Owner
[Team/Person responsible for maintaining this runbook]
```

---

## Common Patterns

### Pattern 1: Database Operations

**Template for DB tasks:**
```
1. Verify backup is recent
   - Command to check backup timestamp
2. Put system in maintenance mode (if needed)
3. Execute operation with explicit timeout
4. Verify operation success with query
5. Monitor metrics for 5 minutes
6. Exit maintenance mode
```

**Why this matters:**
- Ensures data can be recovered if needed
- Prevents concurrent operations
- Explicit timeouts prevent hangs
- Metrics monitoring catches cascading failures

### Pattern 2: Service Deployments

**Template for deployment:**
```
1. Health check pre-deployment
2. Build/prepare new version
3. Deploy to non-critical instance
4. Run smoke tests
5. Gradual rollout (canary/blue-green)
6. Monitor error rates and latency
7. Roll back if thresholds exceeded
```

### Pattern 3: Data Corrections

**Template for data fixes:**
```
1. Identify affected transactions/records
2. Backup current state before changes
3. Dry-run query to show impact
4. Get approval from manager
5. Execute with transaction rollback point
6. Audit log the change with reason
7. Notify affected customers if applicable
```

---

## Available Runbooks

### Payment Processing
- **RUNBOOK_PAYMENT_PROCESSING.md**
  - Manual payment processing
  - Payment retry/replay
  - Idempotency key management
  - Transaction state fixes
  - Payment reversal procedures

### Settlement Operations
- **RUNBOOK_SETTLEMENT.md**
  - Manual settlement execution
  - Settlement dispute investigation
  - Payout failure handling
  - Settlement reconciliation
  - Chargebacks and reversals

### Merchant Management
- **RUNBOOK_MERCHANT_OPERATIONS.md**
  - Merchant account creation
  - KYC verification and approval
  - Merchant suspension/deactivation
  - Fee structure updates
  - API credential rotation

### Database Operations
- **RUNBOOK_DATABASE.md**
  - Database backup/restore
  - Connection pool reset
  - Query optimization
  - Index maintenance
  - Schema migration

### Security Operations
- **RUNBOOK_SECURITY.md**
  - API key rotation
  - Certificate renewal
  - Fraud alert investigation
  - Suspicious activity review
  - Security incident containment

### Monitoring & Observability
- **RUNBOOK_MONITORING.md**
  - Alert investigation
  - Metrics interpretation
  - Log analysis procedures
  - Dashboard setup
  - Data export for analysis

---

## Creating New Runbooks

### Step 1: Identify the Need
**Ask:**
- Do operators perform this task frequently?
- Are there error-prone steps?
- Would documentation save time?
- Is there a standard procedure?

### Step 2: Document Current Process
1. Follow the procedure yourself
2. Note every step, decision point, and potential failure mode
3. Time how long it takes
4. Ask experienced operators for tips and gotchas

### Step 3: Create Draft
1. Use the structure template above
2. Include detailed steps with examples
3. Add verification steps to confirm success
4. Include rollback procedure
5. List all error scenarios you've seen

### Step 4: Review & Test
1. Have another operator follow the runbook end-to-end
2. Fix any unclear or missing steps
3. Verify all commands work in current environment
4. Test rollback procedure
5. Get review from team lead

### Step 5: Publish & Train
1. Add to runbooks documentation
2. Walk team through new runbook
3. Log location in team wiki/documentation
4. Schedule review in 1 month to incorporate feedback

---

## Runbook Maintenance

### Monthly Review
- Check if steps still apply (systems change)
- Look at execution log for common issues
- Update based on feedback from operators
- Verify all commands still work

### Quarterly Update
- Review for steps that can be automated
- Update estimated times based on actual executions
- Incorporate new best practices
- Remove outdated procedures

### When to Update
- **After incident**: If an incident revealed gaps in a runbook
- **System changes**: If underlying systems change
- **New tools**: If new tools make a procedure easier
- **Feedback**: If operators report issues

### Version Control
Keep runbooks in git with clear version history:
```
docs/runbooks/
├── README.md (this file)
├── payment_processing.md
├── settlement.md
├── merchant_operations.md
├── database_operations.md
├── security_operations.md
└── monitoring.md
```

---

## Best Practices

### 1. Be Specific
❌ **Bad**: "Check the database"
✅ **Good**: "Execute `SELECT COUNT(*) FROM transactions WHERE created_at > NOW() - INTERVAL '1 hour'` and verify count < 10000"

### 2. Provide Context
Include **why** each step matters:
```
Step 3: Enable maintenance mode
- Why: Prevents new transactions during data migration
- Risk if skipped: Database deadlocks from concurrent writes
```

### 3. Include Rollback
Every runbook must have a rollback section:
```
## Rollback Procedure
If settlement fails:
1. Query most recent failed batch ID
2. Run reversal script: ./scripts/reverse-settlement.sh <batch-id>
3. Verify all transactions returned to PENDING state
4. Contact affected merchants
```

### 4. Document Verification
Provide exact commands to verify success:
```
## Verification
Run: psql -d fintech -c "SELECT COUNT(*) FROM settlements WHERE status='COMPLETED' AND created_at > NOW() - INTERVAL '5 minutes';"
Expected result: ~1000 settlements in last 5 minutes
Acceptable range: 800-1200
```

### 5. Include Timing
Always estimate how long tasks take:
```
## Estimated Time
- Full deployment: 15-20 minutes
  - Build: 5 minutes
  - Deploy to staging: 3 minutes
  - Smoke tests: 2 minutes
  - Canary deploy: 5 minutes
  - Monitor: 5 minutes
```

### 6. Plan for Failures
Address common failure modes:
```
## Common Issues

### Issue: "Connection timeout" error
**Cause**: Database connection pool exhausted
**Solution**:
  1. Check active connections: SELECT count(*) FROM pg_stat_activity;
  2. Identify long-running queries: SELECT * FROM pg_stat_statements ORDER BY mean_time DESC;
  3. Terminate if safe: SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state='idle' AND query_start < NOW() - INTERVAL '2 hours';
```

---

## Runbook Templates by Category

### For Maintenance Tasks
```markdown
## Prerequisites
- Maintenance window scheduled
- Backup verified
- Team notified

## Impact
- Service briefly unavailable
- ~5 minute impact window
- No data loss

## Procedure
1. [Steps]

## Post-Maintenance
- Monitor for 15 minutes
- Run health checks
```

### For Data Corrections
```markdown
## Data Change Request
- Ticket: [Link to change request]
- Approval: [Who approved]
- Reason: [Why this change needed]
- Affected customers: [How many affected]

## Impact Assessment
- Rows affected: [Number]
- Data integrity: [Any risks]
- Reversibility: [Can we undo]

## Dry Run
[Show what changes before applying]

## Execution
[Apply changes]

## Notification
[Which teams/customers to inform]
```

### For Operational Tasks
```markdown
## Task
[What are we doing]

## Preparation
[Prerequisites and setup]

## Procedure
[Steps to complete task]

## Verification
[How to confirm success]

## Monitoring
[What to watch for during/after]
```

---

## Integration with Incident Response

**Runbooks** = Normal operations
**Incident Response** = Abnormal situations

When an incident occurs:
1. Start incident response procedure
2. Investigation may identify a need for a runbook
3. After resolution, document lessons learned
4. Create runbook if task is repeated

**Example flow:**
```
Customer reports payment failures
  ↓
Incident declared (SEV-2)
  ↓
Investigation: "Long database query causing timeouts"
  ↓
Immediate mitigation: Kill long query, restart service
  ↓
Resolution: Optimize query, update database indexes
  ↓
Prevention: Create RUNBOOK_DATABASE.md "Index Optimization" for regular maintenance
```

---

## Tools & Automation

### Runbook Automation
Some runbook steps can be automated:

```bash
#!/bin/bash
# automatic_settlement.sh
# Automated settlement processing runbook

set -e
source /etc/fintech/config.env

echo "Starting settlement processing..."
timestamp=$(date +%s)
log_file="/var/log/settlement_${timestamp}.log"

# Step 1: Verification
echo "1. Verifying pre-conditions..." | tee -a $log_file
pg_isready -h $DB_HOST -p $DB_PORT || { echo "Database unavailable"; exit 1; }
redis-cli -h $REDIS_HOST ping || { echo "Redis unavailable"; exit 1; }

# Step 2: Backup
echo "2. Creating backup..." | tee -a $log_file
pg_dump -h $DB_HOST fintech > /backups/settlement_${timestamp}.sql.gz

# Step 3: Execute
echo "3. Running settlement batch..." | tee -a $log_file
psql -h $DB_HOST -d fintech -f /scripts/settlement_batch.sql >> $log_file 2>&1

# Step 4: Verify
echo "4. Verifying results..." | tee -a $log_file
result=$(psql -h $DB_HOST -d fintech -tc "SELECT COUNT(*) FROM settlements WHERE status='COMPLETED' AND DATE(created_at) = CURRENT_DATE;")
if [ "$result" -lt 500 ]; then
  echo "WARNING: Only $result settlements processed (expected >500)" | tee -a $log_file
  exit 1
fi

echo "Settlement complete: $result settlements processed" | tee -a $log_file
echo "Log: $log_file"
```

### Runbook Checklist Tracking
```markdown
## Execution Log
Date: 2024-01-15
Operator: john.doe
Status: ✅ SUCCESS

- [x] Backup verified recent
- [x] Database connectivity confirmed
- [x] Settlement batch executed
- [x] Results verified
- [x] Monitoring enabled
- [x] Team notified

Notes: Completed in 8 minutes, slightly faster than estimated due to recent optimization.
```

---

## Conclusion

Well-maintained runbooks are critical for operational excellence. They:
- Reduce toil and manual errors
- Enable faster incident response
- Make team knowledge persistent
- Facilitate team scaling
- Improve customer reliability

Invest in documentation. Future you will thank current you.

