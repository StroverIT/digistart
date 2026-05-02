# digistart

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
