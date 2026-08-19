# Fantasy Esports Tournament App — Technical Architecture (v3, Final)

**Scope:** token purchase via Razorpay, match registration, manual admin-credited winnings, manual admin-approved withdrawals (paid outside the system to a UPI ID), manual Free Fire ID verification by room host, PWA for web+app — plus profile, history, notifications, leaderboard, promo codes, referrals, and basic security hardening.

**Stack:** Next.js (App Router, frontend + API routes) on Vercel · PostgreSQL on Neon (pooled connection) · Prisma ORM.

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend + Backend | **Next.js (App Router)** | One codebase, one deployment; API routes are serverless functions |
| Database | **PostgreSQL** (hosted on **Neon**) | Relational data fits SQL; foreign keys + constraints enforce integrity at the DB level |
| ORM | **Prisma** | Type-safe queries, schema-driven migrations |
| Auth | NextAuth.js (Google OAuth) + role field for admin | OAuth flow, sessions/JWT out of the box |
| Payments (in only) | Razorpay Orders API | UPI/card token purchase |
| Validation | **Zod** | Schema validation on every API route input |
| Rate limiting | **@upstash/ratelimit** + Upstash Redis (free tier) | Protects login/registration routes from spam/abuse |
| Hosting | **Vercel** | No cold-start "sleep" problem; scales automatically under burst load |
| Notifications | In-app `Notification` table (+ optional Telegram Bot API for room creds) | No push infra needed for a college project |

---

## 2. High-Level Flow

```
[Next.js Frontend Pages] --(same deployment)--> [Next.js API Routes, serverless, Zod-validated]
                                                         |
                                     Rate limiter (Upstash) on sensitive routes
                                                         |
                                              Prisma Client (pooled connection)
                                                         |
                                        Postgres on Neon (pooled connection string)
                                                         |
                                        Razorpay (token purchase) / Telegram Bot API (optional)
```

**Reminder:** always use Neon's **pooled** connection string in `DATABASE_URL` — under bursty serverless traffic, multiple parallel function instances each opening a direct connection will exhaust Postgres's connection limit otherwise.

---

## 3. Database Schema (Prisma)

