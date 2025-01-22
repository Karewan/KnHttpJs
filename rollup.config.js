import terser from "@rollup/plugin-terser"
import replace from "@rollup/plugin-replace"

const banner = `/**
 * KnHttp v` + process.env.npm_package_version + ` (` + new Date().toISOString() + `)
 * Copyright (c) 2022 - ` + new Date().getFullYear() + ` Florent VIALATTE
 * Released under the MIT license
 */`

const replacePlugin = replace({
	preventAssignment: true,
	values: {
		'process.env.npm_package_version': JSON.stringify(process.env.npm_package_version)
	}
})

export default [
	{
		input: 'src/kn-http.js',
		output: {
			format: 'esm',
			file: 'dist/kn-http.js',
			banner: banner,
			exports: 'named'
		},
		plugins: [
			replacePlugin
		]
	},
	{
		input: 'src/kn-http.js',
		output: {
			name: 'KnHttp',
			format: 'iife',
			file: 'dist/kn-http.iife.js',
			banner: banner
		},
		plugins: [
			replacePlugin
		]
	},
	{
		input: 'src/kn-http.js',
		output: {
			name: 'KnHttp',
			format: 'iife',
			file: 'dist/kn-http.iife.min.js'
		},
		plugins: [
			replacePlugin,
			terser({
				ecma: '2020',
				compress: {
					ecma: '2020',
					drop_console: true,
					drop_debugger: true,
					passes: 2
				},
				format: {
					comments: false,
					ecma: '2020',
					quote_style: 3,
					preamble: banner
				}
			})
		]
	}
]
