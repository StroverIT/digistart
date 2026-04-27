# digistart

## Stripe setup

- Add Stripe keys to `.env` / `.env.production` using `.env.example` as a template.
- Required env vars:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_SITE_URL`

### Local webhook testing

Run Stripe CLI and forward webhook events to Next.js:

`stripe listen --forward-to localhost:3000/api/stripe/webhook`
