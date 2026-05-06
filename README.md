# digistart

## Coming soon mode

- Set `IS_COMING_SOON=true` to show the launch page and block normal page content.
- Accepted truthy values: `true`, `1`, `yes`, `on`.
- `/admin` (including login) stays available; other page routes show the launch screen. Public APIs return `503` except `POST /api/newsletter/subscribe`, NextAuth, and Stripe webhooks.
- After pulling, run `npx prisma migrate deploy` (or `prisma migrate dev`) so the `newsletter_subscribers` table exists.

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

- `NEXT_PUBLIC_META_PIXEL_ID` — Facebook / Meta Pixel ID. Browser `fbq` and the inline `<Script>` in `app/layout.tsx` are skipped if unset.
- `NEXT_PUBLIC_META_CURRENCY` — ISO 4217 code (default `EUR`).
- `STAPE_CAPIG_URL` — e.g. `https://capig.digistart.bg`.
- `STAPE_CAPIG_IDENTIFIER` — Stape CAPIG identifier.
- `STAPE_CAPIG_API_KEY` — Stape CAPIG API key (base64 token).

`/api/meta/capi` no-ops when the CAPIG env vars are unset, so local dev stays clean.

### Local webhook testing

Run Stripe CLI and forward webhook events to Next.js:

`stripe listen --forward-to localhost:3000/api/stripe/webhook`
