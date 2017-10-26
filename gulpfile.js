var gulp = require('gulp');
var sync = require('browser-sync');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var prefix = require('gulp-autoprefixer');
var cp = require('child_process');

gulp.task('sass', function() {
	return gulp.src('_sass/main.scss')
	.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
	.pipe(prefix({browsers: ['last 2 versions']}))
	.pipe(rename('main.min.css'))
	// we want gulp to compile the CSS, not jekyll, so include a 2nd minified CSS file in non-compiled dir
	.pipe(gulp.dest('css'))
	.pipe(gulp.dest('_site/css'))
	.pipe(sync.reload({stream: true}))
});

gulp.task('js', function() {
	return gulp.src('./js/*.js')
	.pipe(concat('scripts.js'))
	.pipe(uglify())
	.pipe(rename('scripts.min.js'))
	.pipe(gulp.dest('_site/js'))
	.pipe(sync.reload({stream: true}))
});

gulp.task('jekyll-build', function (done) {
	return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
		.on('close', done);
});

gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
	sync.reload();
});

gulp.task('sync', ['jekyll-build'], function() {
	sync({
		server: {
			baseDir: '_site'
		},
		host: 'localhost'
	});
});

gulp.task('watch', function() {
  gulp.watch(['index.html', '*/*.html', '*/*/*.html', '*/*/*/*.html', '_includes/*.html', '_layouts/*.html', '*.md', '!_site/**', '!_site/*/**'], ['jekyll-rebuild']);
  gulp.watch('_sass/**/*.scss', ['sass']);
  gulp.watch('js/*.js', ['js']);
});

gulp.task('default', ['sass'], function() {
	gulp.start('sync', 'watch')

	// apparently on first build, jekyll JS compiler will overwrite gulp output to _site
	// this delays gulp compilation of JS till jekyll has finished compilation
	setTimeout(function() {
		gulp.start('js')
	}, 1500)
});
