# PCI-DSS Compliance Documentation

## GHXSTSHIP Industries - Payment Card Industry Data Security Standard

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Compliance Level:** SAQ-A (Merchant)  
**Payment Processor:** Stripe

---

## 1. Executive Summary

GHXSTSHIP Industries processes payment card transactions through Stripe, a PCI-DSS Level 1 certified payment processor. This document outlines our compliance approach and security measures for handling payment card data.

### 1.1 Compliance Scope

| Aspect | Status | Notes |
|--------|--------|-------|
| Card Data Storage | ✅ Not Applicable | No card data stored |
| Card Data Processing | ✅ Outsourced | Stripe handles all processing |
| Card Data Transmission | ✅ Secure | Stripe.js handles transmission |
| SAQ Type | SAQ-A | E-commerce, fully outsourced |

### 1.2 Key Points

- **No cardholder data touches GHXSTSHIP servers**
- All payment processing is handled by Stripe
- Stripe.js collects card details directly
- Payment tokens are used for transactions
- PCI-DSS compliance is maintained through Stripe

---

## 2. Payment Architecture

### 2.1 Payment Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Browser  │     │  GHXSTSHIP API  │     │     Stripe      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │  1. Load Stripe.js    │                       │
         │◄──────────────────────┼───────────────────────│
         │                       │                       │
         │  2. Enter card details│                       │
         │  (Stripe Elements)    │                       │
         │───────────────────────┼──────────────────────►│
         │                       │                       │
         │  3. Receive token     │                       │
         │◄──────────────────────┼───────────────────────│
         │                       │                       │
         │  4. Send token to API │                       │
         │──────────────────────►│                       │
         │                       │                       │
         │                       │  5. Create charge     │
         │                       │──────────────────────►│
         │                       │                       │
         │                       │  6. Charge result     │
         │                       │◄──────────────────────│
         │                       │                       │
         │  7. Confirmation      │                       │
         │◄──────────────────────│                       │
         │                       │                       │
```

### 2.2 Data Handling

| Data Type | Handled By | Storage Location |
|-----------|------------|------------------|
| Card Number (PAN) | Stripe | Stripe servers |
| CVV/CVC | Stripe | Never stored |
| Expiry Date | Stripe | Stripe servers |
| Cardholder Name | Stripe | Stripe servers |
| Payment Token | GHXSTSHIP | Our database |
| Transaction ID | Both | Both systems |
| Amount | Both | Both systems |

---

## 3. SAQ-A Eligibility

### 3.1 Eligibility Criteria

GHXSTSHIP qualifies for SAQ-A because:

- [x] All payment processing is outsourced to Stripe
- [x] No electronic storage of cardholder data
- [x] No electronic processing of cardholder data
- [x] No electronic transmission of cardholder data
- [x] All cardholder data functions outsourced to PCI-DSS compliant provider
- [x] Website is served over HTTPS
- [x] No direct connection to payment processor systems

### 3.2 SAQ-A Requirements

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 2.1 Change vendor defaults | ✅ | N/A - No payment systems |
| 6.5 Secure coding | ✅ | Secure development practices |
| 9.9 Protect devices | ✅ | N/A - No card-present devices |
| 12.8 Service provider management | ✅ | Stripe agreement in place |

---

## 4. Security Controls

### 4.1 Website Security

| Control | Implementation |
|---------|----------------|
| HTTPS | Enforced on all pages |
| TLS Version | TLS 1.3 |
| HSTS | Enabled with preload |
| CSP | Content Security Policy configured |
| XSS Protection | Headers and sanitization |
| CSRF Protection | Token-based protection |

### 4.2 Stripe Integration Security

| Control | Implementation |
|---------|----------------|
| Stripe.js Loading | From Stripe CDN only |
| API Keys | Server-side only (secret key) |
| Publishable Key | Client-side (safe to expose) |
| Webhook Verification | Signature validation |
| Idempotency | Keys used for retries |

### 4.3 Code Security

```typescript
// Example: Secure Stripe integration
// Server-side only - secret key never exposed to client

// ❌ NEVER DO THIS
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// return { key: process.env.STRIPE_SECRET_KEY }; // NEVER expose

// ✅ CORRECT APPROACH
// Client-side: Use publishable key only
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Server-side: Use secret key securely
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});
```

---

## 5. Stripe Configuration

### 5.1 Account Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| Radar | Enabled | Fraud detection |
| 3D Secure | Enabled | SCA compliance |
| Webhook Signing | Enabled | Request verification |
| API Version | 2023-10-16 | Stable API |

### 5.2 Webhook Security

```typescript
// Webhook signature verification
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      endpointSecret
    );
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }
  
  // Process verified event
  // ...
}
```

### 5.3 Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `STRIPE_SECRET_KEY` | Server only | API authentication |
| `STRIPE_PUBLISHABLE_KEY` | Client safe | Stripe.js initialization |
| `STRIPE_WEBHOOK_SECRET` | Server only | Webhook verification |

---

## 6. Cardholder Data Flow

### 6.1 What We DO Handle

- Payment intent creation (amount, currency, metadata)
- Customer creation (email, name - no card data)
- Subscription management (plan IDs, not card data)
- Refund processing (transaction IDs only)
- Webhook events (encrypted, verified)

### 6.2 What We DO NOT Handle

- ❌ Card numbers (PAN)
- ❌ CVV/CVC codes
- ❌ Expiration dates
- ❌ Magnetic stripe data
- ❌ PIN numbers
- ❌ Card images

### 6.3 Data Segregation

```
┌─────────────────────────────────────────────────────────────┐
│                    GHXSTSHIP Systems                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Order Data: order_id, amount, status, user_id      │   │
│  │  Customer Data: email, name, address                 │   │
│  │  Payment Reference: stripe_payment_intent_id         │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           │ API calls (no card data)        │
│                           ▼                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Secure API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Stripe Systems                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Card Data: PAN, CVV, expiry (encrypted, tokenized) │   │
│  │  Customer: Stripe customer ID, payment methods      │   │
│  │  Transactions: Full payment history                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Incident Response

