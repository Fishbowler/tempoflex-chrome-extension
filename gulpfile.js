// generated on 2019-06-02 using generator-chrome-extension 0.7.1
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const del = require('del');
const runSequence = require('run-sequence');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const es = require('event-stream');

const $ = gulpLoadPlugins();

gulp.task('copyEverythingElse', () => {
  return gulp.src([
    'app/**',
    '!app/scripts/**'
  ], {
    base: 'app',
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('buildScripts', () => {
  const files = [
    'background.js',
    'popup.js',
    'options.js'
  ];

  const tasks = files.map(file => (
    browserify({
      entries: `./app/scripts/${file}`,
      debug: false
    }).bundle()
      .pipe(source(file))
      .pipe(gulp.dest('dist/scripts'))
  ));

  return es.merge.apply(null, tasks);
});

gulp.task('clean', del.bind(null, ['dist']));

gulp.task('package', function () {
  var manifest = require('./dist/manifest.json');
  return gulp.src('dist/**')
      .pipe($.zip('TempoFlex-' + manifest.version + '.zip'))
      .pipe(gulp.dest('package'));
});

gulp.task('build', (cb) => {
  runSequence('buildScripts', 'copyEverythingElse', cb);
});

gulp.task('default', ['clean'], cb => {
  runSequence('build', cb);
});
