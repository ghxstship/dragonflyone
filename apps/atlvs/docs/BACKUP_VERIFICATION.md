# ATLVS Database Backup & Recovery Verification

## Overview

This document outlines the backup strategy, verification procedures, and recovery processes for the ATLVS application database hosted on Supabase.

---

## Backup Strategy

### Automatic Backups (Supabase Managed)

| Feature | Configuration | Notes |
|---------|---------------|-------|
| **Daily Backups** | Enabled | Automatic at 00:00 UTC |
| **Retention Period** | 7 days (Pro) / 30 days (Enterprise) | Configurable |
| **Point-in-Time Recovery** | Enabled | Up to 7 days |
| **Backup Location** | Same region as database | Encrypted at rest |

### Backup Types

1. **Logical Backups (pg_dump)**
   - Full database schema and data
   - Portable across PostgreSQL versions
   - Used for migrations and cloning

2. **Physical Backups (WAL)**
   - Write-Ahead Log continuous archiving
   - Enables Point-in-Time Recovery (PITR)
   - Sub-second recovery point objective

---

## Verification Procedures

### Daily Verification Checklist

- [ ] Confirm backup completed in Supabase dashboard
- [ ] Verify backup size is within expected range
- [ ] Check backup logs for errors
- [ ] Validate backup integrity (monthly)

### Monthly Restoration Test

**Objective:** Verify backups can be successfully restored

**Procedure:**

```bash
# 1. Create a test project in Supabase (or use staging)
supabase projects create atlvs-backup-test --region us-east-1

# 2. Download latest backup from Supabase dashboard
# Dashboard > Settings > Database > Backups > Download

# 3. Restore to test project
psql -h db.[TEST_PROJECT_REF].supabase.co \
     -U postgres \
     -d postgres \
     -f backup_YYYY-MM-DD.sql

# 4. Verify data integrity
psql -h db.[TEST_PROJECT_REF].supabase.co \
     -U postgres \
     -d postgres \
     -c "SELECT COUNT(*) FROM platform_users;"

# 5. Run application smoke tests against restored database
NEXT_PUBLIC_SUPABASE_URL=https://[TEST_PROJECT_REF].supabase.co \
pnpm test:e2e --grep "smoke"

# 6. Document results and delete test project
supabase projects delete atlvs-backup-test
```

### Verification Log Template

```markdown
## Backup Verification Log

**Date:** YYYY-MM-DD
**Performed By:** [Name]
**Backup Date:** YYYY-MM-DD
**Backup Size:** X.XX GB

### Verification Steps

| Step | Status | Notes |
|------|--------|-------|
| Backup downloaded | ✅/❌ | |
| Restore completed | ✅/❌ | Duration: Xm |
| Schema verified | ✅/❌ | Tables: X |
| Data integrity | ✅/❌ | Records: X |
| Application tests | ✅/❌ | Passed: X/Y |

### Issues Found
- None / [Description]

### Sign-off
- [ ] Verified by: [Name]
- [ ] Date: YYYY-MM-DD
```

---

## Recovery Procedures

### Scenario 1: Point-in-Time Recovery (PITR)

**Use Case:** Accidental data deletion, corruption within last 7 days

```bash
# 1. Access Supabase Dashboard
# Dashboard > Settings > Database > Point in Time Recovery

# 2. Select recovery point (timestamp)
# Choose a time BEFORE the incident

# 3. Initiate recovery
# This creates a new database branch

# 4. Verify recovered data
psql -h db.[RECOVERED_REF].supabase.co \
     -U postgres \
     -d postgres \
     -c "SELECT * FROM [affected_table] LIMIT 10;"

# 5. If verified, promote recovered branch or migrate data
```

### Scenario 2: Full Database Restore

**Use Case:** Complete database failure, major corruption

```bash
# 1. Download latest backup
# Dashboard > Settings > Database > Backups

# 2. Create new Supabase project (if needed)
supabase projects create atlvs-recovery --region us-east-1

# 3. Restore backup
psql -h db.[NEW_PROJECT_REF].supabase.co \
     -U postgres \
     -d postgres \
     -f backup_YYYY-MM-DD.sql

# 4. Update environment variables
# Update NEXT_PUBLIC_SUPABASE_URL and keys in Vercel

# 5. Verify application functionality
curl https://atlvs.ghxstship.com/api/health

# 6. Update DNS if project URL changed
```

### Scenario 3: Table-Level Recovery

**Use Case:** Single table corruption or accidental DROP

```bash
# 1. Download backup containing the table

# 2. Extract specific table from backup
pg_restore -t [table_name] backup.dump > table_restore.sql

# 3. Restore table to production
psql -h db.[PROJECT_REF].supabase.co \
     -U postgres \
     -d postgres \
     -f table_restore.sql

# 4. Verify table data
psql -c "SELECT COUNT(*) FROM [table_name];"
```

---

## Recovery Time Objectives

| Scenario | RTO | RPO | Procedure |
|----------|-----|-----|-----------|
| PITR Recovery | 30 min | < 1 min | Scenario 1 |
| Full Restore | 2 hours | 24 hours | Scenario 2 |
| Table Recovery | 1 hour | 24 hours | Scenario 3 |

**RTO** = Recovery Time Objective (max downtime)
**RPO** = Recovery Point Objective (max data loss)

---

## Backup Monitoring

### Alerts Configuration

Set up alerts in Supabase for:
- Backup failure
- Backup size anomaly (>20% change)
- Storage quota approaching limit

### Dashboard Checks

**Weekly:**
- Review backup completion status
- Check storage usage trends
- Verify PITR is enabled

**Monthly:**
- Perform restoration test
- Review backup retention policy
- Update documentation if needed

---

## Security Considerations

### Backup Encryption

- **At Rest:** AES-256 encryption (Supabase managed)
- **In Transit:** TLS 1.3 for all transfers
- **Access Control:** Only admin users can download backups

### Access Audit

```sql
-- Check who accessed backup functions
SELECT * FROM auth.audit_log_entries
WHERE payload->>'action' LIKE '%backup%'
ORDER BY created_at DESC
LIMIT 20;
```

---

## Compliance

### Data Retention

| Data Type | Retention | Backup Retention |
|-----------|-----------|------------------|
| User Data | Per privacy policy | 30 days |
| Audit Logs | 1 year | 90 days |
| Transaction Data | 7 years | 90 days |

### Regulatory Requirements

- **GDPR:** Right to erasure applies to backups after retention period
- **SOC 2:** Backup procedures documented and tested
- **PCI DSS:** Cardholder data encrypted in backups (if applicable)

---

## Emergency Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| Database Admin | [Contact] | Backup management |
| DevOps Lead | [Contact] | Recovery execution |
| Security Officer | [Contact] | Breach notification |

---

## Verification History

| Date | Type | Result | Performed By |
|------|------|--------|--------------|
| 2025-12-26 | Documentation | Created | Automated Audit |
| | Monthly Test | Pending | |
| | Monthly Test | Pending | |

---

*Last Updated: December 2025*
*Next Review: January 2026*
