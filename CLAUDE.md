# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Divi child theme (`Template: Divi`) for innotecht.com.au. No test suite, no linter. Work is PHP (shortcodes, Divi modules, ACF field groups), SCSS, and vanilla JS animated with GSAP/Three.js.

A second copy of the theme lives at `/opt/lampp/htdocs/innotechdev/wp-content/themes/innotech-divi-child` (XAMPP dev site, DB `innotechdevlocal`, php at `/opt/lampp/bin/php`). Confirm which copy you're editing before building.

## Commands

```bash
npm install
npm run build        # gulp build: styles + per-file mins + bundle (one-shot)
npm run dev          # gulp default: build, then watch
npx gulp styles      # scss/main.scss -> ctc-style.css (+ .map)
npx gulp scripts     # every js/*.js -> js/min/<name>.min.js
npx gulp bundle      # bundleOrder list -> js/min/theme.bundle.min.js
php -l functions.php # PHP syntax check;  node --check js/<file>.js for JS
```

**Compiled output is committed** (`ctc-style.css`, `js/min/*`). After editing any `scss/` or `js/` source, rebuild and commit the outputs too — the site serves only the compiled files.

## Architecture

### CSS pipeline
`scss/main.scss` is the single entry; it `@import`s every partial (`_variables`, `_base`, then feature partials, `_responsive` last). A new partial does nothing until it is imported there. Output is `ctc-style.css` at the theme root, enqueued by `functions.php` at priority 99999998 with `filemtime` cache-busting. `style.css` is only the theme header — don't put styles there.

### JS pipeline (the non-obvious part)
`functions.php` (`innotech_enqueue_animation_scripts`) enqueues:
- CDN libs: GSAP + ScrollTo + ScrollTrigger (cdnjs), SplitType (unpkg)
- `js/three.min.js` as global `THREE`
- **`js/min/theme.bundle.min.js`** — one concatenated bundle of the theme's classic scripts, depending on jquery/gsap/splittype/three

Which files go into the bundle, and in what order, is the `bundleOrder` array in `gulpfile.js`. Order matters (e.g. `text-heading-effect` before `heading-word-wrap`; `locomotive-scroll-init` before `section4-mobile` before `section4-carousel`). **A new classic script must be added to `bundleOrder`**, otherwise it is only minified standalone and never loaded.

Scripts that must stay out of the bundle:
- `liquid-background.js` — loaded as `<script type="module">` (`script_loader_tag` filter in `functions.php`)
- `product-details-viewer.js` — ESM using `import()`; relies on the Three.js **importmap** emitted in `wp_head` priority 1; also forced to `type="module"`
- `product-showcase-slider.js`, `showcase-blob.js`, `profile-carousel.js`, `google-map.js` — conditional enqueues (shortcode render or `is_singular('showcase')`)

PHP-to-JS data goes through `wp_localize_script` (`innotechBlogSearch`, `innotechTheme`, plus swirl-chart image from ACF `globe_pattern_image`).

Note `js/mask-zoom-effect.min.js` is a hand-placed file in `js/`, so the gulp scripts task also produces `js/min/mask-zoom-effect.min.min.js`; same for `three.min.min.js`. Ignore these double-`.min` artifacts.

### PHP structure
`functions.php` is the hub: enqueues, then `require_once`s one file per feature at the theme root:
- Shortcodes: `latest-posts`, `latest-post-hero`, `blog-posts`, `career-opportunities`, `profile-carousel`, `google-map`, `product-details`, `product-showcase-slider`, plus inline `[share_buttons]`, `[innotech_products]`, `[innotech_lower_footer_menu]`
- ACF field groups registered in code: `acf-post-categories.php`, `acf-product-info.php`, `acf-product-video.php` (ACF plugin required; templates read `get_field`)
- Custom Divi modules: `mouse-function.php` (MouseAnimation), `dot-label-function.php` (DotLabel), `nested-grid-module.php`. Module class files and assets are in `includes/modules/<Name>/`; `MaskZoomEffect` has its own README/USAGE docs.
- Custom post type `showcase` (single pages get the blob + hero slider) and WooCommerce product pages (tabs, gallery lightbox, blueprint, 3D viewer) are driven by ACF fields plus the shortcodes above.
- Legacy `innotech_mobile_menu_output` is deliberately disabled; the live mobile menu is the `.innotech-hamburger` overlay in `js/mobile-menu.js`.

## Gotchas

- `staging.innotecht.com.au/wp-content/themes/innotech-divi-child/` is a committed snapshot of the staging site's theme (~320 files, incl. a stale `ctc-style.css`). It is **not** part of the build — never edit it expecting changes to take effect, and don't mistake its files for the real sources.
- Repo root is cluttered with QA screenshots (`*.png`/`*.jpeg`: `ind-*`, `sw-*`, `qa*`, `footer-*`, etc.). They are not theme assets; real assets are in `_assets/`.
- `ctc-style.css` header ("CTC Separate Stylesheet") comes from the Child Theme Configurator plugin; don't hand-edit the "AUTO GENERATED" enqueue block at the top of `functions.php`.
- Responsive work is split across per-section SCSS partials (`_section4-responsive`, `_section7-responsive`, …) as well as `_responsive.scss`; check all when a breakpoint looks wrong.
