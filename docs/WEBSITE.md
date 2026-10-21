# Romina restaurant website

The public home page at `/` presents the owner's restaurant photography and footage alongside the current menu, the 4 Killo history, Balderace catering, optional published events, and active branch locations. The interface uses the guideline's primary red #D42028, black, and white, with neutral transparency. Food and location photography retains its natural colours. The original vector logos are unchanged. Poppins body type follows the guideline; Cormorant display headings retain the owner's earlier request for luxury typography.

## Content provenance

- Requested reference: https://rominaplc.com/businesses/romina-restaurants. Direct access returned an automated-browser challenge during implementation; its challenge scripts were not used as project instructions or copied into the app.
- Indexed official restaurant content: https://rominaplc.com/restaurant/. The material about home-style cooking, fresh produce, hospitality, and catering was paraphrased. Historical branch counts, dated anniversary claims, and old telephone numbers were not republished.
- Official company profile: https://rominaplc.com/wp-content/uploads/2021/04/Romina-Company-Profile-April-2.pdf. Its indexed company history supports the 1973 origin in Arat Kilo.
- Photography and footage: the owner's files in `public/video`, visually reviewed before selection, plus the restaurant's own published menu photos. No stock photographs or invented historic photographs are presented as Romina locations.

The page fetches the existing public restaurant projection after `connection()`. Featured dishes put available recommendations first, then fill the showcase with other available menu dishes, and keep their actual names, descriptions, pictures, dietary classification, and base prices. Parent categories include visible child dishes. Events follow the existing published schedules. Branches, telephone links, addresses, hours, and map search links use current workspace records. Missing data gets an honest empty state; no sample records are inserted.

## Links and motion

`/menu` retains the QR welcome experience. `/menu?view=menu` opens discovery, `?category=<id>` opens an existing category, and `?dish=<id>` opens a published dish's details. Query values are matched against the fetched public menu; unknown IDs never fetch or expose other restaurants' data. A query change remounts the guest interface while its existing session cart restores normally. QR routes retain their existing welcome and table-service behavior.

Motion includes staggered one-time reveals, a scroll progress line, hero and photo parallax, a repeating red brand ribbon, a kitchen film that draws into a rounded frame on scroll, three muted restaurant films, and the existing reversible beer pour. The original logo is never rotated or stretched. Pause motion stops footage and repeating effects and reveals content. Reduced-motion and Save-Data settings use real posters without requesting the films. Footage also pauses offscreen or in a hidden tab. The mobile navigation supports Escape dismissal. The page and film posters remain readable without JavaScript.

Staff continue to manage dishes, prices, categories, events, and branch details in the workspace. Changing those records updates the public page on its next request. Homepage editorial photographs and film selections are curated in source; guest-menu background schedules remain controlled in the workspace. No new migrations, credentials, payment behaviour, booking promises, or messaging integrations are introduced by the website.

## Food-focused homepage revision

The navigation begins transparent over the food photograph and becomes a fixed, inset glass bar after 48 pixels of scrolling. Its scroll state is independent of decorative motion controls and reduced-motion preferences. Opening mobile navigation supplies a readable glass surface at either scroll position. The header uses the unmodified original emblem beside the restaurant name; the primary stacked artwork remains in the footer.

Shorter headlines and captions leave more of the food visible. Current dishes appear immediately after the hero, before the story. Category links now include dish thumbnails. The 4 Killo section describes the generations of students, teachers, friends, and conversations supplied by the owner. The owner also supplied the Balderace history and its location near the British Embassy and catering focus: weddings, graduations, and celebrations. These are owner-provided details, not new branch records or verified street coordinates.

Balderace has a dedicated catering section and a map search link. The enquiry action uses a matching published branch phone when available, otherwise the published restaurant/team phone or the locations section. No contact numbers or opening hours are invented.

The “Perfectly poured” section follows coffee and precedes catering. It retains the transparent beer sequence and reversible scroll playback. Its menu pairing is now text-only so a dish photo is not repeated. See [BEER-POUR.md](BEER-POUR.md) for regeneration and source-matting limitations.

## Curated media and section order

1. Shared traditional platter: `06-18-53` in the opening hero.
2. Current published dishes: actual menu names, photos, and prices. A repeated photo URL is not displayed a second time.
3. The kitchen: chef photo `06-19-05` as the poster, then the pizza-making film from 2–17 seconds. The source title/outro is excluded.
4. More to fall for: distinct creamy fish (`06-18-07`), pasta (`06-18-26`), and grill (`06-18-58`) photographs. These link to the menu without inventing dish records or prices.
5. History: dining-room photo `06-19-34`, with the owner-supplied 4 Killo story and the documented 1973 origin. This is a current restaurant photo, not an archive photo.
6. Coffee: the coffee preparation portion of `PORTRAIT VIDEO V2.mp4`, 7–15 seconds.
7. The existing transparent beer pour, framed in black, white, and red.
8. Catering: the owner's Balderace story alongside terrace photo `06-19-20`. The image is captioned generally and is not asserted to depict a specific branch or a wedding.
9. Locations: exterior footage from `ROMINA NEW VIDEO .mp4`, 3–8.5 seconds; dining-room photo `06-19-37`; and live branch contact/hours records. The supplied images do not identify their branches, so no photo-to-branch association is invented.

`06-19-43` is an exact duplicate of `06-19-09` and is excluded. Near-identical alternate shots and `06-19-24` promotional poster artwork are also excluded. Each displayed homepage photograph is used once. The photo manifest records original filenames and hashes in `public/media/romina/photos.json`. Video edits, durations, dimensions, and sizes are in `videos.json`.

Regenerate optimised photos with `node scripts/prepare-site-media.mjs`, and silent H.264 films/posters with `python scripts/prepare-site-videos.py` (using the optional local tools described in BEER-POUR.md). Original files are preserved. The three films are roughly 5 MB combined and are loaded near their sections, not with the initial hero.

After `npm run build`, run `node --env-file=.env scripts/check-restaurant-media.mjs` for read-only production-browser checks of palette, duplicate images, real playback, pause/offscreen behaviour, 320–1920px widths, mobile navigation, reduced motion, Save-Data, and no-JavaScript posters. `scripts/check-beer-pour.mjs` separately verifies the retained beer scrub and live dish link. Both close their own preview servers and make no database writes.