```prisma
// schema.prisma

model User {
  id              String    @id @default(cuid())
  name            String
  email           String    @unique
  passwordHash    String?
  googleId        String?   @unique
  phone           String?
  freeFireUID     String?
  freeFireIGN     String?
  role            Role      @default(USER)
  isBanned        Boolean   @default(false)
  referralCode    String    @unique @default(cuid())   // this user's own shareable code
  referredBy      String?                               // another user's referralCode, if any
  agreedToTerms   Boolean   @default(false)
  createdAt       DateTime  @default(now())

  transactions        Transaction[]
  registrations        Registration[]
  withdrawalRequests   WithdrawalRequest[]
  notifications         Notification[]
  promoRedemptions      PromoRedemption[]
}

enum Role {
  USER
  ADMIN
}

model Transaction {
  id                  String    @id @default(cuid())
  user                User      @relation(fields: [userId], references: [id])
  userId              String
  type                TxType
  amount              Decimal   @db.Decimal(10, 2)
  status              TxStatus  @default(PENDING)
  relatedMatch        Match?    @relation(fields: [relatedMatchId], references: [id])
  relatedMatchId      String?
  relatedWithdrawal   WithdrawalRequest? @relation(fields: [relatedWithdrawalId], references: [id])
  relatedWithdrawalId String?
  razorpayOrderId     String?
  note                String?
  createdBy           String?              // admin userId, for manual actions — audit trail
  createdAt           DateTime  @default(now())

  @@index([userId])
}

enum TxType {
  TOPUP
  MATCH_FEE
  WINNINGS
  WITHDRAWAL
  REFUND
  PROMO_BONUS
  REFERRAL_BONUS
}

enum TxStatus {
  PENDING
  SUCCESS
  FAILED
  REJECTED
}

model Match {
  id                String    @id @default(cuid())
  title             String
  description       String?              // rules, map, mode — shown on match info page
  gameType          GameType
  entryFee          Decimal   @db.Decimal(10, 2)
  prizePool         Decimal   @db.Decimal(10, 2)
  maxSlots          Int
  matchTime          DateTime
  status            MatchStatus @default(UPCOMING)
  roomId            String?
  roomPassword      String?
  telegramGroupLink String?
  resultsSubmitted  Boolean   @default(false)
  createdAt         DateTime  @default(now())

  registrations     Registration[]
  transactions      Transaction[]
}

enum GameType {
  SOLO
  DUO
  SQUAD
}

enum MatchStatus {
  UPCOMING
  LIVE
  COMPLETED
  CANCELLED
}

model Registration {
  id                String    @id @default(cuid())
  user              User      @relation(fields: [userId], references: [id])
  userId            String
  match             Match     @relation(fields: [matchId], references: [id])
  matchId           String
  freeFireIGNUsed   String
  verifiedByHost    Boolean   @default(false)
  placement         Int?
  winningsCredited  Boolean   @default(false)
  registeredAt      DateTime  @default(now())

  @@unique([userId, matchId])   // double-registration impossible at DB level
}

model WithdrawalRequest {
  id            String    @id @default(cuid())
  user          User      @relation(fields: [userId], references: [id])
  userId        String
  amount        Decimal   @db.Decimal(10, 2)
  upiId         String
  status        WithdrawalStatus @default(PENDING)
  adminNote     String?
  requestedAt   DateTime  @default(now())
  actionedAt    DateTime?
  actionedBy    String?               // admin userId — audit trail

  transactions  Transaction[]
}

enum WithdrawalStatus {
  PENDING
  APPROVED
  REJECTED
  PAID
}

model Notification {
  id          String    @id @default(cuid())
  user        User      @relation(fields: [userId], references: [id])
  userId      String
  title       String
  message     String
  type        NotifType
  isRead      Boolean   @default(false)
  createdAt   DateTime  @default(now())

  @@index([userId, isRead])
}

enum NotifType {
  ROOM_AVAILABLE
  WINNINGS_CREDITED
  WITHDRAWAL_UPDATE
  GENERAL
}

model PromoCode {
  id            String    @id @default(cuid())
  code          String    @unique
  bonusAmount   Decimal   @db.Decimal(10, 2)
  maxRedemptions Int?               // null = unlimited
  expiresAt     DateTime?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())

  redemptions   PromoRedemption[]
}

model PromoRedemption {
  id            String    @id @default(cuid())
  user          User      @relation(fields: [userId], references: [id])
  userId        String
  promoCode     PromoCode @relation(fields: [promoCodeId], references: [id])
  promoCodeId   String
  redeemedAt    DateTime  @default(now())

  @@unique([userId, promoCodeId])   // one redemption per user per code
}
```

**Design notes:**
- `Notification` is deliberately simple — a row per notice, `isRead` flag, no push infra. A bell icon + `GET /api/notifications` + "mark as read" is enough for a college project.
- `referralCode`/`referredBy` live directly on `User` rather than a separate table, since it's a 1:1 relationship per user; the bonus itself is still logged as a proper `Transaction (REFERRAL_BONUS)` for audit purposes.
- `PromoCode`/`PromoRedemption` follow the same ledger discipline — redeeming a code creates a `Transaction (PROMO_BONUS)`, never a direct balance edit.
- **Wallet balance** is still always *derived* from `SUCCESS` transactions (`TOPUP + WINNINGS + PROMO_BONUS + REFERRAL_BONUS + REFUND - MATCH_FEE - WITHDRAWAL`) — never a stored column.

---

## 4. Auth Flow

**Users:** NextAuth.js, Google provider. First login creates a `User` row (`role: USER`), `referralCode` auto-generated. If a referral code was passed at signup (e.g. via `?ref=CODE` in the invite link), store it as `referredBy` and issue both users a `REFERRAL_BONUS` transaction once the referred user completes their first top-up (prevents fake/empty-account farming).

**Admin:** same NextAuth flow, `role: ADMIN` seeded directly in the DB. Every admin route checks `session.user.role === "ADMIN"`.

**Terms acceptance:** `agreedToTerms` must be `true` before a user can register for any match — checked server-side in the registration route, not just a frontend checkbox.

---

## 5. API Routes

