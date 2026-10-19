# Delivery checklist

## Phase 1 — development foundation

- [x] Inspect repository, installed Next.js guides and existing modifications.
- [x] Review actual Romina PDF palette, typography, logo and layout examples.
- [x] Inspect environment names without revealing values.
- [x] Detect unrelated original database; perform no writes to it.
- [x] Verify replacement database empty; record safe local target metadata.
- [x] Define architecture and dependency gaps.
- [x] Add JavaScript Prisma schema and additive migration.
- [x] Test SQL in a disposable schema; deploy to verified development target; verify migration status.
- [x] Add authentication, current account status and sessions.
- [x] Add tenant memberships, branch assignments, default/custom roles and server-side grant checks.
- [x] Separate platform administration from restaurant permissions.
- [x] Add restaurant onboarding/settings and branch management.
- [x] Add menus/categories/items, pricing permission and audit trail.
- [x] Add areas/tables, random QR tokens, expiry/revocation/regeneration and branded printing.
- [x] Add privately shared invitations, acceptance and staff access management.
- [x] Pass database-backed isolation/authentication tests, validation tests, lint, build and client secret scan.
- [x] Pass real-browser registration/onboarding, branch/menu/table/QR flow, download/print/revocation, access-denial and mobile-layout checks; review desktop/mobile/print screenshots.

Production dependencies remain open: email delivery and recovery, deployment origin, proxy trust, separate physical test database, licensed Ethiopian typeface, production backup/restore and security review.

## Authorized Romina website/upload extension

- [x] Replace the home screen with a Romina website based on the actual guideline.
- [x] Add authenticated Cloudinary dish/logo and PDF/image menu uploads.
- [x] Back up and restore-check existing records before the additive menu-document migration.
- [x] Add public guest menus, search, category filters and uploaded menu links.
- [x] Apply restaurant branding to menu pages and QR print-card backgrounds.
- [x] Verify real Cloudinary image/PDF uploads and image delivery.
- [ ] Enable Cloudinary's public PDF delivery setting and verify a successful guest PDF request (currently 401).

See `docs/ROMINA-WEBSITE-UPLOADS.md` for configuration, evidence and limits.

## Requested guest-menu and table-action extension

- [x] Redesign the menu around the supplied app reference with Romina branding.
- [x] Add dish details, basket/quantity controls and order instructions.
- [x] Add authoritative quotes, changed-price checks and transactional price snapshots.
- [x] Add idempotent table-QR dine-in order submission and private tracking.
- [x] Add waiter, bill, water, cutlery and assistance requests with duplicate protection.
- [x] Add a permission/branch-scoped staff queue and status changes.
- [x] Verify additive migration against a restored backup; deploy and check status.
- [x] Pass 30 database/security tests and 16 focused unit tests.
- [x] Complete the final browser regression, including changed-price review, anonymous order submission, waiter/bill calls, staff acceptance, guest tracking and mobile layouts; review screenshots.

See `docs/GUEST-ORDERING.md`. This explicitly requested extension implements parts of phases 3 and 4; those phases remain incomplete.

## Remaining roadmap

- [ ] Phase 2: branch-specific pricing/availability, explicit fasting classification, scheduled menus, promotions/events and server-side display rules.
- [ ] Phase 3: finish the broader ordering phase; table-QR basket/snapshots/references/tracking are implemented, while takeaway/delivery and broader cancellation/modifier rules remain.
- [ ] Phase 4: finish full kitchen/waiter operations; basic scoped polling queues and service requests are implemented, while stations, assignment and push delivery remain.
- [ ] Phase 5: official Telebirr documentation/merchant access, encrypted provider configuration, verified checkout/callbacks, reconciliation and supported refunds.
- [ ] Phase 6: eligible feedback/ratings, KPI definitions/aggregates, CSV exports and rule-based recommendations.
- [ ] Phase 7: production tenant/security testing, backup restore drills, monitoring, performance, deployment and subscription foundations.

Do not begin Phase 2 automatically. Review Phase 1 acceptance evidence and limitations first.
