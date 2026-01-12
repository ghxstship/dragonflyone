# Deployment Guide - Cross-Platform Booking System

This guide outlines the steps required to deploy the cross-platform booking system to production.

---

## Prerequisites

### Environment Requirements
- **Node.js**: 18.x or higher
- **pnpm**: 8.x or higher
- **PostgreSQL**: 15.x or higher (via Supabase)
- **Stripe Account**: Live mode credentials

### Required Services
- **Supabase**: Production project
- **Stripe**: Live API keys
- **Vercel/AWS/GCP**: Hosting platform
- **Email Service**: Resend/SendGrid account

---

## Pre-Deployment Checklist

### 1. Environment Variables

Create `.env.production` files for each app:

#### GVTEWAY
```env
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=https://gvteway.com
NODE_ENV=production

# Email
EMAIL_FROM=bookings@gvteway.com
RESEND_API_KEY=re_...
```

#### ATLVS
```env
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Application
NEXT_PUBLIC_APP_URL=https://atlvs.com
NODE_ENV=production
```

#### COMPVSS
```env
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Application
NEXT_PUBLIC_APP_URL=https://compvss.com
NODE_ENV=production
```

### 2. Database Migrations

Run the following SQL migrations on your production database:

```sql
-- Create travel_bookings table for ATLVS
CREATE TABLE IF NOT EXISTS travel_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  package_id UUID NOT NULL REFERENCES booking_packages(id),
  package_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',

  -- Dates
  travel_start_date TIMESTAMPTZ NOT NULL,
  travel_end_date TIMESTAMPTZ NOT NULL,

  -- Travelers
  num_travelers INTEGER NOT NULL,
  traveler_first_name VARCHAR(100) NOT NULL,
  traveler_last_name VARCHAR(100) NOT NULL,
  traveler_email VARCHAR(255) NOT NULL,
  traveler_phone VARCHAR(50) NOT NULL,
  traveler_country VARCHAR(100) NOT NULL,
  special_requests TEXT,
  marketing_opt_in BOOLEAN DEFAULT false,

  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  add_ons_total DECIMAL(10,2) DEFAULT 0,
  service_fee DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Payment
  payment_intent_id VARCHAR(255),
  payment_status VARCHAR(50),

  -- Metadata
  selected_add_ons JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

CREATE INDEX idx_travel_bookings_package ON travel_bookings(package_id);
CREATE INDEX idx_travel_bookings_email ON travel_bookings(traveler_email);
CREATE INDEX idx_travel_bookings_status ON travel_bookings(status);

-- Create competition_entries table for COMPVSS
CREATE TABLE IF NOT EXISTS competition_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_number VARCHAR(50) UNIQUE NOT NULL,
  competition_id UUID NOT NULL REFERENCES competitions(id),
  competition_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',

  -- Participants
  num_participants INTEGER NOT NULL,
  team_name VARCHAR(255),
  category VARCHAR(100),
  participant_first_name VARCHAR(100) NOT NULL,
  participant_last_name VARCHAR(100) NOT NULL,
  participant_email VARCHAR(255) NOT NULL,
  participant_phone VARCHAR(50) NOT NULL,
  participant_country VARCHAR(100) NOT NULL,
  special_requests TEXT,
  marketing_opt_in BOOLEAN DEFAULT false,

  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  add_ons_total DECIMAL(10,2) DEFAULT 0,
  service_fee DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Payment
  payment_intent_id VARCHAR(255),
  payment_status VARCHAR(50),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

CREATE INDEX idx_competition_entries_competition ON competition_entries(competition_id);
CREATE INDEX idx_competition_entries_email ON competition_entries(participant_email);
CREATE INDEX idx_competition_entries_status ON competition_entries(status);

-- Add Row Level Security (RLS)
ALTER TABLE travel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own bookings"
  ON travel_bookings FOR SELECT
  USING (auth.email() = traveler_email);

CREATE POLICY "Users can view their own entries"
  ON competition_entries FOR SELECT
  USING (auth.email() = participant_email);
```

### 3. Stripe Webhooks

