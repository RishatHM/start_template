'use strict';

var gulp        = require('gulp'),
    gutil       = require('gulp-util' ),
    watch       = require('gulp-watch'),
    prefixer    = require('gulp-autoprefixer'),
    uglify      = require('gulp-uglify'),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'),
    rigger      = require('gulp-rigger'),
    cssmin      = require('gulp-minify-css'),
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    rimraf      = require('rimraf'),
    browserSync = require("browser-sync"),
    ftp         = require('vinyl-ftp'),
    notify      = require("gulp-notify"),
    babel       = require("gulp-babel"),
    reload      = browserSync.reload;

var path = {
    build: {
        html: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/main.js',
        style: 'src/style/main.sass',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        other: ['src/*.*', '!src/*.html']
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.sass',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './dist'
};

var config = {
    server: {
        baseDir: "./dist"
    },
    //tunnel: true,
    host: 'localhost',
    port: 9000,
    notify: false,
    logPrefix: "RishatHM",
    browser: "Chrome"
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
    gulp.src(path.src.html) 
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) 
        .pipe(rigger()) 
        .pipe(sourcemaps.init()) 
            .pipe(babel())
            .pipe(uglify()) 
        .pipe(sourcemaps.write()) 
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    gulp.src(path.src.style) 
        .pipe(sourcemaps.init())
            .pipe(sass({
                sourceMap: true,
                errLogToConsole: true
            }).on("error", notify.onError()))
            .pipe(prefixer(['last 4 versions']))
            .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) 
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
], function (){
    gulp.src(path.src.other)
        .pipe(gulp.dest(path.build.html))    
});


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});


gulp.task('default', ['build', 'webserver', 'watch']);


gulp.task('deploy', function() {

    var conn = ftp.create({
        host:      'hostname.com',
        user:      'username',
        password:  'userpassword',
        parallel:  10,
        log: gutil.log
    });

    var globs = [
    'dest/**',
    'dest/.htaccess',
    ];
    return gulp.src(globs, {buffer: false})
    .pipe(conn.dest('/path/to/folder/on/server'));

});