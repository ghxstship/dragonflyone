# GHXSTSHIP Testing Checklist

## Overview

This document provides comprehensive testing checklists for QA sign-off before production deployment.

---

## Pre-Deployment Testing Matrix

### 1. Build Verification

- [ ] All apps build successfully (`pnpm build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors or warnings
- [ ] All dependencies resolve correctly
- [ ] Bundle size within acceptable limits

### 2. Unit Tests

- [ ] All unit tests pass (`pnpm test:unit`)
- [ ] Code coverage meets threshold (>80%)
- [ ] No skipped tests without justification
- [ ] Critical business logic covered

### 3. Integration Tests

- [ ] API integration tests pass
- [ ] Database operations verified
- [ ] Third-party service mocks working
- [ ] Cross-platform data sync verified

### 4. End-to-End Tests

- [ ] All E2E tests pass (`pnpm test:e2e`)
- [ ] Critical user journeys verified
- [ ] Cross-browser testing complete
- [ ] Mobile responsive tests pass

---

## Functional Testing by Platform

### GVTEWAY Testing

#### Authentication
- [ ] User registration works
- [ ] Email verification sends
- [ ] Login with email/password works
- [ ] Password reset flow works
- [ ] Session persistence works
- [ ] Logout clears session
- [ ] OAuth login works (if enabled)

#### Event Discovery
- [ ] Events list loads correctly
- [ ] Search returns relevant results
- [ ] Filters work (category, date, location)
- [ ] Pagination works
- [ ] Event details page loads
- [ ] Related events display

#### Ticket Purchase
- [ ] Add to cart works
- [ ] Cart persists across sessions
- [ ] Quantity selection works
- [ ] Promo code application works
- [ ] Checkout flow completes
- [ ] Stripe payment processes
- [ ] Order confirmation displays
- [ ] Confirmation email sends
- [ ] Tickets appear in user account

#### Ticket Management
- [ ] View tickets works
- [ ] QR code generates
- [ ] Ticket transfer works
- [ ] Transfer notification sends
- [ ] Refund request works

#### User Profile
- [ ] Profile view works
- [ ] Profile edit saves
- [ ] Avatar upload works
- [ ] Password change works
- [ ] Notification preferences save
- [ ] Payment methods manage

#### Membership & Rewards
- [ ] Points balance displays
- [ ] Points earn correctly
- [ ] Rewards redemption works
- [ ] Membership upgrade works
- [ ] Tier benefits apply

### ATLVS Testing

#### Dashboard
- [ ] Dashboard loads
- [ ] KPIs display correctly
- [ ] Charts render
- [ ] Real-time updates work
- [ ] Date range filters work

#### Project Management
- [ ] Create project works
- [ ] Edit project works
- [ ] Delete project works
- [ ] Task creation works
- [ ] Task assignment works
- [ ] Status updates work
- [ ] Timeline view works
- [ ] Budget tracking works

#### Financial Management
- [ ] Invoice creation works
- [ ] Invoice sending works
- [ ] Payment recording works
- [ ] Expense submission works
- [ ] Expense approval works
- [ ] Ledger entries correct
- [ ] Reports generate

#### CRM
- [ ] Contact creation works
- [ ] Contact search works
- [ ] Deal creation works
- [ ] Pipeline view works
- [ ] Deal stage updates work
- [ ] Activity logging works

#### Employee Management
- [ ] Employee list loads
- [ ] Employee creation works
- [ ] Department assignment works
- [ ] Role assignment works
- [ ] Time tracking works

### COMPVSS Testing

#### Crew Management
- [ ] Crew directory loads
- [ ] Crew search works
- [ ] Skills filter works
- [ ] Availability filter works
- [ ] Crew assignment works
- [ ] Schedule view works
- [ ] Conflict detection works

#### Equipment Management
- [ ] Equipment list loads
- [ ] Equipment search works
- [ ] Check-out works
- [ ] Check-in works
- [ ] Maintenance tracking works
- [ ] Availability status updates

#### Production Management
- [ ] Run of show creation works
- [ ] Cue management works
- [ ] Real-time updates work
- [ ] Notes/comments work
- [ ] Status tracking works

#### Safety & Compliance
- [ ] Incident reporting works
- [ ] Certification tracking works
- [ ] Expiration alerts work
- [ ] Document upload works

---

## Cross-Platform Testing

### Data Synchronization
- [ ] Deal → Project handoff works (ATLVS → COMPVSS)
- [ ] Project → Event sync works (COMPVSS → GVTEWAY)
- [ ] Revenue sync works (GVTEWAY → ATLVS)
- [ ] Asset availability syncs
- [ ] User roles sync across platforms

### Role-Based Access
- [ ] Legend roles have full access
- [ ] Admin roles have platform access
- [ ] Member roles have limited access
- [ ] Viewer roles are read-only
- [ ] Event roles apply correctly
- [ ] Permission inheritance works

---

## Non-Functional Testing

### Performance Testing
- [ ] Page load time < 3s
- [ ] API response time < 200ms (p95)
- [ ] Lighthouse score > 90
- [ ] No memory leaks
- [ ] Database queries optimized

### Security Testing
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] XSS protection verified
- [ ] CSRF protection verified
- [ ] SQL injection prevented
- [ ] Rate limiting works
- [ ] Authentication required on protected routes
- [ ] Authorization enforced

### Accessibility Testing
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets standards
- [ ] Focus indicators visible
- [ ] Alt text on images

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile Large (414x896)

---

## Integration Testing

### Stripe Integration
- [ ] Test mode payments work
- [ ] Card validation works
- [ ] Payment success handling
- [ ] Payment failure handling
- [ ] Webhook signature verification
- [ ] Refund processing works

### Email Integration
- [ ] Transactional emails send
- [ ] Email templates render
- [ ] Links in emails work
- [ ] Unsubscribe works

### SMS Integration
- [ ] SMS notifications send
- [ ] Phone number validation
- [ ] Opt-out works

### Analytics Integration
- [ ] Page views track
- [ ] Events track
- [ ] User identification works
- [ ] Conversion tracking works

---

## Deployment Verification

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates valid
- [ ] DNS configured correctly
- [ ] CDN configured
- [ ] Monitoring configured

### Post-Deployment
- [ ] All pages load
- [ ] API endpoints respond
- [ ] Authentication works
- [ ] Payments process
- [ ] Emails send
- [ ] No console errors
- [ ] Error tracking active
- [ ] Performance metrics normal

---

## Sign-Off Requirements

### QA Sign-Off
- [ ] All critical tests pass
- [ ] No P1/P2 bugs open
- [ ] Performance benchmarks met
- [ ] Security review complete

### Product Owner Sign-Off
- [ ] Features match requirements
- [ ] User experience approved
- [ ] Business logic verified

### Security Sign-Off
- [ ] Security audit complete
- [ ] Penetration testing done
- [ ] Compliance requirements met

### Stakeholder Sign-Off
- [ ] Demo completed
- [ ] Feedback addressed
- [ ] Launch approved

---

## Test Execution Commands

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm test:unit

# Run E2E tests
pnpm test:e2e

# Run E2E with UI
pnpm test:e2e:ui

# Run specific test file
pnpm test:e2e apps/gvteway/e2e/events.spec.ts

# Run tests with coverage
pnpm test:coverage

# Run accessibility tests
pnpm test:a11y

# Run performance tests
pnpm test:perf
```

---

## Bug Severity Definitions

| Severity | Definition | Example |
|----------|------------|---------|
| **P1 - Critical** | System unusable, data loss | Payment fails, login broken |
| **P2 - High** | Major feature broken | Cannot create events |
| **P3 - Medium** | Feature partially broken | Filter doesn't work |
| **P4 - Low** | Minor issue, workaround exists | Typo in UI |
| **P5 - Trivial** | Cosmetic issue | Alignment off by 1px |

---

## Test Environment URLs

| Environment | GVTEWAY | ATLVS | COMPVSS |
|-------------|---------|-------|---------|
| Local | localhost:3000 | localhost:3001 | localhost:3002 |
| Staging | staging.gvteway.com | staging-atlvs.ghxstship.com | staging-compvss.ghxstship.com |
| Production | gvteway.com | atlvs.ghxstship.com | compvss.ghxstship.com |

---

## Approval Signatures

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Product Owner | | | |
| Security Lead | | | |
| Engineering Lead | | | |
| Stakeholder | | | |
