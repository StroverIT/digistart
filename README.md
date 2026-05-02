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

## Meta Pixel (optional)

- `NEXT_PUBLIC_META_PIXEL_ID` — Facebook / Meta Pixel ID (browser `fbq` is skipped if unset; `dataLayer` still receives events).
- `NEXT_PUBLIC_META_CURRENCY` — ISO 4217 code (default `EUR`).
- `NEXT_PUBLIC_STAPE_EVENT_ENDPOINT` — optional URL for JSON POST mirroring each event payload (Stape / server-side GTM). Use the same `event_id` server-side for deduplication.

### Local webhook testing

Run Stripe CLI and forward webhook events to Next.js:

`stripe listen --forward-to localhost:3000/api/stripe/webhook`
