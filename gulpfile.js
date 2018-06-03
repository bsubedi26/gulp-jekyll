var fs = require('fs')
var yargs = require('yargs')
var yaml = require('js-yaml')
var sequence = require('run-sequence')
var del = require('del')
var gulp = require('gulp')
var spawn = require('cross-spawn')
var sass = require('gulp-sass')
var browserSync = require('browser-sync')
var autoprefixer = require('gulp-autoprefixer')
var cssnano = require('gulp-cssnano')
var gulpif = require('gulp-if')
var sourcemaps = require('gulp-sourcemaps')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var imagemin = require('gulp-imagemin')
var rsync = require('gulp-rsync')
const babel = require('gulp-babel')

const PRODUCTION = yargs.argv.production

const loadConfig = () => yaml.load(fs.readFileSync('gulpconfig.yml', 'utf8'))
const config = loadConfig()

gulp.task('clean', done => {
  del(config.clean)
  done()
})

gulp.task('copy', () => {
  browserSync.notify(config.copy.notification)
  return gulp
    .src(config.copy.assets)
    .pipe(gulpif(PRODUCTION, imagemin()))
    .pipe(gulp.dest(config.copy.dist))
})

gulp.task('sass', () => {
  return gulp
    .src(config.sass.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer(config.sass.compatibility))
    .pipe(gulpif(PRODUCTION, cssnano()))
    .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
    .pipe(gulp.dest(config.sass.dest.jekyllRoot))
    .pipe(gulp.dest(config.sass.dest.buildDir))
    .pipe(browserSync.stream())
})

gulp.task('javascript', () => {
  browserSync.notify(config.javascript.notification)
  return gulp
    .src(config.javascript.src)
    .pipe(sourcemaps.init())
    .pipe(concat(config.javascript.filename))
    .pipe(
      babel({
        presets: ['babel-preset-env', 'babel-preset-react']
      })
    )
    .pipe(gulpif(PRODUCTION, uglify()))
    .pipe(gulp.dest(config.javascript.dest.buildDir))
  // .pipe(gulp.dest(config.javascript.dest.jekyllRoot))
})

gulp.task('jekyll-build', done => {
  browserSync.notify(config.jekyll.notification)
  return spawn('jekyll', ['build'], {
    stdio: 'inherit'
  }).on('close', done)
  on('exit', code => {
    done(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code)
  })
})

gulp.task('rsync', () => {
  return gulp.src('_site/**').pipe(
    rsync({
      root: '_site/',
      hostname: config.deploy.hostname,
      destination: config.deploy.destination,
      username: config.deploy.username,
      incremental: true
    })
  )
})

gulp.task('deploy', done => {
  sequence('build', 'rsync', done)
})

gulp.task('build', done => {
  sequence('clean', 'jekyll-build', ['sass', 'javascript'], 'copy', done)
})

gulp.task('browser-sync', () => {
  browserSync.init({
    notify: config.browsersync.notify,
    open: config.browsersync.open,
    port: config.browsersync.port,
    server: {
      baseDir: config.browsersync.server.basedir
    },
    xip: config.browsersync.xip,
    browser: config.browsersync.browser
  })
})

gulp.task('watch', () => {
  gulp.watch(config.watch.pages, ['build', browserSync.reload])
  gulp.watch(config.watch.javascript, ['javascript', browserSync.reload])
  gulp.watch(config.watch.sass, ['sass'])
  gulp.watch(config.watch.images, ['copy', browserSync.reload])
})

gulp.task('default', done => {
  sequence('build', 'browser-sync', 'watch', done)
})

module.exports = config
