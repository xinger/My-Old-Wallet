window._log = console.log.bind( console );

Air.config( {
	'variables': {
		'global_modules': ''
	},
	'router': {

	},
	'global': '{{global_modules}}', // переменная – просто так, для демонстрации
	'modules': window.__modules_config || {}
} );

Air.start( {
	is_debug: true
} );
