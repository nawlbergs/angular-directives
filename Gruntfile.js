module.exports = function(grunt) {

  grunt.registerTask('default', ['bower-update', 'concat', 'less']);
  grunt.registerTask('dev', ['default', 'watch']);


  var concatLibs = function(filename, files){
    return {
      options: {
        separator: grunt.util.linefeed + ';' + grunt.util.linefeed
      },
      nonull: true,
      dest:'<%= dirs.js.out %>/'+filename,
      src: files
    }
  };


  grunt.initConfig({

    dirs:{
      js: {
        out: 'dist/scripts'
      },
      css:{
        in:'src/styles',
        out:'dist/css'
      }
    },

    //
    // LESS
    //
    less:{
      'af-lib':{
        //options: {compress: true},
        files: {
          '<%= dirs.css.out %>/af-lib.css': '<%= dirs.css.in %>/af-lib/af-lib.less',
          '<%= dirs.css.out %>/af-init.css':'<%= dirs.css.in %>/af-lib/af-init.less'
        }
      },
      themes:{
        options: {compress: true},
        files: {
          '<%= dirs.css.out %>/theme-blue.css':      '<%= dirs.css.in %>/themes/theme-blue.less',
          '<%= dirs.css.out %>/theme-brown.css':     '<%= dirs.css.in %>/themes/theme-brown.less',
          '<%= dirs.css.out %>/theme-green.css':     '<%= dirs.css.in %>/themes/theme-green.less',
          '<%= dirs.css.out %>/theme-litegreen.css': '<%= dirs.css.in %>/themes/theme-litegreen.less',
          '<%= dirs.css.out %>/theme-orange.css':    '<%= dirs.css.in %>/themes/theme-orange.less',
          '<%= dirs.css.out %>/theme-red.css':       '<%= dirs.css.in %>/themes/theme-red.less'
        }
      }
    },

    
    //
    // SCRIPTS
    //
    concat: {


      //
      // AF-LIB
      //
      'af-lib': {
        options: {
          separator: grunt.util.linefeed + ';' + grunt.util.linefeed
        },
        nonull: true,
        files: {
          '<%= dirs.js.out %>/af-angular-lib-core.js':[
            'src/scripts/**/*'
          ],
          '<%= dirs.js.out %>/af-angular-lib-setup.js':[
            'src/setup/console-fix.js',
            'src/setup/**/*'
          ],
          '<%= dirs.js.out %>/af-angular-lib.js':[
            'src/setup/console-fix.js',
            'src/setup/**/*',
            'src/scripts/**/*'
          ]
        }
      },



      //
      // AF-CORE
      //
      libs: concatLibs('af-core-libs.js', [
        // angular
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/amplify/lib/amplify.core.js',
        'bower_components/amplify/lib/amplify.store.js',
        // angular
        'bower_components/angular/angular.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-animate/angular-animate.js',
        'bower_components/angular-messages/angular-messages.js',
        'bower_components/angular-ui-router/release/angular-ui-router.js',
        // util
        'bower_components/lodash/dist/lodash.js',
        'bower_components/moment/moment.js',
        // raven
        'bower_components/raven-js/dist/raven.min.js'
      ]),
      libsMin: concatLibs('af-core-libs.min.js', [
        // angular
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/amplify/lib/amplify.core.min.js',
        'bower_components/amplify/lib/amplify.store.min.js',
        // angular
        'bower_components/angular/angular.min.js',
        'bower_components/angular-sanitize/angular-sanitize.min.js',
        'bower_components/angular-animate/angular-animate.min.js',
        'bower_components/angular-messages/angular-messages.min.js',
        'bower_components/angular-ui-router/release/angular-ui-router.min.js',
        // util
        'bower_components/lodash/dist/lodash.min.js',
        'bower_components/moment/min/moment.min.js',
        // raven
        'bower_components/raven-js/dist/raven.min.js'
      ])
    },


    // watch files... (for dev)
    watch: {
      options: { livereload: false },
      js: {
        files: ['src/scripts/**/*.js', 'src/setup/**/*.js'],
        tasks: ['concat']
      },
      styles: {
        files: ['src/styles/**/*.less'],
        tasks: ['less']
      }
    }

  });



  // updates af lib
  grunt.registerTask('bower-update', 'install the backend and frontend dependencies', function() {
    var exec = require('child_process').exec;
    var cb = this.async();
    exec('bower update', {cwd: './'}, function(err, stdout, stderr) {
      console.log(stdout);
      cb();
    });
  });


  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
