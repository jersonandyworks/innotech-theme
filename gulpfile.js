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

// Minify JavaScript
function scripts() {
  return gulp.src(['./js/**/*.js', '!./js/min/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.jsOutput));
}

// Watch for changes
function watch() {
  gulp.watch(paths.scss, styles);
  gulp.watch(['./js/**/*.js', '!./js/min/**/*.js'], scripts);
}

// Build task
const build = gulp.series(gulp.parallel(styles, scripts));

// Default task
exports.default = gulp.series(gulp.parallel(styles, scripts), watch);
exports.build = build;
exports.watch = watch;
exports.styles = styles;
exports.scripts = scripts;