```
Auth
  handled by NextAuth.js (app/api/auth/[...nextauth]/route.js)   [rate-limited]

Wallet
  POST /api/wallet/topup/create-order
  POST /api/wallet/topup/verify
  GET  /api/wallet/balance
  GET  /api/wallet/transactions

Matches
  GET  /api/matches                       // supports ?gameType= & ?status= filters
  GET  /api/matches/[id]
  POST /api/matches/[id]/register         [rate-limited]
  GET  /api/matches/[id]/room-details

Profile & History
  GET   /api/profile
  PATCH /api/profile                      // name, phone, FF UID/IGN, avatar
  PATCH /api/profile/password
  GET   /api/profile/match-history        // past registrations + placements
  GET   /api/profile/stats                // total winnings, matches played, win rate

Withdrawals
  POST /api/withdrawals
  GET  /api/withdrawals/mine

Notifications
  GET   /api/notifications
  PATCH /api/notifications/[id]/read

Promo Codes
  POST /api/promo/redeem

Referrals
  GET  /api/referrals/my-code
  GET  /api/referrals/history

Leaderboard
  GET  /api/leaderboard?period=monthly|allTime

Admin  (all gated by role === ADMIN, all Zod-validated)
  POST  /api/admin/matches
  PATCH /api/admin/matches/[id]
  POST  /api/admin/matches/[id]/credit-winnings
  GET   /api/admin/withdrawals
  PATCH /api/admin/withdrawals/[id]
  GET   /api/admin/users
  PATCH /api/admin/users/[id]/ban
  POST  /api/admin/promo-codes
  GET   /api/admin/promo-codes
  GET   /api/admin/audit-log             // unified view of createdBy/actionedBy actions
```

---

## 6. Key Flow Walkthroughs

**Token purchase** — unchanged from v2: create order → Razorpay checkout → **server re-verifies signature** → `Transaction(TOPUP, SUCCESS)`.

**Match registration** (inside `prisma.$transaction`, Zod-validated input, rate-limited):
1. Confirm `agreedToTerms === true`.
2. Check wallet balance ≥ `entryFee`.
3. Check slot availability and no time overlap with user's other upcoming/live registrations.
4. Create `Registration` + `Transaction(MATCH_FEE, SUCCESS)` together; `@@unique([userId, matchId])` is the DB-level backstop.
5. Create a `Notification(GENERAL)` — "Registered for {match}."

**Room details reveal** — unchanged: only visible if registered and within ~30 min of `matchTime`. When it becomes visible, create a `Notification(ROOM_AVAILABLE)` so the user doesn't have to keep refreshing.

**Winnings credit (manual, by admin)** — unchanged: admin reviews screenshots outside the app, credits via admin panel → `Transaction(WINNINGS, SUCCESS)` → also fires `Notification(WINNINGS_CREDITED)`.

**Withdrawal (manual payout)** — unchanged: user requests → admin reviews → pays manually via UPI → marks paid → `Transaction(WITHDRAWAL, SUCCESS)` → fires `Notification(WITHDRAWAL_UPDATE)`.

**Promo code redemption**
1. User submits a code on `/api/promo/redeem`.
2. Validate: code exists, `isActive`, not expired, under `maxRedemptions`, and no existing `PromoRedemption` for this user+code (`@@unique` backs this up).
3. Create `PromoRedemption` + `Transaction(PROMO_BONUS, SUCCESS)` together.

**Referral bonus**
1. New user signs up via `?ref=CODE` link → `referredBy` stored on their `User` row.
2. On the referred user's **first successful top-up**, backend checks `referredBy` is set and no referral bonus has been paid yet for this pair (add a simple flag or check for an existing `REFERRAL_BONUS` transaction note referencing this user) → credits both users with `Transaction(REFERRAL_BONUS, SUCCESS)`.

**Leaderboard**
- `GET /api/leaderboard` aggregates `Transaction(WINNINGS)` per user for the requested period (this month vs all-time), returns top N with name + total winnings. Pure read query, no new write paths.

---

## 7. Admin Panel — Pages

- **Dashboard** — pending withdrawals, today's registrations, quick stats
- **Matches** — create/edit (title, description/rules, room ID+password, mark completed)
- **Registrations** — per-match list with Free Fire UID/IGN, for the room host to cross-check
- **Credit Winnings** — match → user → placement + amount → confirm
- **Withdrawals** — pending queue → approve/reject → mark paid
- **Users** — search, wallet/transaction history, ban/unban
- **Promo Codes** — create/deactivate codes, view redemption counts
- **Audit Log** — unified, readable view of every `createdBy`/`actionedBy` action (winnings credited, withdrawals actioned, users banned) — the data already exists in the ledger, this page just surfaces it

