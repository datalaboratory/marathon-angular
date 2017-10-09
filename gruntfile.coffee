module.exports = (grunt) ->
  require('load-grunt-config') grunt

  grunt.initConfig
    concat:
      js:
        src: [
          'bower_components/jquery/dist/jquery.js'
          'bower_components/moment/moment.js'
          'bower_components/lodash/lodash.js'
          'bower_components/d3/d3.js'
          'bower_components/angular/angular.js'
          'bower_components/angular-route/angular-route.js'
          'bower_components/angular-translate/angular-translate.js'
          'bower_components/data-lab-blocks/dist/js/script.js'

          'vendor/js/**/*.js'

          'src/js/app.js'
          'src/js/marathon.js'
          'src/js/**/*.js'

          'static/js/templates.js'
        ]
        dest: 'static/js/script.js'
      css:
        src: [
          'bower_components/normalize.css/normalize.css'
          'bower_components/data-lab-blocks/dist/css/style.css'
          'vendor/css/**/*.css'
          'src/css/**/*.css'
        ]
        dest: 'static/css/style.css'

    cssmin:
      minify:
        expand: true
        cwd: 'static/css/'
        src: ['style.css']
        dest: 'static/css/'
        ext: '.min.css'

    uglify:
      main:
        options:
          mangle: false

        files:
          'static/js/script.min.js': '<%= concat.js.dest %>'

    watch:
      js:
        files: [
          'src/js/**/*.js'
          'src/templates/**/*.html'
        ]
        tasks: ['js']
        options:
          nospawn: true

      css:
        files: [
          'src/css/**/*.css'
        ]
        tasks: ['css']
        options:
          nospawn: true

    ngtemplates:
      marathon:
        cwd: 'src/templates'
        src: '**/*.html'
        dest: 'static/js/templates.js'
        options:
          module: 'marathon'

  grunt.registerTask 'default', ['js-full', 'css-full']
  grunt.registerTask 'dev', ['js', 'css']
  grunt.registerTask 'templates', ['ngtemplates:marathon']
  grunt.registerTask 'js', ['templates', 'concat:js']
  grunt.registerTask 'js-full', ['js', 'uglify']
  grunt.registerTask 'css', ['concat:css']
  grunt.registerTask 'css-full', ['css', 'cssmin']