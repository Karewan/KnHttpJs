const gulp = require('gulp'),
fs = require('fs'),
rename = require('gulp-rename'),
terser = require('gulp-terser'),
header_comment = require('gulp-header-comment');

const terser_options = {
	ecma: '2015',
	ie8: false,
	safari10: false,
	compress: {
		ecma: '2015',
		drop_console: true,
		drop_debugger: true,
		passes: 2
	},
	format: {
		comments: false,
		ecma: '2015',
		quote_style: 3
	}
},
header_txt= `
	KnHttp v<%= pkg.version %> (<%= moment().format('YYYY-MM-DD HH:mm:ss ZZ') %>)
	Copyright (c) 2022 <%= pkg.author %>
	Released under the MIT license
`;

gulp.task('minify', function() {
	return gulp.src('src/kn_http.js')
		.pipe(header_comment(header_txt))
		.pipe(gulp.dest('dist'))
		.pipe(terser(terser_options))
		.pipe(header_comment(header_txt))
		.pipe(rename('kn_http.min.js'))
		.pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.series('minify'));
