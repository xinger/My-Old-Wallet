window._log = console.log.bind( console );

Air.config( {
	'router': {

	},
	'global': '',
	'modules': window.__modules_config || {}
} );

Air.start( {
	is_debug: true
} );
