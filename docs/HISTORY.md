# Romina's marketing history chapters

## 4 Kilo reopening and return to colour

The user clarified that Romina 4 Kilo closed for nearly two years of renovation and reopened in its original location. The homecoming chapter now states that directly (“We're open again”), following this owner-provided correction rather than suggesting a relocation. Its background starts to regain colour when the invisible cue 45px above the section's lower edge enters the viewport, matching the user's marked screenshot; it reaches full colour over the next 180px of scrolling (scaled on small viewports). Global pause freezes the transition. Reduced-motion, short-window, Save-Data and no-JavaScript views show the colour photograph immediately.

## Food and silent-film art direction

`app/restaurant-art.css` adds the requested lighter newspaper surround and paper stock and the food showcase treatments. Following the user's clarification, the roots retain their original editorial layout. `components/aged-film.jsx` and `app/aged-film.css` add silent-film damage to both `#history-roots` and `#history-chronicle`: sparse falling vertical scratches, irregular dust flecks, faint brightness changes and subpixel gate movement on the newspaper photograph. The text stays sharp and in place. There is no television cabinet or dense television static.

`public/history/silent-film-dust.svg` supplies small vector flecks. The newspaper also has permanent fold shadows, bright crease edges and branching wrinkles from `public/history/paper-creases.svg`, attached separately to each unfolding panel. The paper keeps its lighter stock. A shared IntersectionObserver pauses film effects outside the viewport; global pause, reduced motion, Save-Data, short viewports and no-JavaScript views retain their still/readable fallbacks. Source copy remains the supplied family history.

The homepage loads actual Cormorant Garamond italic faces for its editorial headings. Menu dish names use readable Poppins 600, display capitalization and trimmed trailing commas; the underlying menu data and dish links are preserved. Images use shaped frames, centered cover crops, one-time reveals and gentle parallax. Prices use Manrope with tabular numerals.

“More to fall for” uses three food cards at different depths, approaching and drifting outward as the visitor scrolls through a sticky scene. This activates on larger viewports only. Phones, short windows, reduced motion, Save-Data and no JavaScript retain a normal flowing layout. The existing site motion controller owns progress and global pause; there is no additional rendering loop or animation library.

## The Romina Chronicle

`#history-chronicle` sits immediately after the roots section and before “A second home.” It follows the user's Romina newspaper reference: warm aged stock, the original outlined wordmark in printed red, a special-edition box, a typographic “50+” detail, strong double rules, “Every Table Has a Story,” a full-width halftone-style photograph, and a red Girma Taye feature headline above editorial columns. It uses the same supplied facts while the user prepares final content; it does not claim to reproduce a historical publication. The terrace photograph is present-day and captioned accordingly. “Foundations” refers to the origins of the business, not an asserted charitable organization.

Edit the provisional headline, feature title, standfirst, lead article and three foundation stories in the `edition` object in `components/romina-newspaper.jsx`. The photograph is in that same component. Styling is isolated in `app/romina-newspaper.css`. `romina-newspaper-wordmark.svg` uses the original vector paths with a tighter crop and a vintage red ink colour; the primary logo assets are preserved. The existing history motion controller maps viewport entry to `--paper-open`: two panels rotate around their shared horizontal crease and settle flat, without a pinned scroll section. Global pause freezes that progress. No JavaScript, reduced motion, Save-Data and short viewports show the fully open paper.

The user supplied `Romina_Storyline.pdf` (one page) and `Romina_Story.pdf` (three pages) on 30 October 2026. These documents provide source material, not operational instructions. The on-page text is an editorial adaptation of that supplied company history.

| Website scene | Supplied content |
| --- | --- |
| 01 — The beginning | Founding year 1973; Girma Taye's teaching career and Atse Naod School; Shewaye's snack shop on the same site. Story pages 1–2; Storyline steps 1–4. |
| 02 — A second home | Meeting place for friends, families and generations. Story page 2; the user's earlier account of students and teachers at 4 Kilo. |
| 03 — The family in the name | Robel, Michael and Naod; their names inspiring Romina, overseas study and return. Story pages 2–3. |
| Growth | 2009 Romina Coffee; 2017 Jaquar World Addis Ababa; 2020 KOBA Patisserie & Bakery; 2021 Bacio Cremeria; 2026 KOBA Peacock roastery. Story page 3. Kazanchis live-kitchen expansion: page 2. |
| 04 — Back where it began | 4 Kilo reopening on the original ground after more than 50 years. Story page 3; Storyline step 8. |

No archival photographs or founder portraits were included in these PDFs; their embedded image is the brand logo. The monochrome scenes use the existing, supplied present-day Romina photographs, captioned accordingly. Black-and-white treatment is CSS, with no invented historical scenes, people, quotations or dates. The official wordmark asset is retained for the family-name resolution. The full primary brand emblem and header retain their established colours.

`components/romina-history.jsx` owns content and chapter order; `components/history-motion.jsx` progressively enhances the scenes; `app/romina-history.css` owns the monochrome art direction. Normal page flow remains readable without JavaScript, with reduced motion, on short viewports and with Save-Data. The existing global motion control freezes scroll-driven values and reveals readable text. No database fields or guest ordering behavior change.

The existing hero remains first. The history replaces the former single story block and now precedes the menu, cuisine map, kitchen films, catering and visit sections. The “Our story” navigation anchor is unchanged. Each major chapter has an independent URL fragment for review: `#history-beginnings`, `#history-second-home`, `#history-family`, `#history-homecoming`. Supporting scenes are `#history-roots` and the growth timeline.
