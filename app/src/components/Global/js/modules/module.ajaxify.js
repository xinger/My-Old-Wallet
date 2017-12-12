Air.defineModule( 'module.ajaxify', 'module.analytics, module.notify, module.location, lib.ajax, lib.DOM', function( analytics, notify, module_location, ajax, $, util ) {
	var self = this,
		DOM = {},
		is_link_clicked,
		last_y = 0,
		scroll_top_history = {},
		blocking_message,
		is_locked = false,
		is_blocked = false,
		code_handlers = {},
		ajax_container_selector = null;

    self.addCodeHandler = function( code, handler ) {
        code_handlers[ code ] = handler;
    };

	/**
	 * Remembers and returns scroll position for every URL.
	 */
	var rememberScrollTop = function( value ) {
		if ( value !== undefined ) {
			scroll_top_history[ module_location.getPath() ] = value;
		} else {
			return scroll_top_history[ module_location.getPath() ];
		}
	};

	/**
	 * Handles links click (then calls goByLink).
	 */
	var onClickLink = function( event, a ) {

		/**
		 * Dont perform segue by clicks on the links inside CodeX Editor
		 * @type {Boolean}
		 */
		let is_inside_editor = $.belong(a, '.ce-redactor');

		if ( !is_locked && !is_inside_editor ) {
			if ( event.which == 1 ) {
				return goByLink( event, a );
			}
		} else {
			event.preventDefault();
			return false;
		}
	};

	/**
	 * Checks link attributes and event details (then calls goTo).
	 */
	var goByLink = function( event, a ) {
		var url = a.getAttribute( 'href' ),
			target = a.getAttribute( 'target' ),
			is_no_ajax = a.getAttribute( 'data-no-ajax' ),
			is_meta = event.ctrlKey || event.metaKey,
			is_same_host = a.hostname === module_location.getHostname(),
			is_target_self = ( target === null ) || ( target === '_self' ),
			is_mail = url.indexOf( 'mailto:' ) >= 0;

		ajax_container_selector = a.getAttribute( 'data-ajax-container' );

		if ( url !== null && is_no_ajax === null && !is_meta && is_same_host && is_target_self && !is_mail ) {
			/**
			 * Если урл нормальный, не по метки что он не аяксовый, не зажата мета-клавиша, тот же хост, не target="_blank" и не имейл,
			 * то делаем аяксовый переход.
			 */

			if ( !is_blocked ) {

				self.goTo(url );
				event.preventDefault();

				return false;

			} else {

				if ( confirm( blocking_message ) ) {

					self.block( false );
					self.goTo(url );
					event.preventDefault();

					return false;

				} else {

					event.preventDefault();

					return false;

				}

			}

		} else if (is_same_host === false) {
			/**
			 * Если ни один из предыдущий кейсов,
			 * то открываем ссылку в новом окне.
			 */
			window.open(url);

			event.preventDefault();

			return false;

		} else {
			/**
			 * Иначе, сработает дефолтное действие браузера.
			 */
		}
	};

	/**
	 * Checks URL and going to the next page, or triggers 'Only hash changed'.
	 */
	self.goTo = function( url ) {
		if ( !module_location.isOnlyHashChanged( url ) ) {
			self.trigger( 'Before go to', {
				url: url
			} );

			is_link_clicked = true;

			rememberScrollTop( window.scrollY );

			module_location.goTo( url );
		} else {
			module_location.setHash( module_location.retriveHashFromUrl( url ) );

			setTimeout( function() {
				self.trigger( 'Only hash changed' );
			}, 0 );
		}
	};

	/**
	 * Handles URL change event
	 */
	var onUrlChanged = function( data ) {
		var is_can_go = true;

		self.trigger( 'Url changed', data );

		if ( is_link_clicked !== true ) {
			if ( is_blocked ) {
				if ( !self.is_navigation_correcting ) {
					if ( confirm( blocking_message ) ) {
						self.block( false );
						is_can_go = true;
					} else {
						is_can_go = false;
						self.is_navigation_correcting = true;
						module_location.forward();
					}
				} else {
					self.is_navigation_correcting = false;
					is_can_go = false;
				}
			} else {
				is_can_go = true;
			}

			history.scrollRestoration = 'manual';
		} else {
			// Этот кейс, по сути, проверяется раньше, в onClickLink
		}

		if ( is_can_go ) {
			ajax.get( {
				url: data.url,
				data: {
					'mode': 'ajax'
				},
				dataType: 'JSON',
				success: onAjaxSuccess,
				error: onAjaxError,
				async: false
			} );
		}
	};

	var setTitle = function( title ) {
		document.title = title;
	};

	var setHTML = function( html ) {
		var ajax_container;

		if ( ajax_container_selector ) {
			ajax_container = $.find( ajax_container_selector );

			if ( ajax_container ) {
				$.parseHTML( html, true ).forEach( function( element ) {
					var container = $.find( element, ajax_container_selector );

					if ( container ) {
						$.replace( ajax_container, container );
					}
				} );
			}

			ajax_container_selector = null;
		} else {
			DOM.page.innerHTML = html;
		}
	};

	var scrollTop = function( value ) {
		window.scrollTo( 0, value || 0 );
	};

	var tryToRequireSpecialScripts = function( data, callback ) {
		var scripts_list;

		if ( data.is_special ) {
			scripts_list = $.parseHTML( data.html ).filter( function( el ) {
				return el.id === 'special_json';
			} ).map( function( el ) {
				return JSON.parse( $.html( el ) ).js;
			} )[ 0 ];

			if ( scripts_list ) {
				util.requireScripts( scripts_list, callback );
			} else {
				callback();
			}
		} else {
			callback();
		}
	};

	/* ajax */
	var onAjaxSuccess = function( response ) {
		var redirect = response[ 'module.ajaxify' ].redirect;

		if ( redirect === undefined ) {
			self.trigger( 'Before page changed' );

			tryToRequireSpecialScripts( response[ 'module.ajaxify' ], function() {
				setTitle( response[ 'module.ajaxify' ].title );
				setHTML( response[ 'module.ajaxify' ].html );

				if ( history.scrollRestoration === 'auto' ) {
					scrollTop();
				} else {
					scrollTop( rememberScrollTop() );
				}

				history.scrollRestoration = 'auto';
				is_link_clicked = false;

				util.build( module_location.getPath(), {
					beforeRefresh: function() {
						util.delegateData( response );// раньше было в beforeInit
					},
					beforeInit: function() {
					},
					finish: function() {
						self.trigger( 'Build finished' );
					}
				} );
			} );
		} else {
			if ( redirect.external !== true ) {
				module_location.goTo( redirect.url, true );
			} else {
				module_location.jump( redirect.url );
			}
		}
	};

	var onAjaxError = function( response, err_code ) {
		var handler = code_handlers[ err_code ];

		if ( handler !== undefined ) {
			handler( function( state, error_msg ) {
				if ( state ) {
					module_location.goTo( module_location.getPath(), true );
				} else {
					notify.error( 'Не удалось перейти на страницу (' + error_msg + ')' );
					// self.trigger( 'Build finished' );
					module_location.back();
				}
			} );
		} else {
			if ( response && response[ 'module.ajaxify' ] ) {
				onAjaxSuccess( response );
			} else {
				notify.error( 'Не удалось перейти на страницу (код ' + err_code + ')' );
				// self.trigger( 'Build finished' );
				module_location.back();
			}
		}
	};

	var assign = function() {
		DOM.page = document.getElementById( 'page_wrapper' );
	};

	var bind = function() {
		$.delegateEvent( document, 'a', 'click.module_ajaxify', onClickLink );

		module_location.on( 'Url changed', onUrlChanged );

		self.on( 'Build finished', analytics.hit );
	};

	var unbind = function() {
		$.removeEvent( document, 'click.module_ajaxify' );
		module_location.off();
		self.off();
	};

	self.block = function( state, message ) {
		blocking_message = message ? message : 'Вы что-то ввели и решили уйти, это не случайность?';

		is_blocked = state !== false;

		if (is_blocked) {

			window.onbeforeunload = function () {
				return blocking_message;
			};

		}else{

			window.onbeforeunload = null;

		}
	};

	self.lock = function( state ) {
		is_locked = state !== false;
	};

	self.init = function() {
		assign();
		bind();
	};

	self.refresh = function() {
	};

	self.destroy = function() {
		unbind();
	};
} );
