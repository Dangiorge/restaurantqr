# Phase 1 report — 19 October 2026

Development implementation complete. Production rollout is not approved by these checks. Phase 2 has not started.

## Features completed

Registration/sign-in/sign-out, persisted sessions, active-account checks, database-backed auth rate limiting, restaurant onboarding, tenant memberships, seven default restaurant roles, custom roles, granular delegation checks, branch assignments, staff suspension and single-use invitations. Platform administration is a separate privilege; privileged operators can activate/suspend restaurants.

Restaurant profiles and brand settings, ETB currency, tax/service configuration, IANA time zones, branches and weekly opening hours. Shared basic menus, categories, dishes, images by HTTPS URL, decimal base prices, dietary/allergen labels, ordering within categories, active/availability states and price audit records.

Dining areas and named/numbered tables, 256-bit QR tokens, expiry handling, regeneration/revocation, scoped SVG downloads, branded print cards and a public read-only menu. The Romina profile uses the original supplied logo, documented red/grey palette and locally hosted Poppins. Admin screens have a separate design system. No invented restaurant, customer, order or payment records were seeded into the development schema.

## Files created or modified

- Application: `app/page.jsx`, `app/layout.jsx`, `app/globals.css`, `app/workspace/page.jsx`, `app/q/[token]/page.jsx`, `app/print/[id]/page.jsx`.
- Routes: `app/api/auth/[...all]/route.js`, `app/api/restaurants/route.js`, `app/api/workspace/[restaurantId]/[resource]/route.js`, `app/api/invitations/accept/route.js`, `app/api/platform/route.js`, `app/api/qr/[id]/route.js`.
- Components: `components/workspace.jsx`, `components/print-button.jsx`.
- Server/business logic: `lib/auth.mjs`, `lib/db.mjs`, `lib/http.mjs`, `modules/identity/permissions.mjs`, `modules/identity/context.mjs`, `modules/validation.mjs`, `modules/workspace/service.mjs`.
- Database: `prisma.config.mjs`, `prisma/schema.prisma`, `prisma/migrations/migration_lock.toml`, `prisma/migrations/20261019090000_phase_one/migration.sql`.
- Tests: `tests/permissions.test.mjs`, `tests/validation.test.mjs`, `tests/database.test.mjs`, `tests/service-security.test.mjs`.
- Tooling: `scripts/inspect-database.mjs`, `scripts/verify-target.mjs`, `scripts/deploy-migration.mjs`, `scripts/check-client-secrets.mjs`, `scripts/browser-check.mjs`.
- Assets/configuration: `public/brand/romina-logo.png`, `.env.example`, `.gitignore`, `package.json`, `package-lock.json`. `.env` received only missing local auth configuration and stays ignored; no secret values were displayed or committed.
- Documentation: `README.md`, `docs/ARCHITECTURE.md`, `docs/BRAND.md`, `docs/CHECKLIST.md`, `docs/PHASE-1.md`.

Pre-existing favicon changes, `favicon2.ico`, and JS-to-JSX filename changes were preserved. No commit was created.

## Models and migration

21 models: User, Session, Account, Verification, RateLimit, Restaurant, RestaurantSettings, Permission, Role, RolePermission, Membership, MembershipBranch, Branch, Invitation, DiningArea, DiningTable, QrCode, Menu, MenuCategory, MenuItem and AuditLog. Money uses PostgreSQL `decimal(12,2)`; rates use `decimal(5,2)`. Composite tenant foreign keys protect branch, role, table, area, QR and menu parentage.

Migration `20261019090000_phase_one` is additive. The initial unrelated database was never changed. The replacement target is the user-confirmed empty Neon PostgreSQL 18.6 database `neondb`, public schema, on `ep-dark-surf-b5kiefdi-pooler.c-7.us-east-2.aws.neon.tech`. Its verification fingerprint is recorded locally without credentials.

The migration was first applied to disposable test schemas, then deployed to the verified empty public schema. Prisma reported successful deployment and **Database schema is up to date**. No data backup was needed because the target had no application tables or records before migration. The disposable schemas are not an independent physical test database; that remains a production rehearsal requirement.

## Actual verification

| Check | Result |
| --- | --- |
| ESLint | Passed, no errors/warnings |
| Permission, service-boundary and validation unit tests | 10 passed |
| Database-backed suite including unit tests | 22 passed, 0 failed/skipped |
| Prisma schema validation/client generation | Passed |
| Additive migration SQL/test deployment | Passed |
| Migration deployment/status | Applied; up to date |
| Production Next.js build | Passed |
| Client artifact scan for actual configured secrets | Passed |
| Headless Chrome workflow | Passed registration, Romina onboarding, branch, category/item, table, QR menu/download/print/revocation, mobile layout and API access denial |
| Visual inspection | Desktop workspace, mobile workspace, mobile customer menu and print-card screenshots reviewed |
| Production dependency audit | 0 vulnerabilities |
| Full dependency audit | 5 high-severity findings in the existing development ESLint dependency chain |

The initial test/build attempts exposed sandbox worker restrictions, missing font network access, Neon startup-option incompatibility, a transaction timeout and Prisma composite nested-write differences. These were corrected or rerun with required process access; failed attempts were not counted as passing. Fonts are now local. The browser test required a corrected dropdown selector before its successful run.

Security coverage verifies tenant A cannot read/write tenant B, branch restrictions, custom permission enforcement, owner/platform separation, rejection of browser privilege fields, inactive account/membership/restaurant denial, invitation email/expiry/replay checks, cross-tenant database FK denial, invalid/revoked/expired QR rejection, concurrent QR regeneration, tenant verification before QR table lookup, precise price audit snapshots, hostile URL rejection, input bounds and same-origin mutation protection. Authentication was exercised against a real PostgreSQL schema; browser tests used a separate temporary schema and did not seed the public schema.

## Limitations and deferred work

Email verification and password recovery delivery require a configured email service and verified sending domain. Invitations currently use privately shared links. Initial platform-admin provisioning and ownership transfer are not available to restaurant users. Production origin/HTTPS, trusted proxy/IP headers, independent test database, backup restore drill, managed uploads and licensed Nokia Pure assets remain unconfigured. Authentication falls back to a shared rate-limit bucket if no trusted client IP is available; configure trusted infrastructure before deployment.

Five npm high-severity findings arise from `braces` through `micromatch`/`fast-glob` and the development Next.js ESLint chain. npm suggests downgrading Next's lint configuration to 14.x; this breaking downgrade was not applied. Production dependencies have no reported findings. Review a compatible upstream fix before production CI hardening.

Tax/service percentages are settings only. Currency is ETB for Phase 1. Menus are restaurant-wide; branch overrides and fasting classification belong to Phase 2. Public ordering is not enabled. Telebirr credentials/documentation access, payment verification, refunds, kitchen/waiter realtime, promotions, delivery, feedback, KPIs and subscriptions are intentionally unimplemented. No later-phase security test is reported as passed for an unimplemented feature.

## Next phase

Phase 2 only after reviewing this Phase 1 report: add tenant-aware branch price/availability overrides and explicit staff-configured fasting classifications first, with authoritative price-resolution tests and audit history. Then implement timezone-aware schedules and promotion eligibility/conflict handling. Do not start Phase 3 until Phase 2 acceptance passes.
