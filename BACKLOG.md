# GHXSTSHIP Platform Backlog

This document tracks incomplete, deferred, and planned features that need to be addressed.

---

## Deferred Features

### Vercel Cron Jobs (Disabled - Plan Limit)
**Status:** Temporarily disabled due to Vercel Hobby plan limit (2 crons max)
**Action Required:** Upgrade to Vercel Pro plan, then re-enable crons in vercel.json files

#### ATLVS Crons
- [ ] `/api/cron/sync-ledger` - Daily ledger synchronization (schedule: `0 0 * * *`)
- [ ] `/api/cron/cleanup-sessions` - Daily session cleanup (schedule: `0 0 * * *`)

#### COMPVSS Crons
- [ ] `/api/cron/sync-equipment` - Daily equipment sync (schedule: `0 0 * * *`)
- [ ] `/api/cron/crew-notifications` - Daily crew notifications at 8am (schedule: `0 8 * * *`)

#### GVTEWAY Crons
- [ ] `/api/cron/ticket-reminders` - Daily ticket reminders at 9am (schedule: `0 9 * * *`)
- [ ] `/api/cron/loyalty-points` - Daily loyalty points processing (schedule: `0 0 * * *`)
- [ ] `/api/cron/event-notifications` - Daily event notifications at 6am (schedule: `0 6 * * *`)

---

## Planned Features

_Add planned features here as they are identified._

---

## Technical Debt

_Add technical debt items here as they are identified._

---

## Notes

- Vercel Hobby plan allows 2 cron jobs total across all projects
- Vercel Pro plan ($20/month per member) allows more cron jobs
- Consider consolidating cron jobs or using external cron services as alternatives
