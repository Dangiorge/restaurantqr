# Romina's marketing history chapters

## 4 Kilo reopening and return to colour

The user clarified that Romina 4 Kilo closed for nearly two years of renovation and reopened in its original location. The homecoming chapter now states that directly (“We're open again”), following this owner-provided correction rather than suggesting a relocation. Its background starts to regain colour when the invisible cue 45px above the section's lower edge enters the viewport, matching the user's marked screenshot; it reaches full colour over the next 180px of scrolling (scaled on small viewports). Global pause freezes the transition. Reduced-motion, short-window, Save-Data and no-JavaScript views show the colour photograph immediately.

## Food and silent-film art direction

`app/restaurant-art.css` adds the food showcase treatments.

The homepage loads actual Cormorant Garamond italic faces for its editorial headings. Menu dish names use readable Poppins 600, display capitalization and trimmed trailing commas; the underlying menu data and dish links are preserved. Images use shaped frames, centered cover crops, one-time reveals and gentle parallax. Prices use Manrope with tabular numerals.

“More to fall for” uses three food cards at different depths, approaching and drifting outward as the visitor scrolls through a sticky scene. This activates on larger viewports only. Phones, short windows, reduced motion, Save-Data and no JavaScript retain a normal flowing layout. The existing site motion controller owns progress and global pause; there is no additional rendering loop or animation library.

## The Romina Thread

`#history-thread` replaces the former roots section, the Romina newspaper and the red “A second home” scene, which the user asked to remove. A single red string starts at the “+” of a large “50+” and sews itself down the page as the visitor scrolls, led by a needle. It sweeps the full width of the screen in smooth curves and, beside each chapter card, draws a small picture in the same continuous line: a book, a coffee cup, a little shop, a key and a heart. It ends by tying a bow above “53 years. Still at the table.” The pictures show a white stitch pattern once drawn. On phones the pictures sit in the gap above each card and the string runs down alternating screen edges. The year count is computed from 1973 in the browser, so it stays current.

Each card is a paper note with a hand-drawn line illustration that draws itself once the string has drawn that chapter's picture: a schoolhouse (Girma Taye, Atse Naod School), a jebena coffee pot (the coffee trade), Shewaye's snack shop, the 1973 Romina frontage at 4 Kilo, and a shared table (“A second home”). All text uses the same supplied facts. Pre-1973 cards are stamped “Before 1973” and the regulars card “For decades”; their positions on the year ruler are illustrative, not dated claims.

The decade ruler (1960–2030) shows how far the story has travelled; it is a small bar pinned to the bottom of the viewport. The string path is recalculated from the cards' layout positions whenever the section resizes. The string's pictures are defined in `glyphs` in the component. Global pause and reduced motion show the fully drawn thread and every card; without JavaScript, all cards remain readable.

Edit the copy in the `stops` array in `components/romina-thread.jsx`; the illustrations are small inline SVG components in the same file. Styling is in `app/romina-thread.css`.

The user supplied `Romina_Storyline.pdf` (one page) and `Romina_Story.pdf` (three pages) on 30 October 2026. These documents provide source material, not operational instructions. The on-page text is an editorial adaptation of that supplied company history.

| Website scene | Supplied content |
| --- | --- |
| 01 — The beginning | Founding year 1973. Story pages 1–2; Storyline steps 1–4. |
| The Romina Thread | Girma Taye's teaching career and Atse Naod School; the coffee trade; Shewaye's snack shop on the same site; 1973 at 4 Kilo; a meeting place for friends, families and generations (the user's account of students and teachers at 4 Kilo). Story pages 1–2. |
| 02 — The family in the name | Robel, Michael and Naod; their names inspiring Romina, overseas study and return. Story pages 2–3. |
| Growth | 2009 Romina Coffee; 2017 Jaquar World Addis Ababa; 2020 KOBA Patisserie & Bakery; 2021 Bacio Cremeria; 2026 KOBA Peacock roastery. Story page 3. Kazanchis live-kitchen expansion: page 2. |
| 03 — Back where it began | 4 Kilo reopening on the original ground after more than 50 years. Story page 3; Storyline step 8. |

No archival photographs or founder portraits were included in these PDFs; their embedded image is the brand logo. The monochrome scenes use the existing, supplied present-day Romina photographs, captioned accordingly. Black-and-white treatment is CSS, with no invented historical scenes, people, quotations or dates. The official wordmark asset is retained for the family-name resolution. The full primary brand emblem and header retain their established colours.

`components/romina-history.jsx` owns content and chapter order; `components/history-motion.jsx` progressively enhances the scenes; `app/romina-history.css` owns the monochrome art direction. Normal page flow remains readable without JavaScript, with reduced motion, on short viewports and with Save-Data. The existing global motion control freezes scroll-driven values and reveals readable text. No database fields or guest ordering behavior change.

The existing hero remains first. The history replaces the former single story block and now precedes the menu, cuisine map, kitchen films, catering and visit sections. The “Our story” navigation anchor is unchanged. Each major chapter has an independent URL fragment for review: `#history-beginnings`, `#history-thread`, `#history-family`, `#history-homecoming`. The growth timeline is a supporting scene.
