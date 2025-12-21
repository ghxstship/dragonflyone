# Disaster Recovery Plan

## GHXSTSHIP Industries - Business Continuity & Disaster Recovery

**Document Version:** 1.0  
**Last Updated:** January 2025  
**SOC 2 Control:** A2 (Availability)  
**Classification:** Confidential

---

## 1. Executive Summary

This document defines the Disaster Recovery (DR) and Business Continuity Plan (BCP) for the GHXSTSHIP platform. It establishes Recovery Time Objectives (RTO), Recovery Point Objectives (RPO), and procedures for restoring services following a disaster or major incident.

---

## 2. Recovery Objectives

### 2.1 Recovery Time Objective (RTO)

| Service Tier | RTO | Description |
|--------------|-----|-------------|
| **Critical** | 1 hour | Core authentication, payment processing |
| **High** | 4 hours | Primary application functionality |
| **Medium** | 8 hours | Secondary features, reporting |
| **Low** | 24 hours | Non-essential features, analytics |

### 2.2 Recovery Point Objective (RPO)

| Data Type | RPO | Backup Method |
|-----------|-----|---------------|
| **Transactional** | 0 minutes | Synchronous replication |
| **User Data** | 1 hour | Point-in-time recovery |
| **Application State** | 4 hours | Scheduled snapshots |
| **Logs/Analytics** | 24 hours | Daily backups |

---

## 3. Infrastructure Architecture

### 3.1 Primary Infrastructure

| Component | Provider | Region | Redundancy |
|-----------|----------|--------|------------|
| Database | Supabase | US-East | Multi-AZ |
| Hosting | Vercel | Global Edge | Multi-region |
| CDN | Cloudflare | Global | Anycast |
| Payments | Stripe | US/EU | Multi-region |
| Email | Resend | US | N/A |

### 3.2 Data Flow

```
Users → Cloudflare (CDN/WAF) → Vercel (Edge) → Supabase (Database)
                                    ↓
                              Stripe (Payments)
                                    ↓
                              Resend (Email)
```

### 3.3 Backup Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Database                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Primary Instance (US-East)                          │   │
│  │  - WAL streaming to standby                          │   │
│  │  - Point-in-time recovery enabled                    │   │
│  │  - Daily automated backups                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Backup Storage (S3-compatible)                      │   │
│  │  - 30-day retention                                  │   │
│  │  - Cross-region replication                          │   │
│  │  - Encrypted at rest (AES-256)                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Disaster Scenarios

### 4.1 Scenario Classification

| Scenario | Severity | RTO | Procedure |
|----------|----------|-----|-----------|
| Database corruption | Critical | 1 hour | PITR restore |
| Region outage | Critical | 2 hours | Failover to backup region |
| DDoS attack | High | 15 minutes | Cloudflare mitigation |
| Application bug | High | 30 minutes | Rollback deployment |
| Data breach | Critical | Immediate | Incident response |
| Vendor outage (Supabase) | Critical | 4 hours | Manual failover |
| Vendor outage (Vercel) | High | 1 hour | DNS failover |
| Vendor outage (Stripe) | Medium | N/A | Queue payments |

### 4.2 Scenario Details

#### 4.2.1 Database Corruption

**Trigger:** Data integrity issues, failed migration, malicious activity

**Response:**
1. Identify scope of corruption
2. Stop write operations to affected tables
3. Initiate point-in-time recovery to last known good state
4. Verify data integrity
5. Resume operations
6. Post-incident review

**Commands:**
```bash
# Supabase PITR restore (via dashboard or CLI)
supabase db restore --project-ref <project-id> --target-time "2025-01-20T12:00:00Z"
```

#### 4.2.2 Region Outage

**Trigger:** AWS region failure, network partition

**Response:**
1. Confirm outage via status pages
2. Update DNS to point to backup region
3. Verify application functionality
4. Communicate with users
5. Monitor for primary region recovery
6. Plan failback

#### 4.2.3 DDoS Attack

**Trigger:** Traffic spike, service degradation

**Response:**
1. Cloudflare automatically mitigates
2. Enable "Under Attack" mode if needed
3. Review attack patterns
4. Adjust WAF rules
5. Document incident

---

