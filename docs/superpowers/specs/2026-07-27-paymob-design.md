# Paymob Payment System for HefnoPlant — Design Doc

## Overview
Replace Stripe + VodafoneCash with Paymob as the sole payment provider. Paymob handles cards, Vodafone Cash, Meeza, and wallets through a single integration. Frontend is CRA, backend is Vercel serverless functions.

## Architecture
Provider pattern in `api/_lib/payments/` — Paymob registers itself via `registerProvider('paymob', {...})`. Vercel routes map to `api/billing.js`. Webhook flow: Paymob POST → HMAC verification → idempotency → amount/currency/merchant/integration check → subscription activation.

## Firestore Collections
- `payments/{transactionId}` — payment records
- `payment_events/{transactionId}` — idempotency/event log
- `subscriptions/{userId}` — already exists
- `subscriptionLogs/{logId}` — already exists

## Security
- HMAC SHA-512 verification on every webhook
- Idempotency via `payment_events` collection
- Amount, currency, merchant_id, integration_id verification
- No frontend subscription activation
- Firestore rules block client writes to payments, payment_events

## Env Vars
PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, PAYMOB_IFRAME_ID, PAYMOB_HMAC_SECRET, PAYMOB_MERCHANT_ID