Configure Stripe webhooks for production:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://gvteway.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

Repeat for ATLVS and COMPVSS domains.

---

## Build and Deploy

### Option 1: Vercel Deployment

#### Install Vercel CLI
```bash
pnpm install -g vercel
```

#### Deploy GVTEWAY
```bash
cd apps/gvteway
vercel --prod
```

#### Deploy ATLVS
```bash
cd apps/atlvs
vercel --prod
```

#### Deploy COMPVSS
```bash
cd apps/compvss
vercel --prod
```

### Option 2: Docker Deployment

#### Build Docker Images
```bash
# GVTEWAY
docker build -t gvteway:latest -f apps/gvteway/Dockerfile .

# ATLVS
docker build -t atlvs:latest -f apps/atlvs/Dockerfile .

# COMPVSS
docker build -t compvss:latest -f apps/compvss/Dockerfile .
```

#### Run Containers
```bash
# GVTEWAY
docker run -p 3000:3000 \
  --env-file apps/gvteway/.env.production \
  gvteway:latest

# ATLVS
docker run -p 3001:3000 \
  --env-file apps/atlvs/.env.production \
  atlvs:latest

# COMPVSS
docker run -p 3002:3000 \
  --env-file apps/compvss/.env.production \
  compvss:latest
```

### Option 3: Manual Build & Deploy

#### Build All Apps
```bash
# From repository root
pnpm install
pnpm build

# This builds:
# - apps/gvteway/.next
# - apps/atlvs/.next
# - apps/compvss/.next
```

#### Deploy to Server
```bash
# Copy built files to server
scp -r apps/gvteway/.next user@server:/var/www/gvteway/
scp -r apps/atlvs/.next user@server:/var/www/atlvs/
scp -r apps/compvss/.next user@server:/var/www/compvss/

# Start applications with PM2
pm2 start ecosystem.config.js
```

---

## Post-Deployment Verification

### 1. Health Checks

Test all endpoints:

```bash
# GVTEWAY
curl https://gvteway.com/api/health

# ATLVS
curl https://atlvs.com/api/health

# COMPVSS
curl https://compvss.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-12T00:00:00.000Z"
}
```

### 2. Booking Flow Tests

Test complete booking flow for each platform:

#### GVTEWAY Experience Booking
1. Navigate to experience page
2. Click "Book Now"
3. Complete booking form
4. Use Stripe test card: `4242 4242 4242 4242`
5. Verify confirmation email received
6. Check database for booking record

#### ATLVS Package Booking
1. Navigate to `/packages`
2. Click on a package
3. Click "Book This Package"
4. Complete traveler details
5. Complete payment
6. Verify confirmation

#### COMPVSS Competition Entry
1. Navigate to competition page
2. Click "Register for Competition"
3. Complete participant details
4. Complete payment
5. Verify entry confirmation

### 3. Performance Checks

Run Lighthouse audits:

```bash
# Install Lighthouse
npm install -g lighthouse

# Test GVTEWAY
lighthouse https://gvteway.com --output=html --output-path=./reports/gvteway.html

# Test ATLVS
lighthouse https://atlvs.com --output=html --output-path=./reports/atlvs.html

# Test COMPVSS
lighthouse https://compvss.com --output=html --output-path=./reports/compvss.html
```

Target scores:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90

### 4. Monitoring Setup

Configure monitoring and alerting:

#### Application Monitoring
- **Sentry**: Error tracking
- **Vercel Analytics**: Performance monitoring
- **LogRocket**: Session replay

#### Database Monitoring
- **Supabase Dashboard**: Query performance
- **Connection pooling**: Monitor active connections
- **Slow query alerts**: > 1s query time

#### Payment Monitoring
- **Stripe Dashboard**: Transaction monitoring
- **Failed payment alerts**: Real-time notifications
- **Webhook delivery**: Monitor success rates

---

## Rollback Plan

### Quick Rollback

If issues arise, immediately rollback to previous version:

#### Vercel
```bash
# Rollback to previous deployment
vercel rollback
```

