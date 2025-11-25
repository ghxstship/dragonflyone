# GHXSTSHIP API Documentation

## Overview

The GHXSTSHIP platform exposes RESTful APIs across three applications. All APIs follow consistent patterns for authentication, error handling, and response formats.

## Base URLs

| Environment | ATLVS | COMPVSS | GVTEWAY |
|-------------|-------|---------|---------|
| Production | `https://atlvs.ghxstship.com/api` | `https://compvss.ghxstship.com/api` | `https://gvteway.com/api` |
| Staging | `https://staging-atlvs.ghxstship.com/api` | `https://staging-compvss.ghxstship.com/api` | `https://staging.gvteway.com/api` |
| Development | `http://localhost:3001/api` | `http://localhost:3002/api` | `http://localhost:3000/api` |

## Authentication

### JWT Bearer Token

All protected endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtaining a Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "roles": ["GVTEWAY_MEMBER"]
  }
}
```

### Refreshing Tokens

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Response Format

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |

## Rate Limiting

API requests are rate limited per user/IP:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Standard | 100 requests | 15 minutes |
| Auth | 5 requests | 5 minutes |
| Webhooks | 1000 requests | 1 hour |

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699999999
```

---

## GVTEWAY API Endpoints

### Events

#### List Events
```http
GET /api/events
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Items per page (default: 20, max: 100) |
| `search` | string | Search by title, description |
| `category` | string | Filter by category |
| `date_from` | date | Filter events from date |
| `date_to` | date | Filter events to date |
| `venue_id` | uuid | Filter by venue |
| `status` | string | Filter by status (draft, published, cancelled) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Summer Music Festival",
      "description": "Annual outdoor music festival",
      "start_date": "2024-07-15T18:00:00Z",
      "end_date": "2024-07-15T23:00:00Z",
      "venue": {
        "id": "uuid",
        "name": "Central Park",
        "address": "New York, NY"
      },
      "ticket_types": [
        {
          "id": "uuid",
          "name": "General Admission",
          "price": 5000,
          "available": 500
        }
      ],
      "status": "published",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

#### Get Event
```http
GET /api/events/:id
```

#### Create Event
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Event",
  "description": "Event description",
  "start_date": "2024-07-15T18:00:00Z",
  "end_date": "2024-07-15T23:00:00Z",
  "venue_id": "uuid",
  "category": "music",
  "ticket_types": [
    {
      "name": "General Admission",
      "price": 5000,
      "quantity": 1000
    }
  ]
}
```

#### Update Event
```http
PATCH /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Event Title"
}
```

#### Delete Event
```http
DELETE /api/events/:id
Authorization: Bearer <token>
```

### Tickets

#### List User Tickets
```http
GET /api/tickets
Authorization: Bearer <token>
```

#### Get Ticket
```http
GET /api/tickets/:id
Authorization: Bearer <token>
```

#### Transfer Ticket
```http
POST /api/tickets/:id/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient_email": "recipient@example.com"
}
```

### Orders

#### Create Order (Checkout)
```http
POST /api/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "ticket_type_id": "uuid",
      "quantity": 2
    }
  ],
  "promo_code": "SUMMER20"
}
```

**Response:**
```json
{
  "data": {
    "order_id": "uuid",
    "stripe_session_id": "cs_...",
    "checkout_url": "https://checkout.stripe.com/..."
  }
}
```

#### Get Order
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### List Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

### Search

#### Global Search
```http
GET /api/search?q=music&type=events,artists,venues
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query |
| `type` | string | Comma-separated types (events, artists, venues) |
| `limit` | integer | Results per type (default: 10) |

---

## ATLVS API Endpoints

### Projects

#### List Projects
```http
GET /api/projects
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `client_id` | uuid | Filter by client |
| `date_from` | date | Filter by start date |

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Summer Festival 2024",
  "client_id": "uuid",
  "budget": 500000,
  "start_date": "2024-06-01",
  "end_date": "2024-08-31",
  "description": "Annual summer festival production"
}
```

### Finance

#### List Ledger Entries
```http
GET /api/ledger-entries
Authorization: Bearer <token>
```

#### Create Invoice
```http
POST /api/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "client_id": "uuid",
  "project_id": "uuid",
  "line_items": [
    {
      "description": "Production Services",
      "quantity": 1,
      "unit_price": 50000
    }
  ],
  "due_date": "2024-02-15"
}
```

### Employees

#### List Employees
```http
GET /api/employees
Authorization: Bearer <token>
```

#### Create Employee
```http
POST /api/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@company.com",
  "department_id": "uuid",
  "role": "Production Manager",
  "hire_date": "2024-01-15"
}
```

### Analytics

#### Get Dashboard Metrics
```http
GET /api/analytics
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | Time period (day, week, month, quarter, year) |
| `metrics` | string | Comma-separated metrics |

