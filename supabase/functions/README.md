# Supabase Edge Functions

This directory contains Deno-based Edge Functions for the GHXSTSHIP platform.

## Functions Overview

### Webhook Handlers

#### `webhook-stripe`
Processes Stripe webhook events with signature verification.
- **Events:** All Stripe webhook events (payment_intent, charge, etc.)
- **Auth:** HMAC signature verification
- **Env:** `STRIPE_WEBHOOK_SECRET`

#### `webhook-twilio`
Processes Twilio SMS and voice webhooks.
- **Events:** SMS status, voice status, incoming messages
- **Auth:** HMAC signature verification (SHA-1)
- **Env:** `TWILIO_AUTH_TOKEN`

#### `webhook-gvteway`
Processes GVTEWAY platform events (ticketing, orders, events).
- **Events:** ticket.purchased, ticket.refunded, event.created, event.updated, order.completed
- **Auth:** HMAC signature verification (SHA-256) with timestamp
- **Env:** `GVTEWAY_WEBHOOK_SECRET`

### Automation Integration

#### `automation-triggers`
Exposes platform triggers for n8n, Zapier, Make integration.
- **GET /automation-triggers** - List available triggers
- **POST /automation-triggers** - Test trigger and get sample data
- **Platforms:** ATLVS, COMPVSS, GVTEWAY

#### `automation-actions`
Executes platform actions from external automation tools.
- **GET /automation-actions** - List available actions
- **POST /automation-actions** - Execute action with payload
- **Actions:** create.contact, create.deal, create.project, etc.

### Operations

#### `health-check`
System health monitoring endpoint.
- **GET /health-check** - Returns system health status
- **Checks:** Database connectivity, Auth service availability
- **Status Codes:** 200 (healthy), 503 (degraded/unhealthy)

#### `deal-project-handoff`
Automated workflow for deal-to-project conversion.
- **Trigger:** Deal status changes to 'won'
- **Action:** Create project, integration links, notify stakeholders

### Shared Utilities

#### `_shared`
Common types and utilities used across functions.
- `globals.d.ts` - Shared type definitions

## Deployment

### Local Development

Start Supabase locally:
```bash
supabase start
```

Serve a specific function:
```bash
supabase functions serve webhook-gvteway
```

### Deploy to Production

Deploy all functions:
```bash
supabase functions deploy
```

Deploy specific function:
```bash
supabase functions deploy webhook-gvteway
```

Deploy with environment secrets:
```bash
supabase secrets set GVTEWAY_WEBHOOK_SECRET=your_secret_here
supabase functions deploy webhook-gvteway
```

## Environment Variables

### Required for All Functions
- `SUPABASE_URL` - Automatically provided
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically provided

### Webhook Functions
- `STRIPE_WEBHOOK_SECRET` - From Stripe Dashboard → Webhooks
- `TWILIO_AUTH_TOKEN` - From Twilio Console
- `GVTEWAY_WEBHOOK_SECRET` - Generated internally, share with GVTEWAY

### Setting Secrets

Via CLI:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... --env-file .env.local
```

Via Supabase Dashboard:
1. Go to Project Settings → Edge Functions
2. Add environment variables
3. Redeploy functions to pick up changes

## Webhook URLs

After deployment, webhook URLs follow this pattern:
```
https://{project-ref}.supabase.co/functions/v1/{function-name}
```

Example:
```
https://abc123xyz.supabase.co/functions/v1/webhook-stripe
```

Configure these URLs in external services:
- **Stripe:** Dashboard → Developers → Webhooks
- **Twilio:** Console → Phone Numbers → Configure → Webhooks
- **GVTEWAY:** Internal platform webhook configuration

## Testing

### Test Webhook Signature Verification

```bash
# Generate test signature
echo -n "timestamp.payload" | openssl dgst -sha256 -hmac "your_secret" -binary | base64

# Send test request
curl -X POST https://your-project.supabase.co/functions/v1/webhook-gvteway \
  -H "Content-Type: application/json" \
  -H "x-gvteway-signature: computed_signature" \
  -H "x-gvteway-timestamp: 1234567890" \
  -d '{"event_type":"test","data":{}}'
```

### Test Health Check

```bash
curl https://your-project.supabase.co/functions/v1/health-check
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-22T19:00:00Z",
  "checks": {
    "database": { "status": "pass", "responseTime": 45 },
    "auth": { "status": "pass", "responseTime": 120 }
  },
  "uptime": 3600,
  "version": "1.0.0"
}
```

### Test Automation Endpoints

List triggers:
```bash
curl https://your-project.supabase.co/functions/v1/automation-triggers?platform=ATLVS
```

Execute action:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/automation-actions \
  -H "Content-Type: application/json" \
  -H "apikey: your_supabase_anon_key" \
  -d '{
    "action_code": "create.contact",
    "organization_id": "uuid",
    "payload": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    }
  }'
```

## Monitoring

### View Function Logs

Via CLI:
```bash
supabase functions logs webhook-gvteway
```

Via Dashboard:
1. Go to Edge Functions
2. Select function
3. View logs tab

### Database Logging

All webhook events are logged to `webhook_event_logs` table:
```sql
SELECT * FROM webhook_event_logs 
WHERE provider = 'gvteway' 
ORDER BY created_at DESC 
LIMIT 10;
```

Automation actions logged to `automation_usage_log`:
```sql
SELECT * FROM automation_usage_log 
WHERE automation_type = 'action' 
ORDER BY executed_at DESC 
LIMIT 10;
```

## Security Best Practices

1. **Never commit secrets** to version control
2. **Rotate webhook secrets** quarterly
3. **Use service role key** only in Edge Functions, never in frontend
4. **Enable CORS** only for trusted domains in production
5. **Verify signatures** for all webhook handlers
6. **Rate limit** automation endpoints if exposed publicly
7. **Monitor logs** for suspicious activity

## Troubleshooting

### Function Not Responding
- Check function deployment status in Dashboard
- Verify environment variables are set
- Check function logs for errors
- Ensure Supabase project is not paused

### Signature Verification Failing
- Verify webhook secret matches provider configuration
- Check timestamp is within tolerance (5 minutes for GVTEWAY)
- Ensure raw body is used for signature computation
- Test with provider's webhook testing tools

### Database Connection Errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check RLS policies allow service role access
- Ensure tables exist and migrations are applied
- Test database connectivity via `health-check` function

### CORS Issues
- Add allowed origins to function CORS headers
- Use `OPTIONS` preflight for cross-origin requests
- Check browser console for specific CORS errors

## Development Notes

### Deno Runtime
These functions run in Deno, not Node.js:
- Use Deno-compatible imports (URLs)
- No `node_modules` or `package.json`
- Use `Deno.env.get()` for environment variables
- Web standard APIs (fetch, crypto, etc.)

### TypeScript Support
- Type definitions in `globals.d.ts`
- Supabase types imported from generated types
- No `tsconfig.json` needed (Deno handles TS natively)

### Hot Reload
Local development supports hot reload:
```bash
supabase functions serve --no-verify-jwt webhook-gvteway
```

Changes to function code automatically reload.

## Further Reading

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Manual](https://deno.land/manual)
- [Webhook Security Best Practices](https://webhooks.fyi/security/hmac)
