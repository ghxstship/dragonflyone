# Disaster Recovery Plan

## GHXSTSHIP Platform Recovery Objectives

**Last Updated:** December 29, 2025  
**Document Owner:** Engineering Team  
**Review Cadence:** Quarterly

---

## Recovery Objectives

### Recovery Time Objective (RTO)

| Service | RTO | Justification |
|---------|-----|---------------|
| **ATLVS** (Production Management) | 4 hours | Business-critical for active productions |
| **COMPVSS** (Crew Management) | 4 hours | Required for crew scheduling and operations |
| **GVTEWAY** (Consumer Portal) | 2 hours | Revenue-generating, customer-facing |
| **Supabase Database** | 1 hour | Core data store for all services |
| **Edge Functions** | 30 minutes | Webhooks and automation |
| **Authentication** | 30 minutes | Blocks all user access |

### Recovery Point Objective (RPO)

| Data Type | RPO | Backup Method |
|-----------|-----|---------------|
| **Transactional Data** | 1 hour | Supabase PITR (Pro plan) |
| **User Data** | 24 hours | Daily automated backups |
| **Configuration** | 0 (real-time) | Git version control |
| **Media/Attachments** | 24 hours | Supabase Storage replication |

---

## Backup Strategy

### Automated Backups

1. **Daily Database Backups** (`.github/workflows/backup.yml`)
   - Schedule: 2:00 AM UTC daily
   - Retention: 30 days
   - Storage: AWS S3 (Glacier IR for production, Standard IA for staging)
   - Encryption: AES-256 at rest

2. **Point-in-Time Recovery (PITR)**
   - Enabled on Supabase Pro plan
   - Retention: 7 days
   - Granularity: 1 second

3. **Configuration Backups**
   - All infrastructure as code in Git
   - Environment variables in GitHub Secrets
   - Supabase migrations versioned

### Manual Backup Commands

```bash
# Create manual backup
pnpm backup:production

# List available backups
bash scripts/backup-restore.sh list production

# Point-in-time recovery info
bash scripts/backup-restore.sh pitr production "2024-12-29 15:30:00"
```

---

## Recovery Procedures

### Scenario 1: Database Corruption

**Detection:** Health check failure, application errors  
**RTO:** 1 hour  
**RPO:** 1 hour (PITR) or 24 hours (daily backup)

**Steps:**
1. Identify corruption scope via Supabase dashboard
2. For recent corruption (< 7 days): Use PITR
   ```bash
   # Via Supabase Dashboard > Database > Backups > Point in Time Recovery
   ```
3. For older corruption: Restore from S3 backup
   ```bash
   bash scripts/backup-restore.sh restore production backups/production/backup_YYYYMMDD_HHMMSS.sql.gz
   ```
4. Verify data integrity
5. Notify affected users

### Scenario 2: Application Deployment Failure

**Detection:** Vercel deployment failure, health check failure  
**RTO:** 30 minutes  
**RPO:** 0 (no data loss)

**Steps:**
1. Check Vercel dashboard for deployment status
2. Rollback to previous deployment:
   ```bash
   bash scripts/rollback.sh production
   ```
3. Or via Vercel Dashboard: Deployments > Previous > Promote to Production
4. Verify health endpoints respond
5. Investigate root cause before re-deploying

### Scenario 3: Supabase Outage

**Detection:** Health check failure, connection errors  
**RTO:** Dependent on Supabase (typically < 1 hour)  
**RPO:** 0 (Supabase manages replication)

**Steps:**
1. Check Supabase status: https://status.supabase.com
2. Enable maintenance mode in applications
3. Monitor Supabase status for resolution
4. Verify connectivity once resolved
5. Disable maintenance mode

### Scenario 4: Complete Infrastructure Loss

**Detection:** All services unreachable  
**RTO:** 4 hours  
**RPO:** 24 hours

**Steps:**
1. Create new Supabase project
2. Restore database from S3 backup
3. Apply migrations: `supabase db push`
4. Deploy Edge Functions: `bash scripts/supabase-deploy.sh production`
5. Update Vercel environment variables
6. Trigger Vercel redeployment
7. Update DNS if needed
8. Verify all health endpoints

---

## Communication Plan

### Internal Escalation

| Severity | Response Time | Notification |
|----------|---------------|--------------|
| P0 (Complete outage) | 15 minutes | Slack #ops-critical, PagerDuty |
| P1 (Partial outage) | 30 minutes | Slack #ops-alerts |
| P2 (Degraded) | 2 hours | Slack #engineering |

### External Communication

- **Status Page:** Update within 15 minutes of confirmed incident
- **Email:** Notify affected customers within 1 hour
- **Social:** Post updates for major incidents

---

## Testing Schedule

| Test Type | Frequency | Last Tested | Next Scheduled |
|-----------|-----------|-------------|----------------|
| Backup Verification | Monthly | - | January 2025 |
| Restore Drill | Quarterly | - | Q1 2025 |
| Failover Test | Annually | - | 2025 |
| Full DR Exercise | Annually | - | 2025 |

---

## Contacts

| Role | Primary | Backup |
|------|---------|--------|
| On-Call Engineer | See PagerDuty | See PagerDuty |
| Engineering Lead | - | - |
| DevOps | - | - |

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-29 | 1.0 | Initial document | Infrastructure Audit |
