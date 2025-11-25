# AP/AR Automated Sync Cutover Plan

## Overview

This document outlines the cutover plan for transitioning from manual AP/AR processes to automated synchronization between ATLVS and external ERP systems (NetSuite, QuickBooks, Xero).

---

## Pre-Cutover Checklist

### 1. Data Validation (T-14 days)

- [ ] Export all open AP invoices from ERP
- [ ] Export all open AR invoices from ATLVS
- [ ] Reconcile totals between systems
- [ ] Document any discrepancies
- [ ] Resolve data quality issues

### 2. Integration Testing (T-10 days)

- [ ] Complete end-to-end sync test in staging
- [ ] Verify field mapping accuracy
- [ ] Test error handling scenarios
- [ ] Validate webhook delivery
- [ ] Confirm retry logic works correctly

### 3. User Training (T-7 days)

- [ ] Train finance team on new workflow
- [ ] Document manual override procedures
- [ ] Create troubleshooting guide
- [ ] Establish escalation contacts

### 4. Final Preparation (T-3 days)

- [ ] Freeze manual entries during cutover window
- [ ] Take full backup of both systems
- [ ] Notify stakeholders of cutover schedule
- [ ] Confirm rollback procedures

---

## Cutover Procedure

### Phase 1: Preparation (Friday 6:00 PM)

```bash
# 1. Enable maintenance mode
curl -X POST https://api.ghxstship.com/atlvs/v1/admin/maintenance \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"enabled": true, "message": "AP/AR sync cutover in progress"}'

# 2. Disable existing manual sync jobs
pnpm run disable-manual-sync

# 3. Create backup checkpoint
pnpm run backup:create --tag "pre-cutover-$(date +%Y%m%d)"
```

### Phase 2: Data Sync (Friday 7:00 PM)

```bash
# 1. Run full reconciliation
pnpm run reconcile:full --source=erp --target=atlvs

# 2. Verify totals match
pnpm run verify:totals

# 3. Generate reconciliation report
pnpm run report:reconciliation --output=cutover-report.pdf
```

### Phase 3: Enable Automation (Friday 8:00 PM)

```bash
# 1. Enable automated AP sync
curl -X POST https://api.ghxstship.com/atlvs/v1/integrations/erp-sync/enable \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"module": "ap", "direction": "bidirectional"}'

# 2. Enable automated AR sync
curl -X POST https://api.ghxstship.com/atlvs/v1/integrations/erp-sync/enable \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"module": "ar", "direction": "bidirectional"}'

# 3. Register webhooks
pnpm run webhooks:register --config=production
```

### Phase 4: Validation (Friday 9:00 PM)

```bash
# 1. Create test invoice in ATLVS
curl -X POST https://api.ghxstship.com/atlvs/v1/invoices \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"client_id": "test_client", "amount": 100, "description": "Cutover test"}'

# 2. Verify sync to ERP (wait 60 seconds)
sleep 60
pnpm run verify:sync --invoice-id=$TEST_INVOICE_ID

# 3. Create test bill in ERP and verify reverse sync
# (Manual step in ERP UI)

# 4. Run validation suite
pnpm run validate:cutover
```

### Phase 5: Go Live (Friday 10:00 PM)

```bash
# 1. Disable maintenance mode
curl -X POST https://api.ghxstship.com/atlvs/v1/admin/maintenance \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"enabled": false}'

# 2. Send completion notification
pnpm run notify:cutover-complete

# 3. Enable monitoring alerts
pnpm run alerts:enable --profile=ap-ar-sync
```

---

## Rollback Procedure

### Trigger Conditions

Initiate rollback if any of the following occur:
- Sync failure rate > 5% in first hour
- Data mismatch > $1,000 in totals
- Critical error in sync logs
- ERP system unavailable > 30 minutes

### Rollback Steps

