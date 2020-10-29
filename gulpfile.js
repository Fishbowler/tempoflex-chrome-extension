const gulp = require('gulp');

const cleanCSS = require('gulp-clean-css')
const del = require('del');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const merge = require('merge-stream');

gulp.task('buildScripts', () => {
  const files = [
    'background.js',
    'popup.js',
    'options.js'
  ];

  return merge(
    files.map(file => (
      browserify({
        entries: `./app/scripts/${file}`,
        debug: true
      }).bundle()
      .pipe(source(file))
      .pipe(gulp.dest('dist/scripts'))
    )));
});

gulp.task('minify-css', () => {
  return gulp.src('app/styles/*.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/styles'));
})

gulp.task('copyEverythingElse', () => {
  return gulp.src([
    'app/**',
    '!app/scripts/**',
    '!app/styles/**'
  ], {
    base: 'app',
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', () => del('dist/**/*'));

gulp.task('build',
  gulp.series(gulp.parallel('buildScripts', 'minify-css'), 'copyEverythingElse')
)

gulp.task('default',
  gulp.series('clean', 'build')
)