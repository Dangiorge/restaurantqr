# Tableline · QR restaurant SaaS

Phase 1 development foundation for a multi-tenant restaurant platform for Ethiopia, with the Romina restaurant website and Cloudinary upload extension. JavaScript, Next.js App Router, Tailwind CSS, PostgreSQL, Prisma and Better Auth.

## Run locally

Use Node.js 24. Install with `npm ci`, configure `.env` using `.env.example`, and run:

```sh
npm run db:generate
npm run dev
```

Open [the workspace](http://localhost:3000/workspace), create an account, then create a restaurant. Select the Romina Restaurants brand profile to use the supplied logo and documented palette. Add a branch, category, dish and table, then generate its QR code. Nothing is seeded into the development database automatically. The local authentication secret has already been generated for this workspace without displaying it.

`BETTER_AUTH_URL` must match the browser origin, including port. The current local default is `http://localhost:3000`. Set a publicly reachable HTTPS origin before printing operational QR codes; a guest's phone cannot reach your computer through its own localhost. Generate a new high-entropy `BETTER_AUTH_SECRET` for each deployment and keep all credentials server-side.

## Implemented

- Email/password registration, sign-in/out and persisted sessions with account-status checks and database-backed authentication rate limiting.
- Restaurant onboarding, memberships, settings, configurable branding, branches, time zones and weekly hours.
- Restaurant-wide and branch-scoped roles; seven default restaurant roles plus custom permissions. Separate platform administration can activate/suspend restaurants.
- Privately shared, email-matched staff invitations with expiry, revocation, branch assignment and replay protection. Staff membership roles/status/scopes can be changed by authorized delegators.
- Basic menus, categories, items, decimal ETB base prices, dietary/allergen labels and visibility/availability.
- Dining areas, tables, secure QR generation/regeneration/revocation, SVG downloads, branded print cards and public menu resolution.
- Transactional audit writes and tenant-aware foreign keys.

Platform-admin access is intentionally not self-service. A trusted operator must provision an initial platform administrator outside the restaurant application. Restaurant owners cannot grant platform access. Ownership-transfer workflows are deferred.

## Validate

```sh
npm run lint
npm test
npm run test:db
npm run db:validate
npm run build
npm run check:secrets
npm run db:status
npm run test:browser
```

The database tests require the ignored `.local/database-verification.json` target manifest. They create a randomly named disposable schema in the verified development database and remove only that schema in cleanup. They never reset or erase the public schema. Browser tests use a separate disposable schema, headless system Chrome, and a temporary server on port 3107. Set `CHROME_PATH` if Chrome is elsewhere. Screenshots are written to ignored `.local/previews/`. These tests are for a dedicated development database; an independent physical test database is still needed for production rehearsal.

## Database safety

The initial supplied connection contained another application's data and migrations. It was inspected read-only and left unchanged. The replacement connection was verified empty before applying `20261019090000_phase_one`. See [architecture and migration controls](docs/ARCHITECTURE.md).

For a new empty development target only:

```sh
node --env-file=.env scripts/verify-target.mjs
npm run test:db
node --env-file=.env scripts/deploy-migration.mjs
npm run db:status
```

The initial deployment guard checks the target fingerprint, tested SQL checksum and empty public schema. It intentionally refuses an already populated database. Do not reuse it for future upgrades. Inspect schema/migration history, prepare additive SQL, obtain and verify a usable backup when data exists, test on an isolated database, review destructive statements, and check results. Never use `prisma migrate reset` or force-push to resolve conflicts.

## Project guide

| Location | Purpose |
| --- | --- |
| `app/api/` | Auth, tenant operations, invitations, QR downloads and platform endpoints |
| `app/workspace/`, `components/workspace.jsx` | Responsive management screens |
| `app/q/[token]/`, `app/print/[id]/` | Public QR menu and authorized printable card |
| `lib/` | Server authentication, database lifecycle and safe HTTP handling |
| `modules/identity/` | Permission registry, grant restrictions and verified tenant context |
| `modules/workspace/` | Phase 1 transactional business operations |
| `modules/validation.mjs` | Strict server input validation |
| `prisma/` | Schema and additive migration |
| `tests/`, `scripts/` | Automated verification and guarded database tooling |

Read the [phase checklist](docs/CHECKLIST.md), [Phase 1 report](docs/PHASE-1.md), [architecture](docs/ARCHITECTURE.md), and [Romina brand reference](docs/BRAND.md).

## Current limits

This is a development foundation. Email verification/reset delivery, public HTTPS hosting, production proxy/IP trust configuration, backup/restore rehearsal, Nokia Pure font assets/licensing are not configured. Invitations are shared privately through generated links. Currency is restricted to ETB in this phase. Tax and service settings are recorded but no checkout calculation is implemented yet. Staff can upload dish/logo images and PDF/image menu files through Cloudinary. Public PDF delivery requires enabling Cloudinary's PDF/ZIP delivery setting; the tested account currently returns 401 for PDFs. See [website and upload setup](docs/ROMINA-WEBSITE-UPLOADS.md).

The table-QR menu now supports dine-in orders, private order tracking, and waiter/bill/water/cutlery/help requests. Branch price overrides, fasting classification, promotions, takeaway/delivery, advanced realtime operations, Telebirr, feedback, reporting, subscriptions and production hardening remain deferred. No successful payments or revenue are simulated. Review the phase report before proceeding.

## Romina website and uploads

The restaurant website is at `/`, the Romina guest menu at `/menu`, and each tenant's public menu at `/r/[slug]/menu`. Configure `CLOUDINARY_URL` server-side and `ROMINA_RESTAURANT_SLUG` for the homepage restaurant. In the workspace, edit a dish to upload its photo, edit a menu to upload a PDF/image menu, or edit settings to upload a logo. Save changes to publish the result. The original QR token routes remain supported.

Read the [website/upload report](docs/ROMINA-WEBSITE-UPLOADS.md) for the additive migration, verified backup, Cloudinary PDF setting and security checks.

## Dine-in orders and table service

Scan a valid table QR to add dishes, review server-calculated totals and place an order. Guests can call a waiter, request the bill, water, cutlery or assistance. Open **Workspace ? Live service** to process orders and requests with tenant/branch permissions. Queues and guest status refresh every 10 seconds. Online payment and automatic consolidated billing are not enabled. See [menu and ordering details](docs/GUEST-ORDERING.md) for the migration, security tests and current limits.
