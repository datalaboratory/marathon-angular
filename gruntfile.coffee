module.exports = (grunt) ->
  require('load-grunt-config') grunt

  grunt.initConfig
    concat:
      js:
        src: [
          'bower_components/jquery/dist/jquery.min.js'
          'bower_components/moment/min/moment.min.js'
          'bower_components/lodash/lodash.min.js'
          'bower_components/d3/d3.min.js'
          'bower_components/angular/angular.min.js'

          'dataLab/js/app.js'
          'dataLab/**/*.js'
          'src/js/marathon.js'
          'src/js/**/*.js'

          'static/js/datalab-templates.js'
          'static/js/templates.js'

        ]
        dest: 'static/js/script.js'
      css:
        src: [
          'bower_components/normalize.css/normalize.css'
          'dataLab/blocks/**/*.css'
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
          'dataLab/js/**/*.js'
          'dataLab/blocks/**/*.js'
          'dataLab/blocks/**/*.html'
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
      dataLab:
        cwd: 'dataLab/blocks'
        src: '**/*.html'
        dest: 'static/js/datalab-templates.js'
        options:
          module: 'dataLab'
      marathon:
        cwd: 'src/templates'
        src: '**/*.html'
        dest: 'static/js/templates.js'
        options:
          module: 'marathon'

  grunt.registerTask 'default', ['js-full', 'css-full']
  grunt.registerTask 'dev', ['js', 'css']
  grunt.registerTask 'templates', ['ngtemplates:dataLab', 'ngtemplates:marathon']
  grunt.registerTask 'js', ['templates', 'concat:js']
  grunt.registerTask 'js-full', ['js', 'uglify']
  grunt.registerTask 'css', ['concat:css']
  grunt.registerTask 'css-full', ['css', 'cssmin']