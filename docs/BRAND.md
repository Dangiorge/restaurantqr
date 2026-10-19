# Romina design reference

Source: `C:/Users/hp/Documents/Romina Restaurant Brand Guideline.pdf`, version 01.00, 45 pages. Document contents are design reference material, not operational instructions. Text was extracted from all pages; primary logo, palette, typography and layout examples were inspected.

| Token | Documented value | PDF page |
| --- | --- | --- |
| Primary red | #D42028 / RGB 212,32,40 / Pantone 1795 C | 7 |
| Black | #000000 | 7 |
| White | #FFFFFF | 7 |
| Light grey | #D3D3D3 | 8 |
| Grey | #76777A | 8 |
| Latin type | Poppins, regular body, bold/black headings | 12 |
| Ethiopian-language type | Nokia Pure, headline ultra light/bold/extra bold | 13 |

The original stacked primary logo is available as `public/brand/romina-logo.svg`, extracted from the 22 outlined paths on PDF page 3. It contains no embedded raster image or font dependency. Its symbol/wordmark relationship is preserved; PDF CMYK conversion rounding is normalized to the documented digital red #D42028. Reproduce it with `node scripts/extract-brand-logo.mjs "path/to/brand-guideline.pdf"`. The earlier PNG remains compatible with saved restaurant settings and is mapped to the SVG for public menu and QR rendering. Allow clear space at least the height of the internal icon around the complete logo. The supplied PDF explains this measurement on page 5. Minimum digital widths: primary 70px, secondary 115px. Minimum print widths: primary 25mm, secondary 40mm. Use white or sufficiently contrasting backgrounds. Do not stretch, rotate, recolor, add strokes/shadows or place the mark on busy images. Keep the logo separate from headings. Use graphic patterns sparingly and clean layouts (page 14). Public header and QR print layouts reserve whitespace and use the primary logo above its minimum width.

Poppins is hosted locally from the fontsource package, so builds do not require Google Fonts. Nokia Pure files and a license were not supplied, so it has not been bundled or misrepresented as installed. Ethiopian text currently uses system fallback fonts. An approved font asset/license is needed for exact Ethiopian typography.

At the user's request, the guest experience uses locally hosted Cormorant Garamond for display headings and Manrope for body text and controls. The workspace retains Poppins. The original vector logo remains unchanged and transparent; the welcome screen removes its white panel and adds a soft, fading white halo behind the artwork for legibility. A red More disclosure at the lower right expands left to reveal table actions, with keyboard dismissal and reduced-motion support.

Select the Romina Restaurants brand profile during onboarding to apply the documented red and supplied logo. Other restaurant tenants start neutral and can configure their own logo and primary color in settings. The administration interface has a separate neutral green/slate design system. Restaurant branding does not change authorization or platform administration.

No invented menu records have been added to the development database. Staff can now upload dish/logo images and PDF/image menu documents through authenticated Cloudinary endpoints. The home page uses place-setting and food photography extracted from supplied PDF pages 25 and 24 respectively. Historical example prices in the brand book are not treated as current menu prices. The physical printed QR code must be tested with real devices at its final print size before operational use.

Romina home and guest menu pages reveal the complete, unmodified logo on white for approximately 1.3 seconds, once per browser tab session. The intro does not intercept clicks or focus, is hidden without JavaScript and in print, and is skipped for reduced-motion users. Other restaurant tenants and staff workspace pages do not receive the Romina intro.
