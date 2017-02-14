import gulp from 'gulp';
import SSI from 'browsersync-ssi';
import del from 'del';
import uglify from 'gulp-uglify';
import babel from 'gulp-babel';
import hash from 'gulp-hash';

const browserSync = require('browser-sync').create();

gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: ['./dist'],
      middleware: SSI({
        baseDir: './dist',
        ext: '.shtml',
        version: '2.10.0',
        port: 3000,
      }),
    },
  });

  gulp.watch('src/*.js', ['js', browserSync.reload]);
  gulp.watch('test/*', ['test', browserSync.reload]);
});

gulp.task('js', () => gulp.src('src/*.js')
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream()));

gulp.task('test', () => gulp.src('test/*')
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream()));

gulp.task('clean', () => del(['dist']));

gulp.task('build', ['clean'], () => gulp.src('src/*.js')
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(uglify())
    .pipe(hash())
    .pipe(gulp.dest('dist/')));

gulp.task('default', ['clean', 'js', 'test', 'serve']);
