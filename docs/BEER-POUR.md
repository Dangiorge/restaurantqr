The public homepage includes “Perfectly poured” between the coffee and catering sections. It uses the opening 2.5 seconds of `public/video/ROMINA beer showing v3.mp4`; the source is preserved. This section has no audio or autoplay video.

Scroll down to advance the pour, or up to reverse it. The scene stays pinned for the duration of the scroll section and then releases into the next section. The pairing links to an actual available public menu dish, preferring a grill/fillet dish with a photo. It does not create a beer menu item or invent prices.

The revised design uses only the primary Romina interface colours: red #D42028, black, and white. An arched white backdrop frames the transparent glass. The real menu pairing uses text and a cutlery icon to avoid repeating a dish photograph. The mobile composition stacks the heading, menu action, glass, and pairing. The transparent animation assets and all motion/data-saving fallbacks are retained.

The 61 transparent WebP frames and poster in `public/animations/beer-pour` are approximately 1.5 MB total. Frame requests begin near the section. Only a small neighbourhood is prefetched, with at most four requests in flight and twelve decoded frames retained (roughly 13 MB of pixels). A poster stays underneath the canvas until a frame is ready.

Reduced motion, Save-Data, and reported 2G connections use the still poster without downloading the sequence. No-JavaScript visitors also see the poster and all links. The website’s Pause motion control freezes the pour. A failed frame request returns to the poster rather than leaving an empty scene.

This source has a moving camera, a detailed bar, reflections, hands, and embedded text. The cutout uses interpolated hand-traced glass/hand silhouettes and a softer matte in the clear glass. Original reflections and any lettering that overlaps the foreground remain; this is not studio-quality transparent-glass reconstruction. A clean-background source would allow a cleaner result. The original logo assets are unchanged.

To regenerate, install the optional local processing tools and run the script from the project root:

```powershell
python -m pip install --target .local/video-tools imageio-ffmpeg pillow numpy
python scripts/prepare-beer-pour.py
```

The script writes a light/dark matte review under `.local/previews`. These tools are not production dependencies. The application uses only the generated WebP assets and manifest.

After a production build, verify in Chrome with:

```powershell
node --env-file=.env scripts/check-beer-pour.mjs
```

This read-only check starts and closes its own preview server on port 3112. It checks real alpha pixels, scroll reversal, pinning, memory-friendly loading, pause, responsive widths, menu links, and still-image fallbacks. Set `CHROME_PATH` if Chrome is installed elsewhere.
