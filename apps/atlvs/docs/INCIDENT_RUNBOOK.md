# ATLVS Incident Response Runbook

## Overview

This runbook provides step-by-step procedures for responding to incidents affecting the ATLVS application. All team members should be familiar with these procedures.

---

## Incident Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **SEV1** | Critical - Complete service outage | 15 minutes | Database down, auth broken, data breach |
| **SEV2** | High - Major feature unavailable | 30 minutes | Payment processing failed, API errors >5% |
| **SEV3** | Medium - Degraded performance | 2 hours | Slow response times, minor feature broken |
| **SEV4** | Low - Minor issue | 24 hours | UI glitch, non-critical bug |

---

## Incident Response Process

### 1. Detection & Triage

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Alert received (Vercel, Supabase, user report)          │
│ 2. Acknowledge alert within SLA                             │
│ 3. Assess severity level                                    │
│ 4. Create incident channel: #incident-YYYY-MM-DD-brief     │
│ 5. Assign Incident Commander (IC)                           │
└─────────────────────────────────────────────────────────────┘
```

### 2. Initial Response Checklist

- [ ] Verify the issue is real (not false positive)
- [ ] Check Vercel deployment status: https://vercel.com/ghxstship/atlvs
- [ ] Check Supabase dashboard: https://supabase.com/dashboard
- [ ] Check recent deployments for correlation
- [ ] Notify stakeholders if SEV1/SEV2

### 3. Communication Template

```
INCIDENT DECLARED: [SEV Level]
Time: [UTC timestamp]
Impact: [Brief description]
Status: Investigating
IC: [Name]
Next update: [Time]
```

---

## Common Incidents & Resolution

### Database Connection Issues

**Symptoms:** 500 errors, "Connection refused", slow queries

**Resolution Steps:**
1. Check Supabase status page
2. Verify connection pooler status
3. Check for connection limit exhaustion
4. Review recent migrations
5. If needed, restart connection pooler

```bash
# Check database status
curl -X GET "https://[PROJECT_REF].supabase.co/rest/v1/" \
  -H "apikey: [ANON_KEY]" \
  -H "Authorization: Bearer [ANON_KEY]"
```

### Authentication Failures

**Symptoms:** Users can't log in, 401 errors, session issues

**Resolution Steps:**
1. Check Supabase Auth service status
2. Verify JWT secret hasn't changed
3. Check for expired certificates
4. Review auth middleware logs
5. Clear auth cache if needed

```bash
# Test auth endpoint
curl -X POST "https://[PROJECT_REF].supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### Deployment Failures

**Symptoms:** Build errors, deployment stuck, 404 on new routes

**Resolution Steps:**
1. Check Vercel deployment logs
2. Review build output for errors
3. Verify environment variables are set
4. Check for dependency issues
5. Rollback if needed

```bash
# Rollback to previous deployment
vercel rollback --token=$VERCEL_TOKEN
```

### High Error Rate

**Symptoms:** Error rate >1%, increased 5xx responses

**Resolution Steps:**
1. Check Vercel Analytics for error patterns
2. Review application logs
3. Identify affected endpoints
4. Check for recent code changes
5. Scale resources if needed

### Performance Degradation

**Symptoms:** Response times >2s, timeouts, slow pages

**Resolution Steps:**
1. Check Vercel Speed Insights
2. Review database query performance
3. Check for N+1 queries
4. Verify CDN is functioning
5. Review recent deployments

---

## Rollback Procedures

### Vercel Rollback

```bash
# List recent deployments
vercel ls --token=$VERCEL_TOKEN

# Rollback to specific deployment
vercel rollback [DEPLOYMENT_URL] --token=$VERCEL_TOKEN

# Or use Vercel dashboard:
# 1. Go to Deployments
# 2. Find last working deployment
# 3. Click "..." menu
# 4. Select "Promote to Production"
```

### Database Rollback

```bash
# Connect to Supabase
supabase db remote commit

# List migrations
supabase migration list

# Rollback last migration (if safe)
supabase db reset --linked
```

**WARNING:** Database rollbacks may cause data loss. Always backup first.

---

## Escalation Matrix

| Severity | Primary Contact | Escalation | Executive |
|----------|-----------------|------------|-----------|
| SEV1 | On-call Engineer | Engineering Lead (15min) | CTO (30min) |
| SEV2 | On-call Engineer | Engineering Lead (1hr) | - |
| SEV3 | Assigned Engineer | Team Lead (4hr) | - |
| SEV4 | Assigned Engineer | - | - |

---

## Post-Incident Process

### Incident Closure Checklist

- [ ] Root cause identified
- [ ] Fix deployed and verified
- [ ] Monitoring confirms resolution
- [ ] Stakeholders notified
- [ ] Incident channel archived

### Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

**Date:** YYYY-MM-DD
**Duration:** X hours Y minutes
**Severity:** SEV[1-4]
**Author:** [Name]

## Summary
[Brief description of what happened]

## Timeline
- HH:MM - [Event]
- HH:MM - [Event]

## Root Cause
[Detailed explanation]

## Impact
- Users affected: X
- Revenue impact: $Y
- Data loss: None/Minimal/Significant

## Resolution
[What was done to fix it]

## Lessons Learned
1. [Lesson]
2. [Lesson]

## Action Items
- [ ] [Action] - Owner - Due Date
- [ ] [Action] - Owner - Due Date
```

---

## Monitoring & Alerting

### Key Metrics to Monitor

| Metric | Warning | Critical | Dashboard |
|--------|---------|----------|-----------|
| Error Rate | >1% | >5% | Vercel Analytics |
| Response Time (p95) | >1s | >3s | Speed Insights |
| Database Connections | >80% | >95% | Supabase |
| Memory Usage | >80% | >95% | Vercel |

### Alert Channels

- **Vercel:** Deployment failures, function errors
- **Supabase:** Database alerts, auth issues
- **Sentry:** Application errors (if configured)

---

## Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| On-Call Engineer | [Rotation Schedule] | 24/7 |
| Engineering Lead | [Contact] | Business Hours |
| DevOps | [Contact] | Business Hours |
| CTO | [Contact] | SEV1 Only |

---

## Useful Commands

```bash
# Check application health
curl -I https://atlvs.ghxstship.com/api/health

# View recent logs (Vercel CLI)
vercel logs atlvs.ghxstship.com --token=$VERCEL_TOKEN

# Check deployment status
vercel inspect [DEPLOYMENT_URL] --token=$VERCEL_TOKEN

# Database health check
supabase db lint --linked
```

---

## Appendix: Environment Variables

Required environment variables for ATLVS:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `STRIPE_SECRET_KEY` | Stripe API key | For payments |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | For SMS |

---

*Last Updated: December 2025*
*Version: 1.0*
