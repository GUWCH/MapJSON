let gulp = require('gulp');
let $ = require('gulp-load-plugins')();
let webpack = require("webpack-stream");
// let gulpUtil = require('gulp-util');

const AssertsDir = 'assets2';

gulp.task('webpack', function() {
    return gulp.src('./src')
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('dist/'));
});

gulp.task('copy', function() {
    return gulp.src([`./dist/${AssertsDir}/**/**`],{nodir: true})
        .pipe(gulp.dest(`../../scada_new/${AssertsDir}/`));
});

gulp.task('clean-assets', function() {
    return gulp.src(`../../scada_new/${AssertsDir}/`, {allowEmpty: true})
        .pipe($.clean({force: true}));
});

gulp.task('del-dist', function() {
    return gulp.src('./dist')
        .pipe($.clean({force: true}));
});

gulp.task('deploy',  gulp.series(
    'clean-assets', 
    'copy', 'del-dist'
));

gulp.task('default', function() {
});
