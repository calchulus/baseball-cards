module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		sass: {
			dist: {
				options: {
					style: 'compact'
				},
				files: {
					'public/assets/css/style.css': 'public/assets/scss/style.scss'
				}
			}
		},

		concat: {
			libs: {
				src: [
					'public/assets/js/libs/jquery-2.0.3.min.js',
					'public/assets/js/libs/underscore-min.js',
					'public/assets/js/libs/backbone-min.js',
					'public/assets/js/libs/bootstrap.min.js'
				],
				dest: 'public/assets/js/libs.js'
			},
			app: {
				src: [
					'public/assets/js/utils.js',
					'public/assets/js/main.js',
					'public/assets/js/models/*.js',
					'public/assets/js/views/*.js'
				],
				dest: 'public/assets/js/app.js'
			}
		},

		watch: {
			sass: {
				files: 'public/assets/scss/*.scss',
				tasks: ['sass']
			},
			concat: {
				files: [
					'public/assets/js/utils.js',
					'public/assets/js/main.js',
					'public/assets/js/models/*.js',
					'public/assets/js/views/*.js',
					'!public/assets/js/app.js',
					'!public/assets/js/libs.js'
				],
				tasks: ['concat']
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-sass');

	// Default task(s).
	grunt.registerTask('default', ['sass', 'concat']);
};