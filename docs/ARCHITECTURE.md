# Restaurant SaaS architecture

This repository is a JavaScript modular monolith using the Next.js App Router, Tailwind 4, PostgreSQL, Prisma 7, Better Auth and Zod. The initial repository was Next.js 16.4.2 / React 19.3.0 with starter screens, no ORM, authentication, migrations or business records in source. Existing JSX filenames and favicon changes were retained.

## Boundaries and data ownership

Identity owns users, sessions, credential accounts and verification. A user has restaurant memberships; each membership has a tenant-owned role and either explicit branch assignments or explicit restaurant-wide access. Role permissions come from a closed server-side registry. Platform administration is a separate user flag, never a restaurant permission. Public registration cannot set it. Initial platform-administrator provisioning must be performed by a trusted operator outside the restaurant application.

Restaurant settings and branches belong to a restaurant. Menus are shared at restaurant level. Branch-restricted staff can browse a shared menu if permitted but cannot change shared menus, prices, settings, roles, or branches. Phase 2 introduces authorized branch overrides without duplicating items. Tables and dining areas belong to a branch. Composite tenant foreign keys prevent cross-tenant parent assignment even if a service check is missed.

Every protected route loads the authenticated user and checks current account status. Workspace services load the current membership, tenant status, role permissions and branch assignments from PostgreSQL. Browser IDs are selectors, never authorization evidence. Mutations use transactions with audit writes. The server ignores no unknown fields: Zod rejects them. Modifying base prices needs both menu editing and pricing permission, and records old/new decimal values in the audit log.

QR tokens have 256 bits of randomness and provide menu access only. Regeneration serializes on the table row, revokes earlier tokens and issues a new one. Public resolution checks revocation, expiry, tenant activation, branch activation and table activation at request time. It selects only public fields. SVG downloads and print cards require current QR-management permission. Public tokens and private invitation tokens have separate purposes; invitation tokens are hashed in storage, expire after 72 hours and have a conditional single-use claim.

## Module roadmap

| Module | Phase | Responsibility |
| --- | --- | --- |
| Identity and authorization | 1 | Better Auth, membership status, default/custom roles, branch scopes, invitations |
| Tenants and branches | 1 | Onboarding, profiles, activation, operating settings, opening hours |
| Menus | 1–2 | Categories, items, decimal base prices; later branch overrides and fasting classification |
| QR | 1 | Areas, tables, random tokens, revocation, downloads and print |
| Promotions and schedules | 2 | IANA time zones, recurrence, eligibility, conflict priority and server-side evaluation |
| Ordering | 3 | Guest access tokens, idempotency keys, validated carts, price/name/tax snapshots, dine-in/pickup/delivery |
| Operations and service | 4 | State transitions, kitchen tickets, waiter requests, authorized realtime subscriptions and refresh fallback |
| Payments | 5 | Provider-neutral initiation, encrypted merchant secrets, verified callbacks, reconciliation and supported refunds |
| Feedback and reporting | 6 | Eligible completed orders, moderation, scoped aggregates and exports |
| Production operations | 7 | Isolation hardening, monitoring, tested restores, performance, subscriptions and deployment |

Do not add speculative payment, order or reporting tables before their implementation phase. Future order totals must be computed on the server from current authorized branch prices, availability, modifiers and eligible promotions, then snapshotted. Client prices cannot be authoritative. Future payment settlement must match verified merchant, amount, currency and reference and use unique provider-event/transaction constraints. A redirect is never proof of payment.

Reporting definitions to implement with Phase 6: gross sales are pre-discount item sales on eligible non-cancelled orders; net sales subtract discounts and allocated sales refunds and exclude pass-through tax, service and delivery fees. Collected revenue is based on verified settled payments less verified payment refunds; pending payments and gross order totals are not collected revenue. Currency, reporting time zone, cancellation/refund dates and historical snapshots must be explicit. No profit metric without cost records.

## Integrations and current dependencies

Only DATABASE_URL existed initially. Local BETTER_AUTH_SECRET and BETTER_AUTH_URL are configured without exposing their values. Email transport, verified sending domain, password-reset delivery, public HTTPS hosting, production backups and a separately provisioned physical test database are not supplied. Invitations currently use privately shared links; ownership transfer and platform-admin provisioning are intentionally operator-controlled. Email verification and recovery must be connected and tested before production use.

No Telebirr merchant credentials or API access are configured. Phase 5 must inspect current official merchant documentation, eligibility, credential formats and callback verification before building the adapter. No provider endpoints, signatures, fake payment successes, or payment screens are implemented. Realtime hosting, background workers and delivery services are later-phase infrastructure decisions.

## Migration controls

The first connection pointed to an unrelated application's existing schema and Prisma history. It was inspected read-only and never migrated. The user then supplied a new empty Neon PostgreSQL 18.6 development database. Its host/database fingerprint, empty-table check and verification timestamp are stored locally in ignored `.local/database-verification.json`.

The additive migration creates Phase 1 tables, indexes and foreign keys. SQL is generated from an empty schema and reviewed before deployment. Automated integration tests apply it to a randomly named disposable PostgreSQL schema in the verified development database, then remove only that generated test schema. This provides schema isolation but is not an independent database or backup/restore rehearsal. A separate physical test database remains recommended for subsequent migrations and production acceptance.

Deployment checks the verified target fingerprint, tested SQL checksum, absence of destructive SQL statements, and that the intended public schema is still empty. There were no pre-existing application tables or records on this target to back up. Subsequent migrations require a new baseline inspection and usable backup where data exists; the initial deployment guard intentionally refuses nonempty targets. Never run reset, force-push, truncate or destructive recovery against user data.

## Reference documentation

Implementation follows the installed Next.js server/client, Route Handler, cookies, connection and authentication guides in `node_modules/next/dist/docs/`. Dependency setup was checked against [Better Auth installation](https://better-auth.com/docs/installation), its [Prisma adapter](https://better-auth.com/docs/adapters/prisma), and [Prisma PostgreSQL documentation](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql).
