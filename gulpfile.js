var _log = console.log.bind( this );

/**
 * Node modules
 */
var modules = {
	fs: require('fs'),
	gulp: require( 'gulp' ),
	concat: require( 'gulp-concat' ),
	rename: require( 'gulp-rename' ),
	path: require( 'path' ),
	chmod: require( 'gulp-chmod' ),
	uglify: require( 'gulp-uglify' ),
	stylus: require( 'gulp-stylus' ),
	autoprefixer: require( 'gulp-autoprefixer' ),
	csso: require( 'gulp-csso' ),
	file: require( 'gulp-file' )
};

/**
 * Common variables
 */
var paths = {
	components: 'app/src/components',
	build_dev: 'app/build/dev',
	build_prod: 'app/build/prod',
	js_name: 'js',
	css_name: 'css',
	tpl_name: 'tpl'
};

/**
 * Functions lib
 */
var lib = {

	/**
	 * Common
	 */
	getFilenameFromPath: function( path ) {
		return path.replace(/^.*[\\\/]/, '');
	},

	getFilesOrFolders: function( method_name, dir ) {
		if ( modules.fs.existsSync( dir ) ) {
			return modules.fs.readdirSync( dir ).filter( function( file ) {
				return file[ 0 ] !== '_' && modules.fs.statSync( modules.path.join( dir, file ) )[ method_name ]();
			} );
		} else {
			return [];
		}
	},

	getFolders: function( dir ) {
		return this.getFilesOrFolders( 'isDirectory', dir );
	},

	getFiles: function( dir ) {
		return this.getFilesOrFolders( 'isFile', dir );
	},

	getFilesFromComponent: function( comp_name, subdir ) {
		return this.getFiles( modules.path.join( paths.components, comp_name, subdir ) ).map( function( filename ) {
			return modules.path.join( paths.components, comp_name, subdir, filename );
		} );
	},

	getComponents: function() {
		return this.getFolders( paths.components );
	},

	setVersion: function( type, dest ) {
		modules.file( type + '_version.txt', Date.now().toString(16), { src: true } )
		    .pipe( modules.gulp.dest( dest ) )
	},

	/**
	 * Scripts
	 */
	getVendorScriptsFromComponent: function( comp_name ) {
		return this.getFilesFromComponent( comp_name, paths.js_name + '/vendor' );
	},

	getModuleScriptsFromComponent: function( comp_name ) {
		return this.getFilesFromComponent( comp_name, paths.js_name + '/modules' );
	},

	getTplsFromComponent: function( comp_name ) {
		return this.getFilesFromComponent( comp_name, paths.tpl_name );
	},

	getOtherScriptsFromComponent: function( comp_name ) {
		return this.getFilesFromComponent( comp_name, paths.js_name );
	},

	getAllScripts: function() {
		var that = this,
			global_component_name = 'Global',
			global_vendor = this.getVendorScriptsFromComponent( global_component_name );

		var comp_vendor = this.getComponents().reduce( function( prev, comp_name ) {
			if ( comp_name !== global_component_name ) {
				prev = prev.concat( that.getVendorScriptsFromComponent( comp_name ) );
			}

			return prev;
		}, [] );

		var all_modules = this.getComponents().reduce( function( prev, comp_name ) {
			return prev.concat( that.getModuleScriptsFromComponent( comp_name ) );
		}, [] );

		return global_vendor
				.concat( comp_vendor )
				.concat( [ modules.path.join( paths.components, global_component_name, paths.js_name, 'air.js' ) ] )
				.concat( all_modules )
				.concat( [ modules.path.join( paths.components, global_component_name, paths.js_name, 'main.js' ) ] );
	},

	buildScriptsDev: function() {
		var all_scripts = this.getAllScripts();

		modules.gulp.src( all_scripts )
	        .pipe( modules.concat( 'min.js', { newLine: ';' } ) )
	        .pipe( modules.chmod( 0o777 ) )
	        .pipe( modules.gulp.dest( paths.build_dev ) );

	    this.setVersion( paths.js_name, paths.build_dev );
	},

	buildScriptsProd: function() {
		var all_scripts = this.getAllScripts();

		modules.gulp.src( all_scripts )
	        .pipe( modules.concat( 'min.js', { newLine: ';' } ) )
	        .pipe( modules.uglify() )
	        .pipe( modules.chmod( 0o777 ) )
	        .pipe( modules.gulp.dest( paths.build_prod ) );

	   	this.setVersion( paths.js_name, paths.build_prod );
	},

	/**
	 * Styles
	 */
	getVendorStylesFromComponent: function( comp_name ) {
		return this.getFilesFromComponent( comp_name, paths.css_name + '/vendor' );
	},

	getOtherStylesFromComponent: function( comp_name ) {
		return this.getFilesFromComponent( comp_name, paths.css_name );
	},

	getAllStyles: function() {
		var that = this,
			global_component_name = 'Global',
			global_vendor = this.getVendorStylesFromComponent( global_component_name ),
			global_other = this.getOtherStylesFromComponent( global_component_name );

		var comp_vendor = this.getComponents().reduce( function( prev, comp_name ) {
			if ( comp_name !== global_component_name ) {
				prev = prev.concat( that.getVendorStylesFromComponent( comp_name ) );
			}

			return prev;
		}, [] );

		var comp_other = this.getComponents().reduce( function( prev, comp_name ) {
			if ( comp_name !== global_component_name ) {
				prev = prev.concat( that.getOtherStylesFromComponent( comp_name ) );
			}

			return prev;
		}, [] );

		return global_vendor.concat( comp_vendor ).concat( global_other ).concat( comp_other );
	},

	buildStyles: function( dest_dir ) {
		var all_styles = this.getAllStyles();

		modules.gulp.src( all_styles )
			.pipe( modules.concat( 'min.styl' ) )
	        .pipe( modules.stylus() )
	        .pipe( modules.rename('min.css') )
	        .pipe( modules.autoprefixer( {
	            browsers: [ 'last 2 versions' ],
	            cascade: false
	        } ) )
	        .pipe( modules.csso() )
	        .pipe( modules.chmod( 0o777 ) )
	        .pipe( modules.gulp.dest( dest_dir ) );

	    this.setVersion( paths.css_name, dest_dir );
	},

	buildTpl: function( dest_dir ) {
		var that = this,
			all_components = this.getComponents(),
			config_data = {};

		all_components.forEach( function( comp_name ) {
			var comp_modules = that.getModuleScriptsFromComponent( comp_name ),
				comp_tpls = that.getTplsFromComponent( comp_name ),
				comp_modules_names = comp_modules.map( that.getFilenameFromPath ),
				comp_tpl_names = comp_tpls.map( that.getFilenameFromPath );

			comp_modules_names.forEach( function( module_name ) {
				var conf_path,
					conf;

				module_name = module_name.replace( /\.[^/.]+$/, '' );

				if ( module_name.indexOf( 'module.' ) === 0 ) {
					if ( config_data[ module_name ] === undefined ) {
						conf_path = modules.path.join( paths.components, comp_name, 'config.json' );

						if ( modules.fs.existsSync( conf_path ) ) {
							conf = JSON.parse( modules.fs.readFileSync( conf_path, 'utf8' ) );
						} else {
							conf = {};
						}

						config_data[ module_name ] = {
							tpl: {},
							conf: conf
						};
					}

					comp_tpls.forEach( function( tpl_name, j ) {
						config_data[ module_name ][ 'tpl' ][ tpl_name ] = modules.fs.readFileSync( comp_tpls[ j ], 'utf8' ).replace( /(\r\n|\n|\r)/gm, '' );
					} );
				}
			} );
		} );

		modules.fs.writeFileSync( dest_dir + '/modules_config.json', JSON.stringify( config_data ), 'utf8' );
	}

};

