var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var browserSync = require('browser-sync');
var reload      = browserSync.reload;
var del   = require('del');

var gulp = require('gulp');
var electron = require('gulp-electron');
var elecRebuild   = require('electron-rebuild');
var packageJson = require('./package.json');
var install = require("gulp-install");




var paths = {
  sass: ['./www/sass/**/*.scss']
};

gulp.task('default', ['sass', 'scripts', 'serve']);

gulp.task('build', ['install', 'sass-build', 'scripts', /*'electron-clean',*/ 'electron-copy', 'electron-install', 'electron-build']);

// Static Server + watching scss/html files
gulp.task('serve', ['sass', 'scripts'], function() {

    browserSync({
        server: "./www"
    });

    gulp.watch("www/js/**/*", ['scripts']).on('change', reload);;
    gulp.watch("www/sass/**/*.scss", ['sass']);
    gulp.watch("www/templates/**/*.html").on('change', reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src('./www/sass/base.scss')
        .pipe(sass())
        .pipe(gulp.dest("./www/css"))
        .pipe(reload({stream: true}));
});

gulp.task('scripts', function() {
  return gulp.src('./www/js/app/**/*.js')
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('./www/js'));
});

gulp.task('sass-build', function(done) {
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

gulp.task('electron-clean', function () {
  return del([
    './electron-src/**/*',
  ]);
});

gulp.task('electron-rebuild', [], function() {
  elecRebuild.shouldRebuildNativeModules('./node_modules/electron-prebuilt/dist/')
    .then((shouldBuild) => {
      if (!shouldBuild) return true;

      return elecRebuild.installNodeHeaders('v0.36.7')
        .then(() => elecRebuild.rebuildNativeModules('v0.36.7', './node_modules'));
    })
    .catch((e) => {
      console.error("Building modules didn't work!");
      console.error(e);
    });
  });

gulp.task('electron-copy', ['sass', 'scripts', /*'electron-rebuild', 'electron-clean'*/], function() {

  var modules = [
    'serialport',
    'cbt-wireshark',
    'noble'
  ];

  var files = [
    'package.json',
    'main.js',
    'www/**/*',
    'node_modules/cbt-wireshark/**/*',
    'node_modules/noble/**/*',
    'node_modules/debug/**/*',
    'node_modules/ms/**/*',
    'node_modules/serialport/node_modules/**/*',
    'node_modules/serialport/build/**/*',
    'node_modules/serialport/serialport*.*',
    'node_modules/serialport/*.js',
    'node_modules/serialport/*.json'
  ];


  modules.forEach( function(value, index, arr){

    var package = require('serialport/package.json');
    Object.keys(package.dependencies).map(function(v, i, a){
      files.push('node_modules/'+v+'/**/*');
    });

    //addModules(package);

  });

  // function addModules(package, level){
  //
  //   level = level | 1;
  //   if( level > 7 )return;
  //
  //   Object.keys(package.dependencies).map(function(v, i, a){
  //     files.push('node_modules/'+v+'/**/*');
  //
  //     // recursively add required modules (npm 3 flat format only)
  //     var package = require('./node_modules/'+v+'/package.json');
  //     addModules(package, level+1);
  //   });
  // }

  gulp.src(files, {base: "."})
   .pipe(gulp.dest('./electron-src/'));

});



gulp.task('electron-install', ['electron-copy'], function() {
  gulp.src(['./electron-src/package.json'])
    .pipe(install({production:true, ignoreScripts:true}));
  });

gulp.task('electron-build', ['electron-copy'], function() {

    gulp.src("")
    .pipe(electron({
        src: './electron-src',
        packageJson: packageJson,
        release: './release',
        cache: './cache',
        asar: true,
        version: 'v0.36.7',
        packaging: true,
        platforms: [/*'win32-ia32', 'win32-x64', */'darwin-x64', /*'linux-x64'*/],
        platformResources: {
            darwin: {
                CFBundleDisplayName: packageJson.name,
                CFBundleIdentifier: packageJson.name,
                CFBundleName: packageJson.name,
                CFBundleVersion: packageJson.version,
                icon: 'build_assets/nw.icns'
            },
            win: {
                "version-string": packageJson.version,
                "file-version": packageJson.version,
                "product-version": packageJson.version,
                "icon": 'build_assets/cbt.ico'
            }
        }
    }))
    .pipe(gulp.dest(""));
});
