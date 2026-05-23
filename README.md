# digistart

## Coming soon mode

- Set `IS_COMING_SOON=true` to show the launch page and block normal page content.
- Accepted truthy values: `true`, `1`, `yes`, `on`.
- `/admin` (including login) stays available; other page routes show the launch screen. Public APIs return `503` except `POST /api/newsletter/subscribe`, NextAuth, and Stripe webhooks.
- After pulling, run `npx prisma migrate deploy` (or `prisma migrate dev`) so the `newsletter_subscribers` table exists.

## Support chat (Supabase Realtime)

Client support chat at `/user/support` uses Postgres persistence (Prisma) and [Supabase Realtime](https://supabase.com/docs/guides/realtime/postgres-changes) for live updates.

Required env vars (in addition to existing Supabase service role vars):

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (same as `SUPABASE_URL` if already set).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase **anon** public key (Project Settings → API).
- `SUPABASE_JWT_SECRET` — Supabase JWT secret (Project Settings → API → JWT Secret). Used to issue short-lived tokens for Realtime RLS.
- `ADMIN_EMAIL` — receives an email with the chat link when a customer sends their first message.
- `NEXT_PUBLIC_SITE_URL` — used in admin notification links (e.g. `https://digistart.bg/admin/support/{chatId}`).

Admins manage chats at `/admin/support` (sidebar: **Чат за помощ**). Email „Отвори чата“ links open the chat in the admin panel.

After deploying Prisma migration `20260523120000_support_chat`, apply the Supabase SQL migration `supabase/migrations/20260523120000_support_chat.sql` on your Supabase project (Dashboard SQL editor or `supabase db push`) so Realtime publication and RLS policies are active.

## Stripe setup

- Add Stripe keys to `.env` / `.env.production` using `.env.example` as a template.
- Required env vars:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_SITE_URL`

## Meta Pixel + Stape CAPI Gateway (production only)

Browser-side Meta Pixel and server-side Meta Conversions API events both fire
with the same unique `event_id`, so Meta deduplicates them. The server-side
mirror lives at `POST /api/meta/capi`, which enriches with IP / User-Agent /
`_fbp` / `_fbc` cookies and hashed PII before forwarding to Stape's CAPIG.

Set in `.env.production` only (server-side keys are NOT prefixed with `NEXT_PUBLIC_`):

- `NEXT_PUBLIC_META_PIXEL_ID` - Facebook / Meta Pixel ID. Browser `fbq` and the inline `<Script>` in `app/layout.tsx` are skipped if unset.
- `NEXT_PUBLIC_META_CURRENCY` - ISO 4217 code (default `EUR`).
- `STAPE_CAPIG_URL` - e.g. `https://capig.digistart.bg`.
- `STAPE_CAPIG_IDENTIFIER` - Stape CAPIG identifier.
- `STAPE_CAPIG_API_KEY` - Stape CAPIG API key (base64 token).

`/api/meta/capi` no-ops when the CAPIG env vars are unset, so local dev stays clean.

### Local webhook testing

Run Stripe CLI and forward webhook events to Next.js:

`stripe listen --forward-to localhost:3000/api/stripe/webhook`

## E2E tests (Playwright)

Checkout flows are covered by serial scenarios: guest paths (one service, two services, three services, plan only, plan + service) and a logged-in customer checkout. Tests build the cart through the UI and pay with a Stripe test card.

### Prerequisites

- Postgres with migrations applied (`npm run prisma:migrate:deploy`)
- Stripe **test** keys in `.env`:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (same publishable key as above)
  - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `IS_COMING_SOON` unset or `false` (coming soon blocks checkout APIs)
- `NEXTAUTH_SECRET` set (required by the app)
- Logged-in scenario (optional): `E2E_CUSTOMER_PASSWORD` in `.env.local`, and optionally `E2E_CUSTOMER_EMAIL` (default `emilzlatinov1234@gmail.com`). Run `E2E_CUSTOMER_PASSWORD=… npx tsx scripts/ensure-e2e-customer.ts` once against your local DB if the user does not exist yet.

Optional: run `npm run stripe-webhook` in another terminal for webhook-driven emails (success page polling marks orders paid without the webhook).

### Commands

```bash
npm run test:e2e      # headless
npm run test:e2e:ui   # interactive UI mode
```

`playwright.config.ts` starts `npm run dev` unless a server is already running locally. Override the base URL with `PLAYWRIGHT_BASE_URL`.

### CI

GitHub Actions workflow `.github/workflows/e2e.yml` runs on pull requests when repository secrets `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` are configured. For the logged-in test, add `E2E_CUSTOMER_PASSWORD` (and optionally `E2E_CUSTOMER_EMAIL`) secrets.
