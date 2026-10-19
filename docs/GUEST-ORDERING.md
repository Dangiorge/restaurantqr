# Guest menu redesign and table actions — 19 October 2026

This change implements the user's requested menu redesign and a scoped dine-in ordering/service extension. It does not mark the full ordering or operations roadmap phases complete.

## Guest experience

The large red masthead has been replaced with a compact branded header, table context, a small food-led introduction, searchable dishes, category pills, circular dish photos, rounded cards, dish details, quantity controls and a persistent bottom action bar. Romina's original logo, Poppins and documented `#D42028` remain the visual foundation. The introductory food photo comes from the supplied brand book; saved dish names, photos and prices are preserved.

Guests can browse dish details and build a basket. Table QR menus additionally allow submitting an order, calling a waiter, requesting the bill, drinking water, cutlery or other assistance. Public `/menu` and `/r/[slug]/menu` pages explain that a table QR is needed to send an order or table request. These pages do not invent a table or place an order against an arbitrary branch.

Cart, instructions, pending submission IDs and the latest private receipt are retained in tab session storage where available. An in-memory pending ID also protects retries when storage is unavailable. The order review shows the current server quote. Prices that change after review require the guest to review updated totals and submit again. A successful response opens a genuine persisted order receipt; request confirmation is shown only after a service record exists.

## Staff experience

Open **Workspace → Live service**. Authorized staff see orders and requests for their restaurant and permitted branches. The queue refreshes every 10 seconds and covers the last 24 hours, up to 100 records of each kind. It is polling, not push notifications or a guaranteed delivery alert; staff must keep the queue open and monitor it.

Order states: PLACED → ACCEPTED → PREPARING → READY → SERVED → COMPLETED, with staff cancellation allowed before READY. Order processing requires `orders.process`. Kitchen staff with `kitchen.manage` can move accepted orders to PREPARING and then READY. Service requests move OPEN → ACKNOWLEDGED → RESOLVED and require `service.manage`. A restaurant owner has these permissions; custom staff roles can be configured as needed. Updates use conditional writes to reject competing/stale state transitions.

Guests see actual persisted order/request status updates at 10-second intervals. A bill request goes to staff; it does not create a paid invoice, collect money, or settle a table. Order totals are not collected revenue or payment records. Payment remains at the restaurant.

## Pricing, authorization and duplicate protection

- The server resolves the restaurant, branch and table from a currently active random QR token. Revoked/expired QR codes, inactive tables/branches and suspended restaurants cannot submit actions.
- Current active/available menu items must belong to the verified restaurant and an active category/menu. Browser prices, totals, branch IDs and unknown fields are rejected.
- Quantities are integers from 1–20; a basket has at most 30 unique items and notes have at most 500 characters. Excessive totals are rejected.
- Base prices and configured tax/service rates are read on the server. Amounts are calculated in integer cents. Both tax and service are independently rounded half-up from the item subtotal; service is not taxed in this initial implementation. No promotions or branch-price overrides are implied.
- A server-generated quote fingerprint detects price/name/rate changes between review and submission. Order item names, unit prices, quantities, line totals, order rates, fees and totals are snapshotted transactionally.
- Order submission UUIDs are unique per QR. A payload hash detects reuse for a different cart. Transaction-scoped advisory locks serialize competing submissions; repeated/concurrent identical requests return the same order.
- Repeated identical open table service requests are coalesced for ten minutes. New orders are capped at 20/table/hour; service requests at 30/table/hour. These are basic application limits; production infrastructure abuse controls remain a later hardening task.
- Random 256-bit private receipt references expire after seven days and reveal only that receipt's selected public fields. Staff queue responses omit these bearer references and idempotency hashes. Existing receipts continue to work after a table QR is regenerated/revoked.
- Staff reads and writes reload current membership/account/restaurant status and branch permissions. No platform privilege is inferred from a restaurant role.

## Database changes and preservation

Migration `20261019140000_guest_ordering` adds Order, OrderItem and ServiceRequest, their status/type enums, tenant/table/QR composite keys and indexes. Existing menus, photos, users, memberships and the platform administrator are preserved. Order item menu IDs are historical references; snapshots remain meaningful after menu edits.

Before deployment, the verified Neon database fingerprint and two existing migration records were checked. All 21 existing application tables were captured in a consistent read-only backup, restored exactly to an isolated schema and compared. The additive migration was tested against that restored schema and rolled back. Its checked SQL checksum and verified backup checksum were then required by the deployment wrapper. The backup and verification manifest remain ignored under `.local/`. Prisma confirmed all three migrations applied and the database schema up to date. No application data reset, drop or truncate was performed.

New tooling: `scripts/prepare-guest-migration.mjs` and `scripts/deploy-guest-migration.mjs`. The preparation tool intentionally expects the pre-upgrade two-migration history and refuses an already upgraded target.

## Verification

The database/security suite passed 30 tests (0 failures/skips), including precise totals, price snapshots, changed-price rejection, browser-price injection, unavailable/cross-tenant items, concurrent idempotent orders, duplicate service requests, private receipt access, tenant/branch authorization, revoked QR rejection and authorized status transitions. The focused unit suite passed 16 tests. Prisma validation, client generation, lint and production build passed. Client secret scans cover the configured database/auth/Cloudinary secrets.

Browser verification exercises the new menu at phone width, images, search, public-menu restrictions, basket, instructions, an anonymous order, waiter and bill requests, staff acceptance, guest status restoration, table QR revocation, and the existing upload/branding workflows. The final workflow additionally simulates a menu price change before submission and verifies re-review rather than silently placing at a new total. Test records use a disposable schema; temporary image assets are deleted during cleanup.

The first full browser flow passed with real image uploads. A later combined attempt received a Cloudinary 502, so the final focused ordering regression used `GUEST_ONLY_BROWSER=1` with local image fixtures in its isolated schema and passed without calling Cloudinary. An idle test-admin database connection also reset during an intermediate run; the test runner now closes that setup connection and uses short-lived connections for fixture updates and cleanup. A verified leftover disposable schema from the interrupted run was removed; application schemas were not touched.

The final checks also fixed malformed image URLs producing unrelated TypeErrors and price-conflict messages being replaced by a generic duplicate-record error. Both now have focused validation/error-response regression coverage. Final lint, unit checks, production build and client secret scan passed. Screenshots are in ignored `.local/previews/`, including `menu-mobile.png`, `guest-order-confirmation.png` and `live-service-desktop.png`.

## Main changed files

`components/guest-menu.jsx`, `components/menu-icons.jsx`, `components/operations.jsx`, `components/workspace.jsx`, `app/guest-menu.css`, `app/layout.jsx`, `app/q/[token]/page.jsx`, `modules/ordering/service.mjs`, `app/api/guest/[token]/[action]/route.js`, `app/api/guest-status/[type]/[reference]/route.js`, `app/api/workspace/[restaurantId]/operations/route.js`, `prisma/schema.prisma`, the additive migration, `lib/db.mjs`, ordering/database/browser tests and guarded migration tooling.

## Deliberately deferred

Takeaway/delivery, modifiers with additional prices, branch-price overrides, fasting schedules, promotions, online payments/Telebirr, refunds, guest cancellation rules, stock quantities, automatic consolidated bills, kitchen station assignment, push notification infrastructure, reports and production load/abuse hardening are not implemented by this extension. Customer submission is a request for staff acceptance, not a payment guarantee. Image menus remain the selected upload format; the previously documented Cloudinary PDF setting is unchanged.