## 5. Backup Procedures

### 5.1 Automated Backups

| Backup Type | Frequency | Retention | Location |
|-------------|-----------|-----------|----------|
| Database (full) | Daily | 30 days | Supabase managed |
| Database (PITR) | Continuous | 7 days | Supabase managed |
| Application code | On deploy | Indefinite | GitHub |
| Configuration | On change | 90 days | GitHub |
| Secrets | On change | Encrypted | Vercel/Supabase |

### 5.2 Backup Verification

| Test Type | Frequency | Owner | Documentation |
|-----------|-----------|-------|---------------|
| Restore test | Monthly | DevOps | Test report |
| PITR test | Quarterly | DevOps | Test report |
| Full DR drill | Annually | Engineering | DR report |

### 5.3 Backup Monitoring

```yaml
# GitHub Actions: .github/workflows/backup.yml
name: Backup Verification

on:
  schedule:
    - cron: '0 6 * * 1'  # Weekly on Monday at 6 AM

jobs:
  verify-backups:
    runs-on: ubuntu-latest
    steps:
      - name: Check Supabase backup status
        run: |
          # Verify backup exists and is recent
          curl -s -H "Authorization: Bearer ${{ secrets.SUPABASE_ACCESS_TOKEN }}" \
            "https://api.supabase.com/v1/projects/${{ secrets.SUPABASE_PROJECT_ID }}/database/backups" \
            | jq '.backups[0].created_at'
      
      - name: Alert if backup is stale
        if: failure()
        run: |
          # Send alert to Slack/PagerDuty
          echo "Backup verification failed!"
```

---

## 6. Recovery Procedures

### 6.1 Database Recovery

#### Point-in-Time Recovery (PITR)

```bash
# 1. Access Supabase Dashboard
# 2. Navigate to Database > Backups
# 3. Select "Point in Time Recovery"
# 4. Choose target timestamp
# 5. Confirm restore

# Or via CLI:
supabase db restore \
  --project-ref $SUPABASE_PROJECT_ID \
  --target-time "2025-01-20T12:00:00Z"
```

#### Full Backup Restore

```bash
# 1. Download backup from Supabase
# 2. Create new database instance
# 3. Restore backup
pg_restore -h $NEW_HOST -U postgres -d postgres backup.dump

# 4. Update connection strings
# 5. Verify data integrity
# 6. Switch traffic
```

### 6.2 Application Recovery

#### Rollback Deployment

```bash
# Vercel rollback to previous deployment
vercel rollback <deployment-id>

# Or via dashboard:
# 1. Go to Vercel Dashboard
# 2. Select project
# 3. Go to Deployments
# 4. Click "..." on previous deployment
# 5. Select "Promote to Production"
```

#### Redeploy from Git

```bash
# Force redeploy from specific commit
git checkout <known-good-commit>
git push origin main --force

# Or trigger manual deploy
vercel deploy --prod
```

### 6.3 DNS Failover

```bash
# Update Cloudflare DNS to failover
# 1. Access Cloudflare Dashboard
# 2. Navigate to DNS
# 3. Update A/CNAME records to backup infrastructure
# 4. Reduce TTL during incident (60 seconds)
# 5. Monitor propagation
```

---

## 7. Communication Plan

### 7.1 Internal Communication

| Audience | Channel | Timing | Owner |
|----------|---------|--------|-------|
| Engineering | Slack #incidents | Immediate | On-call |
| Leadership | Slack + Email | 15 minutes | Engineering Lead |
| All Staff | Email | 30 minutes | Communications |

### 7.2 External Communication

| Audience | Channel | Timing | Owner |
|----------|---------|--------|-------|
| Affected Users | Email | 1 hour | Support |
| All Users | Status page | 15 minutes | DevOps |
| Partners | Email | 2 hours | Account Management |
| Regulators | Email | As required | Legal |

### 7.3 Status Page

**URL:** status.ghxstship.com

**Update Frequency:**
- Initial: Within 15 minutes
- During incident: Every 30 minutes
- Resolution: Within 1 hour of resolution

---

## 8. Roles and Responsibilities

### 8.1 DR Team