---

## COMPVSS API Endpoints

### Crew

#### List Crew Members
```http
GET /api/crew
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `skills` | string | Filter by skills (comma-separated) |
| `availability` | string | Filter by availability status |
| `rating_min` | number | Minimum rating filter |

#### Assign Crew to Project
```http
POST /api/crew/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "crew_member_id": "uuid",
  "project_id": "uuid",
  "role": "Stage Manager",
  "start_date": "2024-07-14",
  "end_date": "2024-07-16"
}
```

### Production

#### Get Run of Show
```http
GET /api/projects/:id/run-of-show
Authorization: Bearer <token>
```

#### Update Cue
```http
PATCH /api/run-of-show/cues/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "actual_time": "2024-07-15T19:30:00Z"
}
```

### Equipment

#### List Equipment
```http
GET /api/equipment
Authorization: Bearer <token>
```

#### Check Out Equipment
```http
POST /api/equipment/:id/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": "uuid",
  "expected_return_date": "2024-07-20"
}
```

#### Check In Equipment
```http
POST /api/equipment/:id/checkin
Authorization: Bearer <token>
Content-Type: application/json

{
  "condition": "good",
  "notes": "Minor wear on cables"
}
```

### Safety

#### Report Incident
```http
POST /api/safety/incidents
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": "uuid",
  "severity": "minor",
  "description": "Slip hazard identified near stage left",
  "location": "Stage Left Wing",
  "reported_by": "uuid"
}
```

---

## Webhooks

### Configuring Webhooks

Register webhook endpoints in your account settings or via API:

```http
POST /api/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-server.com/webhooks/ghxstship",
  "events": ["order.completed", "ticket.transferred"],
  "secret": "your_webhook_secret"
}
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `order.completed` | Order successfully completed |
| `order.refunded` | Order refunded |
| `ticket.transferred` | Ticket transferred to new owner |
| `event.published` | Event published |
| `event.cancelled` | Event cancelled |
| `project.created` | Project created |
| `crew.assigned` | Crew member assigned |

### Webhook Payload

```json
{
  "id": "evt_123",
  "type": "order.completed",
  "created": "2024-01-15T10:30:00Z",
  "data": {
    "order_id": "uuid",
    "amount": 10000,
    "currency": "usd"
  }
}
```

### Verifying Webhooks

Verify webhook signatures using HMAC-SHA256:

```typescript
import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

---

## SDK Usage

### TypeScript/JavaScript

```typescript
import { GhxstshipClient } from '@ghxstship/sdk';

const client = new GhxstshipClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

// List events
const events = await client.events.list({
  category: 'music',
  limit: 10
});

// Create order
const order = await client.orders.create({
  items: [{ ticketTypeId: 'uuid', quantity: 2 }]
});
```

### Error Handling

```typescript
try {
  const event = await client.events.get('invalid-id');
} catch (error) {
  if (error instanceof GhxstshipError) {
    console.error(`Error ${error.code}: ${error.message}`);
  }
}
```

---

## OpenAPI Specifications

Full OpenAPI 3.1 specifications are available:

- **ATLVS**: `/packages/api-specs/atlvs/openapi.yaml`
- **COMPVSS**: `/packages/api-specs/compvss/openapi.yaml`
- **GVTEWAY**: `/packages/api-specs/gvteway/openapi.yaml`

Import into Postman, Insomnia, or generate clients using OpenAPI Generator.

---

## Support

- **API Status**: https://status.ghxstship.com
- **Developer Portal**: https://developers.ghxstship.com
- **Support Email**: api-support@ghxstship.com