---

## 8. Frontend Pages (User-Facing)

```
/                        Home / upcoming matches
/matches                 Match list (filterable by game type, fee range, status)
/matches/[id]            Match detail — rules, entry fee, slots, register button
/wallet                  Balance, top-up, transaction history
/profile                 Edit profile (name, phone, FF UID/IGN, avatar, password)
/profile/history         Match history + placements
/profile/stats           Total winnings, matches played, win rate
/withdraw                Request withdrawal, view request status
/leaderboard             Top winners (monthly / all-time)
/notifications            In-app notification list, mark-as-read
/referrals                Your referral code/link, referral history
/promo                    Redeem a promo code
/terms                    Terms & rules — must accept before first registration
```

---

## 9. PWA Setup

Unchanged from v2 — `next-pwa` + a `manifest.json` in `/public` for installable, full-screen behavior on mobile/desktop from the same deployment.

---

## 10. Security & Robustness

- **Zod validation** on every API route's input — reject malformed/missing fields before they reach Prisma.
- **Rate limiting** (`@upstash/ratelimit`, Upstash Redis free tier) on `/api/auth/*` and `/api/matches/[id]/register` — prevents spam signups and registration abuse.
- **Server-side re-verification** of Razorpay signatures — never trust client-reported payment success.
- **DB-level constraints** (`@@unique` on Registration and PromoRedemption) as a backstop against race conditions, not just app-level checks.
- **Audit trail by construction** — `createdBy`/`actionedBy` on every manual admin action, surfaced via the Audit Log page.
- **Server-only env vars** by default in Next.js; only `NEXT_PUBLIC_`-prefixed vars reach the browser — DB URL, Razorpay secret, NextAuth secret never leak client-side.
- **Basic loading/error states** on every data-fetching page in the frontend — avoids blank screens on failed requests.
- **Terms acceptance enforced server-side**, not just a frontend checkbox that can be bypassed by calling the API directly.

---

## 11. Project Structure

```
/app
  /page.jsx
  /matches/page.jsx
  /matches/[id]/page.jsx
  /wallet/page.jsx
  /profile/page.jsx
  /profile/history/page.jsx
  /profile/stats/page.jsx
  /withdraw/page.jsx
  /leaderboard/page.jsx
  /notifications/page.jsx
  /referrals/page.jsx
  /promo/page.jsx
  /terms/page.jsx
  /admin/
    page.jsx                    (dashboard)
    matches/page.jsx
    withdrawals/page.jsx
    users/page.jsx
    promo-codes/page.jsx
    audit-log/page.jsx
  /api/
    auth/[...nextauth]/route.js
    wallet/topup/create-order/route.js
    wallet/topup/verify/route.js
    wallet/transactions/route.js
    matches/[id]/register/route.js
    matches/[id]/room-details/route.js
    profile/route.js
    profile/match-history/route.js
    profile/stats/route.js
    withdrawals/route.js
    notifications/route.js
    promo/redeem/route.js
    referrals/my-code/route.js
    leaderboard/route.js
    admin/matches/route.js
    admin/withdrawals/[id]/route.js
    admin/promo-codes/route.js
    admin/audit-log/route.js
    ...
/lib
  prisma.js          (singleton Prisma client)
  razorpay.js
  ratelimit.js        (Upstash config)
  validation/          (Zod schemas per route)
/prisma
  schema.prisma
```

---

## 12. Explicitly Out of Scope (by design, not oversight)

- Push notifications — in-app notifications are enough
- Real payout API integration — manual UPI payout by admin, as decided
- Screenshot upload/storage — handled via Telegram/WhatsApp outside the app
- Multi-admin roles/permissions — single admin role is sufficient
- Automated Free Fire ID verification — manual, by room host, as decided

---

This is the complete, final feature set: the core wallet/match/withdrawal engine from v2, plus profile, match history, transaction history, in-app notifications, leaderboard, promo codes, referrals, and the security/validation layer that makes it feel production-considered rather than just a working demo.