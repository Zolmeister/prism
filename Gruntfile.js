module.exports = function (grunt) {

	grunt.initConfig({
		concat_sourcemap: {
			options: {
				sourceRoot: '../'
			},
			target: {
				files: {
					'dist/prism.js': ['js/**/*.js'],
					'dist/lib.js': ['lib/**/*.js']
				}
			}
		},
		watch: {
			scripts: {
				files: ['js/**/*.js', 'lib/**/*.js'],
				tasks: ['concat_sourcemap', 'cssmin', 'uglify', 'inlineEverything', 'compress'],
				options: {
					spawn: false,
				},
			},
		},
		cssmin: {
			combine: {
				files: {
					'dist/style.min.css': ['css/style.css']
				}
			}
		},
		uglify: {
			prism: {
				options: {
					sourceMap: true,
					sourceMapIncludeSources: true,
					sourceMapIn: 'dist/prism.js.map', // input sourcemap from a previous compilation
				},
				files: {
					'dist/prism.min.js': ['dist/prism.js']
				}
			},
			lib: {
				options: {
					sourceMap: true,
					sourceMapIncludeSources: true,
					sourceMapIn: 'dist/lib.js.map', // input sourcemap from a previous compilation
				},
				files: {
					'dist/lib.min.js': ['dist/lib.js']
				}
			}
		},
		inlineEverything: {
			templates: {
				options: {},
				files: [{
					expand: true,
					cwd: '.',
					src: 'index.html',
					dest: 'build'
				}]
			}
		},
		compress: {
			main: {
				options: {
					mode: 'gzip'
				},
				expand: true,
				cwd: 'build/',
				src: ['index.html'],
				dest: 'build/'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-cruncher');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-concat-sourcemap');
	grunt.loadNpmTasks('grunt-contrib-compress');

	grunt.registerTask('default', ['concat_sourcemap', 'cssmin', 'uglify', 'inlineEverything', 'compress', 'watch']);

};