```bash
# 1. Disable automated sync immediately
curl -X POST https://api.ghxstship.com/atlvs/v1/integrations/erp-sync/disable \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"module": "all", "reason": "Rollback initiated"}'

# 2. Enable maintenance mode
curl -X POST https://api.ghxstship.com/atlvs/v1/admin/maintenance \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"enabled": true, "message": "AP/AR sync rollback in progress"}'

# 3. Restore from backup
pnpm run backup:restore --tag "pre-cutover-$(date +%Y%m%d)"

# 4. Verify data integrity
pnpm run verify:integrity

# 5. Re-enable manual sync jobs
pnpm run enable-manual-sync

# 6. Disable maintenance mode
curl -X POST https://api.ghxstship.com/atlvs/v1/admin/maintenance \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"enabled": false}'

# 7. Notify stakeholders
pnpm run notify:rollback-complete
```

### Post-Rollback Analysis

1. Collect all sync logs from cutover window
2. Identify root cause of failure
3. Document lessons learned
4. Schedule follow-up cutover attempt

---

## Monitoring & Alerting

### Key Metrics

| Metric | Threshold | Alert Level |
|--------|-----------|-------------|
| Sync success rate | < 95% | Critical |
| Sync latency | > 5 minutes | Warning |
| Data variance | > $100 | Warning |
| Data variance | > $1,000 | Critical |
| Webhook failures | > 3 consecutive | Critical |

### Alert Configuration

```yaml
# alerts/ap-ar-sync.yaml
alerts:
  - name: ap_ar_sync_failure_rate
    condition: sync_success_rate < 0.95
    duration: 5m
    severity: critical
    channels: [pagerduty, slack-finance]
    
  - name: ap_ar_sync_latency
    condition: avg_sync_latency > 300s
    duration: 10m
    severity: warning
    channels: [slack-finance]
    
  - name: ap_ar_data_variance
    condition: abs(atlvs_total - erp_total) > 1000
    duration: 1m
    severity: critical
    channels: [pagerduty, slack-finance, email-cfo]
```

### Dashboard URLs

- **Sync Status**: https://atlvs.ghxstship.com/admin/integrations/erp-sync
- **Metrics**: https://grafana.ghxstship.com/d/ap-ar-sync
- **Logs**: https://logs.ghxstship.com/app/ap-ar-sync

---

## Support Contacts

| Role | Name | Contact |
|------|------|---------|
| Integration Lead | Platform Team | platform@ghxstship.com |
| Finance Lead | Finance Team | finance@ghxstship.com |
| ERP Admin | IT Team | it@ghxstship.com |
| On-Call Engineer | PagerDuty | #integration-oncall |

### Escalation Path

1. **L1**: Integration monitoring alerts → Slack #integration-alerts
2. **L2**: Platform team on-call → PagerDuty
3. **L3**: Finance leadership → Direct contact
4. **L4**: Executive escalation → CTO/CFO

---

## Post-Cutover Tasks

### Day 1 (Monday)

- [ ] Review overnight sync logs
- [ ] Verify all scheduled syncs completed
- [ ] Check for any failed transactions
- [ ] Confirm finance team can access reports

### Week 1

- [ ] Daily reconciliation checks
- [ ] Monitor sync latency trends
- [ ] Gather user feedback
- [ ] Document any issues encountered

### Month 1

- [ ] Full reconciliation audit
- [ ] Performance optimization review
- [ ] Update documentation based on learnings
- [ ] Plan for additional automation features

---

## Appendix

### A. Field Mapping Reference

| ATLVS Field | NetSuite Field | QuickBooks Field | Xero Field |
|-------------|----------------|------------------|------------|
| invoice_number | tranId | DocNumber | InvoiceNumber |
| client_id | entity | CustomerRef | ContactID |
| amount | total | TotalAmt | Total |
| due_date | dueDate | DueDate | DueDate |
| status | status | Balance (derived) | Status |
| line_items | item | Line | LineItems |

### B. Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| SYNC_001 | Connection timeout | Retry automatically |
| SYNC_002 | Authentication failed | Check API credentials |
| SYNC_003 | Rate limit exceeded | Backoff and retry |
| SYNC_004 | Data validation error | Review field mapping |
| SYNC_005 | Duplicate record | Skip or merge |

### C. Backup Schedule

- **Full backup**: Daily at 2:00 AM UTC
- **Incremental**: Every 4 hours
- **Retention**: 30 days
- **Location**: S3 bucket `ghxstship-backups/atlvs/`

---

*Document Version: 1.0.0*
*Last Updated: November 2024*
*Next Review: Post-cutover + 30 days*