### 7.1 Payment-Related Incidents

| Incident Type | Response | Notification |
|---------------|----------|--------------|
| Fraudulent transaction | Contact Stripe | User + Stripe |
| Disputed charge | Provide evidence | Via Stripe Dashboard |
| Webhook failure | Retry mechanism | Internal alert |
| API error | Log and retry | Internal monitoring |

### 7.2 Escalation Path

1. **Level 1:** Engineering team - API/integration issues
2. **Level 2:** Stripe support - Payment processing issues
3. **Level 3:** Security team - Potential breach
4. **Level 4:** Legal/Compliance - Regulatory notification

---

## 8. Compliance Maintenance

### 8.1 Annual Requirements

| Task | Frequency | Owner |
|------|-----------|-------|
| SAQ-A completion | Annual | Compliance |
| Stripe security review | Annual | Engineering |
| Penetration testing | Annual | Security |
| Staff training | Annual | HR |

### 8.2 Ongoing Requirements

| Task | Frequency | Owner |
|------|-----------|-------|
| Stripe API updates | As released | Engineering |
| Security patching | Monthly | DevOps |
| Access review | Quarterly | Security |
| Log review | Weekly | Security |

### 8.3 Documentation Requirements

- [x] This PCI-DSS compliance document
- [x] Stripe integration documentation
- [x] Incident response procedures
- [x] Access control policies
- [x] Change management procedures

---

## 9. Stripe Compliance Attestation

### 9.1 Stripe's PCI-DSS Status

Stripe is certified as a **PCI-DSS Level 1 Service Provider**, the highest level of certification. Their attestation of compliance (AOC) is available at:

https://stripe.com/docs/security/stripe

### 9.2 Shared Responsibility

| Responsibility | Owner |
|----------------|-------|
| Payment processing security | Stripe |
| Card data storage | Stripe |
| Fraud detection | Stripe |
| Website security | GHXSTSHIP |
| API key protection | GHXSTSHIP |
| Webhook verification | GHXSTSHIP |
| Customer authentication | GHXSTSHIP |

---

## 10. Audit Trail

### 10.1 Payment Logging

All payment-related actions are logged:

```typescript
// Example audit log entry
{
  action: 'payment_created',
  entity_type: 'payment',
  entity_id: 'pi_xxxxx',
  user_id: 'user_xxxxx',
  metadata: {
    amount: 5000,
    currency: 'usd',
    status: 'succeeded'
  },
  ip_address: '192.168.x.x',
  timestamp: '2025-01-20T12:00:00Z'
}
```

### 10.2 What We Log

- Payment intent creation
- Payment success/failure
- Refund requests
- Subscription changes
- Webhook events received
- API errors

### 10.3 What We DO NOT Log

- ❌ Card numbers
- ❌ CVV codes
- ❌ Full card details
- ❌ Stripe secret keys

---

## 11. Contact Information

### 11.1 Internal Contacts

| Role | Contact |
|------|---------|
| PCI Compliance Officer | compliance@ghxstship.com |
| Security Team | security@ghxstship.com |
| Engineering Lead | engineering@ghxstship.com |

### 11.2 External Contacts

| Provider | Contact |
|----------|---------|
| Stripe Support | https://support.stripe.com |
| Stripe Security | security@stripe.com |

---

## 12. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2025 | Compliance Team | Initial document |

---

## Appendix A: SAQ-A Questionnaire Reference

The Self-Assessment Questionnaire A (SAQ-A) is designed for merchants who have fully outsourced all cardholder data functions to PCI-DSS validated third parties.

**Applicable Requirements:**
- Requirement 2: Do not use vendor-supplied defaults
- Requirement 6: Develop and maintain secure systems
- Requirement 9: Restrict physical access to cardholder data
- Requirement 12: Maintain an information security policy

## Appendix B: Stripe Security Features

| Feature | Description | Status |
|---------|-------------|--------|
| Radar | ML-based fraud detection | Enabled |
| 3D Secure | Strong customer authentication | Enabled |
| Stripe.js | Secure card collection | Implemented |
| Webhooks | Signed event notifications | Implemented |
| Idempotency | Prevent duplicate charges | Implemented |

---

*This document should be reviewed annually and updated when significant changes are made to payment processing.*
