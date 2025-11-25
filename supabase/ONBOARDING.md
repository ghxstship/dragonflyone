# Supabase Onboarding & Credential Handling

This guide aligns with Section 11 (Technical Documentation) of the MASTER_ROADMAP and explains how engineers set up Supabase locally and in CI while keeping secrets compliant with GHXSTSHIP security policies.

## 1. Prerequisites
- Install the Supabase CLI (`npm install -g supabase` or download from https://supabase.com/docs/guides/cli).
- Install Docker Desktop (required for local stack).
- Ensure PNPM + Turbo are installed per repository README.
- Request access to GHXSTSHIP 1Password vault for Supabase service-role + anon keys.

## 2. Local Environment Setup
1. Copy the template: `cp supabase/.env.example supabase/.env`.
2. Fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` with non-production keys (dev).
3. Set `DATABASE_PASSWORD` for local Postgres. Default: `postgres`.
4. Source the file when running CLI commands: `export $(cat supabase/.env | xargs)`.

## 3. Running Supabase Locally
```bash
supabase start
```
- Spins up Postgres (54321), shadow DB (54322), Studio, and functions runner.
- Configuration sourced from `supabase/config.toml` (project id, ports, function flags).

Apply migrations to sync schema:
```bash
supabase db reset # or supabase db push
```
This runs SQL files under `supabase/migrations` (starting with `0001_base_schema.sql`).

## 4. Auth & Role Mapping
- Platform roles are driven through JWT claim `app_role`.
- Use Supabase Dashboard → Authentication → Policies to verify RLS policies for `ATLVS_*`, `COMPVSS_*`, and `LEGEND_*` roles.
- Support engineers can impersonate accounts using LEGEND roles defined in MASTER_ROADMAP.

## 5. Edge Functions
- Functions live under `supabase/functions`. Example: `deal-project-handoff` handles ATLVS → COMPVSS project sync.
- Deploy via CLI:
```bash
supabase functions deploy deal-project-handoff --project-ref <ref>
```
- Set secrets before deploy:
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=***
```

## 6. CI/CD Integration
- Turbo CI should run `supabase db lint` and `supabase db push --dry-run` to detect drift.
- Vercel/Turbo pipelines pull secrets from 1Password → GitHub Actions → environment groups.
- Rotation cadence: quarterly or upon incident, tracked in Security Validation checklist.

## 7. Credential Handling Rules
- Production service-role keys **never** leave 1Password or CI secret stores.
- Local `.env` files must stay inside `supabase/.env` and are gitignored.
- Use `supabase secrets list` to audit deployed secrets each sprint.

## 8. Support & Escalation
- Supabase incidents route to #ops-platform Slack channel with PagerDuty fallback.
- Document restores in Postmortem template referenced in MASTER_ROADMAP Section 10.

---
Questions? Ping the Platform Engineering channel or reference MASTER_ROADMAP Section 10 (Risk Mitigation) for escalation procedures.
