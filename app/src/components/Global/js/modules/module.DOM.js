Air.define('module.DOM', 'class.DOM, lib.DOM, fn.extend, class.AnimationFrame, module.metrics, module.ajaxify', function(ClassDOM, $, extend, RAF, metr, ajaxify) {
    var self = this,
        do_not_trigger = false;

    /**
     * Auto bind events by attribute
     * [air-click="name"] 	– Click event
     * [air-hover="name"]	- Mouseover event
     * [air-leave="name"]	– Mouseout event
     * [air-change="name"]	– Change event
     * [air-key="name"]	    – Keydown event
     * TODO:
     * [air-visible="name"]
     */
    var clickHandler = function(event) {
        var event_name = this.getAttribute('air-click');

        self.trigger(event_name, {
            el: this,
            event: event,
            type: 'click'
        });

        self.trigger(event_name + ':click', {
            el: this,
            event: event
        });
    };

    var hoverHandler = function(event) {
        var event_name = this.getAttribute('air-hover');

        self.trigger(event_name, {
            el: this,
            event: event,
            type: 'hover'
        });

        self.trigger(event_name + ':hover', {
            el: this,
            event: event
        });
    };

    var leaveHandler = function(event) {
        var event_name = this.getAttribute('air-leave');

        self.trigger(event_name, {
            el: this,
            event: event,
            type: 'leave'
        });

        self.trigger(event_name + ':leave', {
            el: this,
            event: event
        });
    };

    var changeHandler = function(event) {
        var event_name = this.getAttribute('air-change');

        self.trigger(event_name, {
            el: this,
            event: event
        });

        self.trigger(event_name + ':change', {
            el: this,
            event: event
        });
    };

    var keyHandler = function(event) {
        var event_name = this.getAttribute('air-key');
        // _log(event);
        self.trigger(event_name, {
            el: this,
            event: event
        });

        self.trigger(event_name + ':key', {
            el: this,
            event: event,
            is_bkspc: event.keyCode === 8,
            is_enter: event.keyCode === 13,
            is_esc: event.keyCode === 27,
            is_shift: event.shiftKey,
            is_ctrl: event.ctrlKey,
            is_alt: event.altKey,
            is_meta: event.metaKey
        });
    };

    var keyUpHandler = function(event) {
        var event_name = this.getAttribute('air-keyup');
        // _log(event);
        self.trigger(event_name, {
            el: this,
            event: event
        });

        self.trigger(event_name + ':keyup', {
            el: this,
            event: event
        });
    };

    /**
     * Global bind for scroll and resize events for window
     */
    var scrollHandler = function(event) {
        if (do_not_trigger === false) {
            self.trigger('Window scroll', event);
        }
    };

    var resizeHandler = function(event) {
        self.trigger('Window resize', event);
    };

    /**
     * Create list of cached DOM elements
     * @param  {*} 		arg_1	- Any
     * @param  {string} arg_2	- Selector
     * @return {Object}
     */
    var list = function(arg_1, arg_2) {
        var dom_list = {},
            new_class_dom,
            key;

        var pushElement = function(elem) {
            var dom_name = $.attr(elem, 'air-dom');

            if (dom_name) {
                if (dom_list[dom_name] === undefined) {
                    new_class_dom = new ClassDOM();
                    new_class_dom.select(elem);
                    dom_list[dom_name] = new_class_dom;
                    new_class_dom = null;
                } else {
                    dom_list[dom_name].select(elem);
                }
            }
        };

        if (arg_2 === undefined) {
            if ($.dealWithArbitraryData(arg_1) === 'other') {
                // create dom list from Object
                for (key in arg_1) {
                    new_class_dom = new ClassDOM();
                    new_class_dom.select(arg_1[key]);
                    dom_list[key] = new_class_dom;
                    new_class_dom = null;
                }
            } else {
                // create dom list from attributes in Elements
                $.each(arg_1, function(el) {
                    $.each($.findAll(el, '[air-dom]'), pushElement);
                    pushElement(el);
                });
            }
        } else {
            // create dom list from one element
            new_class_dom = new ClassDOM();
            new_class_dom.select(arg_2);
            dom_list[arg_1] = new_class_dom;
            new_class_dom = null;
        }

        return dom_list;
    };

    var logEvents = function() {
        var dead_events,
            dead_elements,
            dead_count = 0,
            group_name,
            table = {},
            unique_elements = [];

        dead_events = __dom_events.filter(function(event_obj) {
            if (unique_elements.indexOf(event_obj.el) < 0) {
                unique_elements.push(event_obj.el);
            }

            if (event_obj.el !== document && event_obj.el !== window) {
                return !$.isExists(event_obj.el);
            }
        });

        dead_elements = dead_events.map(function(event_obj) {
            return event_obj.el;
        });

        dead_count = dead_elements.length;

        group_name = __dom_events.length + ' events on ' + unique_elements.length + ' elements' + (dead_count ? ', ' + dead_count + ' is dead' : '')

        if (dead_count > 0) {
            console.log('%c ' + group_name, 'background: #FFF0F0; color: #333; padding: 3px 0px;');
        } else {
            // console.log('%c ' + group_name, 'color: #888');
        }

        if (dead_count > 0) {
            console.groupCollapsed('Dead events');

            dead_events.forEach(function() {

            });

            console.table(dead_events);

            console.groupEnd('Dead events');
        }
    };

    var easeInOutCubic = function ( t ) {
        return ( t < 0.5 ) ? ( 4 * t * t * t ) : ( ( t - 1 ) * ( 2 * t - 2 ) * ( 2 * t - 2 ) + 1 );
    };

    var scrollTo = function(top_finish, duration, easing, callback) {
        var time_start = Date.now(),
            top_start = metr.scroll_top,
            start,
            raf;

        if ( duration > 0 ) {
            raf = new RAF(function() {
                var p = (Date.now() - time_start) / duration,
                    top;

                if (easing !== undefined) {
                    p = easing(p);
                }

                if (p < 1) {
                    top = Math.round(top_start + (top_finish - top_start) * p);
                } else {
                    top = top_finish;
                    raf.stop();
                    callback && callback();
                }

                window.scrollTo(0, top);
            });

            raf.start();
        } else {
            window.scrollTo(0, top_finish);
            callback && callback();
        }
    };

    var onElementResize = function (element, callback) {
        var iframe = document.createElement('iframe');

        $.css(iframe, {
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: '-9999px',
            top: '-9999px',
            'z-index': '-1'
        });

        $.append(element, iframe);

        iframe.contentWindow.onresize = function(){
            callback && callback();
        };

        iframe = null;
    };

    self.scrollTo = function(top_finish, duration, callback) {
        scrollTo(top_finish, duration, easeInOutCubic, callback);
    };

    self.scrollToElement = function( element, params = {}, callback ) {
        self.scrollTo( $.offset( element ).top + ( params.shift || 0 ), params.duration || 0, callback );
    };

    self.benchScrollFps = function () {
        var i = 0,
        	time,
            avg = [],
            frame_id;

        var f = function(){
        	var t = Date.now();

        	if (t - time > 1000) {
        		_log('fps', i);
                avg.push(i);
        		i = 0;
        		time = t;
            }

         	i++;

        	frame_id = requestAnimationFrame(f);
        }

        DOM.scrollTo(metr.scroll_top + 2000, 10000, function () {
            cancelAnimationFrame(frame_id);
            _log('avg', avg);
            _log('avg result', avg.reduce(function(a, b) { return a + b; }) / avg.length);
        });

        setTimeout(function () {
            time = Date.now();
            f();
        }, 500);

    };

    /**
     * Checks if element visible on screen at the moment
     * @param {Element} - HTML NodeElement
     * @return {Boolean}
     */
    self.isOnScreen = function isOnScreen ( el ){

        var elRect    = $.rect(el);

        // Верх объекта выше дна экрана, а низ объекта ниже верха экрана.
        return (elRect.top < metr.window_height) && (elRect.bottom > 0);

    };



    var bind = function() {
        if ( metr.is_desktop || metr.is_android ) {
            $.delegateEvent(document, '[air-click]', 'click.module_DOM', clickHandler);
        } else {
            $.delegateEvent(document, '[air-click]', 'tap.module_DOM', clickHandler);
        }

        $.delegateEvent(document, '[air-hover]', 'mouseover.module_DOM', hoverHandler);
        $.delegateEvent(document, '[air-leave]', 'mouseout.module_DOM', leaveHandler);
        $.delegateEvent(document, '[air-change]', 'input.module_DOM', changeHandler);
        $.delegateEvent(document, '[air-key]', 'keydown.module_DOM', keyHandler);
        $.delegateEvent(document, '[air-keyup]', 'keyup.module_DOM', keyUpHandler);

        $.addEvent(window, 'scroll.module_DOM', scrollHandler);
        $.addEvent(window, 'resize.module_DOM', resizeHandler);

        onElementResize(document.body, function () {
            self.trigger('Document resized');
        });

        ajaxify.on('Before page changed', function () {
            do_not_trigger = true;
        });
    };

    var unbind = function() {
        $.removeEvent(window, '.module_DOM');
        $.removeEvent(document, '.module_DOM');
    };

    /* exports */
    self.list = list;

    self.onElementResize = onElementResize;

    self.init = function() {
        bind();

        // scrollHandler();
        // resizeHandler();
    };

    self.refresh = function() {
        // setTimeout(function(){
            do_not_trigger = false;
        // }, 300);
    };

    self.destroy = function() {
        unbind();
    };

    window.onAirReady = function() {
        // logEvents();
        // testEvents();
    };

    DOM = this;

});