#### Docker
```bash
# Revert to previous image
docker run -p 3000:3000 gvteway:previous
```

#### Manual
```bash
# Revert git changes
git revert edf7e8a7
git push origin main

# Redeploy previous version
pnpm build
# ... deploy steps
```

### Gradual Rollout (Recommended)

Use feature flags or percentage-based rollout:

1. **10% Traffic**: Deploy to small user segment
2. **Monitor**: Check error rates and performance
3. **25% Traffic**: Expand if metrics are healthy
4. **50% Traffic**: Continue monitoring
5. **100% Traffic**: Full deployment

---

## Monitoring & Alerts

### Key Metrics to Monitor

#### Application Metrics
- **Response Time**: < 500ms (p95)
- **Error Rate**: < 0.1%
- **Availability**: > 99.9%
- **CPU Usage**: < 70%
- **Memory Usage**: < 80%

#### Business Metrics
- **Booking Success Rate**: > 95%
- **Payment Success Rate**: > 98%
- **Conversion Rate**: Track baseline
- **Average Booking Value**: Track baseline

### Alert Configuration

```yaml
# Example alert rules
alerts:
  - name: High Error Rate
    condition: error_rate > 1%
    duration: 5 minutes
    notify: oncall-team

  - name: Slow Response Time
    condition: p95_response_time > 2000ms
    duration: 10 minutes
    notify: engineering-team

  - name: Failed Payments
    condition: payment_failure_rate > 5%
    duration: 5 minutes
    notify: finance-team

  - name: Low Availability
    condition: uptime < 99.9%
    duration: 1 minute
    notify: oncall-team
```

---

## Security Checklist

### Pre-Production
- [ ] All secrets in environment variables (not hardcoded)
- [ ] HTTPS enforced on all domains
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

### Post-Deployment
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Penetration testing completed
- [ ] Vulnerability scan passed
- [ ] Third-party dependencies audited
- [ ] SSL certificates valid
- [ ] Database backups configured
- [ ] Disaster recovery plan documented

---

## Maintenance

### Regular Tasks

#### Daily
- Monitor error rates
- Check payment success rates
- Review failed bookings

#### Weekly
- Review performance metrics
- Analyze user feedback
- Check database performance

#### Monthly
- Update dependencies
- Review security logs
- Conduct load testing
- Update documentation

### Backup Strategy

```bash
# Automated daily backups
# Supabase handles automatic backups

# Manual backup command
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Backup retention:
# - Daily: 7 days
# - Weekly: 4 weeks
# - Monthly: 12 months
```

---

## Troubleshooting

### Common Issues

#### Issue: High Response Times
**Symptoms**: Slow page loads, timeout errors
**Solutions**:
1. Check database query performance
2. Enable caching
3. Scale server resources
4. Review code for N+1 queries

#### Issue: Failed Payments
**Symptoms**: Users report payment failures
**Solutions**:
1. Check Stripe dashboard for errors
2. Verify webhook endpoints are reachable
3. Check payment intent logs
4. Review card validation logic

#### Issue: Email Delivery Failures
**Symptoms**: Confirmation emails not sent
**Solutions**:
1. Check email service status
2. Verify email templates render correctly
3. Check spam folder
4. Review email service logs

---

## Support Contacts

### Technical Support
- **Platform Issues**: devops@dragonflyone.com
- **Payment Issues**: payments@dragonflyone.com
- **Database Issues**: dba@dragonflyone.com

### On-Call
- **Phone**: +1-XXX-XXX-XXXX
- **Slack**: #incident-response
- **PagerDuty**: incidents@dragonflyone.pagerduty.com

---

## Success Criteria

Deployment is considered successful when:

✅ All health checks passing
✅ Error rate < 0.1%
✅ Response time < 500ms (p95)
✅ Payment success rate > 98%
✅ Zero critical bugs
✅ All monitoring alerts configured
✅ Team trained on new features

---

**Last Updated**: January 2026
**Deployment Status**: Ready for Production
**Branch**: `claude/ui-v2-rebuild-wpLaO`
