const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');
const rename = require('gulp-rename');

// Paths
const paths = {
  scss: './scss/**/*.scss',
  js: './js/**/*.js',
  jsOutput: './js/min/',
  output: './'
};

// Ordered list of the theme's own classic scripts that get concatenated into a
// single bundle. ORDER MATTERS — dependants come after their providers:
//   - text-heading-effect before heading-word-wrap (wraps the .char elements it makes)
//   - locomotive-scroll-init before section4-mobile before section4-carousel
//   - carousel-menu-blob needs the global THREE (enqueued separately, before bundle)
// Excluded on purpose (must stay separate, NOT concatenated):
//   - gsap / gsap-scrollto / gsap-scrolltrigger / splittype  → external CDN
//   - three.min.js                                           → vendor global lib
//   - liquid-background.js                                   → loaded as <script type="module">
//   - product-details-viewer.js                              → ESM, uses import() + importmap
//   - profile-carousel.js / google-map.js                    → shortcode-conditional enqueues
const bundleOrder = [
  './js/scroll-effects.js',
  './js/side-nav.js',
  './js/text-heading-effect.js',
  './js/heading-word-wrap.js',
  './js/button-particles.js',
  './js/cta-button-upgrade.js',
  './js/map-swirl.js',
  './js/blurb.js',
  './js/blob-animation.js',
  './js/mask-zoom-effect.js',
  './js/mask-reveal.js',
  './js/locomotive-scroll-init.js',
  './js/section4-mobile.js',
  './js/section4-carousel.js',
  './js/footer-bg-sway.js',
  './js/video-autoplay.js',
  './js/mobile-menu.js',
  './js/product-blueprint.js',
  './js/wc-gallery-lightbox.js',
  './js/breadcrumb-chevron.js',
  './js/wc-qty-add-to-cart.js',
  './js/product-info-tabs.js',
  './js/product-info-layout.js',
  './js/carousel-menu-blob.js',
  './js/component-carousel.js',
  './js/product-video.js',
  './js/innotech-video-wrapper.js',
  './js/show-card-carousel.js',
  './js/blog-search.js'
];

// Compile SCSS, concatenate, and minify
function styles() {
  return gulp.src('./scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('ctc-style.css'))
    .pipe(cleanCSS({ compatibility: 'ie11' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.output));
}

// Minify individual JS files (kept so single-purpose mins like
// liquid-background.min.js still exist for their own enqueues).
function scripts() {
  return gulp.src(['./js/**/*.js', '!./js/min/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.jsOutput));
}

// Concatenate the theme's classic scripts into ONE minified bundle.
// `newLine: ';\n'` inserts a semicolon between files so a file ending without
// one can't merge into the next (ASI safety for back-to-back IIFEs).
function bundle() {
  return gulp.src(bundleOrder, { allowEmpty: true })
    .pipe(sourcemaps.init())
    .pipe(concat('theme.bundle.js', { newLine: ';\n' }))
    .pipe(terser())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.jsOutput));
}

// Watch for changes
function watch() {
  gulp.watch(paths.scss, styles);
  gulp.watch(['./js/**/*.js', '!./js/min/**/*.js'], gulp.parallel(scripts, bundle));
}

// Build task
const build = gulp.series(gulp.parallel(styles, scripts, bundle));

// Default task
exports.default = gulp.series(gulp.parallel(styles, scripts, bundle), watch);
exports.build = build;
exports.watch = watch;
exports.styles = styles;
exports.scripts = scripts;
exports.bundle = bundle;
