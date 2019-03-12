const gulp = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const argv = require('yargs').argv;
const iff = require('gulp-if');
const size = require('gulp-size');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

sass.compiler = require('node-sass');

const devBuild = argv.production || argv.prod;

const dir = {
    src: 'assets/src/',
    build: 'assets/dist/'
};

const clean = () => {
    return del([dir.build]);
};

exports.clean = clean;

const cssConfig = {
    src: dir.src + 'scss/main.scss',
    build: dir.build + 'css',
    sassOpts: {
        sourceMap: devBuild,
        outputStyle: 'nested',
        precision: 3,
        logErrorsToConsole: true,
        outFile: dir.build + 'css'
    },
    postCSS: [
        require('autoprefixer')()
    ]
};

if (!devBuild) {
    cssConfig.postCSS.push(require('cssnano'));
}

const css = () => 
    gulp.src(cssConfig.src)
        .pipe(iff(cssConfig.sassOpts.sourceMap, sourcemaps.init()))
        .pipe(sass(cssConfig.sassOpts).on('error', sass.logError))
        .pipe(postcss(cssConfig.postCSS))
        .pipe(iff(cssConfig.sassOpts.sourceMap, sourcemaps.write('./')))
        .pipe(size({ showFiles: true }))
        .pipe(rename({suffix: '.min' }))
        .pipe(gulp.dest(cssConfig.build));

exports.css = css;

const jsConfig = {
    srcRoot: dir.src + 'js/',
    build: dir.build + 'js/'
};

const jsBundles = {
    primary: {
        sources: [
            'globals/jquery-3.3.1.slim.min.js', 'globals/jquery-migrate-3.0.1.js',
            'globals/plugins.js', 'globals/bootstrap/*.js', 'globals/functions.js'
        ].map(src => jsConfig.srcRoot + src),
        dest: 'all.js'
    }
};

const js = ({ sources, dest }) => {
    return () => gulp.src(sources)
        .pipe(iff(devBuild, sourcemaps.init()))
        .pipe(concat(dest))
        .pipe(babel())
        .pipe(gulp.dest(jsConfig.build))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(iff(devBuild, sourcemaps.write('./')))
        .pipe(gulp.dest(jsConfig.build));
}

const jsPrimary = js(jsBundles.primary);

const buildJs = gulp.parallel(jsPrimary, jsRegipedia);
const buildAll = gulp.parallel(buildJs, css);

gulp.task('default', buildAll);