/**
 * Tasks
 */
modules.gulp.task( 'build_scripts_dev', function() {
	lib.buildScriptsDev();
} );

modules.gulp.task( 'build_scripts_prod', function() {
	lib.buildScriptsProd();
} );

modules.gulp.task( 'build_styles_dev', function() {
	lib.buildStyles( paths.build_dev );
} );

modules.gulp.task( 'build_styles_prod', function() {
	lib.buildStyles( paths.build_prod );
} );

modules.gulp.task( 'build_tpl_dev', function() {
	lib.buildTpl( paths.build_dev );
} );

modules.gulp.task( 'build_tpl_prod', function() {
	lib.buildTpl( paths.build_prod );
} );

modules.gulp.task( 'build_dev', [ 'build_tpl_dev', 'build_scripts_dev', 'build_styles_dev' ] );

modules.gulp.task( 'build_prod', [ 'build_tpl_prod', 'build_scripts_prod', 'build_styles_prod' ] );

modules.gulp.task( 'watch', function () {
	modules.gulp.watch( [
        '**/*.html', '**/*.json'
    ], { cwd: paths.components }, function() {
    	setTimeout( function() {
    		modules.gulp.start( 'build_tpl_dev' );
    	}, 100 );
    } );

    modules.gulp.watch( [
        '**/*.css'
    ], { cwd: paths.components }, function() {
    	setTimeout( function() {
    		modules.gulp.start( 'build_styles_dev' );
    	}, 100 );
    } );

    modules.gulp.watch( [
        '**/*.js'
    ], { cwd: paths.components }, function() {
    	setTimeout( function() {
    		modules.gulp.start( 'build_scripts_dev' );
    	}, 100 );
    } );
} );

modules.gulp.task( 'dev', [ 'build_dev', 'watch' ] );

modules.gulp.task( 'default', function() {
	_log( ';)' );
} );
