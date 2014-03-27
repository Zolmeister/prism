module.exports = function (grunt) {

	grunt.initConfig({
		concat_sourcemap: {
			options: {
				sourceRoot: '../'
			},
			target: {
				files: {
					'dist/prism.js': ['js/bind.js', 'js/board.js', 'js/events.js', 'js/main.js', 'js/tutorial.js'],
					'dist/lib.js': ['lib/**/*.js']
				}
			}
		},
		watch: {
			scripts: {
				files: ['js/**/*.js', 'lib/**/*.js', 'css/**/*.css'],
				tasks: ['concat_sourcemap', 'cssmin', 'uglify', 'inlineEverything', 'compress', 'copy:main', 'usebanner', 'copy:build'],
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
		},
		usebanner: {
			dist: {
				options: {
					position: 'bottom',
					banner: '#<%= Date.now() %>'
				},
				files: {
					src: [ 'cache.appcache' ]
				}
			}
		},
		copy: {
			main: {
				files: [
					{src: ['cache.appcache.tpl'], dest: 'cache.appcache'}
				]
			},
			build: {
				files: [
					{src: ['cache.appcache'], dest: 'build/cache.appcache'}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-cruncher');
	grunt.loadNpmTasks('grunt-banner');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-concat-sourcemap');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['concat_sourcemap', 'cssmin', 'uglify', 'inlineEverything', 'compress', 'copy:main', 'usebanner', 'copy:build', 'watch']);

};