# BattlePlay

Fantasy esports tournament app built with Next.js, Prisma, Neon, Google OAuth, and TranzUPI.

## Phase 0 setup

1. Copy `.env.example` to `.env`.
2. Add Neon's **pooled** `DATABASE_URL` (the hostname must include `-pooler`).
3. Create a Google OAuth web client and set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
   Use `http://localhost:3000/api/auth/callback/google` as the local callback URL.
4. Generate `AUTH_SECRET` with `openssl rand -base64 32`.
5. Run `npm install`, `npm run db:generate`, and `npm run dev`.

Visit `http://localhost:3000`, sign in with Google, and verify the protected `/account` page opens.

## Database setup

After configuring `.env`, apply the schema with `npm run db:migrate -- --name init`.
Set `ADMIN_EMAIL` and run `npm run db:seed` to assign the initial administrator role.

## TranzUPI setup

Add `TRANZUPI_USER_TOKEN` to `.env`, then configure this callback URL in the TranzUPI dashboard:

```text
https://YOUR_DOMAIN/api/wallet/topup/webhook
```

Visit `/wallet` while signed in and with a valid 10-digit Indian mobile number on your profile. BattlePlay creates a hosted TranzUPI payment link and redirects the user there. A successful payment is credited only after BattlePlay independently calls TranzUPI's order-status API and confirms that the reported amount matches the pending transaction. The webhook also triggers this verification, so a payment is still credited if the user closes the browser before returning to BattlePlay.
