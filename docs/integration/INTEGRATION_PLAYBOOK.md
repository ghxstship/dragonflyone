# GHXSTSHIP Integration Playbook

## Overview

This playbook provides comprehensive guidance for integrating with GHXSTSHIP platform APIs (ATLVS, COMPVSS, GVTEWAY).

---

## Authentication

### API Key Authentication

```bash
curl -X GET "https://api.ghxstship.com/atlvs/v1/deals" \
  -H "Authorization: Bearer your_api_key" \
  -H "X-Workspace-ID: ws_abc123"
```

### OAuth 2.0 Flow

1. **Authorization URL**: `https://auth.ghxstship.com/oauth/authorize`
2. **Token URL**: `https://auth.ghxstship.com/oauth/token`
3. **Scopes**: `read`, `write`, `webhooks`, `admin`

```javascript
// OAuth 2.0 Authorization Code Flow
const authUrl = `https://auth.ghxstship.com/oauth/authorize?
  client_id=${CLIENT_ID}&
  redirect_uri=${REDIRECT_URI}&
  response_type=code&
  scope=read write webhooks`;
```

---

## Rate Limits

| Tier | Requests/Minute | Burst Limit | Retry-After |
|------|-----------------|-------------|-------------|
| Free | 100 | 10 | 60s |
| Pro | 1,000 | 100 | 30s |
| Enterprise | 10,000 | 1,000 | 10s |

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699999999
```

### Handling Rate Limits

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      await sleep(retryAfter * 1000);
      continue;
    }
    
    return response;
  }
  throw new Error('Max retries exceeded');
}
```

---

## Error Codes

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Check request body/params |
| 401 | Unauthorized | Refresh token or check API key |
| 403 | Forbidden | Check permissions/scopes |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists or version conflict |
| 422 | Unprocessable | Validation failed |
| 429 | Rate Limited | Wait and retry with backoff |
| 500 | Server Error | Retry with exponential backoff |
| 503 | Service Unavailable | Check status page, retry later |

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

---

## Webhooks

### Webhook Signature Verification

All webhooks include HMAC-SHA256 signatures for verification:

```typescript
import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const [timestamp, sig] = parseSignatureHeader(signature);
  
  // Check timestamp (prevent replay attacks)
  const now = Math.floor(Date.now() / 1000);
  if (now - parseInt(timestamp) > 300) {
    return false; // Webhook too old
  }
  
  // Verify signature
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(sig),
    Buffer.from(expectedSig)
  );
}
```

### Webhook Events

| Platform | Event | Description |
|----------|-------|-------------|
| ATLVS | `deal.created` | New deal created |
| ATLVS | `deal.won` | Deal marked as won |
| ATLVS | `invoice.paid` | Invoice payment received |
| COMPVSS | `crew.assigned` | Crew member assigned to project |
| COMPVSS | `project.status_changed` | Project status updated |
| GVTEWAY | `ticket.purchased` | Ticket sale completed |
| GVTEWAY | `event.sold_out` | Event reached capacity |

### Retry Policy

Failed webhook deliveries are retried with exponential backoff:

- Attempt 1: Immediate
- Attempt 2: 1 minute
- Attempt 3: 5 minutes
- Attempt 4: 30 minutes
- Attempt 5: 2 hours
- Attempt 6: 24 hours (final)

---

## Pagination

### Cursor-Based Pagination

```bash
# First request
GET /deals?limit=50

# Response includes cursor
{
  "data": [...],
  "pagination": {
    "cursor": "eyJsYXN0SWQiOiJkZWFsXzEyMyJ9",
    "hasMore": true,
    "total": 150
  }
}

# Next page
GET /deals?limit=50&cursor=eyJsYXN0SWQiOiJkZWFsXzEyMyJ9
```

### Bulk Data Sync

For syncing large datasets (up to 10,000 records):

```typescript
async function* syncAllDeals() {
  let cursor: string | undefined;
  
  do {
    const response = await fetch(
      `/deals?limit=100${cursor ? `&cursor=${cursor}` : ''}`
    );
    const data = await response.json();
    
    yield data.data;
    
    cursor = data.pagination.cursor;
  } while (cursor);
}

// Usage
for await (const batch of syncAllDeals()) {
  await processBatch(batch);
}
```

---

## Integration Patterns

### 1. Real-Time Sync (Webhooks)

```
┌─────────────┐     Webhook      ┌─────────────┐
│  GHXSTSHIP  │ ───────────────► │  Your App   │
│   Platform  │                  │             │
└─────────────┘                  └─────────────┘
```

Best for: Immediate updates, event-driven workflows

### 2. Polling Sync

```
┌─────────────┐     GET /deals   ┌─────────────┐
│  GHXSTSHIP  │ ◄─────────────── │  Your App   │
│   Platform  │ ───────────────► │  (cron job) │
└─────────────┘     Response     └─────────────┘
```

Best for: Batch processing, data warehousing

### 3. Bidirectional Sync

```
┌─────────────┐ ◄───────────────► ┌─────────────┐
│  GHXSTSHIP  │     Webhooks +    │  Your CRM   │
│   Platform  │     API Calls     │             │
└─────────────┘                   └─────────────┘
```

Best for: CRM integration, ERP sync

---

## Sample Integrations

### Slack Notifications

```typescript
// n8n workflow: ATLVS Deal Won → Slack
{
  "trigger": "deal.won",
  "action": "slack.postMessage",
  "config": {
    "channel": "#sales-wins",
    "text": "🎉 Deal won: {{deal.name}} - ${{deal.value}}"
  }
}
```

### Mailchimp Sync

```typescript
// Sync GVTEWAY ticket buyers to Mailchimp
async function syncToMailchimp(purchase: TicketPurchase) {
  await mailchimp.lists.addMember(LIST_ID, {
    email_address: purchase.customer.email,
    status: 'subscribed',
    merge_fields: {
      FNAME: purchase.customer.first_name,
      EVENT: purchase.event.name
    },
    tags: ['ticket-buyer', purchase.event.genre]
  });
}
```

### Jira Issue Creation

```typescript
// Create Jira issue from COMPVSS incident
async function createJiraIssue(incident: Incident) {
  await jira.issues.create({
    project: 'OPS',
    issuetype: 'Bug',
    summary: `[COMPVSS] ${incident.title}`,
    description: incident.description,
    priority: mapPriority(incident.severity),
    labels: ['compvss', 'production']
  });
}
```

---

## SDK Libraries

### TypeScript/JavaScript

```bash
npm install @ghxstship/sdk
```

```typescript
import { GhxstshipClient } from '@ghxstship/sdk';

const client = new GhxstshipClient({
  apiKey: process.env.GHXSTSHIP_API_KEY,
  platform: 'atlvs'
});

const deals = await client.deals.list({ status: 'open' });
```

### Python

```bash
pip install ghxstship
```

```python
from ghxstship import Client

client = Client(api_key=os.environ['GHXSTSHIP_API_KEY'])
deals = client.atlvs.deals.list(status='open')
```

---

## Support & Resources

- **API Status**: https://status.ghxstship.com
- **Developer Portal**: https://developers.ghxstship.com
- **API Reference**: https://docs.ghxstship.com/api
- **Support Email**: platform@ghxstship.com
- **Community Slack**: https://ghxstship.slack.com

---

*Last updated: November 2024*