| Role | Responsibility | Primary | Backup |
|------|----------------|---------|--------|
| Incident Commander | Overall coordination | CTO | Engineering Lead |
| Technical Lead | Technical decisions | Engineering Lead | Senior Engineer |
| Communications | User/stakeholder updates | Support Lead | Marketing |
| Documentation | Incident logging | On-call Engineer | Any Engineer |

### 8.2 Escalation Path

```
Level 1: On-call Engineer (0-15 min)
    ↓
Level 2: Engineering Lead (15-30 min)
    ↓
Level 3: CTO (30-60 min)
    ↓
Level 4: CEO (60+ min or critical)
```

---

## 9. Testing Schedule

### 9.1 DR Test Types

| Test Type | Scope | Frequency | Duration |
|-----------|-------|-----------|----------|
| Tabletop Exercise | Discussion-based | Quarterly | 2 hours |
| Component Test | Single system | Monthly | 1 hour |
| Partial DR Test | Multiple systems | Quarterly | 4 hours |
| Full DR Test | Complete failover | Annually | 8 hours |

### 9.2 Test Documentation

Each test must document:
- Test date and participants
- Scenario tested
- Steps executed
- Issues encountered
- Time to recovery
- Lessons learned
- Action items

---

## 10. Vendor Dependencies

### 10.1 Vendor Status Pages

| Vendor | Status Page | SLA |
|--------|-------------|-----|
| Supabase | status.supabase.com | 99.9% |
| Vercel | vercel.com/status | 99.99% |
| Cloudflare | cloudflarestatus.com | 100% |
| Stripe | status.stripe.com | 99.99% |
| GitHub | githubstatus.com | 99.9% |

### 10.2 Vendor Failure Procedures

| Vendor | Impact | Mitigation |
|--------|--------|------------|
| Supabase | Database unavailable | PITR to new instance |
| Vercel | App unavailable | Deploy to backup (Netlify) |
| Cloudflare | CDN/WAF unavailable | Direct to origin |
| Stripe | Payments unavailable | Queue transactions |
| GitHub | No deployments | Local backup, manual deploy |

---

## 11. Post-Incident Review

### 11.1 Review Timeline

| Activity | Timing |
|----------|--------|
| Initial debrief | Within 24 hours |
| Written report | Within 72 hours |
| Action items assigned | Within 1 week |
| Follow-up review | Within 30 days |

### 11.2 Report Template

1. **Incident Summary**
   - Date/time
   - Duration
   - Impact
   - Root cause

2. **Timeline**
   - Detection
   - Response
   - Resolution

3. **What Went Well**

4. **What Needs Improvement**

5. **Action Items**
   - Owner
   - Due date
   - Status

---

## 12. Document Maintenance

### 12.1 Review Schedule

| Review Type | Frequency | Owner |
|-------------|-----------|-------|
| Full review | Annual | CTO |
| Contact update | Quarterly | DevOps |
| Procedure test | Monthly | Engineering |

### 12.2 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2025 | Engineering | Initial document |

---

## Appendix A: Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| CTO | [Name] | [Phone] | cto@ghxstship.com |
| Engineering Lead | [Name] | [Phone] | engineering@ghxstship.com |
| DevOps Lead | [Name] | [Phone] | devops@ghxstship.com |
| Security Lead | [Name] | [Phone] | security@ghxstship.com |

## Appendix B: Vendor Support Contacts

| Vendor | Support URL | Priority Line |
|--------|-------------|---------------|
| Supabase | supabase.com/support | Enterprise support |
| Vercel | vercel.com/support | Enterprise support |
| Cloudflare | support.cloudflare.com | Enterprise support |
| Stripe | support.stripe.com | 24/7 phone support |

## Appendix C: Runbook Quick Reference

### Database Down
1. Check Supabase status
2. Check AWS status
3. If outage confirmed, initiate PITR
4. Update status page
5. Notify users

### Application Down
1. Check Vercel status
2. Check recent deployments
3. Rollback if recent deploy
4. If Vercel down, failover DNS
5. Update status page

### DDoS Attack
1. Cloudflare auto-mitigates
2. Enable "Under Attack" mode
3. Review attack patterns
4. Adjust rate limits
5. Document incident

---

*This document is confidential and should be stored securely. Review annually or after any major incident.*
