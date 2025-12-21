# Cookie Audit Report

## GHXSTSHIP Industries - Cookie Classification & Audit

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Audit Period:** Q1 2025  
**Next Review:** Q2 2025

---

## 1. Executive Summary

This document provides a comprehensive audit of all cookies and similar tracking technologies used across the GHXSTSHIP platform (ATLVS, COMPVSS, GVTEWAY). The audit ensures compliance with:

- **GDPR** (EU General Data Protection Regulation)
- **ePrivacy Directive** (EU Cookie Law)
- **CCPA/CPRA** (California Consumer Privacy Act)
- **PECR** (UK Privacy and Electronic Communications Regulations)

---

## 2. Cookie Categories

### 2.1 Strictly Necessary Cookies

These cookies are essential for the website to function and cannot be disabled.

| Cookie Name | Provider | Purpose | Duration | Type |
|-------------|----------|---------|----------|------|
| `sb-access-token` | Supabase | Authentication token | Session | First-party |
| `sb-refresh-token` | Supabase | Token refresh | 7 days | First-party |
| `__Host-next-auth.csrf-token` | Next.js | CSRF protection | Session | First-party |
| `__Secure-next-auth.session-token` | Next.js | Session management | 30 days | First-party |
| `cookie_consent` | GHXSTSHIP | Stores consent preferences | 1 year | First-party |
| `__cf_bm` | Cloudflare | Bot management | 30 mins | Third-party |
| `_cfuvid` | Cloudflare | Rate limiting | Session | Third-party |

### 2.2 Functional Cookies

These cookies enable enhanced functionality and personalization.

| Cookie Name | Provider | Purpose | Duration | Type |
|-------------|----------|---------|----------|------|
| `theme` | GHXSTSHIP | User theme preference | 1 year | First-party |
| `locale` | GHXSTSHIP | Language preference | 1 year | First-party |
| `sidebar_collapsed` | GHXSTSHIP | UI state | 1 year | First-party |
| `recent_searches` | GHXSTSHIP | Search history | 30 days | First-party |
| `viewed_events` | GHXSTSHIP | Recently viewed events | 30 days | First-party |

### 2.3 Analytics Cookies

These cookies help us understand how visitors interact with our website.

| Cookie Name | Provider | Purpose | Duration | Type |
|-------------|----------|---------|----------|------|
| `_va` | Vercel Analytics | Page view analytics | 1 year | First-party |
| `_vs` | Vercel Speed Insights | Performance metrics | Session | First-party |

### 2.4 Advertising/Marketing Cookies

These cookies are used for advertising and marketing purposes.

| Cookie Name | Provider | Purpose | Duration | Type |
|-------------|----------|---------|----------|------|
| *None currently implemented* | - | - | - | - |

**Note:** GHXSTSHIP does not currently use advertising cookies. If marketing integrations are added in the future, this section will be updated.

---

## 3. Local Storage & Session Storage

### 3.1 Local Storage Items

| Key | Purpose | Category | Retention |
|-----|---------|----------|-----------|
| `auth_token` | Authentication | Necessary | Until logout |
| `user_preferences` | User settings | Functional | Persistent |
| `cart_items` | Shopping cart | Necessary | 7 days |
| `recently_viewed` | Event history | Functional | 30 days |
| `notification_settings` | Notification prefs | Functional | Persistent |
| `age_verified` | Age verification | Necessary | Session |

### 3.2 Session Storage Items

| Key | Purpose | Category | Retention |
|-----|---------|----------|-----------|
| `checkout_session` | Checkout state | Necessary | Session |
| `form_draft` | Form autosave | Functional | Session |
| `search_filters` | Search state | Functional | Session |

---

## 4. Third-Party Services

### 4.1 Supabase (Authentication & Database)

**Purpose:** User authentication and data storage  
**Cookies Set:** `sb-access-token`, `sb-refresh-token`  
**Data Collected:** User credentials, session data  
**Privacy Policy:** https://supabase.com/privacy  
**Category:** Strictly Necessary

### 4.2 Stripe (Payment Processing)

**Purpose:** Payment processing  
**Cookies Set:** `__stripe_mid`, `__stripe_sid` (on payment pages only)  
**Data Collected:** Payment information (PCI-DSS compliant)  
**Privacy Policy:** https://stripe.com/privacy  
**Category:** Strictly Necessary (on payment pages)

### 4.3 Cloudflare (CDN & Security)

**Purpose:** Content delivery and security  
**Cookies Set:** `__cf_bm`, `_cfuvid`  
**Data Collected:** IP address, request headers  
**Privacy Policy:** https://cloudflare.com/privacypolicy  
**Category:** Strictly Necessary

### 4.4 Vercel (Hosting & Analytics)

**Purpose:** Website hosting and performance analytics  
**Cookies Set:** `_va`, `_vs`  
**Data Collected:** Page views, performance metrics (anonymized)  
**Privacy Policy:** https://vercel.com/legal/privacy-policy  
**Category:** Analytics

### 4.5 Sentry (Error Tracking)

**Purpose:** Error monitoring and debugging  
**Cookies Set:** None (uses API)  
**Data Collected:** Error logs, stack traces (anonymized user context)  
**Privacy Policy:** https://sentry.io/privacy  
**Category:** Functional

---

