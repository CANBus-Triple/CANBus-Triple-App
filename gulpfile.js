var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var NwBuilder = require('node-webkit-builder');

var paths = {
  sass: ['./www/sass/**/*.scss'],
  nwjs: ['package.json','./www/**/**', './node_modules/serialport/build/serialport/**/**']
};

gulp.task('default', ['sass', 'watch']);

gulp.task('build', ['install', 'sass', 'nw-build']);

gulp.task('sass', function(done) {
  gulp.src('./www/sass/base.scss')
    .pipe(sass())
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('nw-watch', function() {
  gulp.watch(paths.nwjs, ['sass', 'nw-build']);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});


gulp.task('nw-build', function(done){
	
	var nw = new NwBuilder({
			appName: 'CANBus Triple',
	    files: paths.nwjs, // use the glob format
	    platforms: ['osx64'],//, 'win64','linux64'],
	    macIcns: 'build_assets/nw.icns',
	});
	
	//Log stuff you want
	
	nw.on('log',  console.log);
	
	// Build returns a promise
	nw.build().then(function () {
	   console.log('all done!');
	}).catch(function (error) {
	    console.error(error);
	});
	
	done();
});