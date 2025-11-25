# GHXSTSHIP Partner Integration Documentation

## Overview

This document provides everything partners need to integrate with the GHXSTSHIP platform ecosystem (ATLVS, COMPVSS, GVTEWAY).

---

## Solution Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     GHXSTSHIP Platform Ecosystem                     │
├─────────────────────┬─────────────────────┬─────────────────────────┤
│       ATLVS         │      COMPVSS        │        GVTEWAY          │
│  Business Ops       │  Production Ops     │   Consumer Experience   │
├─────────────────────┴─────────────────────┴─────────────────────────┤
│                         Unified API Layer                            │
│  • REST API (OpenAPI 3.1)  • Webhooks  • Real-time Subscriptions    │
├─────────────────────────────────────────────────────────────────────┤
│                      Integration Platform                            │
│  • Zapier  • Make (Integromat)  • n8n  • Custom Webhooks            │
├─────────────────────────────────────────────────────────────────────┤
│                      Partner Integrations                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │Salesforce│  │ HubSpot │  │NetSuite │  │  Slack  │  │Mailchimp│   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://api.ghxstship.com/{platform}/v1` |
| Staging | `https://staging.api.ghxstship.com/{platform}/v1` |
| Sandbox | `https://sandbox.api.ghxstship.com/{platform}/v1` |

### Platform Identifiers

| Platform | Identifier | Description |
|----------|------------|-------------|
| ATLVS | `atlvs` | Business operations, CRM, finance |
| COMPVSS | `compvss` | Production operations, crew management |
| GVTEWAY | `gvteway` | Consumer experience, ticketing, events |

---

## Sample Payloads

### Deal Created (ATLVS)

```json
{
  "event": "deal.created",
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "deal_abc123",
    "name": "Enterprise Contract",
    "value": 150000,
    "currency": "USD",
    "stage": "qualification",
    "owner": {
      "id": "user_xyz789",
      "name": "John Smith",
      "email": "john@company.com"
    },
    "contact": {
      "id": "contact_def456",
      "name": "Jane Doe",
      "email": "jane@client.com",
      "company": "Client Corp"
    },
    "custom_fields": {
      "source": "referral",
      "priority": "high"
    },
    "created_at": "2024-01-15T10:30:00Z"
  },
  "metadata": {
    "correlation_id": "corr_123abc",
    "idempotency_key": "idem_456def"
  }
}
```

### Ticket Purchased (GVTEWAY)

```json
{
  "event": "ticket.purchased",
  "version": "1.0",
  "timestamp": "2024-01-15T14:00:00Z",
  "data": {
    "order_id": "ord_abc123",
    "event": {
      "id": "evt_xyz789",
      "name": "Summer Music Festival",
      "date": "2024-07-15T19:00:00Z",
      "venue": {
        "id": "ven_123",
        "name": "City Arena",
        "city": "Los Angeles"
      }
    },
    "tickets": [
      {
        "id": "tkt_001",
        "type": "VIP",
        "price": 150.00,
        "seat": "VIP-A-12"
      },
      {
        "id": "tkt_002",
        "type": "VIP",
        "price": 150.00,
        "seat": "VIP-A-13"
      }
    ],
    "customer": {
      "id": "cust_456",
      "email": "fan@example.com",
      "first_name": "Alex",
      "last_name": "Johnson"
    },
    "payment": {
      "method": "credit_card",
      "last_four": "4242",
      "subtotal": 300.00,
      "fees": 15.00,
      "total": 315.00
    }
  }
}
```

### Crew Assigned (COMPVSS)

```json
{
  "event": "crew.assigned",
  "version": "1.0",
  "timestamp": "2024-01-15T09:00:00Z",
  "data": {
    "assignment_id": "assign_abc123",
    "project": {
      "id": "proj_xyz789",
      "name": "Corporate Event 2024",
      "client": "Acme Corp",
      "dates": {
        "start": "2024-02-01",
        "end": "2024-02-03"
      }
    },
    "crew_member": {
      "id": "crew_456",
      "name": "Mike Wilson",
      "email": "mike@crew.com",
      "phone": "+1-555-0123"
    },
    "role": "Stage Manager",
    "department": "Production",
    "schedule": {
      "start_date": "2024-02-01",
      "end_date": "2024-02-03",
      "call_time": "08:00",
      "rate": 500.00,
      "rate_type": "daily"
    }
  }
}
```

---

## Authentication

### API Key

```bash
curl -X GET "https://api.ghxstship.com/atlvs/v1/deals" \
  -H "Authorization: Bearer sk_live_abc123..." \
  -H "X-Workspace-ID: ws_xyz789"
```

### OAuth 2.0

```
Authorization URL: https://auth.ghxstship.com/oauth/authorize
Token URL: https://auth.ghxstship.com/oauth/token

Scopes:
- read: Read access to resources
- write: Write access to resources
- webhooks: Manage webhook subscriptions
- admin: Administrative access
```

---

## Webhook Security

All webhooks include a signature header for verification:

```
X-GHXSTSHIP-Signature: t=1705312200,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
```

### Verification Code (Node.js)

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const [timestampPart, signaturePart] = signature.split(',');
  const timestamp = timestampPart.split('=')[1];
  const sig = signaturePart.split('=')[1];
  
  // Check timestamp (5 minute tolerance)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    return false;
  }
  
  // Verify signature
  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(sig),
    Buffer.from(expected)
  );
}
```

---

## Rate Limits

| Tier | Limit | Burst |
|------|-------|-------|
| Standard | 1,000/min | 100 |
| Pro | 5,000/min | 500 |
| Enterprise | 10,000/min | 1,000 |

### Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1705312260
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ],
    "request_id": "req_abc123",
    "documentation_url": "https://docs.ghxstship.com/errors/VALIDATION_ERROR"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Support Contacts

| Type | Contact |
|------|---------|
| Technical Support | platform@ghxstship.com |
| Partner Program | partners@ghxstship.com |
| Security Issues | security@ghxstship.com |
| Documentation | docs@ghxstship.com |

### Resources

- **API Reference**: https://docs.ghxstship.com/api
- **Developer Portal**: https://developers.ghxstship.com
- **Status Page**: https://status.ghxstship.com
- **Community Slack**: https://ghxstship-community.slack.com

---

## Certification Requirements

To become a certified GHXSTSHIP integration partner:

1. **Technical Review**
   - Pass API integration tests
   - Implement proper error handling
   - Support webhook signature verification

2. **Security Compliance**
   - OAuth 2.0 implementation review
   - Data handling audit
   - Penetration testing (for enterprise partners)

3. **Documentation**
   - User-facing setup guide
   - Troubleshooting documentation
   - Support escalation procedures

4. **Support SLA**
   - Response time commitments
   - Escalation procedures
   - Maintenance window notifications

---

*Document Version: 1.0.0*
*Last Updated: November 2024*
