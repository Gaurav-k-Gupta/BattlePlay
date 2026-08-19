# BattlePlay

Fantasy esports tournament app built with Next.js, Prisma, Neon, Google OAuth, and Razorpay.

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