## 5. Cookie Consent Implementation

### 5.1 Consent Banner

The GHXSTSHIP cookie consent banner:

- ✅ Displays before any non-essential cookies are set
- ✅ Provides granular consent options
- ✅ Includes "Accept All" and "Reject All" buttons
- ✅ Links to full cookie policy
- ✅ Remembers user preferences
- ✅ Allows preference changes at any time

### 5.2 Consent Categories

| Category | Default State | User Can Disable |
|----------|---------------|------------------|
| Strictly Necessary | Enabled | No |
| Functional | Disabled | Yes |
| Analytics | Disabled | Yes |
| Advertising | Disabled | Yes |

### 5.3 Consent Storage

Consent preferences are stored in:
- `cookie_consent` cookie (1 year expiry)
- Database `cookie_consent` table (for authenticated users)

### 5.4 Consent Withdrawal

Users can withdraw consent at any time via:
- Cookie banner "Manage Preferences" link
- Privacy settings page (`/settings/privacy`)
- Cookie policy page (`/legal/cookies`)

---

## 6. Data Flows

### 6.1 Cookie Data Flow

```
User Browser
    │
    ├── First-Party Cookies ──────────────────────┐
    │   (GHXSTSHIP domain)                        │
    │                                             ▼
    │                                    GHXSTSHIP Servers
    │                                             │
    ├── Third-Party Cookies ──────────────────────┤
    │   (Cloudflare, Stripe)                      │
    │                                             ▼
    │                                    Third-Party Servers
    │                                             │
    └── Analytics ────────────────────────────────┤
        (Vercel Analytics)                        │
                                                  ▼
                                         Analytics Dashboard
```

### 6.2 Data Retention

| Data Type | Retention Period | Deletion Method |
|-----------|------------------|-----------------|
| Session cookies | Browser session | Auto-deleted |
| Auth tokens | 7-30 days | Auto-expire |
| Consent records | 5 years | Manual request |
| Analytics data | 26 months | Auto-deleted |

---

## 7. Compliance Checklist

### 7.1 GDPR/ePrivacy Compliance

- [x] Consent obtained before non-essential cookies
- [x] Clear information about cookie purposes
- [x] Granular consent options available
- [x] Easy consent withdrawal mechanism
- [x] Consent records maintained
- [x] Cookie policy accessible
- [x] Third-party cookies disclosed
- [x] Data retention periods defined

### 7.2 CCPA Compliance

- [x] "Do Not Sell My Information" mechanism (N/A - no data sale)
- [x] Disclosure of data collection practices
- [x] Opt-out mechanism for tracking
- [x] Privacy policy updated

### 7.3 Technical Implementation

- [x] Cookies blocked until consent given
- [x] Consent state checked before loading scripts
- [x] Third-party scripts conditionally loaded
- [x] Consent preferences synced across sessions
- [x] Cookie banner accessible (WCAG 2.1 AA)

---

## 8. Cookie Scanning Results

### 8.1 Scan Details

**Scan Date:** January 2025  
**Tool Used:** Manual audit + browser developer tools  
**Pages Scanned:** All major page templates

### 8.2 Findings Summary

| Category | Count | Status |
|----------|-------|--------|
| Strictly Necessary | 7 | ✅ Compliant |
| Functional | 5 | ✅ Compliant |
| Analytics | 2 | ✅ Compliant |
| Advertising | 0 | ✅ N/A |
| Unknown/Undocumented | 0 | ✅ None found |

### 8.3 Recommendations

1. **Regular Audits:** Conduct quarterly cookie audits
2. **Script Monitoring:** Monitor for new third-party scripts
3. **Consent Analytics:** Track consent rates and preferences
4. **Policy Updates:** Update cookie policy when changes occur

---

## 9. Cookie Policy Location

The full cookie policy is available at:
- **ATLVS:** https://atlvs.ghxstship.com/legal/cookies
- **COMPVSS:** https://compvss.ghxstship.com/legal/cookies
- **GVTEWAY:** https://gvteway.ghxstship.com/legal/cookies

---

## 10. Contact Information

For questions about cookies and tracking:

**Privacy Team:** privacy@ghxstship.com  
**Data Protection Officer:** dpo@ghxstship.com

---

## 11. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2025 | Compliance Team | Initial audit |

---

## Appendix A: Cookie Scanning Methodology

1. Clear all browser data
2. Visit each page template without accepting cookies
3. Document cookies set before consent
4. Accept all cookies and document additional cookies
5. Test consent withdrawal functionality
6. Verify cookie deletion on consent withdrawal
7. Cross-reference with third-party documentation

## Appendix B: Third-Party Cookie Policies

| Provider | Privacy Policy | Cookie Policy |
|----------|----------------|---------------|
| Supabase | https://supabase.com/privacy | https://supabase.com/privacy |
| Stripe | https://stripe.com/privacy | https://stripe.com/cookies-policy |
| Cloudflare | https://cloudflare.com/privacypolicy | https://cloudflare.com/cookie-policy |
| Vercel | https://vercel.com/legal/privacy-policy | https://vercel.com/legal/cookie-policy |
| Sentry | https://sentry.io/privacy | https://sentry.io/privacy |

---

*This audit should be reviewed and updated quarterly or when significant changes are made to cookie usage.*
