const gulp = require('gulp');
const plumber = require('gulp-plumber');
const eslint = require('gulp-eslint');

var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();

// Set the banner content
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  '\n'
].join('');

function bootstrap() {
  return gulp.src([
    './node_modules/bootstrap/dist/**/*',
    '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
    '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
  ])
  .pipe(gulp.dest('./vendor/bootstrap'));
}

function fontAwesome() {
  return gulp.src([
    './node_modules/@fortawesome/**/*',
  ])
  .pipe(gulp.dest('./vendor'));
}

function jQuery() {
  return gulp.src([
    './node_modules/jquery/dist/*',
    '!./node_modules/jquery/dist/core.js'
  ])
  .pipe(gulp.dest('./vendor/jquery'));
}

function jQueryEasing() {
  return gulp.src([
    './node_modules/jquery.easing/*.js'
  ])
  .pipe(gulp.dest('./vendor/jquery-easing'));
}

function scriptsLint() {
  return gulp
    .src(["./js/resume.js", "./gulpfile.js"])
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function scriptsMinify() {
  return (
    gulp
      .src([
        './js/*.js',
        '!./js/*.min.js'
      ])
      .pipe(plumber())
      .pipe(uglify())
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(header(banner, {
        pkg: pkg
      }))
      .pipe(gulp.dest('./js'))
      .pipe(browserSync.stream())
  );
}

function cssCompile() {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(sass.sync({
      outputStyle: 'expanded'
    })
    .on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('./css'));
}

function cssMinify() {
  return gulp.src([
      './css/*.css',
      '!./css/*.min.css'
    ])
    .pipe(plumber())
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
}

function reload() {
  browserSync.reload();
}

function serve(done) {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
  done();
}

function watch() {
  gulp.watch('./scss/*.scss').on('change', () => {
    css();
    reload();
  });
  gulp.watch('./js/*.js', () => {
    scriptsMinify();
    reload();
  });
  gulp.watch('./*.html', reload);
};

const vendor = gulp.series(bootstrap, fontAwesome, jQuery, jQueryEasing);
const js = gulp.series(scriptsLint, scriptsMinify);
const css = gulp.series(cssCompile, cssMinify);
const build = gulp.series(css, js, vendor);
const dev = gulp.series(css, js, serve, watch);

exports.js = js;
exports.css = css;
exports.vendor = vendor;
exports.build = build;
exports.dev = dev;