const gulp = require('gulp');

const cleanCSS = require('gulp-clean-css')
const zip = require('gulp-zip')
const del = require('del');
const runSequence = require('run-sequence');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const es = require('event-stream');

gulp.task('buildScripts', () => {
  const files = [
    'background.js',
    'popup.js',
    'options.js'
  ];

  const tasks = files.map(file => (
    browserify({
      entries: `./app/scripts/${file}`,
      debug: true
    }).bundle()
      .pipe(source(file))
      .pipe(gulp.dest('dist/scripts'))
  ));

  return es.merge.apply(null, tasks);
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

gulp.task('clean', del.bind(null, ['dist']));

gulp.task('package', function () {
  var manifest = require('./dist/manifest.json');
  return gulp.src('dist/**')
      .pipe(zip('TempoFlex-' + manifest.version + '.zip'))
      .pipe(gulp.dest('package'));
});

gulp.task('build', (cb) => {
  runSequence(['buildScripts', 'minify-css'], 'copyEverythingElse', cb);
});

gulp.task('default', ['clean'], cb => {
  runSequence('build', cb);
});
