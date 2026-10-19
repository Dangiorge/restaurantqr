# Romina website and media uploads — 19 October 2026

This is an authorized extension to Phase 1. Later ordering, payments, promotion and reporting phases remain unstarted. Work uses the Sites skill's local-only workflow in the existing Next.js repository; nothing was published to an external hosting service.

## What changed

- `/` is now a Romina Restaurants website with the original logo, documented `#D42028` red, Poppins, a brand-book place-setting hero, food photography, menu links, and branch/contact/hours information loaded from the existing restaurant. No addresses, reviews, years of operation or dish prices were invented.
- `/menu` is Romina's guest menu. `ROMINA_RESTAURANT_SLUG` selects the existing restaurant without renaming it or changing its records. It is currently configured to the existing slug `lowecase`.
- `/r/[slug]/menu` provides a public guest menu for each active tenant. `/q/[token]` uses the same branded menu design while preserving branch/table context and revocation/expiry checks.
- Guest menus support dish search, category filters, real item photos, availability, allergen information, decimal prices and uploaded menu links. Inactive restaurants, menus, categories and items remain excluded by server-side queries.
- Staff can upload dish photos, restaurant logos, and PDF/image menu files directly in the corresponding edit forms. Menu files are optional; saving publishes the link. Removing a link from a form does not delete the underlying Cloudinary asset.
- Printable table cards use the restaurant color as their background, the original logo in a white panel, and a black/white QR code with its quiet zone preserved. Print to PDF provides a branded downloadable card; the direct SVG QR download remains a plain scannable code.

## Cloudinary implementation

Only the `CLOUDINARY_URL` environment variable name was inspected; its credentials were never printed, committed or sent to the browser. The server parses it and makes authenticated HTTPS Upload API requests using an Authorization header, following [Cloudinary's documented server upload flow](https://cloudinary.com/documentation/upload_images).

The upload endpoint checks sign-in, current account status, tenant membership, permissions and restaurant-wide scope before accepting bytes or calling Cloudinary. Logo uploads require `restaurant.manage`; menu/dish uploads require `menu.edit`. Browser-selected tenant IDs and file destinations never determine storage authorization. The server assigns tenant-specific, random, non-overwriting asset IDs and writes upload audit records. Upload rate limiting currently caps successful uploads at 60 per actor/tenant/hour; concurrent requests may briefly exceed that quota, so production infrastructure rate limiting remains recommended.

Requests have a bounded streaming body limit. Individual files are limited to 12 MB. JPG, PNG and WebP are decoded, constrained to 40 megapixels and re-encoded as WebP with EXIF removed. SVG and HTML are rejected. PDF magic bytes/MIME are required and PDFs are accepted only as menu documents. PDFs are stored as raw assets, not claimed to be malware-sanitized. Use only trusted restaurant documents. Managed asset deletion and malware scanning remain production follow-ups.

### PDF delivery setting

Real PDF upload succeeded, but the tested public Cloudinary URL returned **401**. Cloudinary documents that PDF/archive delivery is blocked by default for free accounts. Enable **Allow delivery of PDF and ZIP files** in the product environment's **Settings → Security** and retest. See [Cloudinary PDF delivery documentation](https://cloudinary.com/documentation/pdf_optimization). Image menu files work without this PDF setting. The upload form now displays a warning when PDF delivery is blocked or cannot be verified; it does not silently claim successful guest delivery.

## Database safety

Migration `20261019110000_menu_document` adds only `Menu.documentUrl TEXT NOT NULL DEFAULT ''`. Existing menu structures, users, roles, permissions, branches and superadmin access are preserved.

Before applying it, the configured database fingerprint and existing migration history were checked. An ignored local JSON backup was captured in a consistent read-only transaction. All 21 application tables were restored into an isolated schema and compared exactly; the additive migration was then applied to that restored schema and rolled back. PostgreSQL timestamp text was preserved to avoid workstation timezone conversion. The verified backup path and checksum are in ignored `.local/menu-migration-verification.json`; backup contents are sensitive and must not be committed or exposed.

Only after successful restore/migration checks was the additive SQL deployed to the verified Neon database. Prisma reported that both migrations were applied and the schema was up to date. No reset/drop/truncate was run against application data. The preparation and deployment scripts are `scripts/prepare-menu-migration.mjs` and `scripts/deploy-menu-migration.mjs`; the preparation script intentionally expects the pre-upgrade baseline and will refuse an already upgraded database.

## Validation

- 25 automated database/security/media/validation tests passed; 13 focused unit tests passed.
- Prisma validation and client generation passed.
- Production build and lint passed.
- The client artifact scan passed for the configured database URL, auth secret, Cloudinary URL and decoded Cloudinary secret.
- Real browser testing passed registration, onboarding, branch/category/item/table creation, real Cloudinary image/PDF upload, saved guest-menu links, visible image delivery, dish search, mobile overflow checks, QR SVG download, branded printing, QR revocation, and access-denial checks. Public PDF delivery is the explicit account-setting exception above; upload success is not described as guest delivery success.
- Desktop/mobile homepage, guest menu, workspace and QR-card screenshots were reviewed. Temporary database schemas and Cloudinary test assets are cleaned up by the test runner.

Run `npm run test:browser` after changing the Cloudinary PDF setting to retest public PDF access. This test requires system Chrome and valid storage credentials and creates then deletes temporary assets. Screenshots live in ignored `.local/previews/`.

## Main files

`app/page.jsx`, `app/romina.css`, `app/layout.jsx`, `app/menu/page.jsx`, `app/r/[slug]/menu/page.jsx`, `app/q/[token]/page.jsx`, `app/print/[id]/page.jsx`, `components/guest-menu.jsx`, `components/upload-field.jsx`, `components/workspace.jsx`, `modules/menus/public.mjs`, `modules/media/cloudinary.mjs`, `app/api/workspace/[restaurantId]/uploads/route.js`, `modules/validation.mjs`, `modules/workspace/service.mjs`, `prisma/schema.prisma`, the additive migration, `tests/media.test.mjs`, updated browser/database tests, migration safety scripts, secret-scan script, and the two photo assets extracted from the supplied PDF.
