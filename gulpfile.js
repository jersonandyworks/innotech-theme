const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');

// Paths
const paths = {
  scss: './scss/**/*.scss',
  output: './'
};

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

// Watch for changes
function watch() {
  gulp.watch(paths.scss, styles);
}

// Build task
const build = gulp.series(styles);

// Default task
exports.default = gulp.series(styles, watch);
exports.build = build;
exports.watch = watch;
exports.styles = styles;
