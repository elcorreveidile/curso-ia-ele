# Test credentials

## Admin user (seeded on startup)
- Email: benitezl@go.ugr.es
- Role: admin
- Auth flow: Magic link via email (Resend). For automated testing, the backend can be tested by:
  1. POST /api/auth/request-link {"email": "benitezl@go.ugr.es"}
  2. Magic link token must be retrieved from Resend email (production)
  3. For test environments, a token can be generated directly with the MAGIC_LINK_SECRET.

## Test student email (for generating enrollments)
- test.student@example.com (created on first magic-link verify)

## Stripe
- STRIPE_API_KEY in backend/.env uses emergent test key by default (sk_test_emergent).
- Webhook endpoint: POST /api/webhook/stripe
- Production webhook URL: https://laclasedigital.com/api/webhook/stripe
- Event to subscribe: checkout.session.completed
- STRIPE_WEBHOOK_SECRET: set to the whsec_... secret from the Stripe dashboard after creating the webhook.
  Without it, signature verification is skipped (dev-only, insecure in production).
- Checkout create: POST /api/checkout/create {course_slug, origin_url}

## Admin test helper
- To get a JWT token in tests without using email, directly generate a signed magic token via the `create_magic_token` helper in server.py (same JWT_SECRET as MAGIC_LINK_SECRET).
