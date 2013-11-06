'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        jquery: {
            dist: {
                options: {
                    prefix: "jquery.",
                    minify: false
                },
                output: "lib/",
                versions: ["2.0.3"]
            }
        },
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),

        banner: '/* <%= pkg.name || pkg.title %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
            ' * Licensed <%= pkg.license %> */\n',

        clean: ['lib'],

        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: 'dynamic/<%= pkg.name %>.js',
                dest: 'dynamic/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            src: {
                options: {
                    jshintrc: 'dynamic/.jshintrc'
                },
                src: ['dynamic/**/*.js']
            },
            dist: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/**/*.js']
            }
        },
        copy: {
            main: {
                files: [
                    {expand:true, cwd:'dynamic/', src: '*', dest: 'test/'},
                    {src: ['dynamic/.jshintrc'], dest: 'test/.jshintrc'}
                ]
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-jquery-builder');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task.
    grunt.registerTask('pull',  ["jquery"]);
    grunt.registerTask('do',    ["uglify", "jshint"]);
    grunt.registerTask('cl',    ["clean"]);

};
